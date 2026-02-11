import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Pill, Plus, Trash2, DollarSign, CheckCircle, ArrowLeft, FileText } from "lucide-react";

export default function PrescriptionModal({
  isOpen,
  onClose,
  medicalRecord,
  appointment,
  onAppointmentUpdated,
}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const [showBillingForm, setShowBillingForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill consultation fee
  useEffect(() => {
    if (appointment?.doctor?.consultation_fee) {
      setAmount(appointment.doctor.consultation_fee);
    }
  }, [appointment]);

  // Fetch prescriptions when modal opens
  useEffect(() => {
    if (isOpen && medicalRecord) fetchPrescriptions();
  }, [isOpen, medicalRecord]);

  async function fetchPrescriptions() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/medical_records/${medicalRecord.id}/prescriptions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setPrescriptions(await res.json());
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    }
  }

  // Add a prescription
  async function handleAddPrescription() {
    if (!medication.trim() || !dosage.trim() ) {
      toast.error("Medication, dosage, and instructions are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/medical_records/${medicalRecord.id}/prescriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medication_name: medication,
            dosage,

            instructions,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to add prescription");
      const newPrescription = await res.json();
      setPrescriptions([...prescriptions, newPrescription]);
      
      // Reset form
      setMedication("");
      setDosage("");
      setInstructions("");
      
      toast.success("Prescription added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error adding prescription");
    } finally {
      setLoading(false);
    }
  }

  // Delete a prescription
  async function handleDeletePrescription(prescriptionId) {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/medical_records/${medicalRecord.id}/prescriptions/${prescriptionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete prescription");
      
      setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
      toast.success("Prescription deleted");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting prescription");
    }
  }

  // Finish appointment and create billing
  async function handleFinishAndBill() {
    if (!amount) {
      toast.error("Please enter billing amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Create billing
      const billingRes = await fetch(
        `http://localhost:3000/appointments/${appointment.id}/billings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ billing: { amount, status: "unpaid" } }),
        }
      );

      if (!billingRes.ok) {
        const errData = await billingRes.json();
        console.error("Billing error:", errData);
        throw new Error(errData.error || "Failed to create billing");
      }

      // Complete appointment
      const completeRes = await fetch(
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

      if (!completeRes.ok) {
        const errData = await completeRes.json();
        console.error("Complete error:", errData);
        throw new Error(errData.error || "Failed to complete appointment");
      }

      toast.success("Appointment completed and billed successfully!");
      onAppointmentUpdated?.();
      onClose();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error finishing appointment");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {showBillingForm ? "Billing" : "Prescriptions"}
              </h2>
              <p className="text-purple-100 text-sm">
                {showBillingForm
                  ? "Finalize appointment billing"
                  : `${prescriptions.length} prescription(s) added`}
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
          {!showBillingForm ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-semibold text-gray-800">{appointment?.patient?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Diagnosis</p>
                    <p className="font-semibold text-gray-800">{medicalRecord?.diagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Prescription List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Current Prescriptions
                </h3>
                
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No prescriptions added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add medications below</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {prescriptions.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-purple-100 rounded-xl p-4 hover:shadow-md transition group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Pill className="w-5 h-5 text-purple-500" />
                              <h4 className="font-semibold text-gray-800">{p.medication_name}</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Dosage:</span>
                                <span className="ml-2 font-medium text-gray-800">{p.dosage}</span>
                              </div>
                              
                              
                            </div>
                            
                            {p.instructions && (
                              <p className="text-sm text-gray-600 mt-2 italic bg-yellow-50 p-2 rounded">
                                📝 {p.instructions}
                              </p>
                            )}
                          </div>
                          
                          {/* <button
                            onClick={() => handleDeletePrescription(p.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                            title="Delete prescription"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button> */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Prescription Form */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Add New Prescription
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Amoxicillin, Paracetamol"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>

                    
                  </div>

                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      placeholder="e.g., Take after meals, Avoid alcohol"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
                      rows="2"
                    />
                  </div>

                  <button
                    onClick={handleAddPrescription}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    {loading ? "Adding..." : "Add Prescription"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
                
                {prescriptions.length > 0 && (
                  <button
                    onClick={() => setShowBillingForm(true)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Proceed to Billing
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Billing Form
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-semibold text-gray-800">{appointment?.patient?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diagnosis:</span>
                    <span className="font-semibold text-gray-800">{medicalRecord?.diagnosis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prescriptions:</span>
                    <span className="font-semibold text-gray-800">{prescriptions.length} medication(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(appointment?.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    KES
                  </span>
                  <input
                    type="number"
                    value={amount}
                    readOnly
                    className="w-full border border-gray-300 p-4 pl-16 rounded-lg bg-gray-100 cursor-not-allowed text-gray-800 font-bold text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 This is the standard consultation fee for this appointment
                </p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <div className="text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Before proceeding:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ensure all prescriptions are correct</li>
                    <li>Patient will be billed KES {amount}</li>
                    <li>Appointment will be marked as completed</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBillingForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Prescriptions
                </button>
                
                <button
                  onClick={handleFinishAndBill}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? "Processing..." : "Confirm & Complete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}