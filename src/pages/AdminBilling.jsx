// AdminBilling.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";

export default function AdminBilling() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

      const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/billings", label: "Billings" }
  ];

  useEffect(() => {
    fetchBillings();
  }, []);

  // Fetch all billings
  async function fetchBillings() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/billings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch billings");
      const data = await res.json();
      setBillings(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading billings");
    } finally {
      setLoading(false);
    }
  }

  // Confirm cash payment
  async function confirmPayment(billingId) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/billings/${billingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billing: { status: "paid" } }),
      });
      if (!res.ok) throw new Error("Failed to update billing");
      toast.success("Payment confirmed!");
      fetchBillings(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Error confirming payment");
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6">
          <Toaster position="top-right" />
          <h1 className="text-2xl font-bold mb-4">All Billings</h1>

          {loading ? (
            <p>Loading billings...</p>
          ) : billings.length === 0 ? (
            <p className="text-gray-500">No billings found.</p>
          ) : (
            <div className="space-y-4">
              {billings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Appointment:</strong> {b.appointment_id}
                    </p>
                    <p>
                      <strong>Patient:</strong> {b.appointment?.patient?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Amount:</strong> KES {b.amount}
                    </p>
                    <p>
                      <strong>Status:</strong> {b.status}
                    </p>
                  </div>

                  {b.status !== "paid" && (
                    <button
                      onClick={() => confirmPayment(b.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Confirm Payment
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
