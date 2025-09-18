import React, { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";

export default function AdminDashboard() {
  const links = [
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/reports", label: "Reports" },
    { path: "/billings", label: "Billings" }
  ];

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function approveDoctor(id) {
    try {
      await API.patch(`/admin/approve_doctor/${id}`);
      alert("Doctor approved!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Approve failed");
    }
  }

  async function rejectDoctor(id) {
    try {
      await API.patch(`/admin/reject_doctor/${id}`);
      alert("Doctor rejected!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar links={links} />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <p className="mb-4">
            Approve doctors, manage users, and see system reports.
          </p>

          <h3 className="text-xl font-semibold mt-6">Users</h3>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-3 py-2">{u.id}</td>
                  <td className="border px-3 py-2">{u.name}</td>
                  <td className="border px-3 py-2">{u.email}</td>
                  <td className="border px-3 py-2">{u.role}</td>
                  <td className="border px-3 py-2">
                    {u.role === "pending_doctor" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveDoctor(u.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectDoctor(u.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
