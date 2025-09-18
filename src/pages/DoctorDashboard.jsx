import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, FileText, UserCheck } from "lucide-react";

export default function DoctorDashboard() {
  const [overview, setOverview] = useState({
    todays_appointments: 0,
    total_patients: 0,
    completed_appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/doctor/appointments", label: "Appointments", icon: <Calendar size={18} /> },
    { path: "/doctor/patient-records", label: "Patient Records", icon: <FileText size={18} /> },
    { path: "/profile", label: "Profile", icon: <UserCheck size={18} /> },
  ];

  useEffect(() => {
    async function fetchOverview() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/appointments", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const appointments = await res.json();

        const today = new Date().toISOString().split("T")[0];

        const todaysAppointments = appointments.filter((appt) => appt.date === today).length;
        const completedAppointments = appointments.filter((appt) => appt.status === "completed").length;
        const uniquePatients = new Set(appointments.map((appt) => appt.patient_id)).size;

        setOverview({
          todays_appointments: todaysAppointments,
          total_patients: uniquePatients,
          completed_appointments: completedAppointments,
        });
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Sidebar */}
      <Sidebar links={links} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Welcome, Doctor 👨‍⚕️</h2>
            <p className="text-gray-600 mt-1">
              Manage your appointments and patient records efficiently.
            </p>
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex flex-col items-center">
                <Calendar className="text-blue-600 mb-2" size={28} />
                <p className="text-3xl font-bold text-blue-600">
                  {overview.todays_appointments}
                </p>
                <p className="text-sm text-gray-600 mt-1">Today's Appointments</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex flex-col items-center">
                <UserCheck className="text-green-600 mb-2" size={28} />
                <p className="text-3xl font-bold text-green-600">
                  {overview.total_patients}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Patients</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex flex-col items-center">
                <FileText className="text-purple-600 mb-2" size={28} />
                <p className="text-3xl font-bold text-purple-600">
                  {overview.completed_appointments}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed Appointments</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/doctor/appointments"
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition"
            >
              <Calendar className="text-blue-600 mb-3" size={36} />
              <h3 className="font-semibold text-lg text-gray-800">
                Appointments
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                View and manage upcoming appointments.
              </p>
            </a>

            <a
              href="/doctor/patient-records"
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition"
            >
              <FileText className="text-green-600 mb-3" size={36} />
              <h3 className="font-semibold text-lg text-gray-800">
                Patient Records
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Access patient history and prescriptions.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
