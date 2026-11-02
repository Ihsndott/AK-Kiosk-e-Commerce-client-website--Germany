import mongoose from "mongoose";
import connectToDatabase from "./mongodb.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderEmails } from "./mailer.js";

/**
 * Atomically finalizes an order following verified Stripe payment.
 *
 * Concurrency, Crash-Recovery & Data-Integrity Guarantees:
 * 1. MANDATORY TRANSACTIONS: Multi-document transactions are strictly required.
 *    Payment status update and ALL product stock deductions execute within the same transaction.
 *    Non-transactional silent fallback is eliminated.
 * 2. ALL-OR-NOTHING ATOMICITY: Uses Mongoose `session.withTransaction()`. If any item fails,
 *    an application crashes, or database error occurs, MongoDB aborts the entire transaction.
 *    An order CANNOT remain paid with incomplete stock deductions.
 * 3. EXPLICIT STOCK TRACKING: `stockDeducted: true` is committed atomically alongside `paymentStatus: "paid"`.
 * 4. IDEMPOTENT RETRIES: Existing paid orders (`paymentStatus === "paid"` or `stockDeducted === true`)
 *    are recognized and never deduct stock a second time.
 * 5. SAFE NOTIFICATIONS: Notifications run outside the transaction with independent lease locks and Message-ID headers.
 *
 * @param {Object} params
 * @param {string} [params.orderId] - MongoDB Order _id
 * @param {string} [params.stripeSessionId] - Stripe Checkout Session ID
 * @param {string} [params.stripePaymentIntentId] - Stripe Payment Intent ID
 * @param {string} [params.orderNumber] - AK Kiosk Order Number
 * @returns {Promise<{ success: boolean, order: Object, newlyFinalized: boolean, alreadyPaid: boolean, notFound?: boolean, error?: string, transient?: boolean, emailResults?: Object }>}
 */
export async function finalizeStripePayment({
  orderId,
  stripeSessionId,
  stripePaymentIntentId,
  orderNumber,
}) {
  await connectToDatabase();

  const candidates = [];
  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    candidates.push({ _id: orderId });
  }
  if (stripeSessionId) {
    candidates.push({ stripeSessionId });
  }
  if (orderNumber) {
    candidates.push({ orderNumber });
  }

  if (candidates.length === 0) {
    return {
      success: false,
      notFound: true,
      message: "No valid order identifier provided",
      order: null,
      newlyFinalized: false,
      alreadyPaid: false,
    };
  }

  const orderQuery = candidates.length === 1 ? candidates[0] : { $or: candidates };

  // 1. Initial lookup: Check for existence and prior finalization
  const existingOrder = await Order.findOne(orderQuery);
  if (!existingOrder) {
    return {
      success: false,
      notFound: true,
      message: "Order not found",
      order: null,
      newlyFinalized: false,
      alreadyPaid: false,
    };
  }

  // Idempotency: If already paid or stock already deducted, do NOT deduct stock again.
  if (existingOrder.paymentStatus === "paid" || existingOrder.stockDeducted === true) {
    const emailResults = await sendOrderEmails(existingOrder);
    return {
      success: true,
      order: existingOrder,
      newlyFinalized: false,
      alreadyPaid: true,
      emailResults,
    };
  }

  // 2. Multi-document transaction is MANDATORY.
  // Never fall back to non-transactional processing for payment finalization.
  let session;
  try {
    session = await mongoose.startSession();
  } catch (sessionErr) {
    console.error("[AK Kiosk OrderFinalizer] MongoDB transactions unavailable:", sessionErr.message);
    return {
      success: false,
      error: "MongoDB multi-document transaction is unavailable. Transactions are mandatory for payment finalization.",
      transient: true,
      order: existingOrder,
      newlyFinalized: false,
      alreadyPaid: false,
    };
  }

  let finalizedOrder = null;
  let alreadyProcessedByConcurrent = false;

  try {
    await session.withTransaction(async () => {
      // Atomic conditional claim within the transaction: MUST match paymentStatus != 'paid'
      const updateQuery = {
        ...orderQuery,
        paymentStatus: { $ne: "paid" },
      };

      const updateFields = {
        $set: {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          paidAt: new Date(),
          stockDeducted: true,
          ...(stripeSessionId ? { stripeSessionId } : {}),
          ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
        },
      };

      const claimedOrder = await Order.findOneAndUpdate(
        updateQuery,
        updateFields,
        { session, new: true }
      );

      if (!claimedOrder) {
        // A concurrent worker won the claim inside their transaction
        alreadyProcessedByConcurrent = true;
        return;
      }

      // Deduct stock for ALL items within the exact same transaction
      for (const item of claimedOrder.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product "${item.name || item.productId}"`);
        }
      }

      finalizedOrder = claimedOrder;
    });
  } catch (txErr) {
    console.error("[AK Kiosk OrderFinalizer] Payment finalization transaction failed:", txErr.message);
    return {
      success: false,
      error: txErr.message || "Payment finalization transaction failed",
      transient: true,
      order: null,
      newlyFinalized: false,
      alreadyPaid: false,
    };
  } finally {
    await session.endSession();
  }

  // If claimed by a concurrent worker, fetch the finalized order state
  if (alreadyProcessedByConcurrent) {
    const updated = await Order.findOne(orderQuery);
    const emailResults = updated ? await sendOrderEmails(updated) : null;
    return {
      success: true,
      order: updated,
      newlyFinalized: false,
      alreadyPaid: true,
      emailResults,
    };
  }

  if (!finalizedOrder) {
    return {
      success: false,
      error: "Order finalization transaction did not complete",
      order: null,
      newlyFinalized: false,
      alreadyPaid: false,
    };
  }

  // 3. Dispatch emails outside the transaction
  const emailResults = await sendOrderEmails(finalizedOrder);

  return {
    success: true,
    order: finalizedOrder,
    newlyFinalized: true,
    alreadyPaid: false,
    emailResults,
  };
}
