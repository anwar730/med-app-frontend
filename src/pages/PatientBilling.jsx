// PatientBilling.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { CreditCard, Calendar, FileText } from "lucide-react";

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { path: "/dash/appointments", label: "My Appointments", icon: <Calendar size={18} /> },
    { path: "/dashboard/records", label: "My Records", icon: <FileText size={18} /> },
    { path: "/dashboard/billing", label: "Billing", icon: <CreditCard size={18} /> },
  ];

  // 🔹 Fetch billing info
  useEffect(() => {
    async function fetchBills() {
      try {
        const token = localStorage.getItem("token");

        const resAppointments = await fetch("http://localhost:3000/appointments", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!resAppointments.ok) throw new Error("Failed to fetch appointments");

        const appointments = await resAppointments.json();
        const billsData = [];

        for (const appt of appointments) {
          const resBill = await fetch(
            `http://localhost:3000/appointments/${appt.id}/billings`,
            {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            }
          );
          if (!resBill.ok) continue;
          const billItems = await resBill.json();
          billsData.push(...billItems);
        }

        setBills(billsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  // 🔹 Verify payment with backend
  const verifyPayment = async (transactionId, billingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/payments/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_id: transactionId, billing_id: billingId }),
      });

      if (!res.ok) throw new Error("Payment verification failed");
      const data = await res.json();

      alert("Payment successful!");
      // update UI
      setBills((prev) =>
        prev.map((b) => (b.id === billingId ? { ...b, status: "paid" } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Payment verification failed");
    }
  };

  // 🔹 Handle Flutterwave payment
  const handlePayment = (bill) => {
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-d0ac8b4138183b187b3d54b9f95cfe18-X", // your test public key
      tx_ref: Date.now(),
      amount: bill.amount,
      currency: "KES",
      payment_options: "card, mobilemoney, ussd",
      customer: {
        email: "patient@example.com", // ideally from logged-in user
        phonenumber: "0700000000",
        name: "Patient User",
      },
      customizations: {
        title: "Hospital Billing",
        description: `Payment for Appointment ${bill.appointment_id}`,
        logo: "https://your-logo-url.com/logo.png",
      },
      callback: function (response) {
        if (response.status === "successful") {
          verifyPayment(response.transaction_id, bill.id);
        } else {
          alert("Payment not completed");
        }
      },
      onclose: function () {
        console.log("Payment popup closed");
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-purple-600" /> Billing
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : bills.length === 0 ? (
            <p className="text-gray-500">No billing records found.</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">
                      Appointment ID: {bill.appointment_id}
                    </p>
                    <span
                      className={`px-3 py-1 text-xs rounded-lg font-medium ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Amount: Ksh {bill.amount}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {new Date(bill.created_at).toLocaleDateString()}
                  </p>
                  {bill.status !== "paid" && (
                    <button
                      onClick={() => handlePayment(bill)}
                      className="mt-3 px-3 py-1 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Pay Now
                    </button>
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
