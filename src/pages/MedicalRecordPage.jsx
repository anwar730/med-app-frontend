import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { User, Stethoscope, Clipboard, FileText } from "lucide-react";
import PrescriptionModal from "./PrescriptionModal";

export default function MedicalRecordPage() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = new URLSearchParams(location.search).get("appointmentId");

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [showAllRecords, setShowAllRecords] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch appointment (includes patient info)
  useEffect(() => {
    if (!appointmentId) return;
    async function fetchAppointment() {
      try {
        const res = await fetch(`http://localhost:3000/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointment");
        const data = await res.json();
        setAppointment(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAppointment();
  }, [appointmentId, token]);

  // Fetch medical records for this patient
  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch(`http://localhost:3000/medical_records?patient_id=${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecords();
  }, [patientId, token]);

  // Create new record
  async function handleCreate() {
    try {
      const res = await fetch("http://localhost:3000/medical_records", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medical_record: {
            patient_id: patientId,
            appointment_id: appointmentId,
            diagnosis,
            treatment,
            notes,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create record");
      const newRecord = await res.json();
      setRecords([newRecord, ...records]);
      setDiagnosis("");
      setTreatment("");
      setNotes("");
      alert("Medical record created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating record");
    }
  }

  // Finish appointment
  async function handleFinish() {
    if (!appointmentId) return;
    try {
      const res = await fetch(`http://localhost:3000/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ appointment: { status: "completed" } }),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      alert("Appointment marked as completed!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Error finishing appointment");
    }
  }

  // Determine records to show
  const displayedRecords = showAllRecords ? records : records.slice(0, 2);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Patient Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-1/3 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {appointment?.patient?.name || "Unnamed Patient"}
        </h2>
        <p className="text-gray-500">{appointment?.patient?.email || "No email"}</p>
      </div>

      {/* Medical Records Section */}
      <div className="flex-1 flex flex-col gap-6">
        {/* New Record Form */}
        {appointmentId && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Add New Medical Record
            </h2>
            <input
              type="text"
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              placeholder="Treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border p-3 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Record
            </button>
          </div>
        )}

        {/* Existing Records */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-gray-500">No medical records found for this patient.</p>
          ) : (
            <>
              {displayedRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white shadow rounded-xl p-5 flex flex-col md:flex-row justify-between items-start hover:shadow-md transition"
                >
                  <div className="flex-1 space-y-2">
                    <p className="flex items-center gap-2 text-gray-800">
                      <Clipboard className="w-4 h-4 text-blue-500" /> <strong>Diagnosis:</strong> {record.diagnosis}
                    </p>
                    <p className="flex items-center gap-2 text-gray-800">
                      <Stethoscope className="w-4 h-4 text-green-500" /> <strong>Treatment:</strong> {record.treatment}
                    </p>
                    <p className="flex items-center gap-2 text-gray-800">
                      <FileText className="w-4 h-4 text-purple-500" /> <strong>Notes:</strong> {record.notes}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    {appointmentId && record.appointment_id === Number(appointmentId) && (
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowPrescriptionModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
                      >
                        Add Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Show More / Show Less */}
              {records.length > 2 && (
                <button
                  onClick={() => setShowAllRecords(!showAllRecords)}
                  className="text-blue-600 hover:underline mt-2 self-start"
                >
                  {showAllRecords ? "Show Less" : `View More Records (${records.length - 2} more)`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Prescription Modal */}
        {selectedRecord && (
          <PrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            medicalRecord={selectedRecord}
            onUpdate={(updatedRecord) =>
              setRecords(records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)))
            }
          />
        )}

        {/* Finish Appointment */}
        {appointmentId && (
          <button
            onClick={handleFinish}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 self-start"
          >
            Finish Appointment
          </button>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-gray-500 hover:underline self-start"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
