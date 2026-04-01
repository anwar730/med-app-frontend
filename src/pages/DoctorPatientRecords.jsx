import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, FileText, User, Pill, Download, Printer, FileDown, ChevronDown, ChevronUp, BarChart2, X } from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// CSV export
function exportCSV(patients) {
  const rows = [["Patient Name", "Diagnosis", "Treatment", "Appointment Date", "Medications"]];
  patients.forEach((patient) => {
    patient.records.forEach((rec) => {
      const meds = (rec.prescriptions || [])
        .map((p) => `${p.medication_name} ${p.dosage}`)
        .join("; ");
      rows.push([
        patient.name,
        rec.diagnosis,
        rec.treatment,
        formatDate(rec.appointment.scheduled_at),
        meds,
      ]);
    });
  });

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patient-records-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// PDF via print-to-PDF (uses browser print dialog targeted at the report)
function exportPDF(printRef) {
  const content = printRef.current?.innerHTML;
  if (!content) return;
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Patient Records Report</title>
        <style>
          body { font-family: Georgia, serif; padding: 32px; color: #1a1a1a; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
          .patient { margin-bottom: 28px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
          .patient-name { font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          .record { margin-bottom: 12px; padding: 10px; background: #f9f9f9; border-left: 4px solid #16a34a; border-radius: 4px; }
          .label { font-weight: 600; font-size: 12px; color: #444; }
          .value { font-size: 13px; color: #222; margin-bottom: 4px; }
          .meds { margin-top: 8px; padding: 8px; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; }
          .meds-title { font-size: 12px; font-weight: bold; margin-bottom: 4px; }
          ul { margin: 0; padding-left: 16px; font-size: 12px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Patient Records Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString("en-KE")}</p>
        ${content}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// Print — same as PDF export but targets the browser print dialog
function printReport(printRef) {
  exportPDF(printRef);
}

// ── Report Modal ───────────────────────────────────────────────────────────

function ReportModal({ patients, onClose, printRef }) {
  const totalRecords = patients.reduce((s, p) => s + p.records.length, 0);
  const diagnosisCounts = {};
  patients.forEach((p) =>
    p.records.forEach((r) => {
      diagnosisCounts[r.diagnosis] = (diagnosisCounts[r.diagnosis] || 0) + 1;
    })
  );
  const topDiagnoses = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-green-600" size={22} />
            <h3 className="text-lg font-bold text-gray-800">Patient Records Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(patients)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <FileDown size={14} /> Export CSV
            </button>
            <button
              onClick={() => exportPDF(printRef)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <Download size={14} /> Export PDF
            </button>
            <button
              onClick={() => printReport(printRef)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{patients.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Patients</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{totalRecords}</p>
              <p className="text-xs text-gray-500 mt-1">Total Records</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">
                {(totalRecords / Math.max(patients.length, 1)).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Avg Records / Patient</p>
            </div>
          </div>

          {/* Top diagnoses */}
          {topDiagnoses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Diagnoses</h4>
              <div className="space-y-2">
                {topDiagnoses.map(([diag, count]) => (
                  <div key={diag} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-48 truncate">{diag}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(count / totalRecords) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Printable detail section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Patient Details</h4>

            {/* This div is the print target */}
            <div ref={printRef} className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="border rounded-xl p-4 bg-gray-50">
                  <p className="font-semibold text-gray-800 text-sm border-b pb-2 mb-3">
                    {patient.name}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({patient.records.length} record{patient.records.length !== 1 ? "s" : ""})
                    </span>
                  </p>

                  <div className="space-y-2">
                    {patient.records.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white rounded-lg p-3 border-l-4 border-green-400 shadow-sm"
                      >
                        <div className="label text-xs text-gray-500">Diagnosis</div>
                        <div className="value text-sm font-medium text-gray-800 mb-1">{rec.diagnosis}</div>
                        <div className="label text-xs text-gray-500">Treatment</div>
                        <div className="value text-sm text-gray-700 mb-1">{rec.treatment}</div>
                        <div className="label text-xs text-gray-500">Appointment</div>
                        <div className="value text-sm text-gray-600">{formatDate(rec.appointment.scheduled_at)}</div>

                        {rec.prescriptions?.length > 0 && (
                          <div className="meds mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                            <div className="meds-title text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                              <Pill size={12} /> Prescriptions
                            </div>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                              {rec.prescriptions.map((p) => (
                                <li key={p.id}>
                                  {p.medication_name} — {p.dosage}{p.instructions ? ` (${p.instructions})` : ""}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DoctorPatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef(null);

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/doctor/appointments", label: "Appointments", icon: <User size={18} /> },
    { path: "/doctor/patient-records", label: "Patient Records", icon: <FileText size={18} /> },
    { path: "/profile", label: "Profile", icon: <FileText size={18} /> },
  ];

  useEffect(() => {
    async function fetchRecords() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/medical_records", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();

        const grouped = data.reduce((acc, record) => {
          const patientId = record.patient.id;
          if (!acc[patientId]) acc[patientId] = { ...record.patient, records: [] };
          acc[patientId].records.push(record);
          return acc;
        }, {});

        setPatients(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  const toggleRecords = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="p-6 overflow-y-auto flex-1">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-green-600" /> Patient Records
            </h2>

            {/* Action buttons — only shown when there's data */}
            {!loading && patients.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCSV(patients)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
                >
                  <FileDown size={15} /> Export CSV
                </button>
                <button
                  onClick={() => exportPDF(printRef)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
                >
                  <Download size={15} /> Export PDF
                </button>
                <button
                  onClick={() => printReport(printRef)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition font-medium"
                >
                  <BarChart2 size={15} /> Generate Report
                </button>
              </div>
            )}
          </div>

          {/* Patient list */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : patients.length === 0 ? (
            <p className="text-gray-500">No patient records found.</p>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white shadow-sm rounded-xl p-4 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{patient.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {patient.records.length} record{patient.records.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRecords(patient.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {expandedPatient === patient.id ? (
                        <><ChevronUp size={14} /> Hide Records</>
                      ) : (
                        <><ChevronDown size={14} /> View Records</>
                      )}
                    </button>
                  </div>

                  {expandedPatient === patient.id && (
                    <div className="mt-4 space-y-3">
                      {patient.records.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400"
                        >
                          <p className="text-sm font-semibold text-gray-800">
                            Diagnosis: {rec.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600">Treatment: {rec.treatment}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(rec.appointment.scheduled_at)}
                          </p>

                          {rec.prescriptions?.length > 0 && (
                            <div className="mt-2 bg-white rounded-lg p-2 border border-gray-100">
                              <h4 className="text-xs font-semibold flex items-center gap-1 text-gray-700 mb-1">
                                <Pill size={13} /> Prescriptions
                              </h4>
                              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                {rec.prescriptions.map((p) => (
                                  <li key={p.id}>
                                    {p.medication_name} — {p.dosage} ({p.instructions})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden printable area always in DOM so ref is valid */}
      <div ref={printRef} style={{ display: "none" }}>
        {patients.map((patient) => (
          <div key={patient.id} className="patient">
            <div className="patient-name">{patient.name}</div>
            {patient.records.map((rec) => (
              <div key={rec.id} className="record">
                <div className="label">Diagnosis</div>
                <div className="value">{rec.diagnosis}</div>
                <div className="label">Treatment</div>
                <div className="value">{rec.treatment}</div>
                <div className="label">Appointment</div>
                <div className="value">{formatDate(rec.appointment.scheduled_at)}</div>
                {rec.prescriptions?.length > 0 && (
                  <div className="meds">
                    <div className="meds-title">Prescriptions</div>
                    <ul>
                      {rec.prescriptions.map((p) => (
                        <li key={p.id}>{p.medication_name} — {p.dosage} ({p.instructions})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Report modal */}
      {showReport && (
        <ReportModal
          patients={patients}
          onClose={() => setShowReport(false)}
          printRef={printRef}
        />
      )}
    </div>
  );
}