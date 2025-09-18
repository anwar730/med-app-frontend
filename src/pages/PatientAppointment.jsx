// PatientAppointments.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, Clock, FileText, CreditCard } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import PatientMedicalRecordModal from "./PatientMedicalRecordModal";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/dash/appointments", label: "My Appointments", icon: <Calendar size={18} /> },
    { path: "/dashboard/records", label: "My Records", icon: <FileText size={18} /> },
    { path: "/dashboard/billing", label: "Billing", icon: <CreditCard size={18} /> },
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/appointments", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel appointment");
      toast.success("Appointment cancelled");
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling appointment");
    }
  }

  async function handleUpdate(id) {
    if (!newDate || !newTime) {
      toast.error("Please select new date and time");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const scheduled_at = `${newDate}T${newTime}:00`;
      const res = await fetch(`http://localhost:3000/appointments/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_at }),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      toast.success("Appointment updated");
      setEditingId(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Error updating appointment");
    }
  }

  // Group appointments
  const upcoming = appointments.filter((a) => a.status === "confirmed");
  const pending = appointments.filter((a) => a.status === "pending");
  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <Section
                title="Upcoming Appointments"
                color="blue"
                list={upcoming}
                editingId={editingId}
                setEditingId={setEditingId}
                newDate={newDate}
                setNewDate={setNewDate}
                newTime={newTime}
                setNewTime={setNewTime}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                setSelectedRecord={setSelectedRecord}
              />
              <Section
                title="Awaiting Confirmation"
                color="yellow"
                list={pending}
                editingId={editingId}
                setEditingId={setEditingId}
                newDate={newDate}
                setNewDate={setNewDate}
                newTime={newTime}
                setNewTime={setNewTime}
                handleCancel={handleCancel}
                handleUpdate={handleUpdate}
                setSelectedRecord={setSelectedRecord}
              />
              <Section
                title="Completed Appointments"
                color="green"
                list={completed}
                readOnly
                setSelectedRecord={setSelectedRecord}
              />
            </>
          )}
        </div>
      </div>

      {/* Medical Record Modal */}
      {selectedRecord && (
        <PatientMedicalRecordModal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          appointment={selectedRecord}
        />
      )}
    </div>
  );
}

// Section Component
function Section({
  title,
  list,
  color,
  readOnly = false,
  editingId,
  setEditingId,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  handleCancel,
  handleUpdate,
  setSelectedRecord,
}) {
  return (
    <div>
      <h2
        className={`text-xl font-bold mb-4 flex items-center gap-2 text-${color}-600`}
      >
        <Calendar /> {title}
      </h2>

      {list.length === 0 ? (
        <p className="text-gray-500 italic">
          {readOnly ? "No completed appointments." : "No appointments."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <AppointmentItem
              key={a.id}
              appt={a}
              readOnly={readOnly}
              editingId={editingId}
              setEditingId={setEditingId}
              newDate={newDate}
              setNewDate={setNewDate}
              newTime={newTime}
              setNewTime={setNewTime}
              handleCancel={handleCancel}
              handleUpdate={handleUpdate}
              setSelectedRecord={setSelectedRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Appointment Item Component
function AppointmentItem({
  appt,
  readOnly,
  editingId,
  setEditingId,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  handleCancel,
  handleUpdate,
  setSelectedRecord,
}) {
  const statusColors = {
    confirmed: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="shadow rounded-xl p-4 bg-white border hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800">
          Appointment with Dr. {appt.doctor?.name || "N/A"}
        </p>
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            statusColors[appt.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {appt.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
        <Clock size={14} />{" "}
        {new Date(appt.scheduled_at).toLocaleString("en-KE", {
          timeZone: "Africa/Nairobi",
        })}
      </p>
      {appt.notes && (
        <p className="mt-2 text-gray-600 text-sm">Notes: {appt.notes}</p>
      )}

      {!readOnly && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setEditingId(appt.id)}
            className="px-3 py-1 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleCancel(appt.id)}
            className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Edit Form */}
      {!readOnly && editingId === appt.id && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} 
            />
            <input
              type="time"
              className="border rounded px-2 py-1 text-sm"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              onClick={() => handleUpdate(appt.id)}
              className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-3 py-1 text-sm rounded-lg bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Medical Record button */}
      {readOnly && appt.medical_record && (
        <button
          onClick={() => setSelectedRecord(appt)}
          className="mt-3 px-3 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          View Medical Record
        </button>
      )}
    </div>
  );
}
