import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/shared/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

export default function DoctorApprovals() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
   const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/billings", label: "Billings" }
  ];

  useEffect(() => { fetchPendingDoctors(); }, []);

  async function fetchPendingDoctors() {
    try {
      const res = await API.get("/admin/pending_doctors");
      setPendingDoctors(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function approveDoctor(id) {
    try {
      await API.patch(`/admin/approve_doctor/${id}`);
      fetchPendingDoctors();
    } catch (e) {
      console.error(e);
    }
  }

  async function rejectDoctor(id) {
    try {
      await API.patch(`/admin/reject_doctor/${id}`);
      fetchPendingDoctors();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={links}/>
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Doctor Approvals</h2>
          <table className="min-w-full border-collapse border rounded-lg shadow bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Specialization</th>
                <th className="border px-3 py-2">Work Place</th>
                <th className="border px-3 py-2">License NO.</th>
                <th className="border px-3 py-2">CV</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingDoctors.map((doc) => (
                <tr key={doc.id}>
                  <td className="border px-3 py-2">{doc.id}</td>
                  <td className="border px-3 py-2">{doc.name}</td>
                  <td className="border px-3 py-2">{doc.email}</td>
                  <td className="border px-3 py-2">{doc.specialization}</td>
                  <td className="border px-3 py-2">{doc.workplace}</td>
                  <td className="border px-3 py-2">{doc.license_number}</td>
                  <td className="border px-3 py-2">
                    {doc.cv_url ? (
                      <a
                        href={doc.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Download CV
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button
                      onClick={() => approveDoctor(doc.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectDoctor(doc.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {pendingDoctors.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No pending doctors.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
