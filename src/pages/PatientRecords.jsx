import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { FileText, Pill, Calendar, CreditCard } from "lucide-react";

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const links = [
    {
          path: "/dashboard",
          label: "Dashboard",
          icon: <Calendar size={18} />,
        },
    { path: "/dash/appointments", label: "My Appointments", icon: <Calendar size={18} /> },
    { path: "/dashboard/records", label: "My Records", icon: <FileText size={18} /> },
    { path: "/dashboard/billing", label: "Billing", icon: <CreditCard size={18} /> },
  ];

  useEffect(() => {
    async function fetchRecords() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/medical_records", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);
  console.log (records)
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar links={links} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-green-600" /> My Medical Records
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-gray-500">No medical records found.</p>
          ) : (
            <div className="space-y-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
                >
                  {<p className="font-semibold text-gray-800">
                    Appointment Date:{" "}
                    {new Date(rec.appointment.scheduled_at).toLocaleString()}
                  </p>
                  }
                  <p className="font-semibold text-gray-800">
                    Diagnosis: {rec.diagnosis}
                  </p>
                  <p className="text-sm text-gray-600">Treatment: {rec.treatment}</p>
                  

                  {rec.prescriptions?.length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-semibold flex items-center gap-1 text-gray-700">
                        <Pill size={14} /> Prescriptions
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {rec.prescriptions.map((p) => (
                          <li key={p.id}>
                            {p.medication_name} - {p.dosage} ({p.instructions})
                          </li>
                        ))}
                      </ul>
                    </div>
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
