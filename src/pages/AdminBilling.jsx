// AdminBilling.jsx
import React, { useEffect, useState, useRef } from "react";
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
  const [showReports, setShowReports] = useState(false);

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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Billing Management</h1>
              <p className="text-sm text-gray-600">Track and manage all billing transactions</p>
            </div>
            <button
              onClick={() => setShowReports(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Reports
            </button>
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

            {/* Sidebar */}
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
                  <button
                    onClick={() => setShowReports(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Reports
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

      {selectedBilling && (
        <BillingDetailsModal billing={selectedBilling} onClose={() => setSelectedBilling(null)} />
      )}

      {showReports && (
        <ReportsModal billings={billings} stats={stats} onClose={() => setShowReports(false)} />
      )}
    </div>
  );
}

// ─── REPORTS MODAL ────────────────────────────────────────────────────────────

function ReportsModal({ billings, stats, onClose }) {
  const [activeReport, setActiveReport] = useState("revenue");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const printRef = useRef();

  const reportTypes = [
    { id: "revenue", label: "Revenue Summary", icon: "💰" },
    { id: "status", label: "Paid vs Unpaid", icon: "📊" },
    { id: "doctor", label: "Per-Doctor Earnings", icon: "👨‍⚕️" },
    { id: "patient", label: "Patient Billing History", icon: "🧾" },
    { id: "invoice", label: "Individual Invoices", icon: "📄" },
  ];

  const filtered = billings.filter((b) => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(b.created_at);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  // ── aggregations ──
  const totalRevenue = filtered.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const paidBillings = filtered.filter((b) => b.status === "paid");
  const unpaidBillings = filtered.filter((b) => b.status !== "paid");
  const paidRevenue = paidBillings.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const unpaidRevenue = unpaidBillings.reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  const byDoctor = filtered.reduce((acc, b) => {
    const name = b.appointment?.doctor?.name || "Unknown Doctor";
    if (!acc[name]) acc[name] = { name, total: 0, paid: 0, unpaid: 0, count: 0 };
    acc[name].total += parseFloat(b.amount || 0);
    acc[name].count += 1;
    if (b.status === "paid") acc[name].paid += parseFloat(b.amount || 0);
    else acc[name].unpaid += parseFloat(b.amount || 0);
    return acc;
  }, {});

  const byPatient = filtered.reduce((acc, b) => {
    const name = b.appointment?.patient?.name || "Unknown Patient";
    const email = b.appointment?.patient?.email || "";
    const key = name + email;
    if (!acc[key]) acc[key] = { name, email, billings: [], total: 0, paid: 0 };
    acc[key].billings.push(b);
    acc[key].total += parseFloat(b.amount || 0);
    if (b.status === "paid") acc[key].paid += parseFloat(b.amount || 0);
    return acc;
  }, {});

  // ── CSV helpers ──
  function downloadCSV(rows, filename) {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportRevenueSummaryCSV() {
    const rows = [
      ["Revenue Summary Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Billings", filtered.length],
      ["Total Revenue (KES)", totalRevenue.toFixed(2)],
      ["Paid Revenue (KES)", paidRevenue.toFixed(2)],
      ["Unpaid Revenue (KES)", unpaidRevenue.toFixed(2)],
      ["Collection Rate (%)", filtered.length ? ((paidBillings.length / filtered.length) * 100).toFixed(1) : "0"],
    ];
    downloadCSV(rows, "revenue-summary.csv");
  }

  function exportStatusCSV() {
    const rows = [
      ["Status Breakdown Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["ID", "Patient", "Email", "Doctor", "Amount (KES)", "Status", "Date"],
      ...filtered.map((b) => [
        b.id,
        b.appointment?.patient?.name || "N/A",
        b.appointment?.patient?.email || "N/A",
        b.appointment?.doctor?.name || "N/A",
        parseFloat(b.amount || 0).toFixed(2),
        b.status,
        new Date(b.created_at).toLocaleDateString(),
      ]),
    ];
    downloadCSV(rows, "status-breakdown.csv");
  }

  function exportDoctorCSV() {
    const rows = [
      ["Per-Doctor Earnings Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Doctor", "Total Billings", "Revenue (KES)", "Paid (KES)", "Unpaid (KES)"],
      ...Object.values(byDoctor).sort((a, b) => b.total - a.total).map((d) => [
        d.name, d.count, d.total.toFixed(2), d.paid.toFixed(2), d.unpaid.toFixed(2),
      ]),
    ];
    downloadCSV(rows, "doctor-earnings.csv");
  }

  function exportPatientCSV() {
    const rows = [
      ["Patient Billing History Report"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Patient", "Email", "Total Billings", "Total (KES)", "Paid (KES)", "Outstanding (KES)"],
      ...Object.values(byPatient).sort((a, b) => b.total - a.total).map((p) => [
        p.name, p.email, p.billings.length, p.total.toFixed(2), p.paid.toFixed(2),
        (p.total - p.paid).toFixed(2),
      ]),
    ];
    downloadCSV(rows, "patient-history.csv");
  }

  function exportAllBillingsCSV() {
    const rows = [
      ["All Billings Export"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["ID", "Patient", "Patient Email", "Doctor", "Amount (KES)", "Status", "Created", "Updated"],
      ...filtered.map((b) => [
        b.id,
        b.appointment?.patient?.name || "N/A",
        b.appointment?.patient?.email || "N/A",
        b.appointment?.doctor?.name || "N/A",
        parseFloat(b.amount || 0).toFixed(2),
        b.status,
        new Date(b.created_at).toLocaleDateString(),
        new Date(b.updated_at).toLocaleDateString(),
      ]),
    ];
    downloadCSV(rows, "all-billings.csv");
  }

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Billing Report</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
            h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
            h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
            .meta { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
            .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .stat-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .stat-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
            .stat-val { font-size: 20px; font-weight: 700; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
            td { padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
            tr:nth-child(even) td { background: #fafafa; }
            .badge-paid { color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
            .badge-unpaid { color: #c2410c; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; color: #9ca3af; font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
  const now = new Date().toLocaleString("en-KE");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reports Center</h2>
            <p className="text-xs text-gray-500 mt-0.5">Generate, preview, download or print billing reports</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel — Report Types */}
          <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Report Type</p>
            <div className="space-y-1">
              {reportTypes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveReport(r.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeReport === r.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Date Range</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="w-full text-xs text-blue-600 hover:underline text-left"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {filtered.length} billing{filtered.length !== 1 ? "s" : ""} in range
              </p>
            </div>
          </div>

          {/* Right Panel — Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
              <p className="text-sm font-medium text-gray-700">
                {reportTypes.find((r) => r.id === activeReport)?.label} Preview
              </p>
              <div className="flex items-center gap-2">
                {/* Per-report CSV */}
                {activeReport === "revenue" && (
                  <button onClick={exportRevenueSummaryCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download CSV
                  </button>
                )}
                {activeReport === "status" && (
                  <button onClick={exportStatusCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download CSV
                  </button>
                )}
                {activeReport === "doctor" && (
                  <button onClick={exportDoctorCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download CSV
                  </button>
                )}
                {activeReport === "patient" && (
                  <button onClick={exportPatientCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download CSV
                  </button>
                )}
                {activeReport === "invoice" && (
                  <button onClick={exportAllBillingsCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download CSV
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Print Preview Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div ref={printRef} className="bg-white rounded-lg shadow-sm p-8 min-h-full">

                {/* ── Report: Revenue Summary ── */}
                {activeReport === "revenue" && (
                  <div>
                    <ReportHeader title="Revenue Summary Report" generated={now} dateFrom={dateFrom} dateTo={dateTo} />
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <PrintStatBox label="Total Revenue" value={`KES ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                      <PrintStatBox label="Paid Revenue" value={`KES ${paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="green" />
                      <PrintStatBox label="Unpaid Revenue" value={`KES ${unpaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="orange" />
                      <PrintStatBox label="Collection Rate" value={`${filtered.length ? ((paidBillings.length / filtered.length) * 100).toFixed(1) : 0}%`} />
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">All Billings ({filtered.length})</h2>
                    <PrintTable
                      headers={["#", "Patient", "Doctor", "Amount (KES)", "Status", "Date"]}
                      rows={filtered.map((b, i) => [
                        i + 1,
                        b.appointment?.patient?.name || "N/A",
                        b.appointment?.doctor?.name || "N/A",
                        parseFloat(b.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                        b.status,
                        fmtDate(b.created_at),
                      ])}
                      statusCol={4}
                    />
                    <ReportFooter />
                  </div>
                )}

                {/* ── Report: Paid vs Unpaid ── */}
                {activeReport === "status" && (
                  <div>
                    <ReportHeader title="Payment Status Breakdown" generated={now} dateFrom={dateFrom} dateTo={dateTo} />
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="border border-green-200 rounded-lg p-5 bg-green-50">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Paid</p>
                        <p className="text-3xl font-bold text-green-900 mb-1">KES {paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-green-700">{paidBillings.length} invoice{paidBillings.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="border border-orange-200 rounded-lg p-5 bg-orange-50">
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Unpaid</p>
                        <p className="text-3xl font-bold text-orange-900 mb-1">KES {unpaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-orange-700">{unpaidBillings.length} invoice{unpaidBillings.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {paidBillings.length > 0 && (
                      <>
                        <h2 className="text-sm font-semibold text-green-800 mb-3 pb-2 border-b border-gray-200">Paid Invoices ({paidBillings.length})</h2>
                        <PrintTable
                          headers={["ID", "Patient", "Doctor", "Amount (KES)", "Paid On"]}
                          rows={paidBillings.map((b) => [
                            `#${b.id}`, b.appointment?.patient?.name || "N/A",
                            b.appointment?.doctor?.name || "N/A",
                            parseFloat(b.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                            fmtDate(b.updated_at),
                          ])}
                        />
                      </>
                    )}
                    {unpaidBillings.length > 0 && (
                      <>
                        <h2 className="text-sm font-semibold text-orange-800 mb-3 pb-2 border-b border-gray-200 mt-6">Unpaid Invoices ({unpaidBillings.length})</h2>
                        <PrintTable
                          headers={["ID", "Patient", "Doctor", "Amount (KES)", "Created"]}
                          rows={unpaidBillings.map((b) => [
                            `#${b.id}`, b.appointment?.patient?.name || "N/A",
                            b.appointment?.doctor?.name || "N/A",
                            parseFloat(b.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                            fmtDate(b.created_at),
                          ])}
                        />
                      </>
                    )}
                    <ReportFooter />
                  </div>
                )}

                {/* ── Report: Per-Doctor Earnings ── */}
                {activeReport === "doctor" && (
                  <div>
                    <ReportHeader title="Per-Doctor Earnings Report" generated={now} dateFrom={dateFrom} dateTo={dateTo} />
                    <PrintTable
                      headers={["Doctor", "Total Billings", "Revenue (KES)", "Paid (KES)", "Outstanding (KES)"]}
                      rows={Object.values(byDoctor)
                        .sort((a, b) => b.total - a.total)
                        .map((d) => [
                          d.name="Dr. Anwar", d.count,
                          d.total.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                          d.paid.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                          d.unpaid.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                        ])}
                    />
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-8 text-sm">
                      <span className="text-gray-500">Grand Total: <strong className="text-gray-900">KES {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                      <span className="text-gray-500">Collected: <strong className="text-green-700">KES {paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                    <ReportFooter />
                  </div>
                )}

                {/* ── Report: Patient Billing History ── */}
                {activeReport === "patient" && (
                  <div>
                    <ReportHeader title="Patient Billing History" generated={now} dateFrom={dateFrom} dateTo={dateTo} />
                    {Object.values(byPatient)
                      .sort((a, b) => b.total - a.total)
                      .map((p, idx) => (
                        <div key={idx} className="mb-8">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.email}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-500">Total: <strong className="text-gray-900">KES {p.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
                              <p className="text-gray-500">Paid: <strong className="text-green-700">KES {p.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
                            </div>
                          </div>
                          <PrintTable
                            headers={["ID", "Doctor", "Amount (KES)", "Status", "Date"]}
                            rows={p.billings.map((b) => [
                              `#${b.id}`,
                              b.appointment?.doctor?.name || "N/A",
                              parseFloat(b.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                              b.status,
                              fmtDate(b.created_at),
                            ])}
                            statusCol={3}
                          />
                        </div>
                      ))}
                    <ReportFooter />
                  </div>
                )}

                {/* ── Report: Individual Invoices ── */}
                {activeReport === "invoice" && (
                  <div>
                    <ReportHeader title="Individual Invoices" generated={now} dateFrom={dateFrom} dateTo={dateTo} />
                    <p className="text-xs text-gray-500 mb-6">Each billing below represents a printable invoice. Use Print to generate a PDF with all invoices.</p>
                    {filtered.map((b, idx) => (
                      <div key={b.id} className={`border border-gray-200 rounded-lg p-6 mb-6 ${idx > 0 ? "page-break" : ""}`} style={{ pageBreakBefore: idx > 0 ? "always" : "auto" }}>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Invoice</p>
                            <p className="text-2xl font-bold text-gray-900">#{b.id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {b.status === "paid" ? "PAID" : "UNPAID"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Patient</p>
                            <p className="text-sm font-medium text-gray-900">{b.appointment?.patient?.name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{b.appointment?.patient?.email || ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Doctor</p>
                            <p className="text-sm font-medium text-gray-900">{b.appointment?.doctor?.name ? `Dr. ${b.appointment.doctor.name}` : "N/A"}</p>
                            <p className="text-xs text-gray-500">{b.appointment?.doctor?.email || ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Date</p>
                            <p className="text-sm font-medium text-gray-900">{fmtDate(b.created_at)}</p>
                            <p className="text-xs text-gray-500">Appt #{b.appointment_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">Consultation Fee</p>
                          <p className="text-2xl font-bold text-gray-900">KES {parseFloat(b.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        {b.status === "paid" && (
                          <p className="text-xs text-green-600 mt-2">✓ Payment received on {fmtDate(b.updated_at)}</p>
                        )}
                      </div>
                    ))}
                    <ReportFooter />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT HELPERS ────────────────────────────────────────────────────────────

function ReportHeader({ title, generated, dateFrom, dateTo }) {
  return (
    <div className="mb-6 pb-5 border-b-2 border-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Medical Billing System</p>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {(dateFrom || dateTo) && (
            <p className="text-sm text-gray-500 mt-1">
              Period: {dateFrom || "All time"} → {dateTo || "Present"}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Generated</p>
          <p className="text-sm font-medium text-gray-700">{generated}</p>
        </div>
      </div>
    </div>
  );
}

function ReportFooter() {
  return (
    <div className="mt-12 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-400">This report was generated by the Medical Billing System. For internal use only. © {new Date().getFullYear()}</p>
    </div>
  );
}

function PrintStatBox({ label, value, accent }) {
  const colors = {
    green: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
    default: "border-gray-200 bg-gray-50",
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[accent] || colors.default}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PrintTable({ headers, rows, statusCol }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-3 py-4 text-center text-xs text-gray-400">No data</td></tr>
          ) : rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                  {statusCol === ci ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cell === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>{cell}</span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── EXISTING COMPONENTS (unchanged) ─────────────────────────────────────────

function StatCard({ label, value, change, icon, trend }) {
  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-orange-600 bg-orange-50",
    neutral: "text-gray-600 bg-gray-50"
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendColors[trend]}`}>{change}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
      {label}
    </button>
  );
}

function BillingCard({ billing, onClick }) {
  const isPaid = billing.status === "paid";
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-mono text-gray-500">#{billing.id}</span>
            <h4 className="font-semibold text-gray-900">{billing.appointment?.patient?.name || "Unknown Patient"}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{billing.appointment?.patient?.email || "No email"}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isPaid ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
          {isPaid ? "Paid" : "Unpaid"}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Amount</p>
          <p className="text-lg font-semibold text-gray-900">KES {parseFloat(billing.amount).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">{isPaid ? "Paid on" : "Created"}</p>
          <p className="text-sm text-gray-700">{formatDate(billing.updated_at || billing.created_at)}</p>
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
        <p className="text-sm font-medium text-gray-900 truncate">{payment.appointment?.patient?.name || "Unknown"}</p>
        <p className="text-xs text-gray-500 mt-0.5">KES {parseFloat(payment.amount).toLocaleString()}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(payment.updated_at)}</span>
    </div>
  );
}

function BillingDetailsModal({ billing, onClose }) {
  const isPaid = billing.status === "paid";
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Billing Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className={`p-4 rounded-lg border ${isPaid ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPaid ? "bg-green-100" : "bg-orange-100"}`}>
                {isPaid ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div>
                <p className={`font-semibold ${isPaid ? "text-green-900" : "text-orange-900"}`}>{isPaid ? "Payment Completed" : "Payment Pending"}</p>
                <p className={`text-sm ${isPaid ? "text-green-700" : "text-orange-700"}`}>{isPaid ? `Paid on ${formatDateTime(billing.updated_at)}` : "Awaiting payment from patient"}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Billing ID" value={`#${billing.id}`} />
              <DetailItem label="Appointment ID" value={`#${billing.appointment_id}`} />
              <DetailItem label="Amount" value={`KES ${parseFloat(billing.amount).toLocaleString()}`} />
              <DetailItem label="Status" value={billing.status} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Name" value={billing.appointment?.patient?.name || "N/A"} />
              <DetailItem label="Email" value={billing.appointment?.patient?.email || "N/A"} />
            </div>
          </div>
          {billing.appointment?.doctor && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Doctor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Name" value={billing.appointment.doctor.name || "N/A"} />
                <DetailItem label="Email" value={billing.appointment.doctor.email || "N/A"} />
              </div>
            </div>
          )}
          {(billing.session_id || billing.payment_intent) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-3">
                {billing.payment_intent && <DetailItem label="Payment Intent" value={billing.payment_intent} className="font-mono text-xs break-all" />}
                {billing.session_id && <DetailItem label="Session ID" value={billing.session_id} className="font-mono text-xs break-all" />}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Created" value={formatDateTime(billing.created_at)} />
              <DetailItem label="Last Updated" value={formatDateTime(billing.updated_at)} />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Download Receipt</button>
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">Send Email</button>
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