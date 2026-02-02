import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();

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
    if (!medication || !dosage) {
      toast.error("Medication and dosage are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/medical_records/${medicalRecord.id}/prescriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ medication_name: medication, dosage, instructions }),
        }
      );
      if (!res.ok) throw new Error("Failed to add prescription");
      const newPrescription = await res.json();
      setPrescriptions([...prescriptions, newPrescription]);
      setMedication("");
      setDosage("");
      setInstructions("");
      toast.success("Prescription added!");
    } catch (err) {
      console.error(err);
      toast.error("Error adding prescription");
    }
  }

  // Finish appointment and create billing
  async function handleFinishAndBill() {
  if (!amount) {
    toast.error("Please enter billing amount");
    return ;
  }

  try {
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
    navigate("/dashboard");
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

    toast.success("Appointment completed and billed!");
    onAppointmentUpdated?.(); 
    onClose();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Error finishing appointment");
  }
}


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4">Prescriptions & Billing</h2>

        {/* PRESCRIPTION LIST */}
        {!showBillingForm && (
          <>
            <ul className="mb-4 max-h-40 overflow-y-auto">
              {prescriptions.map((p) => (
                <li key={p.id} className="border p-2 rounded mb-2">
                  <p>
                    <strong>{p.medication_name}</strong> - {p.dosage}
                  </p>
                  {p.instructions && <p className="text-sm">{p.instructions}</p>}
                </li>
              ))}
            </ul>

            {/* Add Prescription */}
            <input
              type="text"
              placeholder="Medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              type="text"
              placeholder="Dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
            />
            <textarea
              placeholder="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
            />

            <div className="flex justify-between gap-2 mt-2">
              <button
                onClick={handleAddPrescription}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Prescription
              </button>

              {prescriptions.length > 0 && (
                <button
                  onClick={() => setShowBillingForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Finish & Bill
                </button>
              )}
            </div>
          </>
        )}

        {/* BILLING FORM */}
        {showBillingForm && (
          <div className="mt-4">
            <input
              type="number"
              placeholder="Billing Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 mb-2 rounded"
            />
            <button
              onClick={handleFinishAndBill}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Confirm & Finish
            </button>
            <button
              onClick={() => setShowBillingForm(false)}
              className="mt-2 text-sm text-gray-500 hover:underline"
            >
              Back to Prescriptions
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
