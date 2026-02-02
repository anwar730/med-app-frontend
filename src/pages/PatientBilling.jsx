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

  useEffect(() => {
    async function fetchBills() {
      try {
        const token = localStorage.getItem("token");

        const resAppointments = await fetch("http://localhost:3000/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const appointments = await resAppointments.json();
        const billsData = [];

        for (const appt of appointments) {
          const resBill = await fetch(
            `http://localhost:3000/appointments/${appt.id}/billings`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (resBill.ok) {
            const bill = await resBill.json();
            billsData.push(...bill);
          }
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

  // 🔥 STRIPE CHECKOUT
  const handlePayment = async (bill) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/billings/${bill.id}/create_checkout_session`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = await res.text(); // 🔥 read raw response
    console.log("Stripe response:", res.status, text);

    if (!res.ok) {
      throw new Error(text);
    }

    const data = JSON.parse(text);
    window.location.href = data.url;
  } catch (err) {
    console.error("Stripe error:", err.message);
    alert(err.message);
  }
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
                  className="bg-white shadow rounded-lg p-4 border"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">
                      Appointment #{bill.appointment_id}
                    </p>
                    <span
                      className={`px-3 py-1 text-xs rounded-lg ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    Amount: KES {bill.amount}
                  </p>

                  {bill.status !== "paid" && (
                    <button
                      onClick={() => handlePayment(bill)}
                      className="mt-3 px-4 py-1 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
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
