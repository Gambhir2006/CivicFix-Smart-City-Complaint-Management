import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/adminService";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

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
            <span className="text-slate-300">Admin Dashboard</span>
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
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

        {loading ? (
          <div className="text-slate-400">Loading statistics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Total Complaints</h3>
              <p className="text-4xl font-bold text-cyan-400">{stats?.total_complaints || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Submitted</h3>
              <p className="text-4xl font-bold text-blue-400">{stats?.submitted || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">In Progress</h3>
              <p className="text-4xl font-bold text-orange-400">{stats?.in_progress || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Resolved</h3>
              <p className="text-4xl font-bold text-green-400">{stats?.resolved || 0}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            to="/admin/complaints"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Manage Complaints
            </h3>
            <p className="text-slate-400">
              View, assign, and update complaint status
            </p>
          </Link>
          <Link
            to="/admin/departments"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Manage Departments
            </h3>
            <p className="text-slate-400">
              Create and manage municipal departments
            </p>
          </Link>
          <Link
            to="/admin/analytics"
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Analytics
            </h3>
            <p className="text-slate-400">
              View charts and statistics
            </p>
          </Link>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Manage Users
            </h3>
            <p className="text-slate-400">
              View and manage all system users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
