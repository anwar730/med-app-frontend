import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import PendingDoctorDashboard from "./PendingDoctorDashboard";
import Reports from "./Reports";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Reports />;
  if (user.role === "doctor") return <DoctorDashboard />;
  if (user.role === "pending_doctor" ) return <PendingDoctorDashboard />;
  if (user.role === "rejected_doctor" ) return <PendingDoctorDashboard />;
  if (user.role === "patient") return <PatientDashboard />;

  return <div className="p-6">Unknown role — contact admin</div>;
}
