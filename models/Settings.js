import mongoose from "mongoose";

const businessHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    open: { type: String, default: "09:00" },
    close: { type: String, default: "22:00" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

export const DEFAULT_BUSINESS_HOURS = [
  { day: "Monday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Tuesday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Wednesday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Thursday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Friday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Saturday", open: "09:00", close: "22:00", isClosed: false },
  { day: "Sunday", open: "12:00", close: "20:00", isClosed: false },
];

export const DEFAULT_DELIVERY_AREAS = [
  "Oberhausen (All districts)",
  "Alt-Oberhausen",
  "Sterkrade",
  "Osterfeld",
];

const settingsSchema = new mongoose.Schema(
  {
    // Store Information
    storeName: {
      type: String,
      default: "AK Kiosk & Asian Market",
      trim: true,
      maxlength: 120,
    },
    storeAddress: {
      type: String,
      default: "Buschhausener Str. 63, 46049 Oberhausen, Germany",
      trim: true,
      maxlength: 250,
    },
    contactEmail: {
      type: String,
      default: "service@ak-kiosk.de",
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      default: "+49 (0) 208 8839 214",
      trim: true,
      maxlength: 50,
    },

    // Business Hours
    businessHours: {
      type: [businessHourSchema],
      default: DEFAULT_BUSINESS_HOURS,
    },

    // Delivery Settings
    deliveryFee: {
      type: Number,
      default: 3.5,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 35.0,
      min: 0,
    },
    deliveryAreas: {
      type: [String],
      default: DEFAULT_DELIVERY_AREAS,
    },

    // Tax Settings (Sensible German VAT for groceries)
    taxPercentage: {
      type: Number,
      default: 7.0,
      min: 0,
      max: 100,
    },
    taxInclusive: {
      type: Boolean,
      default: true,
    },

    // Payment Settings (Flags only - never secret keys)
    codEnabled: {
      type: Boolean,
      default: true,
    },
    stripeEnabled: {
      type: Boolean,
      default: true,
    },

    // Notification Preferences
    orderNotifications: {
      type: Boolean,
      default: true,
    },
    inquiryNotifications: {
      type: Boolean,
      default: true,
    },
    notificationEmail: {
      type: String,
      default: "service@ak-kiosk.de",
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Helper to retrieve singleton settings document, creating default if not yet stored.
 */
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;

