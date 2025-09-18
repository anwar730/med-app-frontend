import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Reports() {
  // Hooks (must be top-level)
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("summary"); // summary | appointments | medical
  const [appointmentStatus, setAppointmentStatus] = useState("in_progress"); // in_progress | completed | cancelled
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 4;
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/billings", label: "Billings" },
  ];

  // Fetch data
  useEffect(() => {
    fetchSummary();
    fetchAppointments();
    fetchMedicalRecords();
  }, []);

  async function fetchSummary() {
    try {
      const res = await API.get("/admin/summary");
      setSummary(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch reports data");
    }
  }

  async function fetchAppointments() {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch appointments");
    }
  }

  async function fetchMedicalRecords() {
    try {
      const res = await API.get("/medical_records");
      setMedicalRecords(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch medical records");
    }
  }

  // Colors for charts
  const COLORS = ["#2563eb", "#16a34a", "#facc15", "#f43f5e"];

  // Data for charts
  const roleData = summary
    ? [
        { name: "Doctors", value: summary.total_doctors },
        { name: "Pending Doctors", value: summary.total_pending_doctors },
        { name: "Patients", value: summary.total_patients },
        { name: "Admins", value: summary.total_admins },
      ]
    : [];

  const activityData = summary
    ? [
        { name: "Appointments", count: summary.total_appointments },
        { name: "Medical Records", count: summary.total_medical_records },
        { name: "Prescriptions", count: summary.total_prescriptions },
        { name: "Billings", count: summary.total_billings },
      ]
    : [];

  // Group medical records by patient
  const groupedByPatient = medicalRecords.reduce((acc, record) => {
    const pid = record.patient.id;
    if (!acc[pid]) acc[pid] = { patient: record.patient, records: [] };
    acc[pid].records.push(record);
    return acc;
  }, {});

  // Filter and paginate appointments
  const filteredAppointments = appointments.filter(
    (a) => a.status === appointmentStatus
  );
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  function nextPage() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }

  function prevPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  // Reset page when tab or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, appointmentStatus]);

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar links={links} />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 bg-gray-50 min-h-screen">
          <Toaster position="top-right" />
          <h2 className="text-3xl font-bold mb-6">Reports & Analytics</h2>

          {/* Main Tabs */}
          <div className="flex gap-4 border-b mb-6">
            {["summary", "appointments", "medical"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "summary"
                  ? "Summary"
                  : tab === "appointments"
                  ? "Appointments"
                  : "Medical Records"}
              </button>
            ))}
          </div>

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold">{summary.total_users}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Appointments</p>
                  <h3 className="text-2xl font-bold">{summary.total_appointments}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Medical Records</p>
                  <h3 className="text-2xl font-bold">{summary.total_medical_records}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow">
                  <p className="text-gray-500">Revenue</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    Ksh {summary.total_revenue}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow">
                  <h3 className="text-xl font-semibold mb-4">User Roles</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                  <h3 className="text-xl font-semibold mb-4">System Activity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-4">Appointments</h3>

              {/* Status Sub-tabs */}
              <div className="flex gap-4 border-b mb-4">
                {["in_progress", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setAppointmentStatus(status)}
                    className={`px-4 py-2 font-medium capitalize ${
                      appointmentStatus === status
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Appointments Table */}
              <table className="min-w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2">ID</th>
                    <th className="border px-3 py-2">Patient</th>
                    <th className="border px-3 py-2">Doctor</th>
                    <th className="border px-3 py-2">Time</th>
                    <th className="border px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((a) => (
                    <tr key={a.id}>
                      <td className="border px-3 py-2">{a.id}</td>
                      <td className="border px-3 py-2">{a.patient?.name || "N/A"}</td>
                      <td className="border px-3 py-2">{a.doctor?.name || "N/A"}</td>
                      <td className="border px-3 py-2">
                        {new Date(a.scheduled_at).toLocaleString()}
                      </td>
                      <td className="border px-3 py-2">{a.status}</td>
                    </tr>
                  ))}
                  {currentAppointments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="border px-3 py-2 text-center text-gray-500">
                        No appointments in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === "medical" && (
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-4">Medical Records</h3>
              {Object.values(groupedByPatient).map(({ patient, records }) => (
                <div
                  key={patient.id}
                  className="mb-6 border rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-t-xl">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {patient.name} (ID: {patient.id})
                      </p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedPatientId(
                          expandedPatientId === patient.id ? null : patient.id
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {expandedPatientId === patient.id ? "Hide Records" : "View Records"}
                    </button>
                  </div>

                  {expandedPatientId === patient.id && (
                    <div className="p-4">
                      {records.map((rec) => (
                        <div
                          key={rec.id}
                          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
                        >
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Record #{rec.id}
                          </h4>
                          <p>
                            <span className="font-medium">Diagnosis:</span> {rec.diagnosis}
                          </p>
                          <p>
                            <span className="font-medium">Treatment:</span> {rec.treatment}
                          </p>
                          <p>
                            <span className="font-medium">Notes:</span> {rec.notes}
                          </p>
                          {rec.prescriptions?.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium text-gray-800 mb-1">Prescriptions:</p>
                              <ul className="list-disc list-inside text-gray-600">
                                {rec.prescriptions.map((p) => (
                                  <li key={p.id}>
                                    {p.medication_name} – {p.dosage} ({p.instructions})
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
    </div>
  );
}
