"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/lib/features";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const { isLoggedIn, login } = useAuth();

  // Redirect to homepage if customer authentication is temporarily hidden
  useEffect(() => {
    if (!FEATURES.ENABLE_CUSTOMER_AUTH) {
      router.replace("/");
    }
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot Password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ sent: false, error: "" });

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isLoggedIn && !loginSuccess) {
      const destination = from && from.startsWith("/") ? from : "/account";
      router.replace(destination);
    }
  }, [isLoggedIn, loginSuccess, from, router]);

  // Load remembered email on mount if previously saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("ak_kiosk_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Validation logic
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Remember me email client convenience
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("ak_kiosk_remembered_email", email.trim());
        } else {
          localStorage.removeItem("ak_kiosk_remembered_email");
        }
      }

      const result = await login(email.trim(), password, rememberMe);

      if (result.success) {
        setLoginSuccess(true);
        const destination = from && from.startsWith("/") ? from : "/account";
        setTimeout(() => {
          router.push(destination);
        }, 500);
      } else {
        setErrors({ form: result.message || "Invalid email address or password." });
      }
    } catch {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!forgotEmail.trim()) {
      setForgotStatus({ sent: false, error: "Please enter your email address." });
      return;
    }
    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotStatus({ sent: false, error: "Please enter a valid email address." });
      return;
    }

    setForgotStatus({ sent: true, error: "" });
  };

  const registerLink = from ? `/register?from=${encodeURIComponent(from)}` : "/register";

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
      {/* Top Hero Frame with Integrated Architectural Navbar */}
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-6 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Store</span>
            </Link>

            <div className="w-14 h-14 rounded-full bg-white/80 border border-ak-charcoal/10 flex items-center justify-center mx-auto mb-4 text-ak-charcoal shadow-sm">
              <User className="w-7 h-7" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-ak-burgundy block mb-1">
              Customer Account
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ak-charcoal tracking-tight mb-2">
              Sign In to AK Kiosk
            </h1>
            <p className="text-xs sm:text-sm text-ak-charcoal-muted max-w-sm mx-auto">
              Access your order history, manage delivery addresses in Oberhausen, and save favorite Asian treats.
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Card Section */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 -mt-4 mb-16 w-full flex-1">
        <div className="rounded-[2rem] bg-white/85 backdrop-blur-md p-6 sm:p-10 border border-ak-ivory-border shadow-float">
          
          {/* General Form Error Alert */}
          {errors.form && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Login Success Notification */}
          {loginSuccess && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Signed in successfully! Redirecting...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label
                  htmlFor="email-input"
                  className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block"
                >
                  Email Address
                </label>
                <span className="text-[10px] text-ak-charcoal-light">Required</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="name@example.de"
                  className={`w-full pl-10 pr-4 py-3 rounded-full bg-ak-ivory/60 border text-xs text-ak-charcoal placeholder-ak-charcoal/40 transition-all focus:outline-none focus:bg-white ${
                    errors.email
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-ak-charcoal/15 focus:border-ak-charcoal focus:ring-2 focus:ring-ak-charcoal/10"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label
                  htmlFor="password-input"
                  className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmail(email);
                    setForgotStatus({ sent: false, error: "" });
                  }}
                  className="text-[11px] text-ak-burgundy font-medium hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-full bg-ak-ivory/60 border text-xs text-ak-charcoal placeholder-ak-charcoal/40 transition-all focus:outline-none focus:bg-white ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-ak-charcoal/15 focus:border-ak-charcoal focus:ring-2 focus:ring-ak-charcoal/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-ak-charcoal/20 text-ak-charcoal focus:ring-ak-charcoal cursor-pointer accent-ak-charcoal"
                />
                <span className="text-ak-charcoal-muted">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loginSuccess}
              className="w-full py-3.5 px-6 rounded-full bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-ak-charcoal/10 text-center">
            <p className="text-xs text-ak-charcoal-muted">
              Don&apos;t have an account yet?{" "}
              <Link
                href={registerLink}
                className="text-ak-burgundy font-semibold hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>Register here</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {/* Security Trust Badge */}
          <div className="mt-6 pt-4 border-t border-ak-charcoal/5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-ak-charcoal-light">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-Bit SSL Encrypted Access</span>
          </div>
        </div>

        <div className="mt-4 px-4 text-center">
          <p className="text-[11px] text-ak-charcoal-light">
            AK Kiosk & Asian Market • Buschhausener Str. 63, 46049 Oberhausen
          </p>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ak-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-ak-ivory border border-ak-ivory-border p-6 sm:p-8 shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-ak-charcoal mb-2">
              Reset Your Password
            </h3>
            <p className="text-xs text-ak-charcoal-muted mb-6 leading-relaxed">
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>

            {forgotStatus.sent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Reset Instructions Sent</p>
                    <p className="text-[11px] mt-0.5 text-emerald-700">
                      If an account exists for <strong>{forgotEmail}</strong>, you will receive an email shortly with reset steps.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-3 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotStatus.error) setForgotStatus({ sent: false, error: "" });
                    }}
                    placeholder="name@example.de"
                    className="w-full px-4 py-3 rounded-full bg-white border border-ak-charcoal/15 text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal"
                  />
                  {forgotStatus.error && (
                    <p className="mt-1 text-[11px] text-rose-600 pl-2">
                      {forgotStatus.error}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-3 rounded-full bg-ak-pale-grey/60 text-ak-charcoal text-xs uppercase tracking-wider font-semibold hover:bg-ak-pale-grey transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ak-pale-grey flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-ak-burgundy animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
