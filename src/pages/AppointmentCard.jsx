// AppointmentCard.jsx
import React, { useState } from "react";
import MedicalRecordModal from "./MedicalRecordModal";
import BillingModal from "./BillingModal";

export default function AppointmentCard({ appointment, onUpdate }) {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  if (!appointment) return null;

  // Update appointment status
  async function updateStatus(newStatus) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointment: { status: newStatus } }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      onUpdate?.(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Error updating appointment status");
    }
  }

  async function completeAppointment() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/appointments/${appointment.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointment: { status: "completed" } }),
      }
    );
    if (!res.ok) throw new Error("Failed to complete appointment");
    onUpdate?.(); // refresh list
  } catch (err) {
    console.error(err);
    toast.error("Error completing appointment");
  }
}

  // ✅ Ensure Finish only shows if record + prescription exists
  const canFinish =
    appointment.medical_record &&
    appointment.medical_record.prescriptions &&
    appointment.medical_record.prescriptions.length > 0;

  return (
    <div className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">
            Patient: {appointment.patient?.name || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(appointment.scheduled_at).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Status: {appointment.status}</p>
           <p className="text-sm text-gray-600">Symptoms: {appointment.notes}</p>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          {appointment.status === "pending" && (
            <>
              <button
                onClick={() => updateStatus("confirmed")}
                className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Confirm
              </button>
              <button
                onClick={() => updateStatus("cancelled")}
                className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </button>
            </>
          )}

          {appointment.status === "confirmed" && (
            <button
              onClick={() => {
                updateStatus("in_progress");
                setShowRecordModal(true);
              }}
              className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Start
            </button>
          )}

          {appointment.status === "in_progress" && (
  <>
    <button
      onClick={() => setShowRecordModal(true)}
      className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
    >
      View Record
    </button>

    <button
  onClick={() => setShowBillingModal(true)}
  disabled={!canFinish}
  className={`px-3 py-1 text-sm rounded-lg ${
    canFinish
      ? "bg-purple-600 text-white hover:bg-purple-700"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Finish & Bill
</button>

  </>
)}

        </div>
      </div>
      {showBillingModal && (
  <BillingModal
    isOpen={showBillingModal}
    onClose={() => setShowBillingModal(false)}
    appointment={appointment}
    onBillingCreated={onUpdate}
    completeAppointment={completeAppointment}
  />
)}


      {/* Medical Record Modal */}
      <MedicalRecordModal
        isOpen={showRecordModal}
        onClose={() => {
          setShowRecordModal(false);
          onUpdate?.();
        }}
        appointment={appointment}
      />
    </div>
  );
}
