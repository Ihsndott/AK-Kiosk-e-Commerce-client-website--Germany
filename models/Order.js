import mongoose from "mongoose";
/**
 * Generates a unique AK order number in the format: AK-YYMMDD-XXXXXXXX
 */
function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 10);
  return `AK-${datePart}-${randomPart}`;
}

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    sku: { type: String, trim: true, default: "" },
    priceAtOrder: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "Germany" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderNumber,
    },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "Order must contain at least one item",
      ],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "manual", "order_now"],
      default: "manual",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "canceled"],
      default: "pending",
    },

    // Stripe-specific fields
    stripeSessionId: { type: String, trim: true, default: null },
    stripePaymentIntentId: { type: String, trim: true, default: null },
    paidAt: { type: Date, default: null },

    // Stock deduction state tracking
    stockDeducted: { type: Boolean, default: false },

    // Track if admin / customer notifications were sent
    adminNotificationSent: { type: Boolean, default: false },
    customerNotificationSent: { type: Boolean, default: false },

    // Concurrency control & error tracking for notifications
    adminNotificationLock: { type: Date, default: null },
    customerNotificationLock: { type: Date, default: null },
    adminNotificationError: { type: String, default: null },
    customerNotificationError: { type: String, default: null },

    notes: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  }
);

// Index for common query patterns
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ stripeSessionId: 1 }, { sparse: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
