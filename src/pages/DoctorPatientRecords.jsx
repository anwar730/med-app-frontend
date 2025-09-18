import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { Calendar, FileText, User, Pill } from "lucide-react";

export default function DoctorPatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null); // Track expanded patient

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <Calendar size={18} /> },
    { path: "/doctor/appointments", label: "Appointments", icon: <User size={18} /> },
    { path: "/doctor/patient-records", label: "Patient Records", icon: <FileText size={18} /> },
    { path: "/profile", label: "Profile", icon: <FileText size={18} /> },
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

        // Group records by patient
        const grouped = data.reduce((acc, record) => {
          const patientId = record.patient.id;
          if (!acc[patientId]) {
            acc[patientId] = {
              ...record.patient,
              records: [],
            };
          }
          acc[patientId].records.push(record);
          return acc;
        }, {});

        setPatients(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

  const toggleRecords = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-green-600" /> Patient Records
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : patients.length === 0 ? (
            <p className="text-gray-500">No patient records found.</p>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Patient: {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Records: {patient.records.length}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRecords(patient.id)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {expandedPatient === patient.id ? "Hide Records" : "View Records"}
                    </button>
                  </div>

                  {expandedPatient === patient.id && (
                    <div className="mt-3 space-y-3">
                      {patient.records.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-200"
                        >
                          <p className="text-sm text-gray-700 font-semibold">
                            Diagnosis: {rec.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600">
                            Treatment: {rec.treatment}
                          </p>
                          <p className="text-sm text-gray-500">
                            Appointment Date:{" "}
                            {new Date(rec.appointment.scheduled_at).toLocaleString()}
                          </p>

                          {rec.prescriptions?.length > 0 && (
                            <div className="mt-2 bg-white rounded-lg p-2 border">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
