// AdminBilling.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";

export default function AdminBilling() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBilling, setSelectedBilling] = useState(null);

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/billings", label: "Billings" }
  ];

  useEffect(() => {
    fetchBillings();
    fetchStats();
  }, []);

  async function fetchBillings() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/billings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch billings");
      const data = await res.json();
      setBillings(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading billings");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/billings/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredBillings = billings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      b.appointment?.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.appointment?.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.appointment_id?.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const recentPayments = billings
    .filter((b) => b.status === "paid")
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  const filteredTotal = filteredBillings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const paidTotal = filteredBillings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6">
          <Toaster position="top-right" />

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Billing Management</h1>
            <p className="text-sm text-gray-600">Track and manage all billing transactions</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Revenue"
              value={`KES ${stats?.total_revenue?.toLocaleString() || "0"}`}
              change="+12.5%"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend="up"
            />
            <StatCard
              label="Paid Invoices"
              value={stats?.paid_count || 0}
              change={`${((stats?.paid_count / stats?.total_billings) * 100 || 0).toFixed(0)}%`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend="neutral"
            />
            <StatCard
              label="Pending Payments"
              value={stats?.unpaid_count || 0}
              change={`KES ${(stats?.total_revenue - paidTotal || 0).toLocaleString()}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend="down"
            />
            <StatCard
              label="Total Billings"
              value={stats?.total_billings || 0}
              change="All time"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              trend="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Billings Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by patient name, email, or appointment ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" />
                    <FilterButton active={filter === "paid"} onClick={() => setFilter("paid")} label="Paid" />
                    <FilterButton active={filter === "unpaid"} onClick={() => setFilter("unpaid")} label="Unpaid" />
                  </div>
                </div>

                {/* Summary */}
                {filteredBillings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Showing {filteredBillings.length} {filteredBillings.length === 1 ? 'billing' : 'billings'}
                    </span>
                    <div className="flex gap-6">
                      <span className="text-gray-600">
                        Total: <span className="font-semibold text-gray-900">KES {filteredTotal.toLocaleString()}</span>
                      </span>
                      <span className="text-gray-600">
                        Paid: <span className="font-semibold text-green-600">KES {paidTotal.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Billings List */}
              {loading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading billings...</p>
                  </div>
                </div>
              ) : filteredBillings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">No billings found</p>
                    <p className="text-xs text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBillings.map((billing) => (
                    <BillingCard
                      key={billing.id}
                      billing={billing}
                      onClick={() => setSelectedBilling(billing)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent Payments</h3>
                  <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">
                    {recentPayments.length} paid
                  </span>
                </div>

                <div className="space-y-3">
                  {recentPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">No payments yet</p>
                    </div>
                  ) : (
                    recentPayments.map((payment) => (
                      <RecentPaymentItem key={payment.id} payment={payment} />
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Reminders
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedBilling && (
        <BillingDetailsModal billing={selectedBilling} onClose={() => setSelectedBilling(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, change, icon, trend }) {
  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-orange-600 bg-orange-50",
    neutral: "text-gray-600 bg-gray-50"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendColors[trend]}`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function BillingCard({ billing, onClick }) {
  const isPaid = billing.status === "paid";
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500">#{billing.id}</span>
              <span className="text-xs text-gray-400">•</span>
              
            </div>
            <h4 className="font-semibold text-gray-900">
              {billing.appointment?.patient?.name || "Unknown Patient"}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {billing.appointment?.patient?.email || "No email"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isPaid 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-orange-50 text-orange-700 border border-orange-200"
          }`}>
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Amount</p>
          <p className="text-lg font-semibold text-gray-900">
            KES {parseFloat(billing.amount).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">
            {isPaid ? "Paid on" : "Created"}
          </p>
          <p className="text-sm text-gray-700">
            {formatDate(billing.updated_at || billing.created_at)}
          </p>
        </div>
      </div>

      {billing.appointment?.doctor?.name && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Dr. {billing.appointment.doctor.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentPaymentItem({ payment }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="p-1.5 bg-green-50 rounded-lg">
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {payment.appointment?.patient?.name || "Unknown"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          KES {parseFloat(payment.amount).toLocaleString()}
        </p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatDate(payment.updated_at)}
      </span>
    </div>
  );
}

function BillingDetailsModal({ billing, onClose }) {
  const isPaid = billing.status === "paid";

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Billing Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            isPaid 
              ? "bg-green-50 border-green-200" 
              : "bg-orange-50 border-orange-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isPaid ? "bg-green-100" : "bg-orange-100"
              }`}>
                {isPaid ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`font-semibold ${isPaid ? "text-green-900" : "text-orange-900"}`}>
                  {isPaid ? "Payment Completed" : "Payment Pending"}
                </p>
                <p className={`text-sm ${isPaid ? "text-green-700" : "text-orange-700"}`}>
                  {isPaid 
                    ? `Paid on ${formatDateTime(billing.updated_at)}`
                    : "Awaiting payment from patient"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Billing ID" value={`#${billing.id}`} />
              <DetailItem label="Appointment ID" value={`#${billing.appointment_id}`} />
              <DetailItem 
                label="Amount" 
                value={`KES ${parseFloat(billing.amount).toLocaleString()}`}
                className="font-semibold"
              />
              <DetailItem label="Status" value={billing.status} />
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                label="Name" 
                value={billing.appointment?.patient?.name || "N/A"} 
              />
              <DetailItem 
                label="Email" 
                value={billing.appointment?.patient?.email || "N/A"} 
              />
            </div>
          </div>

          {/* Doctor Information */}
          {billing.appointment?.doctor && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Doctor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem 
                  label="Name" 
                  value={billing.appointment.doctor.name || "N/A"} 
                />
                <DetailItem 
                  label="Email" 
                  value={billing.appointment.doctor.email || "N/A"} 
                />
              </div>
            </div>
          )}

          {/* Payment Details */}
          {(billing.session_id || billing.payment_intent) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-3">
                {billing.payment_intent && (
                  <DetailItem 
                    label="Payment Intent" 
                    value={billing.payment_intent}
                    className="font-mono text-xs break-all"
                  />
                )}
                {billing.session_id && (
                  <DetailItem 
                    label="Session ID" 
                    value={billing.session_id}
                    className="font-mono text-xs break-all"
                  />
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Created" value={formatDateTime(billing.created_at)} />
              <DetailItem label="Last Updated" value={formatDateTime(billing.updated_at)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Download Receipt
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, className = "" }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm text-gray-900 ${className}`}>{value}</p>
    </div>
  );
}