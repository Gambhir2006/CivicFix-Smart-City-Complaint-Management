import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-cyan-400">CivicFix</h1>
        <p className="mt-4 text-xl text-slate-300">
          Smart City Complaint Management System
        </p>
        <p className="mt-3 text-slate-400">Report. Track. Resolve.</p>
        <div className="mt-6 flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3 bg-cyan-500 rounded-xl font-semibold hover:bg-cyan-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-slate-700 rounded-xl font-semibold hover:bg-slate-600 transition"
          >
            Register
          </Link>
          <Link
            to="/public/dashboard"
            className="px-8 py-3 bg-slate-700 rounded-xl font-semibold hover:bg-slate-600 transition"
          >
            Public Dashboard
          </Link>
          <Link
            to="/heatmap"
            className="px-8 py-3 bg-slate-700 rounded-xl font-semibold hover:bg-slate-600 transition"
          >
            View Heatmap
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
