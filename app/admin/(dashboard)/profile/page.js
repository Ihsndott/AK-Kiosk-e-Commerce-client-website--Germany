"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  ArrowLeft,
  Mail,
  Calendar,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AdminProfilePage() {
  const router = useRouter();

  // Admin Profile State
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "superadmin",
    createdAt: null,
    lastLogin: null,
  });
  const [loading, setLoading] = useState(true);

  // Form 1: Name Update
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameFeedback, setNameFeedback] = useState(null);

  // Form 2: Email Update
  const [emailInput, setEmailInput] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);

  // Form 3: Password Update
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [passwordNew, setPasswordNew] = useState("");
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Re-login Redirect State
  const [reloginCountdown, setReloginCountdown] = useState(null);

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setAdmin(data.user);
          setNameInput(data.user.name || "");
          setEmailInput(data.user.email || "");
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle countdown redirect
  useEffect(() => {
    if (reloginCountdown === null) return;
    if (reloginCountdown <= 0) {
      router.push("/admin/login");
      return;
    }
    const timer = setTimeout(() => {
      setReloginCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [reloginCountdown, router]);

  // Form 1 Handler: Update Admin Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setNameFeedback({ type: "error", message: "Admin name cannot be blank." });
      return;
    }
    if (nameInput.trim() === admin.name) {
      setNameFeedback({ type: "info", message: "No changes to name." });
      return;
    }

    setNameLoading(true);
    setNameFeedback(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNameFeedback({ type: "success", message: data.message });
        setAdmin((prev) => ({ ...prev, name: data.user.name }));
      } else {
        setNameFeedback({
          type: "error",
          message: data.message || "Failed to update admin name.",
        });
      }
    } catch (err) {
      setNameFeedback({
        type: "error",
        message: "Network error occurred while updating name.",
      });
    } finally {
      setNameLoading(false);
    }
  };

  // Form 2 Handler: Update Admin Email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailFeedback({ type: "error", message: "New email address is required." });
      return;
    }
    if (cleanEmail === admin.email.toLowerCase()) {
      setEmailFeedback({
        type: "info",
        message: "The entered email is already your current email address.",
      });
      return;
    }
    if (!emailCurrentPassword) {
      setEmailFeedback({
        type: "error",
        message: "Current password is required to change your email address.",
      });
      return;
    }

    setEmailLoading(true);
    setEmailFeedback(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          currentPassword: emailCurrentPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmailFeedback({
          type: "success",
          message: `${data.message} Redirecting to login in 3 seconds...`,
        });
        setEmailCurrentPassword("");
        setReloginCountdown(3);
      } else {
        setEmailFeedback({
          type: "error",
          message: data.message || "Failed to update email address.",
        });
      }
    } catch (err) {
      setEmailFeedback({
        type: "error",
        message: "Network error occurred while updating email.",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // Form 3 Handler: Update Admin Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!passwordCurrent) {
      setPasswordFeedback({
        type: "error",
        message: "Please enter your current password.",
      });
      return;
    }
    if (!passwordNew) {
      setPasswordFeedback({
        type: "error",
        message: "Please enter your new password.",
      });
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setPasswordFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    // Client-side strength check
    if (passwordNew.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      return;
    }
    if (
      !/[A-Z]/.test(passwordNew) ||
      !/[a-z]/.test(passwordNew) ||
      !/[0-9]/.test(passwordNew)
    ) {
      setPasswordFeedback({
        type: "error",
        message:
          "Password must include uppercase letters, lowercase letters, and numbers.",
      });
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordCurrent,
          newPassword: passwordNew,
          confirmPassword: passwordConfirm,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordFeedback({
          type: "success",
          message: `${data.message} Redirecting to login in 3 seconds...`,
        });
        setPasswordCurrent("");
        setPasswordNew("");
        setPasswordConfirm("");
        setReloginCountdown(3);
      } else {
        setPasswordFeedback({
          type: "error",
          message: data.message || "Failed to update password.",
        });
      }
    } catch (err) {
      setPasswordFeedback({
        type: "error",
        message: "Network error occurred while updating password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Password Strength Indicators
  const hasMinLength = passwordNew.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordNew);
  const hasLowerCase = /[a-z]/.test(passwordNew);
  const hasNumber = /[0-9]/.test(passwordNew);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Re-login Modal Overlay if session invalidated */}
      {reloginCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-ak-charcoal/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ak-charcoal mb-2">
              Credentials Updated
            </h3>
            <p className="text-xs text-ak-charcoal-muted leading-relaxed mb-6">
              For security, your current session has been ended. Please sign in with your new credentials.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ak-icy-blue/60 text-ak-charcoal font-semibold text-xs mb-4">
              <Loader2 className="w-4 h-4 animate-spin text-ak-burgundy" />
              <span>Redirecting to login in {reloginCountdown}s...</span>
            </div>
            <div>
              <button
                onClick={() => router.push("/admin/login")}
                className="w-full py-2.5 px-4 rounded-xl bg-ak-burgundy hover:bg-[#60122A] text-white text-xs font-semibold tracking-wide transition-all"
              >
                Go to Login Now
              </button>
            </div>
          </div>
        </div>
      )}

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
            Administrator Profile & Credentials
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            Manage your store administrator identity, login email, and authentication credentials
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-ak-burgundy mb-2" />
          <span className="text-xs text-ak-charcoal-muted">Loading profile details...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Account Details & Security Cards (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ak-charcoal/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ak-charcoal to-[#2B3034] text-ak-ivory flex items-center justify-center text-xl font-bold shadow-md">
                  {admin.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ak-charcoal">
                      {admin.name || "Store Administrator"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-ak-burgundy/10 text-ak-burgundy text-[10px] font-bold tracking-wider uppercase">
                      {admin.role || "Superadmin"}
                    </span>
                  </div>
                  <p className="text-xs text-ak-charcoal-muted mt-0.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-ak-charcoal-light" />
                    <span>{admin.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-ak-charcoal/5">
                  <span className="text-ak-charcoal-muted flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-ak-charcoal-light" />
                    Account Role
                  </span>
                  <span className="font-semibold text-ak-charcoal capitalize">
                    {admin.role || "Superadmin"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-ak-charcoal/5">
                  <span className="text-ak-charcoal-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ak-charcoal-light" />
                    Last Active Login
                  </span>
                  <span className="font-medium text-ak-charcoal text-[11px]">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Current Active Session"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-ak-charcoal-muted flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-ak-charcoal-light" />
                    Security Level
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    JWT / BCRYPT-12
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture & Security Notice */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-ak-burgundy" />
                <h3 className="font-serif text-sm font-bold text-ak-charcoal">
                  Security Architecture
                </h3>
              </div>
              <p className="text-xs text-ak-charcoal-muted leading-relaxed">
                Initial admin provisioning reads from deployment environment variables. 
                Once created, your credentials are saved in MongoDB Atlas and managed here.
              </p>
              <div className="space-y-2 text-[11px] text-ak-charcoal-muted pt-2 border-t border-ak-charcoal/5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Passphrases hashed with salted bcrypt (cost factor 12)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Session tokens signed with HMAC-SHA256</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>HTTP-only, SameSite-strict cookie security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Credentials never logged or returned in responses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Update Forms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Form 1: Update Name */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ak-charcoal/10">
                <User className="w-4 h-4 text-ak-charcoal" />
                <h2 className="font-serif text-base font-bold text-ak-charcoal">
                  Administrator Display Name
                </h2>
              </div>

              {nameFeedback && (
                <div
                  className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    nameFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : nameFeedback.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {nameFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{nameFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    Full Name / Title
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Store Administrator"
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                  />
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">
                    Displayed in the dashboard navigation bar and order activity notes.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={nameLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ak-charcoal hover:bg-ak-charcoal/90 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {nameLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Name</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Email Address */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-ak-charcoal/10">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ak-charcoal" />
                  <h2 className="font-serif text-base font-bold text-ak-charcoal">
                    Change Login Email Address
                  </h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                  Requires Password
                </span>
              </div>

              {emailFeedback && (
                <div
                  className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    emailFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : emailFeedback.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {emailFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{emailFeedback.message}</span>
                </div>
              )}

              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Changing your administrator email will immediately log you out. 
                  You will need to sign in again using the new email address.
                </p>
              </div>

              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    Current Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={admin.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/10 bg-ak-charcoal/5 text-xs text-ak-charcoal-muted cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="new-admin@ak-kiosk.de"
                    maxLength={120}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    Current Password (for authorization)
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailCurrentPassword ? "text" : "password"}
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailCurrentPassword(!showEmailCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                    >
                      {showEmailCurrentPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ak-burgundy hover:bg-[#60122A] text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Update Email Address</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form 3: Change Password */}
            <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-ak-charcoal/10">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-ak-charcoal" />
                  <h2 className="font-serif text-base font-bold text-ak-charcoal">
                    Change Password
                  </h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold uppercase tracking-wider">
                  High Security
                </span>
              </div>

              {passwordFeedback && (
                <div
                  className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : passwordFeedback.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {passwordFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordCurrent ? "text" : "password"}
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                    >
                      {showPasswordCurrent ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordNew ? "text" : "password"}
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="Enter new strong password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordNew(!showPasswordNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                    >
                      {showPasswordNew ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                {passwordNew.length > 0 && (
                  <div className="p-3 rounded-2xl bg-ak-icy-blue/40 border border-ak-charcoal/5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {hasMinLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className={hasMinLength ? "text-emerald-800 font-medium" : "text-ak-charcoal-muted"}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasUpperCase ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className={hasUpperCase ? "text-emerald-800 font-medium" : "text-ak-charcoal-muted"}>
                        Uppercase letter (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasLowerCase ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className={hasLowerCase ? "text-emerald-800 font-medium" : "text-ak-charcoal-muted"}>
                        Lowercase letter (a-z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className={hasNumber ? "text-emerald-800 font-medium" : "text-ak-charcoal-muted"}>
                        Numeric digit (0-9)
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ak-burgundy hover:bg-[#60122A] text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
