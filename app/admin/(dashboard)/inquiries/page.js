"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";

const STATUS_LABELS = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_STYLES = {
  new: "bg-rose-100 text-rose-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-float border border-ak-charcoal/10 p-8 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-ak-charcoal text-center mb-2">
          Confirm Deletion
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function InquiryDetailModal({ inquiry, onClose, onStatusChange }) {
  const [status, setStatus] = useState(inquiry.status);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleStatusSave() {
    if (status === inquiry.status) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry._id, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onStatusChange(inquiry._id, status);
        onClose();
      } else {
        setSaveError(data.message || "Failed to update status.");
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-float border border-ak-charcoal/10 p-6 sm:p-8 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[inquiry.status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[inquiry.status] || inquiry.status}
            </span>
            <h3 className="font-serif text-xl font-bold text-ak-charcoal mt-2">
              {inquiry.subject}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ak-pale-grey flex items-center justify-center text-ak-charcoal hover:bg-ak-charcoal hover:text-ak-ivory transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sender info */}
        <div className="p-4 rounded-2xl bg-ak-icy-blue/30 border border-ak-charcoal/10 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-ak-charcoal-muted uppercase tracking-wider text-[10px]">From</span>
              <p className="font-semibold text-ak-charcoal mt-0.5">{inquiry.name}</p>
            </div>
            <div>
              <span className="text-ak-charcoal-muted uppercase tracking-wider text-[10px]">Email</span>
              <a
                href={`mailto:${inquiry.email}`}
                className="font-semibold text-ak-burgundy hover:underline mt-0.5 block"
              >
                {inquiry.email}
              </a>
            </div>
            <div>
              <span className="text-ak-charcoal-muted uppercase tracking-wider text-[10px]">Received</span>
              <p className="font-semibold text-ak-charcoal mt-0.5">
                {new Date(inquiry.createdAt).toLocaleString("de-DE")}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-5">
          <h4 className="text-[11px] uppercase tracking-wider text-ak-charcoal-muted mb-2">Message</h4>
          <div className="p-4 rounded-2xl bg-ak-pale-grey/40 border border-ak-charcoal/10 text-sm text-ak-charcoal leading-relaxed whitespace-pre-wrap">
            {inquiry.message}
          </div>
        </div>

        {/* Status update */}
        <div className="mb-5">
          <h4 className="text-[11px] uppercase tracking-wider text-ak-charcoal-muted mb-2">Update Status</h4>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  status === opt.value
                    ? "bg-ak-charcoal text-ak-ivory border-ak-charcoal"
                    : "border-ak-charcoal/20 text-ak-charcoal hover:border-ak-charcoal"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {saveError && (
            <p className="text-xs text-rose-600 mt-2">{saveError}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:border-ak-charcoal transition-colors"
          >
            Close
          </button>
          <a
            href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
            className="flex-1 py-2.5 rounded-full bg-ak-icy-blue border border-ak-charcoal/10 text-xs font-semibold text-ak-charcoal hover:bg-ak-icy-blue/80 transition-colors text-center"
          >
            Reply by Email
          </a>
          <button
            onClick={handleStatusSave}
            disabled={saving || status === inquiry.status}
            className="flex-1 py-2.5 rounded-full bg-ak-charcoal hover:bg-ak-burgundy disabled:opacity-50 text-ak-ivory text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Save Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/inquiries?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setInquiries(data.data);
        setPagination(data.pagination);
      } else if (res.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(data.message || "Failed to load inquiries.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) => prev.filter((i) => i._id !== deleteTarget));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } else {
        setError(data.message || "Failed to delete inquiry.");
      }
    } catch {
      setError("Network error during deletion.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function handleStatusChange(id, newStatus) {
    setInquiries((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
    );
  }

  const statusCounts = inquiries.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Confirm delete dialog */}
      {deleteTarget && (
        <ConfirmDialog
          message="This inquiry will be permanently deleted and cannot be recovered."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Detail modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status);
            setSelectedInquiry(null);
          }}
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
            Customer Inquiries &amp; Messages
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            {pagination.total > 0
              ? `${pagination.total} inquir${pagination.total === 1 ? "y" : "ies"} total`
              : "Messages submitted via the Contact page"}
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ak-charcoal/15 text-xs font-semibold text-ak-charcoal hover:border-ak-charcoal transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ak-charcoal-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal focus:outline-none focus:border-ak-charcoal transition-colors"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
          <span className="text-sm">Loading inquiries…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && inquiries.length === 0 && (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 p-10 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-ak-charcoal/10 text-ak-charcoal mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold text-ak-charcoal mb-2">
            {search || statusFilter ? "No matching inquiries" : "No inquiries yet"}
          </h2>
          <p className="text-xs text-ak-charcoal-muted leading-relaxed">
            {search || statusFilter
              ? "Try adjusting your search or filter."
              : "Customer inquiries submitted through the Contact page will appear here."}
          </p>
        </div>
      )}

      {/* Inquiry list */}
      {!loading && inquiries.length > 0 && (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 overflow-hidden shadow-xs">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_3fr_1fr_auto] gap-4 px-6 py-3 border-b border-ak-charcoal/10 bg-ak-pale-grey/40">
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Sender</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Subject</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Preview</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Status</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">Actions</span>
          </div>

          <div className="divide-y divide-ak-charcoal/5">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="px-4 md:px-6 py-4 hover:bg-ak-pale-grey/20 transition-colors"
              >
                {/* Mobile layout */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ak-charcoal truncate">{inquiry.name}</p>
                      <p className="text-xs text-ak-charcoal-muted truncate">{inquiry.email}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[inquiry.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[inquiry.status] || inquiry.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-ak-charcoal">{inquiry.subject}</p>
                  <p className="text-xs text-ak-charcoal-muted line-clamp-2">{inquiry.message}</p>
                  <p className="text-[10px] text-ak-charcoal-muted">
                    {new Date(inquiry.createdAt).toLocaleString("de-DE")}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="flex-1 py-1.5 rounded-full bg-ak-charcoal text-ak-ivory text-[10px] font-semibold uppercase tracking-wider hover:bg-ak-burgundy transition-colors"
                    >
                      View &amp; Update
                    </button>
                    <button
                      onClick={() => setDeleteTarget(inquiry._id)}
                      className="w-8 h-8 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-[2fr_2fr_3fr_1fr_auto] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ak-charcoal truncate">{inquiry.name}</p>
                    <p className="text-xs text-ak-charcoal-muted truncate">{inquiry.email}</p>
                    <p className="text-[10px] text-ak-charcoal-muted mt-0.5">
                      {new Date(inquiry.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-ak-charcoal truncate">{inquiry.subject}</p>
                  <p className="text-xs text-ak-charcoal-muted line-clamp-2">{inquiry.message}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${STATUS_STYLES[inquiry.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[inquiry.status] || inquiry.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="px-3 py-1.5 rounded-full bg-ak-charcoal text-ak-ivory text-[10px] font-semibold uppercase tracking-wider hover:bg-ak-burgundy transition-colors whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setDeleteTarget(inquiry._id)}
                      className="w-7 h-7 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
