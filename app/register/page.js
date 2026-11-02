"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
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
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/lib/features";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const { isLoggedIn, register } = useAuth();

  // Redirect to homepage if customer registration is temporarily hidden
  useEffect(() => {
    if (!FEATURES.ENABLE_CUSTOMER_AUTH) {
      router.replace("/");
    }
  }, [router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isLoggedIn && !registerSuccess) {
      const destination = from && from.startsWith("/") ? from : "/account";
      router.replace(destination);
    }
  }, [isLoggedIn, registerSuccess, from, router]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!password) {
      newErrors.password = "Please enter a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "Password must include at least one letter and one number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must agree to the terms and privacy policy.";
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
      const result = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );

      if (result.success) {
        setRegisterSuccess(true);
        const destination = from && from.startsWith("/") ? from : "/account";
        setTimeout(() => {
          router.push(destination);
        }, 600);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ form: result.message || "Failed to create account. Please try again." });
        }
      }
    } catch {
      setErrors({ form: "An unexpected error occurred during registration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginLink = from ? `/login?from=${encodeURIComponent(from)}` : "/login";

  // Password requirements checklist indicators
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

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
              <UserPlus className="w-7 h-7" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-ak-burgundy block mb-1">
              New Customer Registration
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ak-charcoal tracking-tight mb-2">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-ak-charcoal-muted max-w-sm mx-auto">
              Join AK Kiosk, enjoy faster local checkout in Oberhausen, and track your Asian market grocery deliveries.
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Card */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 -mt-4 mb-16 w-full flex-1">
        <div className="rounded-[2rem] bg-white/85 backdrop-blur-md p-6 sm:p-10 border border-ak-ivory-border shadow-float">
          
          {errors.form && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {registerSuccess && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created successfully! Welcome to AK Kiosk...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label
                  htmlFor="name-input"
                  className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block"
                >
                  Full Name
                </label>
                <span className="text-[10px] text-ak-charcoal-light">Required</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name-input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Alex Schmidt"
                  className={`w-full pl-10 pr-4 py-3 rounded-full bg-ak-ivory/60 border text-xs text-ak-charcoal placeholder-ak-charcoal/40 transition-all focus:outline-none focus:bg-white ${
                    errors.name
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-ak-charcoal/15 focus:border-ak-charcoal focus:ring-2 focus:ring-ak-charcoal/10"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

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
                <span className="text-[10px] text-ak-charcoal-light">Min 8 chars</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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

              {/* Password strength helpers */}
              <div className="mt-2 flex items-center gap-3 text-[10px] text-ak-charcoal-light pl-2">
                <span className={`inline-flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-semibold" : ""}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? "text-emerald-600" : "text-ak-charcoal/30"}`} />
                  8+ characters
                </span>
                <span className={`inline-flex items-center gap-1 ${hasLetter ? "text-emerald-700 font-semibold" : ""}`}>
                  <Check className={`w-3 h-3 ${hasLetter ? "text-emerald-600" : "text-ak-charcoal/30"}`} />
                  Letters
                </span>
                <span className={`inline-flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-semibold" : ""}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? "text-emerald-600" : "text-ak-charcoal/30"}`} />
                  Numbers
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label
                  htmlFor="confirm-password-input"
                  className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block"
                >
                  Confirm Password
                </label>
                <span className="text-[10px] text-ak-charcoal-light">Required</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-full bg-ak-ivory/60 border text-xs text-ak-charcoal placeholder-ak-charcoal/40 transition-all focus:outline-none focus:bg-white ${
                    errors.confirmPassword
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-ak-charcoal/15 focus:border-ak-charcoal focus:ring-2 focus:ring-ak-charcoal/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: null }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-ak-charcoal/20 text-ak-charcoal focus:ring-ak-charcoal cursor-pointer accent-ak-charcoal shrink-0"
                />
                <span className="text-xs text-ak-charcoal-muted leading-relaxed">
                  I agree to the{" "}
                  <span className="text-ak-charcoal font-medium underline">Terms of Service</span> and{" "}
                  <span className="text-ak-charcoal font-medium underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.terms}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || registerSuccess}
              className="w-full py-3.5 px-6 rounded-full bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 pt-6 border-t border-ak-charcoal/10 text-center">
            <p className="text-xs text-ak-charcoal-muted">
              Already have an account?{" "}
              <Link
                href={loginLink}
                className="text-ak-burgundy font-semibold hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-ak-charcoal/5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-ak-charcoal-light">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Registration • Oberhausen, Germany</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ak-pale-grey flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-ak-burgundy animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
