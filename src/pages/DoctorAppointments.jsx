import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import AppointmentCard from "./AppointmentCard";
import { Calendar, FileText, Filter, Search, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/doctor/appointments", label: "Appointments", icon: <Calendar size={18} /> },
    { path: "/doctor/patient-records", label: "Patient Records", icon: <FileText size={18} /> },
    { path: "/profile", label: "Profile", icon: <FileText size={18} /> }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter]);

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      let data = await res.json();

      const statusOrder = ["confirmed", "in_progress", "pending", "completed"];
      data.sort((a, b) => {
        const statusCompare = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        if (statusCompare !== 0) return statusCompare;
        return new Date(b.date) - new Date(a.date);
      });

      setAppointments(data);
    } catch (err) {
      console.error(err);
      alert("Error loading appointments");
    } finally {
      setLoading(false);
    }
  }

  function filterAppointments() {
    let filtered = appointments;

    if (statusFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(appt =>
        new Date(appt.date).toDateString() === today &&
        (appt.status === "confirmed" || appt.status === "in_progress")
      );
    } else if (statusFilter !== "all") {
      filtered = filtered.filter(appt =>
        appt.status === statusFilter ||
        (statusFilter === "confirmed" && appt.status === "in_progress")
      );
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(appt =>
        appt.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.reason?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }

  const getStatusCounts = () => {
    const today = new Date().toDateString();
    return {
      upcoming: appointments.filter(a =>
        a.status === "confirmed" || a.status === "in_progress"
      ).length,
      pending: appointments.filter(a => a.status === "pending").length,
      today: appointments.filter(a =>
        new Date(a.date).toDateString() === today &&
        (a.status === "confirmed" || a.status === "in_progress")
      ).length,
      completed: appointments.filter(a => a.status === "completed").length,
    };
  };

  const statusCounts = getStatusCounts();

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              My Appointments
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all your patient appointments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            {/* Upcoming */}
            <div
              onClick={() => setStatusFilter("confirmed")}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer ${
                statusFilter === "confirmed"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">
                {statusCounts.upcoming}
              </p>
            </div>

            {/* Pending */}
            <div
              onClick={() => setStatusFilter("pending")}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer ${
                statusFilter === "pending"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {statusCounts.pending}
              </p>
            </div>

            {/* Today */}
            <div
              onClick={() => setStatusFilter("today")}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer ${
                statusFilter === "today"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-3xl font-bold text-purple-600">
                {statusCounts.today}
              </p>
            </div>

            {/* Completed */}
            <div
              onClick={() => setStatusFilter("completed")}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer ${
                statusFilter === "completed"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {statusCounts.completed}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-xl mb-6 border">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onUpdate={fetchAppointments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}