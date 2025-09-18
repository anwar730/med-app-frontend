// MedicalRecordModal.jsx
import React from "react";
import { X, FileText, Pill, Calendar, User, CreditCard } from "lucide-react";

export default function PatientMedicalRecordModal({ isOpen, onClose, appointment }) {
  if (!isOpen || !appointment) return null;

  const record = appointment.medical_record;
  const isPaid = appointment.billing?.status === "paid";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={22} className="text-blue-600" /> Medical Record
        </h2>

        {/* Appointment Info */}
        <div className="mb-4">
          <p className="text-gray-700 flex items-center gap-2">
            <User size={16} className="text-gray-500" /> 
            Doctor: <span className="font-semibold">{appointment.doctor?.name || "N/A"}</span>
          </p>
          <p className="text-gray-700 flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            Date:{" "}
            <span className="font-semibold">
              {new Date(appointment.scheduled_at).toLocaleString("en-KE", {
                timeZone: "Africa/Nairobi",
              })}
            </span>
          </p>
          <p className="text-gray-600">Status: {appointment.status}</p>
          <p className="text-gray-600 flex items-center gap-2">
            <CreditCard size={16} className="text-gray-500" />
            Billing:{" "}
            <span
              className={`font-semibold ${
                isPaid ? "text-green-600" : "text-red-600"
              }`}
            >
              {appointment.billing?.status || "Unpaid"}
            </span>
          </p>
        </div>

        {/* Record Details */}
        {isPaid ? (
          record ? (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Diagnosis & Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {record.diagnosis || "No diagnosis provided."}
              </p>
              {record.notes && (
                <p className="mt-2 text-gray-600 text-sm">{record.notes}</p>
              )}

              {/* Prescriptions */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Pill size={18} className="text-green-600" /> Prescriptions
                  </h3>
                  <ul className="space-y-2">
                    {record.prescriptions.map((p, i) => (
                      <li
                        key={i}
                        className="p-3 border rounded-lg bg-gray-50 flex flex-col"
                      >
                        <span className="font-medium text-gray-800">
                          {p.medication}
                        </span>
                        <span className="text-sm text-gray-600">
                          Dosage: {p.dosage} | Duration: {p.duration}
                        </span>
                        {p.instructions && (
                          <span className="text-sm text-gray-500 mt-1">
                            {p.instructions}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No medical record available for this appointment.
            </p>
          )
        ) : (
          <div className="border-t pt-4 text-center">
            <p className="text-red-600 font-semibold mb-2">
              Medical record is locked.
            </p>
            <p className="text-gray-500 text-sm">
              Please complete your payment to view the doctor’s notes and prescriptions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
