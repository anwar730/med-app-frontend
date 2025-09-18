import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { UserPlus } from "lucide-react"; // signup icon

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "patient",
    phone: "",
    gender: "",
    dob: "",
    specialization: "",
    license_number: "",
    workplace: "",
    cv: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.password_confirmation) {
      return "Please fill in all required fields.";
    }
    if (form.password !== form.password_confirmation) {
      return "Passwords do not match.";
    }
    if (form.role === "patient") {
      if (!form.phone || !form.gender || !form.dob) {
        return "Please complete all patient fields.";
      }
    }
    if (form.role === "pending_doctor") {
      if (!form.specialization || !form.license_number || !form.workplace || !form.cv) {
        return "Please complete all doctor fields and upload your CV.";
      }
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setBusy(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await API.post("/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const token = res.data.token;
      const serverUser = res.data.user || null;
      if (!token) throw new Error("No token returned");

      login(token, serverUser);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(", ") ||
          err.response?.data?.error ||
          err.message ||
          "Signup failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Create Your Account
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Common fields */}
        <input
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          placeholder="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          type="password"
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          placeholder="Confirm Password"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={handleChange}
        />

        {/* Role selector */}
        <select
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="patient">Patient</option>
          <option value="pending_doctor">Apply as Doctor</option>
        </select>

        {/* Patient extra fields */}
        {form.role === "patient" && (
          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
              placeholder="Phone number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <select
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="date"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Doctor extra fields */}
        {form.role === "pending_doctor" && (
  <div className="space-y-3">
    <select
      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
      name="specialization"
      value={form.specialization}
      onChange={handleChange}
    >
      <option value="">Select Specialization</option>
      <option value="Cardiology">Cardiology</option>
      <option value="Dermatology">Dermatology</option>
      <option value="Pediatrics">Pediatrics</option>
      <option value="Neurology">Neurology</option>
      <option value="Orthopedics">Orthopedics</option>
      <option value="General Surgery">General Surgery</option>
      <option value="Ophthalmology">Ophthalmology</option>
      {/* Add more specializations as needed */}
    </select>

    <input
      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
      placeholder="Medical License Number"
      name="license_number"
      value={form.license_number}
      onChange={handleChange}
    />
    <input
      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
      placeholder="Workplace / Clinic"
      name="workplace"
      value={form.workplace}
      onChange={handleChange}
    />
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      className="w-full px-4 py-3 border rounded-xl focus:outline-none text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200"
      name="cv"
      onChange={handleChange}
    />
  </div>
)}


        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 transition disabled:opacity-50"
        >
          {busy ? "Signing up..." : "Create Account"}
        </button>

        {/* Login link */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
