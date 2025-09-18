import React, { useState } from "react";
import toast from "react-hot-toast";

export default function BillingModal({ isOpen, onClose, appointment, onBillingCreated, completeAppointment }) {
  const [amount, setAmount] = useState("");

  if (!isOpen || !appointment) return null;

  async function handleCreateBilling() {
    if (!amount) return toast.error("Enter an amount");

    try {
      const token = localStorage.getItem("token");

      // 1️⃣ Create billing
      const res = await fetch(`http://localhost:3000/appointments/${appointment.id}/billings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billing: { amount, status: "unpaid" } }),
      });

      if (!res.ok) throw new Error("Failed to create billing");

      toast.success("Billing created successfully!");

      // 2️⃣ Mark appointment as completed
      if (completeAppointment) {
        await completeAppointment();
      }

      onBillingCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error creating billing");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Create Billing</h2>
        <input
          type="number"
          placeholder="Amount (KES)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateBilling}
            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Save & Complete
          </button>
        </div>
      </div>
    </div>
  );
}
