import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import AppointmentCard from "./AppointmentCard";
import { Calendar, FileText, CreditCard } from "lucide-react";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const links = [
      { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
      { path: "/doctor/appointments", label: "Appointments", icon: <Calendar size={18} /> },
      { path: "/doctor/patient-records", label: "Patient Records", icon: <FileText size={18} /> },
      { path: "/profile", label: "Profile", icon: <FileText size={18} /> }
    ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      let data = await res.json();

      // ✅ Sort appointments by status
      const statusOrder = ["confirmed", "pending", "completed"];
      data.sort(
        (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      );

      setAppointments(data);
    } catch (err) {
      console.error(err);
      alert("Error loading appointments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
          {loading ? (
            <p>Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">No appointments found.</p>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onUpdate={fetchAppointments}
                  showActions={appt.status !== "completed"} // only show edit/cancel for upcoming/pending
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
