import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function BillingModal({ isOpen, onClose, appointment, onBillingCreated, completeAppointment }) {
  const [amount, setAmount] = useState("");

  // Auto-fill consultation fee when modal opens
  useEffect(() => {
    if (isOpen && appointment?.doctor?.consultation_fee) {
      setAmount(appointment.doctor.consultation_fee);
    }
  }, [isOpen, appointment]);

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Confirm Billing</h2>
        
        {/* Patient Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Patient</p>
          <p className="font-semibold">{appointment.patient?.name || 'N/A'}</p>
        </div>

        {/* Consultation Fee (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultation Fee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
            <input
              type="number"
              value={amount}
              readOnly
              className="w-full border p-2 pl-12 rounded bg-gray-100 cursor-not-allowed text-gray-700 font-semibold"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This is your standard consultation fee
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateBilling}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Confirm & Complete
          </button>
        </div>
      </div>
    </div>
  );
}