"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Store,
  Clock,
  Truck,
  Percent,
  CreditCard,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form state
  const [settings, setSettings] = useState({
    storeName: "AK Kiosk & Asian Market",
    storeAddress: "Buschhausener Str. 63, 46049 Oberhausen, Germany",
    contactEmail: "service@ak-kiosk.de",
    phone: "+49 (0) 208 8839 214",
    businessHours: [
      { day: "Monday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Tuesday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Wednesday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Thursday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Friday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Saturday", open: "09:00", close: "22:00", isClosed: false },
      { day: "Sunday", open: "12:00", close: "20:00", isClosed: false },
    ],
    deliveryFee: 3.5,
    freeDeliveryThreshold: 35.0,
    deliveryAreas: [
      "Oberhausen (All districts)",
      "Alt-Oberhausen",
      "Sterkrade",
      "Osterfeld",
    ],
    taxPercentage: 7.0,
    taxInclusive: true,
    codEnabled: true,
    stripeEnabled: true,
    orderNotifications: true,
    inquiryNotifications: true,
    notificationEmail: "service@ak-kiosk.de",
  });

  const [newAreaInput, setNewAreaInput] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data?.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleHourChange = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...prev.businessHours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, businessHours: updated };
    });
  };

  const handleAddArea = () => {
    if (!newAreaInput.trim()) return;
    if (settings.deliveryAreas.includes(newAreaInput.trim())) return;
    setSettings((prev) => ({
      ...prev,
      deliveryAreas: [...prev.deliveryAreas, newAreaInput.trim()],
    }));
    setNewAreaInput("");
  };

  const handleRemoveArea = (indexToRemove) => {
    setSettings((prev) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Store settings updated successfully.",
        });
        if (data.settings) setSettings(data.settings);
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Failed to update settings.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Network error occurred while saving settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ak-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/dashboard"
              className="text-xs text-ak-charcoal-light hover:text-ak-burgundy transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ak-charcoal">
            Store & System Settings
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            Configure store info, business hours, delivery thresholds, tax rates, and notifications
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ak-burgundy hover:bg-[#60122A] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save All Settings</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-ak-burgundy mb-2" />
          <span className="text-xs text-ak-charcoal-muted">Loading store settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Store Information */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
              <Store className="w-4 h-4 text-ak-burgundy" />
              <h2 className="font-serif text-base font-bold text-ak-charcoal">
                Store Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Physical Store Address
                </label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, storeAddress: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Hours */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
              <Clock className="w-4 h-4 text-ak-gold" />
              <h2 className="font-serif text-base font-bold text-ak-charcoal">
                Business & Operating Hours
              </h2>
            </div>

            <div className="space-y-3">
              {settings.businessHours.map((item, index) => (
                <div
                  key={item.day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5"
                >
                  <span className="w-28 text-xs font-semibold text-ak-charcoal">
                    {item.day}
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isClosed}
                        onChange={(e) =>
                          handleHourChange(index, "isClosed", e.target.checked)
                        }
                        className="rounded border-ak-charcoal/20 text-ak-burgundy focus:ring-ak-burgundy"
                      />
                      <span className="text-xs text-ak-charcoal-muted">Closed</span>
                    </label>

                    {!item.isClosed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.open}
                          onChange={(e) =>
                            handleHourChange(index, "open", e.target.value)
                          }
                          placeholder="09:00"
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-ak-charcoal/15 bg-white text-xs text-center"
                        />
                        <span className="text-xs text-ak-charcoal-muted">to</span>
                        <input
                          type="text"
                          value={item.close}
                          onChange={(e) =>
                            handleHourChange(index, "close", e.target.value)
                          }
                          placeholder="22:00"
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-ak-charcoal/15 bg-white text-xs text-center"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-ak-charcoal-muted italic px-4 py-1 rounded-md bg-rose-50 text-rose-700">
                        Store closed all day
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Delivery Settings */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
              <Truck className="w-4 h-4 text-ak-charcoal" />
              <h2 className="font-serif text-base font-bold text-ak-charcoal">
                Local Delivery Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Standard Delivery Fee (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deliveryFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Free Delivery Threshold (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ak-charcoal mb-2">
                Supported Delivery Districts & Postal Areas
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {settings.deliveryAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ak-icy-blue/60 text-ak-charcoal text-xs font-medium"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(idx)}
                      className="text-ak-charcoal-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newAreaInput}
                  onChange={(e) => setNewAreaInput(e.target.value)}
                  placeholder="e.g. Sterkrade-Nord"
                  className="flex-1 px-3 py-2 rounded-xl border border-ak-charcoal/15 bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="px-3.5 py-2 rounded-xl bg-ak-charcoal hover:bg-ak-charcoal/90 text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Area</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4 & 5: Tax & Payment Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Settings */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
                <Percent className="w-4 h-4 text-ak-gold" />
                <h2 className="font-serif text-base font-bold text-ak-charcoal">
                  Tax Rates
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    VAT / Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.taxPercentage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        taxPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs"
                  />
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">
                    Standard grocery reduced VAT in Germany is 7.0%.
                  </p>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={settings.taxInclusive}
                    onChange={(e) =>
                      setSettings({ ...settings, taxInclusive: e.target.checked })
                    }
                    className="rounded border-ak-charcoal/20 text-ak-burgundy focus:ring-ak-burgundy"
                  />
                  <span className="text-xs font-medium text-ak-charcoal">
                    Storefront product prices already include VAT
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Workflow */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
                <CreditCard className="w-4 h-4 text-ak-charcoal" />
                <h2 className="font-serif text-base font-bold text-ak-charcoal">
                  Payment Workflow
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Manual Payment Arrangement (Active)
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Customer orders are placed directly without requiring upfront online payment. Store staff contact customers via phone or email to confirm items and arrange payment upon delivery or store pickup.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 flex items-center justify-between opacity-75">
                    <div>
                      <span className="font-semibold text-ak-charcoal block">Stripe Online Checkout</span>
                      <span className="text-[11px] text-ak-charcoal-muted">Deactivated (Manual workflow enforced)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-ak-charcoal/10 text-ak-charcoal text-[10px] font-bold uppercase">
                      Inactive
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 flex items-center justify-between opacity-75">
                    <div>
                      <span className="font-semibold text-ak-charcoal block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-ak-charcoal-muted">Integrated into direct manual confirmation</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-ak-charcoal/10 text-ak-charcoal text-[10px] font-bold uppercase">
                      Inactive
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-ak-icy-blue/30 border border-ak-charcoal/10 flex items-center gap-2 text-[11px] text-ak-charcoal-muted">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Historical Stripe &amp; COD order records are securely preserved in the database.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Notification Preferences */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-ak-charcoal/10">
              <Bell className="w-4 h-4 text-ak-burgundy" />
              <h2 className="font-serif text-base font-bold text-ak-charcoal">
                Administrator Notification Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                  Recipient Notification Email
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, notificationEmail: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.orderNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        orderNotifications: e.target.checked,
                      })
                    }
                    className="rounded border-ak-charcoal/20 text-ak-burgundy focus:ring-ak-burgundy"
                  />
                  <span className="text-xs font-medium text-ak-charcoal">
                    Send email alert when a new order is placed
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inquiryNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        inquiryNotifications: e.target.checked,
                      })
                    }
                    className="rounded border-ak-charcoal/20 text-ak-burgundy focus:ring-ak-burgundy"
                  />
                  <span className="text-xs font-medium text-ak-charcoal">
                    Send email alert when a customer submits an inquiry
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Save Button footer */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-ak-burgundy hover:bg-[#60122A] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
