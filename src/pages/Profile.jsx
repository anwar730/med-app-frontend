// Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/shared/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        name,
        email,
      };

      if (newPassword) {
        payload.old_password = oldPassword;
        payload.password = newPassword;
        payload.password_confirmation = confirmPassword;
      }

      const res = await API.patch(`/users/${user.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data); // update context with new details
      toast.success("Profile updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.errors?.join(", ") ||
          err.response?.data?.error ||
          "Update failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 flex justify-center items-start">
          <Toaster position="top-right" />
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-lg shadow w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>

            <label className="block mb-2 font-medium">Name</label>
            <input
              className="w-full border p-2 mb-4 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full border p-2 mb-4 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password change section */}
            <h3 className="text-lg font-semibold mb-2">Change Password</h3>

            <label className="block mb-2 font-medium">Old Password</label>
            <input
              type="password"
              className="w-full border p-2 mb-4 rounded"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <label className="block mb-2 font-medium">New Password</label>
            <input
              type="password"
              className="w-full border p-2 mb-4 rounded"
              placeholder="Leave blank to keep current"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="block mb-2 font-medium">Confirm New Password</label>
            <input
              type="password"
              className="w-full border p-2 mb-4 rounded"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {busy ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
