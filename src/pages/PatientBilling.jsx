// PatientBilling.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { CreditCard, Calendar, FileText, Smartphone } from "lucide-react";

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [mpesaLoading, setMpesaLoading] = useState(false);

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
  const handleStripePayment = async (bill) => {
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

      const text = await res.text();
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

  // 📱 M-PESA STK PUSH
  const handleMpesaPayment = async (bill) => {
    if (!phoneNumber) {
      alert("Please enter your M-Pesa phone number");
      return;
    }

    // Validate phone number format (254XXXXXXXXX)
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!/^254\d{9}$/.test(cleanPhone)) {
      alert("Please enter a valid phone number (e.g., 254712345678)");
      return;
    }

    setMpesaLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/billings/${bill.id}/mpesa_payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: cleanPhone,
            amount: bill.amount,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "M-Pesa payment failed");
      }

      alert(
        "✅ Payment request sent! Please check your phone and enter your M-Pesa PIN."
      );
      setSelectedBillId(null);
      setPhoneNumber("");

      // Optional: Poll for payment status
      checkPaymentStatus(bill.id);
    } catch (err) {
      console.error("M-Pesa error:", err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setMpesaLoading(false);
    }
  };

  // Optional: Check payment status
  const checkPaymentStatus = async (billId) => {
    const token = localStorage.getItem("token");
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/billings/${billId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const bill = await res.json();
        
        if (bill.status === "paid") {
          clearInterval(interval);
          alert("✅ Payment confirmed!");
          // Refresh bills
          window.location.reload();
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 5000); // Check every 5 seconds

    // Stop checking after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
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
                    <div className="mt-3 space-y-2">
                      {/* Payment method toggle */}
                      {selectedBillId === bill.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              placeholder="254712345678"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => handleMpesaPayment(bill)}
                              disabled={mpesaLoading}
                              className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                            >
                              {mpesaLoading ? (
                                "Processing..."
                              ) : (
                                <>
                                  <Smartphone size={16} />
                                  Confirm
                                </>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedBillId(null);
                              setPhoneNumber("");
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedBillId(bill.id)}
                            className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                          >
                            <Smartphone size={16} />
                            Pay with M-Pesa
                          </button>
                          <button
                            onClick={() => handleStripePayment(bill)}
                            className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                          >
                            Pay with Card
                          </button>
                        </div>
                      )}
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