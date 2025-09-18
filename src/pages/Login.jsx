import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { HeartPulse } from "lucide-react"; // medical-looking icon

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await API.post("/login", { email, password });
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
          "Login failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-100">
        {/* Logo / App Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <HeartPulse className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={busy}
            className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition disabled:opacity-50"
          >
            {busy ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
