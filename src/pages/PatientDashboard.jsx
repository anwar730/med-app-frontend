import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, FileText, CreditCard, UserCheck } from "lucide-react";

export default function PatientDashboard() {
  const [overview, setOverview] = useState({
    upcoming_appointments: 0,
    medical_records: 0,
    pending_bills: 0,
    outstanding_balance: 0,
  });
  const [loading, setLoading] = useState(false);

  // Booking state
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [appointments, setAppointments] = useState([]);

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/dash/appointments", label: "My Appointments", icon: <Calendar size={18} /> },
    { path: "/dashboard/records", label: "My Records", icon: <FileText size={18} /> },
    { path: "/dashboard/billing", label: "Billing", icon: <CreditCard size={18} /> },
  ];

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");

      try {
        // Fetch users → filter doctors
        const resUsers = await fetch("http://localhost:3000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = await resUsers.json();
        setDoctors(users.filter((u) => u.role === "doctor"));

        // Fetch patient appointments
        const resAppts = await fetch("http://localhost:3000/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appts = await resAppts.json();
        setAppointments(appts);

        // Fetch medical records
        const resRecords = await fetch("http://localhost:3000/medical_records", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recordsData = await resRecords.json();

        // Build overview numbers
        const upcoming = appts.filter((a) => a.status !== "completed").length;
        const records = recordsData.length;
        const pendingBills = appts.filter(
          (a) => a.billing && a.billing.status === "unpaid"
        ).length;
        const outstandingBalance = appts.reduce(
          (sum, a) =>
            sum + (a.billing && a.billing.status === "unpaid" ? Number(a.billing.amount) : 0),
          0
        );

        setOverview({
          upcoming_appointments: upcoming,
          medical_records: records,
          pending_bills: pendingBills,
          outstanding_balance: outstandingBalance,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    }

    fetchData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctor_id: selectedDoctor.id, date, time, notes }),
      });

      if (!res.ok) throw new Error("Failed to book appointment");
      await res.json();

      setBookingSuccess("✅ Appointment booked successfully!");
      setSelectedDoctor("");
      setDate("");
      setTime("");
      setNotes("");

      // Refresh appointments
      const refreshed = await fetch("http://localhost:3000/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(await refreshed.json());
    } catch (err) {
      console.error(err);
      setBookingSuccess("❌ Failed to book appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Welcome Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600">
              Manage your appointments, records, and billing in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/dash/appointments"
              className="bg-white shadow rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:border hover:border-teal-200 transition"
            >
              <Calendar className="text-teal-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg text-gray-800">My Appointments</h3>
              <p className="text-sm text-gray-500 mt-1">Check and manage upcoming visits.</p>
            </a>

            <a
              href="/dashboard/records"
              className="bg-white shadow rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:border hover:border-teal-200 transition"
            >
              <FileText className="text-green-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg text-gray-800">My Records</h3>
              <p className="text-sm text-gray-500 mt-1">View your medical history and prescriptions.</p>
            </a>

            <a
              href="/dashboard/billing"
              className="bg-white shadow rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:border hover:border-teal-200 transition"
            >
              <CreditCard className="text-purple-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg text-gray-800">Billing</h3>
              <p className="text-sm text-gray-500 mt-1">Track bills and payments securely.</p>
            </a>
          </div>

          {/* Book Appointment */}
          {/* Book Appointment */}
<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
    <UserCheck size={20} className="text-teal-600" /> Book Appointment
  </h3>

  {bookingSuccess && (
    <p
      className={`mb-4 font-medium p-2 rounded-lg ${
        bookingSuccess.includes("success")
          ? "text-green-600 bg-green-50 border border-green-200"
          : "text-red-600 bg-red-50 border border-red-200"
      }`}
    >
      {bookingSuccess}
    </p>
  )}

  <form
    className="grid grid-cols-1 md:grid-cols-2 gap-6"
    onSubmit={handleBookAppointment}
  >
    {/* Doctor Selection */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Doctor
      </label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        value={selectedDoctor?.id || ""}
        onChange={(e) => {
          const docId = Number(e.target.value);
          const doc = doctors.find((d) => d.id === docId);
          setSelectedDoctor(doc);
        }}
        required
      >
        <option value="">Choose...</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            Dr. {doc.name} - {doc.specialization}
          </option>
        ))}
      </select>
    </div>

    {/* Modern Doctor Profile Card */}
    {selectedDoctor && (
      <div className="md:col-span-2 flex gap-4 p-4 border rounded-lg bg-gray-50 hover:shadow-md transition">
        {/* Avatar */}
        <div className="flex-shrink-0 w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 text-3xl">
  {selectedDoctor.avatar ? (
    <img
      src={selectedDoctor.avatar}
      alt={selectedDoctor.name}
      className="w-20 h-20 rounded-full object-cover"
    />
  ) : (
    "👨‍⚕️"
  )}
</div>


        {/* Doctor Info */}
        <div className="flex flex-col justify-center gap-1">
          <h4 className="font-semibold text-lg text-gray-800">Dr. {selectedDoctor.name}</h4>
          <p className="text-gray-600 flex items-center gap-2">
            <span className="material-icons text-teal-500">Specialization</span>
            {selectedDoctor.specialization}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <span className="material-icons text-green-500">Workplace</span>
            {selectedDoctor.workplace || "N/A"}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <span className="material-icons text-blue-500">Email</span>
            {selectedDoctor.email}
          </p>
          {/* {selectedDoctor.phone && (
            <p className="text-gray-600 flex items-center gap-2">
              <span className="material-icons text-purple-500">phone</span>
              {selectedDoctor.phone}
            </p>
          )} */}
        </div>
      </div>
    )}

    {/* Date Picker */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
      <input
        type="date"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        min={new Date().toISOString().split("T")[0]}
      />
    </div>

    {/* Time Picker */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
      <input
        type="time"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        value={time}
        onChange={(e) => {
          const today = new Date().toISOString().split("T")[0];
          const currentTime = new Date().toTimeString().slice(0, 5);
          if (date === today && e.target.value < currentTime) {
            alert("You cannot book for a past time today.");
            return;
          }
          setTime(e.target.value);
        }}
        required
        min={date === new Date().toISOString().split("T")[0] ? new Date().toTimeString().slice(0, 5) : undefined}
      />
    </div>

    {/* Notes */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        How are you feeling?
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Describe your symptoms or how you feel..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none"
        required
      />
    </div>

    {/* Submit Button */}
    <div className="md:col-span-2">
      <button
        type="submit"
        className="w-full bg-teal-600 text-white font-medium py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow"
        disabled={bookingLoading}
      >
        {bookingLoading ? "Booking..." : "Book Appointment"}
      </button>
    </div>
  </form>
</div>


          {/* Overview & Appointments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-teal-600">{overview.upcoming_appointments}</p>
                  <p className="text-sm text-gray-600">Upcoming Appointments</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{overview.medical_records}</p>
                  <p className="text-sm text-gray-600">Medical Records</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{overview.pending_bills}</p>
                  <p className="text-sm text-gray-600">Pending Bills</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    Ksh {overview.outstanding_balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" /> My Upcoming Appointments
              </h3>
              {appointments.filter((a) => a.status === "confirmed").length === 0 ? (
                <p className="text-gray-500">No upcoming appointments.</p>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .filter((appt) => appt.status === "confirmed")
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-700">Dr. {appt.doctor?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appt.scheduled_at).toLocaleString("en-KE", {
                            timeZone: "Africa/Nairobi",
                          })}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
