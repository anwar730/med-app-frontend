// MedicalRecordModal.jsx
import React, { useState, useEffect } from "react";
import PrescriptionModal from "./PrescriptionModal";

export default function MedicalRecordModal({ isOpen, onClose, appointment, onUpdate }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [medicalRecord, setMedicalRecord] = useState(null);

  useEffect(() => {
    if (appointment?.medical_record) {
      setMedicalRecord(appointment.medical_record);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  async function handleCreate() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/medical_records", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medical_record: {
            patient_id: appointment.patient.id,
            appointment_id: appointment.id,
            diagnosis,
            treatment,
            notes,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create record");
      const newRecord = await res.json();
      setMedicalRecord(newRecord);
      setDiagnosis("");
      setTreatment("");
      setNotes("");
      alert("Medical record created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating record");
    }
  }

  async function handleFinish() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointment: { status: "completed" } }),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      alert("Appointment marked as completed!");
      onUpdate?.(); // refresh parent list
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error finishing appointment");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Medical Record</h2>

        {medicalRecord ? (
          <>
            <p><strong>Diagnosis:</strong> {medicalRecord.diagnosis}</p>
            <p><strong>Treatment:</strong> {medicalRecord.treatment}</p>
            <p><strong>Notes:</strong> {medicalRecord.notes}</p>

            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Prescription
            </button>

            {/* ✅ Show Finish only if prescriptions exist */}
            {medicalRecord.prescriptions?.length > 0 && (
              <button
                onClick={handleFinish}
                className="mt-4 ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Finish Appointment
              </button>
            )}
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
              required
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
              required
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Record
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Close
        </button>

        {/* Prescription Modal */}
        {medicalRecord && (
          <PrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            medicalRecord={medicalRecord}
            onUpdate={(updatedRecord) => setMedicalRecord(updatedRecord)} // ✅ keep prescriptions synced
            appointment={appointment}
          />
        )}
      </div>
    </div>
  );
}
