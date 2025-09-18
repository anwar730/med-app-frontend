import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/shared/Navbar";
import { UserCheck, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PendingDoctorDashboard() {
  const { user } = useAuth();

  const links = [
    { path: "/dashboard", label: "Home", icon: <UserCheck size={18} /> },
  ];

  const isRejected = user?.role === "rejected_doctor";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="bg-white shadow rounded-lg p-8 text-center max-w-md">
            {isRejected ? (
              <>
                <XCircle className="mx-auto mb-4 text-red-600" size={48} />
                <h1 className="text-2xl font-bold mb-2">Application Rejected</h1>
                <p className="text-gray-600 mb-4">
                  Unfortunately, your application to join as a doctor was not
                  approved by our admin team.
                </p>
                <p className="text-gray-500">
                  If you believe this was a mistake, please contact support or try again later.
                </p>
              </>
            ) : (
              <>
                <UserCheck className="mx-auto mb-4 text-blue-600" size={48} />
                <h1 className="text-2xl font-bold mb-2">Application Pending</h1>
                <p className="text-gray-600 mb-4">
                  Your application to join as a doctor is currently under review
                  by our admin team.
                </p>
                <p className="text-gray-500">
                  You will be notified once your account has been approved.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
