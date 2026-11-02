/**
 * AK Kiosk & Asian Market — Feature Configuration
 *
 * Controls toggles for client requirements without deleting underlying implementations.
 * To restore customer login/registration or payment methods, simply toggle the flags below.
 */

export const FEATURES = {
  /**
   * Temporarily hides customer login and registration from the navigation,
   * mobile menu, and redirects direct /login and /register visits to homepage.
   * Customer models, APIs, and existing accounts remain completely preserved.
   */
  ENABLE_CUSTOMER_AUTH: false,

  /**
   * Disables online Stripe card payments in the active customer checkout flow.
   * Historical Stripe records and webhook handlers are fully preserved.
   */
  ENABLE_STRIPE_PAYMENTS: false,

  /**
   * Disables Cash on Delivery payment option in checkout.
   */
  ENABLE_COD_PAYMENTS: false,

  /**
   * Active customer checkout flow: Direct "Order Now" placement.
   * Payment is coordinated manually by store staff via phone/email after order placement.
   */
  ENABLE_ORDER_NOW: true,
};

