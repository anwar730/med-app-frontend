import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, FileText, CreditCard, UserCheck, ShieldCheck, RefreshCw } from "lucide-react";

// ── Simulated OTP Modal ──────────────────────────────────────────────
function OtpModal({ onVerified }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    startCountdown();
    // Auto-focus first box
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // Any 6 digits pass
  const handleVerify = () => {
    const entered = otp.join("");
    if (entered.length < 6) {
      setError("Please enter all 6 digits.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setVerified(true);
    // Mark as verified for this session so it never shows again
    sessionStorage.setItem("otp_verified", "true");
    setTimeout(() => onVerified(), 900);
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
    startCountdown();
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .otp-card { animation: fadeIn 0.25s ease; }
        .shake    { animation: shake 0.4s ease; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 backdrop-blur-md bg-white/40" />

        <div className="otp-card relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5">

          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${verified ? "bg-green-100" : "bg-teal-50"}`}>
            <ShieldCheck size={32} className={verified ? "text-green-500" : "text-teal-600"} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {verified ? "Verified! ✅" : "Two-Step Verification"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {verified
                ? "Loading your dashboard…"
                : "Enter the 6-digit code sent to your phone"}
            </p>
          </div>

          {!verified && (
            <>
              <div className={`flex gap-2 ${shake ? "shake" : ""}`} onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none transition-all
                      ${digit ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-300 text-gray-800"}
                      ${error ? "border-red-400" : "focus:border-teal-500"}`}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

              <button
                onClick={handleVerify}
                className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow"
              >
                Verify &amp; Continue
              </button>

              <div className="text-sm text-gray-500">
                {canResend ? (
                  <button onClick={handleResend} className="flex items-center gap-1 text-teal-600 font-medium hover:underline">
                    <RefreshCw size={14} /> Resend OTP
                  </button>
                ) : (
                  <span>Resend in <span className="font-semibold text-gray-700">{countdown}s</span></span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function PatientDashboard() {
  // Check sessionStorage so OTP only shows once per login session
  const [otpVerified, setOtpVerified] = useState(
    () => sessionStorage.getItem("otp_verified") === "true"
  );

  const [overview, setOverview] = useState({
    upcoming_appointments: 0,
    medical_records: 0,
    pending_bills: 0,
    outstanding_balance: 0,
  });

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
    { path: "/profile", label: "Profile", icon: <UserCheck size={18} /> },
  ];

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      try {
        const resUsers = await fetch("http://localhost:3000/users", { headers: { Authorization: `Bearer ${token}` } });
        const users = await resUsers.json();
        setDoctors(users.filter((u) => u.role === "doctor"));

        const resAppts = await fetch("http://localhost:3000/appointments", { headers: { Authorization: `Bearer ${token}` } });
        const appts = await resAppts.json();
        setAppointments(appts);

        const resRecords = await fetch("http://localhost:3000/medical_records", { headers: { Authorization: `Bearer ${token}` } });
        const recordsData = await resRecords.json();

        const upcoming = appts.filter((a) => a.status !== "completed").length;
        const records = recordsData.length;
        const pendingBills = appts.filter((a) => a.billing && a.billing.status === "unpaid").length;
        const outstandingBalance = appts.reduce(
          (sum, a) => sum + (a.billing && a.billing.status === "unpaid" ? Number(a.billing.amount) : 0), 0
        );
        setOverview({ upcoming_appointments: upcoming, medical_records: records, pending_bills: pendingBills, outstanding_balance: outstandingBalance });
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

    const newDateTime = new Date(`${date}T${time}`);
    const hasConflict = appointments.some((appt) => {
      if (["cancelled", "completed"].includes(appt.status)) return false;
      return Math.abs(newDateTime - new Date(appt.scheduled_at)) < 30 * 60 * 1000;
    });

    if (hasConflict) {
      setBookingSuccess("❌ You already have an appointment around that time. Please choose a different slot.");
      setBookingLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ doctor_id: selectedDoctor.id, date, time, notes }),
      });
      if (!res.ok) throw new Error("Failed to book appointment");
      await res.json();
      setBookingSuccess("✅ Appointment booked successfully!");
      setSelectedDoctor(""); setDate(""); setTime(""); setNotes("");
      const refreshed = await fetch("http://localhost:3000/appointments", { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(await refreshed.json());
    } catch (err) {
      console.error(err);
      setBookingSuccess("❌ Failed to book appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {!otpVerified && <OtpModal onVerified={() => setOtpVerified(true)} />}

      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
            <p className="text-gray-600">Manage your appointments, records, and billing in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: "/dash/appointments", icon: <Calendar className="text-teal-600 mb-3" size={32} />, title: "My Appointments", desc: "Check and manage upcoming visits." },
              { href: "/dashboard/records", icon: <FileText className="text-green-600 mb-3" size={32} />, title: "My Records", desc: "View your medical history and prescriptions." },
              { href: "/dashboard/billing", icon: <CreditCard className="text-purple-600 mb-3" size={32} />, title: "Billing", desc: "Track bills and payments securely." },
            ].map(({ href, icon, title, desc }) => (
              <a key={title} href={href} className="bg-white shadow rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:border hover:border-teal-200 transition">
                {icon}
                <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </a>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <UserCheck size={20} className="text-teal-600" /> Book Appointment
            </h3>

            {bookingSuccess && (
              <p className={`mb-4 font-medium p-2 rounded-lg ${bookingSuccess.includes("successfully") ? "text-green-600 bg-green-50 border border-green-200" : "text-red-600 bg-red-50 border border-red-200"}`}>
                {bookingSuccess}
              </p>
            )}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleBookAppointment}>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={selectedDoctor?.id || ""}
                  onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === Number(e.target.value)))}
                  required
                >
                  <option value="">Choose...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name} - {doc.specialization}</option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div className="md:col-span-2 flex gap-4 p-4 border rounded-lg bg-gray-50 hover:shadow-md transition">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 text-3xl">
                    {selectedDoctor.avatar
                      ? <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-20 h-20 rounded-full object-cover" />
                      : "👨‍⚕️"}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="font-semibold text-lg text-gray-800">Dr. {selectedDoctor.name}</h4>
                    <p className="text-gray-600"><span className="font-medium text-teal-600">Specialization: </span>{selectedDoctor.specialization}</p>
                    <p className="text-gray-600"><span className="font-medium text-green-600">Workplace: </span>{selectedDoctor.workplace || "N/A"}</p>
                    <p className="text-gray-600"><span className="font-medium text-blue-600">Consultation Fee: </span>Ksh {selectedDoctor.consultation_fee}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={time}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    const currentTime = new Date().toTimeString().slice(0, 5);
                    if (date === today && e.target.value < currentTime) { alert("You cannot book for a past time today."); return; }
                    setTime(e.target.value);
                  }}
                  required
                  min={date === new Date().toISOString().split("T")[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling?</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe your symptoms or how you feel..." className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none" required />
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-teal-600 text-white font-medium py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow" disabled={bookingLoading}>
                  {bookingLoading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>

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
                  <p className="text-2xl font-bold text-yellow-600">Ksh {overview.outstanding_balance.toLocaleString()}</p>
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
                  {appointments.filter((appt) => appt.status === "confirmed").map((appt) => (
                    <div key={appt.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                      <p className="font-medium text-gray-700">Dr. {appt.doctor?.name}</p>
                      <p className="text-sm text-gray-500">{new Date(appt.scheduled_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>
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