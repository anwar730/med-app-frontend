import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import Reports from "./pages/Reports";
import DoctorApprovals from "./pages/DoctorApprovals";
import PatientAppointments from "./pages/PatientAppointment";
import PatientRecords from "./pages/PatientRecords";
import PatientBilling from "./pages/PatientBilling";
import DoctorPatientRecords from "./pages/DoctorPatientRecords";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import DoctorAppointments from "./pages/DoctorAppointments";
import AdminBilling from "./pages/AdminBilling";
import Profile from "./pages/Profile";
import MedicalRecordPage from "./pages/MedicalRecordPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manageusers" element={<ManageUsers />} />
          <Route path="/approvals" element={<DoctorApprovals />} />
          <Route path="/reports" element={<Reports />} />
           <Route path="/profile" element={<Profile />} />
          <Route path="/billings" element={<AdminBilling />} />
          <Route path="/dash/appointments" element={<PatientAppointments/>} />
          <Route path="/dashboard/records" element={<PatientRecords/>} />
          <Route path="/dashboard/billing" element={<PatientBilling/>} />
          <Route path="/doctor/appointments" element={<DoctorAppointments/>} />
          <Route path="/doctor/patient-records" element={<DoctorPatientRecords/>} />
          <Route path="/medical-record/:patientId" element={<MedicalRecordPage/>} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
