// Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/shared/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, Calendar, MapPin, Phone, Briefcase, Award } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user]);

const handleUpdate = async (e) => {
  e.preventDefault();

  if (newPassword && newPassword !== confirmPassword) {
    toast.error("New passwords do not match");
    return;
  }

  if (newPassword && newPassword.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setBusy(true);
  try {
    const token = localStorage.getItem("token");

    const payload = {
      name,
      email,
      phone,
    };

    // Only add password fields if user is actually changing password
    if (newPassword && newPassword.trim() !== "") {
      if (!oldPassword) {
        toast.error("Please enter your current password");
        setBusy(false);
        return;
      }
      payload.old_password = oldPassword;
      payload.password = newPassword;
      payload.password_confirmation = confirmPassword;
    }
    // If password fields are empty, don't send them at all

    const res = await API.patch(`/users/${user.id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(res.data);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "doctor":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "patient":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6">
          <Toaster position="top-right" />
          
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information and settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-br from-blue-600 to-teal-500 px-6 py-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                    <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
                  </div>

                  {/* Profile Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                        {user?.role?.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {user?.role === "doctor" && (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <Award className="w-4 h-4 text-teal-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Specialization</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.specialization || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Workplace</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.workplace || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <Shield className="w-4 h-4 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">License Number</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.license_number || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <span className="text-lg">💰</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Consultation Fee</p>
                            <p className="text-sm font-semibold text-gray-800">
                              KES {user?.consultation_fee || "N/A"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {user?.role === "patient" && (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <Phone className="w-4 h-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <User className="w-4 h-4 text-pink-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {user?.gender || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Date of Birth</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatDate(user?.dob)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Member Since</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(user?.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Edit Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                          activeTab === "profile"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <User className="w-4 h-4" />
                          Profile Information
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("security")}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                          activeTab === "security"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          Security
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={handleUpdate} className="p-6">
                    {activeTab === "profile" ? (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                          </h3>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        {/* Phone (if patient) */}
                        {user?.role === "patient" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+254 712 345 678"
                              />
                            </div>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={busy}
                            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Save className="w-5 h-5" />
                            {busy ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-600">
                            Ensure your account is using a long, random password to stay secure.
                          </p>
                        </div>

                        {/* Current Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showOldPassword ? "text" : "password"}
                              className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password (min 6 characters)"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <span className={newPassword.length >= 6 ? "text-green-600" : ""}>
                                {newPassword.length >= 6 ? "✓" : "○"}
                              </span>
                              At least 6 characters
                            </li>
                            <li className="flex items-center gap-2">
                              <span className={newPassword === confirmPassword && newPassword ? "text-green-600" : ""}>
                                {newPassword === confirmPassword && newPassword ? "✓" : "○"}
                              </span>
                              Passwords match
                            </li>
                          </ul>
                        </div>

                        {/* Update Password Button */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={busy}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Shield className="w-5 h-5" />
                            {busy ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}