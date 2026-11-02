"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("from") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    if (!email.trim() || !password) {
      setError("Please provide both administrator email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Please verify your credentials.");
      }

      // Successful login -> redirect to dashboard
      router.push(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] bg-white/85 backdrop-blur-md border-[2px] border-ak-ivory shadow-frame p-8 sm:p-10">
      
      {/* Brand & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ak-charcoal text-ak-ivory shadow-md mb-4">
          <Lock className="w-6 h-6 text-ak-gold" />
        </div>
        
        <div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-ak-charcoal block uppercase">
            AK KIOSK
          </span>
          <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-ak-burgundy block mt-0.5">
            ASIAN MARKET • ADMIN PORTAL
          </span>
        </div>

        <p className="text-xs text-ak-charcoal-muted mt-3">
          Authorized personnel only. Please sign in with your administrator credentials.
        </p>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-ak-charcoal mb-1.5">
            Administrator Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ak-kiosk.de"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-ak-charcoal/15 text-sm text-ak-charcoal placeholder-ak-charcoal-light/50 focus:outline-none focus:border-ak-charcoal focus:ring-1 focus:ring-ak-charcoal transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-ak-charcoal mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ak-charcoal-light">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white border border-ak-charcoal/15 text-sm text-ak-charcoal placeholder-ak-charcoal-light/50 focus:outline-none focus:border-ak-charcoal focus:ring-1 focus:ring-ak-charcoal transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ak-charcoal-light hover:text-ak-charcoal focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-ak-charcoal select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-ak-charcoal/20 text-ak-burgundy focus:ring-ak-burgundy"
            />
            <span>Keep me signed in for 7 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-ak-gold" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <span>Sign In to Admin Panel</span>
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-8 pt-6 border-t border-ak-charcoal/10 text-center">
        <p className="text-[11px] text-ak-charcoal-muted leading-relaxed">
          Sessions are cryptographically signed with HTTP-only cookies.
          Unauthorized access attempts are monitored and logged.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CBD8DC] via-[#DCE8EB] to-[#CBD8DC] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      
      {/* Top Bar with Return to Store */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-ak-charcoal hover:text-ak-burgundy transition-colors px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-ak-charcoal/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customer Store</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-ak-charcoal-light">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">Encrypted Staff Gateway</span>
        </div>
      </div>

      {/* Center Login Container wrapped in Suspense */}
      <div className="w-full max-w-md mx-auto my-8">
        <Suspense
          fallback={
            <div className="rounded-[2.5rem] bg-white/85 p-12 text-center text-xs text-ak-charcoal-muted">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-ak-gold mb-3" />
              <span>Loading administrator gateway...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-[11px] text-ak-charcoal-muted">
        © {new Date().getFullYear()} AK Kiosk & Asian Market • Buschhausener Str. 63, 46049 Oberhausen
      </div>
    </div>
  );
}
