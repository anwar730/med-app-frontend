import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors"); // doctors | patients | admins
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/manageusers", label: "Manage Users" },
    { path: "/approvals", label: "Doctor Approvals" },
    { path: "/billings", label: "Billings" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch users");
    }
  }

  function startEdit(user) {
    setEditUserId(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role });
  }

  function cancelEdit() {
    setEditUserId(null);
    setFormData({});
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function saveEdit(id) {
    try {
      await API.patch(`/users/${id}`, formData);
      toast.success("User updated successfully!");
      setEditUserId(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update user");
    }
  }

  async function approveDoctor(id) {
    try {
      await API.patch(`/users/${id}`, { role: "doctor" });
      toast.success("Doctor approved!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Approve failed");
    }
  }

  async function rejectDoctor(id) {
    try {
      await API.delete(`/users/${id}`);
      toast.success("Doctor rejected and removed!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Reject failed");
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  }

  // Filter users by role
  const filteredUsers = users.filter((u) => {
    if (activeTab === "doctors") return u.role === "doctor" || u.role === "pending_doctor";
    if (activeTab === "patients") return u.role === "patient";
    if (activeTab === "admins") return u.role === "admin";
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  function nextPage() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }

  function prevPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="flex h-screen">
      <Sidebar links={links} />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <Toaster position="top-right" />
          <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
          <p className="mb-4">
            Approve doctors, manage users, and see system reports.
          </p>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {["doctors", "patients", "admins"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 -mb-px font-semibold border-b-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Users Table */}
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
              {currentUsers.map((u) => (
                <tr key={u.id}>
                  <td className="border px-3 py-2">{u.id}</td>
                  <td className="border px-3 py-2">
                    {editUserId === u.id ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.name
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    {editUserId === u.id ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    {editUserId === u.id ? (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="pending_doctor">Pending Doctor</option>
                        <option value="patient">Patient</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    {u.role === "pending_doctor" ? (
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
                    ) : editUserId === u.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(u.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="border px-3 py-2 text-center text-gray-500">
                    No users in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
