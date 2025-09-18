import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ links = [] }) {
  const loc = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-t from-blue-300 to-teal-500 border-r border-gray-200 h-screen p-6 flex flex-col shadow-sm">
      {/* Header / Branding */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-white-600 tracking-wide">
          MediTechno
        </h2>
       
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((l) => (
          <Link
            key={l.path}
            to={l.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              loc.pathname === l.path
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
            }`}
          >
            {/* Icon */}
            {l.icon && (
              <span
                className={`text-lg ${
                  loc.pathname === l.path ? "text-teal-600" : "text-gray-500"
                }`}
              >
                {l.icon}
              </span>
            )}
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>© 2025 MedApp</p>
      </div>
    </aside>
  );
}
