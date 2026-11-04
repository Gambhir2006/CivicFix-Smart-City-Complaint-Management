import React from "react";
import { Link } from "react-router-dom";

function CitizenDashboard() {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">CivicFix</h1>
          <div className="flex gap-4 items-center">
            <span className="text-slate-300">Citizen Dashboard</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Welcome, Citizen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/citizen/report"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Report an Issue
            </h3>
            <p className="text-slate-400">
              Submit a new complaint about city problems
            </p>
          </Link>
          <Link
            to="/citizen/complaints"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              My Complaints
            </h3>
            <p className="text-slate-400">View and track your submitted complaints</p>
          </Link>
          <Link
            to="/public/dashboard"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Public Dashboard
            </h3>
            <p className="text-slate-400">View all public complaints in your area</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CitizenDashboard;
