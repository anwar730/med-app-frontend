import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react"; // ✅ Heart icon

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo / App Name */}
      <div className="flex items-center gap-2">
        <HeartPulse className="text-teal-600 w-6 h-6" strokeWidth={2.5} />
        <h1 className="text-xl font-bold text-teal-700 tracking-wide">
          MediTechno
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/profile" className="text-gray-700 font-medium">
              👨‍⚕️  {user.name}{" "}
              <span className="text-sm text-gray-500">({user.role})</span>
            </Link>
            <button
              className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-gray-500 italic">Not logged in</span>
        )}
      </div>
    </div>
  );
}
