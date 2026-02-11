// MedicalRecordModal.jsx
import React, { useState, useEffect } from "react";
import PrescriptionModal from "./PrescriptionModal";
import { FileText, User, Calendar, Clock, Heart, Activity, AlertCircle, Pill } from "lucide-react";

export default function MedicalRecordModal({ isOpen, onClose, appointment, onUpdate }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [medicalRecord, setMedicalRecord] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment?.medical_record) {
      setMedicalRecord(appointment.medical_record);
    }
    if (appointment?.patient?.id) {
      fetchMedicalHistory();
    }
  }, [appointment]);

  async function fetchMedicalHistory() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Fetch all medical records and filter by patient_id
      const res = await fetch(
        `http://localhost:3000/medical_records`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        // Filter records for this specific patient
        const patientRecords = data.filter(
          record => record.patient_id === appointment.patient.id
        );
        setMedicalHistory(patientRecords);
      }
    } catch (err) {
      console.error("Error fetching medical history:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !appointment) return null;

  async function handleCreate() {
    if (!diagnosis.trim() || !treatment.trim()) {
      alert("Please fill in diagnosis and treatment");
      return;
    }

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
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error finishing appointment");
    }
  }

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Medical Record</h2>
              <p className="text-blue-100 text-sm">
                {medicalRecord ? "View & Manage" : "Create New Record"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Info & History */}
            <div className="lg:col-span-1 space-y-4">
              {/* Patient Details Card */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Patient Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-800">
                      {appointment.patient?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold text-gray-800">
                      {calculateAge(appointment.patient?.dob)} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {appointment.patient?.gender || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-800">
                      {appointment.patient?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Details Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-800">Appointment Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(appointment.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-800">{appointment.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="font-semibold text-gray-800">
                      {appointment.reason || "General Checkup"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Medical History</h3>
                </div>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading history...</p>
                ) : medicalHistory.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {medicalHistory.slice(0, 5).map((record, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-semibold text-gray-700">
                            {record.diagnosis}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs">{record.treatment}</p>
                        {record.prescriptions?.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                            <Pill className="w-3 h-3" />
                            <span>{record.prescriptions.length} prescription(s)</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No previous medical records</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Current Medical Record */}
            <div className="lg:col-span-2">
              {medicalRecord ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Current Medical Record
                  </h3>

                  {/* Display Record */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Diagnosis
                      </label>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-gray-800">{medicalRecord.diagnosis}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Treatment Plan
                      </label>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <p className="text-gray-800">{medicalRecord.treatment}</p>
                      </div>
                    </div>

                    {medicalRecord.notes && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Additional Notes
                        </label>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                          <p className="text-gray-800">{medicalRecord.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prescriptions
                        </label>
                        <div className="space-y-2">
                          {medicalRecord.prescriptions.map((rx, idx) => (
                            <div
                              key={idx}
                              className="bg-purple-50 rounded-lg p-3 border border-purple-100"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {rx.medication_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {rx.dosage} - {rx.frequency}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Duration: {rx.duration}
                                  </p>
                                </div>
                                <Pill className="w-5 h-5 text-purple-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowPrescriptionModal(true)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Pill className="w-5 h-5" />
                      Add Prescription
                    </button>

                    {medicalRecord.prescriptions?.length > 0 && (
                      <button
                        onClick={handleFinish}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition font-medium"
                      >
                        Finish Appointment
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Create Medical Record
                  </h3>

                  {/* Create Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diagnosis <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter diagnosis (e.g., Hypertension, Type 2 Diabetes)"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Treatment Plan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Enter treatment plan and recommendations"
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                        rows="4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        placeholder="Any additional observations or instructions"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                        rows="3"
                      />
                    </div>

                    <button
                      onClick={handleCreate}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-medium"
                    >
                      Save Medical Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {medicalRecord && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          medicalRecord={medicalRecord}
          onUpdate={(updatedRecord) => setMedicalRecord(updatedRecord)}
          appointment={appointment}
        />
      )}
    </div>
  );
}