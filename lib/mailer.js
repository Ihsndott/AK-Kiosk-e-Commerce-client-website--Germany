import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { formatPrice } from "./utils.js";

/**
 * Sanitizes an environment variable value by trimming whitespace
 * and stripping redundant surrounding double or single quotes.
 */
function cleanEnv(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

/**
 * Creates a Nodemailer transporter using environment variables.
 * Returns null and logs a warning if SMTP is not configured.
 */
function createTransporter() {
  const host = cleanEnv(process.env.SMTP_HOST);
  const portStr = cleanEnv(process.env.SMTP_PORT) || "587";
  const port = parseInt(portStr, 10);
  const secure =
    cleanEnv(process.env.SMTP_SECURE) === "true" || port === 465;
  const user = cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    console.warn(
      "[AK Kiosk Mailer] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS required). Emails will not be sent."
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

function getSenderEmail() {
  return cleanEnv(process.env.SMTP_USER) || "noreply@ak-kiosk.de";
}

const SENDER_NAME = "AK Kiosk & Asian Market";

// ────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATE HELPERS
// ────────────────────────────────────────────────────────────────────────────

function headerBlock() {
  return `
  <div style="background:#7A1735;padding:28px 32px;border-radius:16px 16px 0 0;text-align:center;">
    <p style="margin:0;font-family:serif;font-size:22px;font-weight:bold;color:#F7F5EF;letter-spacing:3px;">AK KIOSK</p>
    <p style="margin:4px 0 0;font-size:11px;color:#DCE8EB;letter-spacing:4px;text-transform:uppercase;">Asian Market</p>
  </div>`;
}

function footerBlock() {
  return `
  <div style="background:#17191B;padding:20px 32px;border-radius:0 0 16px 16px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#5A6065;">Buschhausener Str. 63, 46049 Oberhausen, Germany</p>
    <p style="margin:6px 0 0;font-size:11px;color:#5A6065;">Mon–Sat: 09:00–22:00 &nbsp;|&nbsp; Sun: 12:00–20:00</p>
  </div>`;
}

function orderItemsTable(items) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E7EFF1;font-size:12px;color:#17191B;">
          ${item.name}${item.sku ? ` <span style="color:#5A6065;font-size:10px;">(${item.sku})</span>` : ""}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #E7EFF1;font-size:12px;color:#17191B;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E7EFF1;font-size:12px;color:#17191B;text-align:right;font-family:monospace;">${formatPrice(item.priceAtOrder)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E7EFF1;font-size:12px;font-weight:600;color:#17191B;text-align:right;font-family:monospace;">${formatPrice(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#F7F5EF;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#5A6065;text-transform:uppercase;letter-spacing:1px;">Product</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#5A6065;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#5A6065;text-transform:uppercase;letter-spacing:1px;">Unit</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#5A6065;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function totalsBlock(order) {
  return `
  <table style="width:100%;margin-top:8px;">
    <tr>
      <td style="padding:4px 0;font-size:12px;color:#5A6065;">Subtotal</td>
      <td style="padding:4px 0;font-size:12px;color:#17191B;text-align:right;font-family:monospace;">${formatPrice(order.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:12px;color:#5A6065;">Delivery Fee</td>
      <td style="padding:4px 0;font-size:12px;color:#17191B;text-align:right;font-family:monospace;">${order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</td>
    </tr>
    <tr style="border-top:2px solid #17191B;">
      <td style="padding:8px 0 0;font-size:15px;font-weight:bold;color:#17191B;">Total</td>
      <td style="padding:8px 0 0;font-size:15px;font-weight:bold;color:#7A1735;text-align:right;font-family:monospace;">${formatPrice(order.total)}</td>
    </tr>
  </table>`;
}

function deliveryBlock(order) {
  if (order.deliveryMethod === "pickup") {
    return `<p style="margin:0;font-size:12px;color:#17191B;"><strong>Method:</strong> Store Pickup — Buschhausener Str. 63, 46049 Oberhausen, Germany</p>`;
  }
  const c = order.customer;
  return `<p style="margin:0;font-size:12px;color:#17191B;"><strong>Method:</strong> Home Delivery<br>
    ${c.address}<br>${c.postalCode} ${c.city}<br>${c.country}</p>`;
}

// ────────────────────────────────────────────────────────────────────────────
// BUILD ADMIN NOTIFICATION HTML
// ────────────────────────────────────────────────────────────────────────────

function buildAdminEmailHtml(order) {
  const c = order.customer;
  let paymentLabel = "Manual Arrangement (Direct Confirmation)";
  if (order.paymentMethod === "stripe") paymentLabel = "Online (Stripe)";
  else if (order.paymentMethod === "cod") paymentLabel = "Cash on Delivery";

  const paymentStatusLabel =
    order.paymentStatus === "paid"
      ? '<span style="color:#166534;font-weight:bold;">PAID</span>'
      : '<span style="color:#9a3412;font-weight:bold;">PENDING</span>';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Order Notification</title></head>
<body style="margin:0;padding:24px;background:#CBD8DC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(23,25,27,0.12);">
    ${headerBlock()}
    <div style="padding:28px 32px;">
      <div style="background:#FFF8E7;border:1px solid #D1AE70;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9a7631;">🛒 New Order Received</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:#17191B;font-family:monospace;">${order.orderNumber}</p>
      </div>

      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;border-bottom:1px solid #E7EFF1;padding-bottom:10px;">Customer Details</h2>
      <p style="margin:0 0 4px;font-size:13px;color:#17191B;"><strong>${c.fullName}</strong></p>
      <p style="margin:0 0 4px;font-size:12px;color:#17191B;">📧 ${c.email}</p>
      ${c.phone ? `<p style="margin:0 0 4px;font-size:12px;color:#17191B;">📞 ${c.phone}</p>` : ""}

      <div style="margin-top:20px;">
        <h2 style="margin:0 0 4px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Delivery / Pickup</h2>
        ${deliveryBlock(order)}
      </div>

      <div style="margin-top:20px;">
        <h2 style="margin:0 0 0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;border-bottom:1px solid #E7EFF1;padding-bottom:10px;">Order Items</h2>
        ${orderItemsTable(order.items)}
        ${totalsBlock(order)}
      </div>

      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <div style="background:#F7F5EF;border-radius:10px;padding:12px 16px;flex:1;min-width:140px;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Payment Method</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#17191B;">${paymentLabel}</p>
        </div>
        <div style="background:#F7F5EF;border-radius:10px;padding:12px 16px;flex:1;min-width:140px;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Payment Status</p>
          <p style="margin:4px 0 0;font-size:13px;">${paymentStatusLabel}</p>
        </div>
      </div>
    </div>
    ${footerBlock()}
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// BUILD CUSTOMER CONFIRMATION HTML
// ────────────────────────────────────────────────────────────────────────────

function buildCustomerEmailHtml(order) {
  const c = order.customer;
  const firstName = c.fullName.split(" ")[0];
  const isStripe = order.paymentMethod === "stripe";
  const isCOD = order.paymentMethod === "cod";

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Order Confirmation</title></head>
<body style="margin:0;padding:24px;background:#CBD8DC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(23,25,27,0.12);">
    ${headerBlock()}
    <div style="padding:28px 32px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#17191B;font-family:Georgia,serif;">
        ${isStripe ? "✅ Payment Received!" : isCOD ? "🎉 Order Confirmed!" : "🛒 Order Received — We'll Contact You Shortly!"}
      </h1>
      <p style="margin:0 0 20px;font-size:13px;color:#5A6065;line-height:1.6;">
        Hi <strong>${firstName}</strong>, thank you for shopping at AK Kiosk & Asian Market!
        ${isStripe
          ? "Your payment has been verified and your order is confirmed."
          : isCOD
          ? "Your Cash on Delivery order has been placed and will be processed shortly."
          : "Our team will contact you shortly to confirm your order and arrange payment."
        }
      </p>

      <div style="background:#F7F5EF;border:1px solid #E7EFF1;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Order Reference</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#7A1735;font-family:monospace;">${order.orderNumber}</p>
      </div>

      <h2 style="margin:0 0 4px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;border-bottom:1px solid #E7EFF1;padding-bottom:10px;">Your Order Summary</h2>
      ${orderItemsTable(order.items)}
      ${totalsBlock(order)}

      <div style="margin-top:24px;background:#F7F5EF;border-radius:12px;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#17191B;text-transform:uppercase;letter-spacing:1px;">Fulfillment Details</p>
        ${deliveryBlock(order)}
        ${isStripe
          ? `<p style="margin:8px 0 0;font-size:12px;color:#166534;"><strong>Payment:</strong> Paid online via Stripe card payment.</p>`
          : isCOD
          ? `<p style="margin:8px 0 0;font-size:12px;color:#9a3412;"><strong>Payment:</strong> Cash on Delivery — please have exact change ready.</p>`
          : `<p style="margin:8px 0 0;font-size:12px;color:#9a3412;"><strong>Payment:</strong> Manual arrangement — our team will contact you to confirm your order and arrange payment.</p>`
        }
      </div>

      <p style="margin:24px 0 0;font-size:12px;color:#5A6065;line-height:1.6;">
        If you have any questions about your order, please contact us at our store or reply to this email.<br>
        <strong>Store Address:</strong> Buschhausener Str. 63, 46049 Oberhausen, Germany<br>
        <strong>Hours:</strong> Mon–Sat: 09:00–22:00 &nbsp;|&nbsp; Sun: 12:00–20:00
      </p>
    </div>
    ${footerBlock()}
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// INQUIRY EMAIL TEMPLATE
// ────────────────────────────────────────────────────────────────────────────

function buildInquiryEmailHtml(inquiry) {
  const statusLabel =
    inquiry.status === "new"
      ? '<span style="color:#9a3412;font-weight:bold;">NEW</span>'
      : inquiry.status;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Customer Inquiry</title></head>
<body style="margin:0;padding:24px;background:#CBD8DC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(23,25,27,0.12);">
    ${headerBlock()}
    <div style="padding:28px 32px;">
      <div style="background:#FFF8E7;border:1px solid #D1AE70;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9a7631;">📩 New Customer Inquiry</p>
        <p style="margin:6px 0 0;font-size:14px;color:#17191B;font-weight:600;">${inquiry.subject}</p>
      </div>

      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;border-bottom:1px solid #E7EFF1;padding-bottom:10px;">From</h2>
      <p style="margin:0 0 4px;font-size:13px;color:#17191B;"><strong>${inquiry.name}</strong></p>
      <p style="margin:0 0 4px;font-size:12px;color:#17191B;">📧 ${inquiry.email}</p>

      <h2 style="margin:20px 0 10px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5A6065;border-bottom:1px solid #E7EFF1;padding-bottom:10px;">Message</h2>
      <div style="background:#F7F5EF;border-radius:10px;padding:16px;font-size:13px;color:#17191B;line-height:1.7;white-space:pre-wrap;">${inquiry.message}</div>

      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <div style="background:#F7F5EF;border-radius:10px;padding:12px 16px;flex:1;min-width:140px;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Status</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:600;">${statusLabel}</p>
        </div>
        <div style="background:#F7F5EF;border-radius:10px;padding:12px 16px;flex:1;min-width:140px;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#5A6065;">Received</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#17191B;">${new Date(inquiry.createdAt || Date.now()).toLocaleString("de-DE")}</p>
        </div>
      </div>

      <p style="margin:24px 0 0;font-size:12px;color:#5A6065;line-height:1.6;">
        Reply directly to this email to respond to the customer, or log in to the
        <a href="https://ak-kiosk.de/admin/inquiries" style="color:#7A1735;">Admin Dashboard</a>
        to manage inquiries.
      </p>
    </div>
    ${footerBlock()}
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// INQUIRY NOTIFICATION
// ────────────────────────────────────────────────────────────────────────────

/**
 * Sends an admin notification email for a new customer inquiry.
 * Returns { sent: boolean, error?: string }
 */
export async function sendInquiryNotification(inquiry) {
  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP not configured" };
  }

  const adminEmail = cleanEnv(process.env.ADMIN_NOTIFICATION_EMAIL);
  if (!adminEmail) {
    console.warn(
      "[AK Kiosk Mailer] ADMIN_NOTIFICATION_EMAIL is not set. Skipping inquiry notification."
    );
    return { sent: false, error: "ADMIN_NOTIFICATION_EMAIL not set" };
  }

  const inquiryId = inquiry._id?.toString() || "unknown";
  const messageId = `<inquiry-${inquiryId}@ak-kiosk.de>`;

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${getSenderEmail()}>`,
      to: adminEmail,
      replyTo: `"${inquiry.name}" <${inquiry.email}>`,
      subject: `[AK Kiosk] New Inquiry: ${inquiry.subject}`,
      html: buildInquiryEmailHtml(inquiry),
      messageId,
      headers: {
        "X-Entity-Ref-ID": `inquiry-${inquiryId}`,
      },
    });
    return { sent: true, messageId };
  } catch (err) {
    console.error("[AK Kiosk Mailer] Failed to send inquiry notification:", err?.message);
    return { sent: false, error: err?.message };
  }
}

/**
 * Generates deterministic RFC 2822 Message-ID headers for order notifications.
 */
export function getOrderMessageId(orderNumber, recipientType) {
  const cleanNum = (orderNumber || "unknown").replace(/[^a-zA-Z0-9-]/g, "");
  return `<order-${cleanNum}-${recipientType}@ak-kiosk.de>`;
}

/**
 * Sends admin notification email for a new order.
 * Returns { sent: boolean, error?: string }
 */
export async function sendAdminOrderNotification(order) {
  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP not configured" };
  }

  const adminEmail = cleanEnv(process.env.ADMIN_NOTIFICATION_EMAIL);
  if (!adminEmail) {
    console.warn(
      "[AK Kiosk Mailer] ADMIN_NOTIFICATION_EMAIL is not set. Skipping admin notification."
    );
    return { sent: false, error: "ADMIN_NOTIFICATION_EMAIL not set" };
  }

  const messageId = getOrderMessageId(order.orderNumber, "admin");

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${getSenderEmail()}>`,
      to: adminEmail,
      subject: `[AK Kiosk] New Order ${order.orderNumber} — ${
        order.paymentMethod === "cod" ? "Cash on Delivery" : "Stripe Payment"
      }`,
      html: buildAdminEmailHtml(order),
      messageId,
      headers: {
        "X-Entity-Ref-ID": `order-${order.orderNumber}-admin`,
      },
    });
    return { sent: true, messageId };
  } catch (err) {
    console.error("[AK Kiosk Mailer] Failed to send admin notification:", err?.message);
    return { sent: false, error: err?.message };
  }
}

/**
 * Sends customer order confirmation email.
 * Returns { sent: boolean, error?: string }
 */
export async function sendCustomerOrderConfirmation(order) {
  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP not configured" };
  }

  const customerEmail = cleanEnv(order.customer?.email);
  if (!customerEmail) {
    return { sent: false, error: "No customer email on order" };
  }

  const messageId = getOrderMessageId(order.orderNumber, "customer");

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${getSenderEmail()}>`,
      to: customerEmail,
      subject: `Your AK Kiosk Order Confirmation — ${order.orderNumber}`,
      html: buildCustomerEmailHtml(order),
      messageId,
      headers: {
        "X-Entity-Ref-ID": `order-${order.orderNumber}-customer`,
      },
    });
    return { sent: true, messageId };
  } catch (err) {
    console.error("[AK Kiosk Mailer] Failed to send customer confirmation:", err?.message);
    return { sent: false, error: err?.message };
  }
}

/**
 * Sends both admin notification and customer confirmation.
 * Email failures do NOT throw — they return failure info gracefully.
 *
 * Concurrency & Data-Integrity Guarantees:
 * 1. Admin and customer emails are tracked and locked independently.
 * 2. Uses atomic conditional updates (lease locks with 30s timeout) to ensure
 *    concurrent webhook and order confirmation requests cannot send duplicate emails.
 * 3. Successful delivery permanently marks the notification as sent in MongoDB.
 * 4. Failed delivery releases the lease lock and records the error, allowing
 *    safe retries without re-sending already delivered emails.
 * 5. Deterministic Message-ID headers (<order-NUMBER-admin@ak-kiosk.de>) enable receiving
 *    MTAs and email clients to deduplicate messages.
 *
 * Remaining Distributed Systems Limitation:
 * Because external SMTP servers and MongoDB do not share a two-phase commit transaction,
 * if an SMTP server accepts an email but the Node.js application crashes before the database
 * update completes, the 30-second lease lock will eventually expire, and a subsequent retry
 * will re-send the notification (at-least-once delivery guarantee).
 */
export async function sendOrderEmails(order) {
  if (!order) {
    return {
      admin: { sent: false, error: "No order provided" },
      customer: { sent: false, error: "No order provided" },
    };
  }

  const isDbConnected = mongoose.connection?.readyState === 1;
  const orderId = order._id;

  // Fallback for mocks / disconnected test fixtures
  if (!isDbConnected || !orderId) {
    const [adminResult, customerResult] = await Promise.allSettled([
      !order.adminNotificationSent
        ? sendAdminOrderNotification(order)
        : Promise.resolve({ sent: true, alreadySent: true }),
      !order.customerNotificationSent
        ? sendCustomerOrderConfirmation(order)
        : Promise.resolve({ sent: true, alreadySent: true }),
    ]);

    return {
      admin:
        adminResult.status === "fulfilled"
          ? adminResult.value
          : { sent: false, error: adminResult.reason },
      customer:
        customerResult.status === "fulfilled"
          ? customerResult.value
          : { sent: false, error: customerResult.reason },
    };
  }

  const lockTimeout = new Date(Date.now() - 30000); // 30s lease timeout

  let adminResult = {
    sent: !!order.adminNotificationSent,
    alreadySent: !!order.adminNotificationSent,
  };
  let customerResult = {
    sent: !!order.customerNotificationSent,
    alreadySent: !!order.customerNotificationSent,
  };

  // 1. ADMIN NOTIFICATION
  if (!order.adminNotificationSent) {
    // Atomically claim lock
    const claimedForAdmin = await Order.findOneAndUpdate(
      {
        _id: orderId,
        adminNotificationSent: { $ne: true },
        $or: [
          { adminNotificationLock: { $exists: false } },
          { adminNotificationLock: null },
          { adminNotificationLock: { $lt: lockTimeout } },
        ],
      },
      {
        $set: { adminNotificationLock: new Date() },
      },
      { new: true }
    );

    if (claimedForAdmin) {
      try {
        const res = await sendAdminOrderNotification(claimedForAdmin);
        if (res.sent) {
          await Order.findByIdAndUpdate(orderId, {
            $set: {
              adminNotificationSent: true,
              adminNotificationLock: null,
              adminNotificationError: null,
            },
          });
          adminResult = { sent: true };
        } else {
          await Order.findByIdAndUpdate(orderId, {
            $set: {
              adminNotificationLock: null,
              adminNotificationError: res.error || "Failed to send admin notification",
            },
          });
          adminResult = { sent: false, error: res.error };
        }
      } catch (err) {
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            adminNotificationLock: null,
            adminNotificationError: err.message || "Admin notification exception",
          },
        });
        adminResult = { sent: false, error: err.message };
      }
    } else {
      // Another concurrent worker acquired lock or already sent it
      const current = await Order.findById(orderId).select("adminNotificationSent").lean();
      adminResult = {
        sent: !!current?.adminNotificationSent,
        lockedOrAlreadySent: true,
      };
    }
  }

  // 2. CUSTOMER NOTIFICATION
  if (!order.customerNotificationSent) {
    // Atomically claim lock
    const claimedForCustomer = await Order.findOneAndUpdate(
      {
        _id: orderId,
        customerNotificationSent: { $ne: true },
        $or: [
          { customerNotificationLock: { $exists: false } },
          { customerNotificationLock: null },
          { customerNotificationLock: { $lt: lockTimeout } },
        ],
      },
      {
        $set: { customerNotificationLock: new Date() },
      },
      { new: true }
    );

    if (claimedForCustomer) {
      try {
        const res = await sendCustomerOrderConfirmation(claimedForCustomer);
        if (res.sent) {
          await Order.findByIdAndUpdate(orderId, {
            $set: {
              customerNotificationSent: true,
              customerNotificationLock: null,
              customerNotificationError: null,
            },
          });
          customerResult = { sent: true };
        } else {
          await Order.findByIdAndUpdate(orderId, {
            $set: {
              customerNotificationLock: null,
              customerNotificationError: res.error || "Failed to send customer confirmation",
            },
          });
          customerResult = { sent: false, error: res.error };
        }
      } catch (err) {
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            customerNotificationLock: null,
            customerNotificationError: err.message || "Customer confirmation exception",
          },
        });
        customerResult = { sent: false, error: err.message };
      }
    } else {
      // Another concurrent worker acquired lock or already sent it
      const current = await Order.findById(orderId).select("customerNotificationSent").lean();
      customerResult = {
        sent: !!current?.customerNotificationSent,
        lockedOrAlreadySent: true,
      };
    }
  }

  return { admin: adminResult, customer: customerResult };
}

