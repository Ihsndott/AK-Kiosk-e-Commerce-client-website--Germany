"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-float border border-ak-charcoal/10 p-8 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-ak-charcoal text-center mb-2">
          Remove Subscriber
        </h3>
        <p className="text-xs text-ak-charcoal-muted text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:border-ak-charcoal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/subscribers?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribers(data.data);
        setPagination(data.pagination);
      } else if (res.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(data.message || "Failed to load subscribers.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/subscribers?id=${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers((prev) => prev.filter((s) => s._id !== deleteTarget));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } else {
        setError(data.message || "Failed to remove subscriber.");
      }
    } catch {
      setError("Network error during deletion.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "csv", limit: "10000" });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/subscribers?${params}`);
      if (!res.ok) {
        setError("CSV export failed. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ak-kiosk-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Confirm delete dialog */}
      {deleteTarget && (
        <ConfirmDialog
          message="This subscriber will be permanently removed from the mailing list."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
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
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            {pagination.total > 0
              ? `${pagination.total} active subscriber${pagination.total === 1 ? "" : "s"}`
              : "Customers registered for weekly Asian grocery drops and store discounts"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSubscribers}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ak-charcoal/15 text-xs font-semibold text-ak-charcoal hover:border-ak-charcoal transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting || pagination.total === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ak-charcoal hover:bg-ak-burgundy disabled:opacity-50 text-ak-ivory text-xs font-semibold transition-colors"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ak-charcoal-muted" />
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-muted hover:text-ak-charcoal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-ak-charcoal-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Loading subscribers…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && subscribers.length === 0 && (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 p-10 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-ak-icy-blue text-ak-charcoal mx-auto flex items-center justify-center mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold text-ak-charcoal mb-2">
            {search ? "No matching subscribers" : "No subscribers yet"}
          </h2>
          <p className="text-xs text-ak-charcoal-muted leading-relaxed">
            {search
              ? "Try adjusting your search."
              : "Email addresses submitted through the footer newsletter signup will appear here."}
          </p>
        </div>
      )}

      {/* Subscriber list */}
      {!loading && subscribers.length > 0 && (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 overflow-hidden shadow-xs">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[3fr_2fr_1fr_auto] gap-4 px-6 py-3 border-b border-ak-charcoal/10 bg-ak-pale-grey/40">
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Email Address</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Subscribed</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Source</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Remove</span>
          </div>

          <div className="divide-y divide-ak-charcoal/5">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber._id}
                className="px-4 sm:px-6 py-4 hover:bg-ak-pale-grey/20 transition-colors"
              >
                {/* Mobile */}
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ak-charcoal truncate">
                      {subscriber.email}
                    </p>
                    <p className="text-xs text-ak-charcoal-muted mt-0.5">
                      {new Date(subscriber.createdAt).toLocaleDateString("de-DE")} ·{" "}
                      {subscriber.source || "footer"}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(subscriber._id)}
                    className="w-8 h-8 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[3fr_2fr_1fr_auto] gap-4 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-ak-icy-blue flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-ak-charcoal" />
                    </div>
                    <p className="text-sm font-semibold text-ak-charcoal truncate">
                      {subscriber.email}
                    </p>
                  </div>
                  <p className="text-xs text-ak-charcoal-muted">
                    {new Date(subscriber.createdAt).toLocaleString("de-DE")}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ak-icy-blue/60 text-ak-charcoal text-[10px] font-semibold uppercase tracking-wider">
                    {subscriber.source || "footer"}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(subscriber._id)}
                    className="w-7 h-7 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-ak-charcoal/10 flex items-center justify-between">
              <p className="text-xs text-ak-charcoal-muted">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-8 h-8 rounded-full border border-ak-charcoal/15 flex items-center justify-center text-ak-charcoal hover:border-ak-charcoal disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="w-8 h-8 rounded-full border border-ak-charcoal/15 flex items-center justify-center text-ak-charcoal hover:border-ak-charcoal disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
