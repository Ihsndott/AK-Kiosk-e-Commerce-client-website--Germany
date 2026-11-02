"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreLocation from "@/components/home/StoreLocation";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validateClient() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Your name is required.";
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!form.subject.trim()) errors.subject = "Subject is required.";
    if (!form.message.trim() || form.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validateClient();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStatus("submitting");
    setFieldErrors({});
    setServerMessage("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setServerMessage(data.message || "Message sent!");
      } else if (res.status === 422 && data.errors) {
        setStatus("idle");
        setFieldErrors(data.errors);
        setServerMessage(data.message || "Please correct the errors below.");
      } else if (res.status === 429) {
        setStatus("error");
        setServerMessage(data.message || "Too many submissions. Please try again later.");
      } else {
        setStatus("error");
        setServerMessage(data.message || "Failed to send message. Please try again.");
      }
    } catch {
      setStatus("error");
      setServerMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              Get in Touch
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Store Location &amp; Contact
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-2 max-w-xl mx-auto">
              Have a product request, wholesale inquiry, or need directions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 flex-1 w-full space-y-12">
        <StoreLocation />

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-ak-charcoal text-center mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-ak-charcoal-muted text-center mb-6">
            We typically respond within 24 hours during business days.
          </p>

          {/* Success state */}
          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-ak-charcoal">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-ak-charcoal-muted mt-1 max-w-sm mx-auto">
                {serverMessage || "Thank you for contacting AK Kiosk & Asian Market. We'll get back to you within 24 hours."}
              </p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setForm({ name: "", email: "", subject: "", message: "" });
                  setServerMessage("");
                }}
                className="mt-6 px-6 py-2.5 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:border-ak-burgundy hover:text-ak-burgundy transition-colors"
              >
                Send Another Message
              </button>
            </div>
          )}

          {/* Error banner */}
          {status === "error" && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{serverMessage}</p>
            </div>
          )}

          {/* Form */}
          {status !== "success" && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                    Your Name <span className="text-ak-burgundy">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Alex"
                    maxLength={120}
                    className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors ${
                      fieldErrors.name
                        ? "border-rose-400 bg-rose-50/30"
                        : "border-ak-charcoal/15"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                    Email Address <span className="text-ak-burgundy">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="alex@example.de"
                    maxLength={254}
                    className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors ${
                      fieldErrors.email
                        ? "border-rose-400 bg-rose-50/30"
                        : "border-ak-charcoal/15"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                  Subject <span className="text-ak-burgundy">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Inquiring about Korean Shin Ramyun bulk pack"
                  maxLength={200}
                  className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors ${
                    fieldErrors.subject
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-ak-charcoal/15"
                  }`}
                />
                {fieldErrors.subject && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.subject}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                  Message <span className="text-ak-burgundy">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  maxLength={5000}
                  className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors resize-none ${
                    fieldErrors.message
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-ak-charcoal/15"
                  }`}
                />
                <div className="flex items-start justify-between mt-1">
                  {fieldErrors.message ? (
                    <p className="text-[11px] text-rose-600">{fieldErrors.message}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] text-ak-charcoal-muted">
                    {form.message.length}/5000
                  </span>
                </div>
              </div>

              {/* Server-side validation error banner (non-429) */}
              {status === "error" && !serverMessage.includes("Too many") && null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-3.5 rounded-full bg-ak-charcoal hover:bg-ak-burgundy disabled:opacity-60 disabled:cursor-not-allowed text-ak-ivory text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
