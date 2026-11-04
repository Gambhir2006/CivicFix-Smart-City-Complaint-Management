import React, { useEffect, useState } from "react";
import { getPublicComplaints } from "../services/complaintService";
import { Link } from "react-router-dom";

function PublicDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await getPublicComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = filter === "all"
    ? complaints
    : complaints.filter(c => c.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      "Submitted": "bg-blue-500",
      "Under Review": "bg-yellow-500",
      "Assigned": "bg-purple-500",
      "In Progress": "bg-orange-500",
      "Resolved": "bg-green-500",
      "Closed": "bg-gray-500",
      "Rejected": "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">Public Complaint Dashboard</h1>
          <Link
            to="/"
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${filter === "all" ? "bg-cyan-500" : "bg-slate-800"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Submitted")}
              className={`px-4 py-2 rounded-lg transition ${filter === "Submitted" ? "bg-cyan-500" : "bg-slate-800"}`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilter("In Progress")}
              className={`px-4 py-2 rounded-lg transition ${filter === "In Progress" ? "bg-cyan-500" : "bg-slate-800"}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("Resolved")}
              className={`px-4 py-2 rounded-lg transition ${filter === "Resolved" ? "bg-cyan-500" : "bg-slate-800"}`}
            >
              Resolved
            </button>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
            <p className="text-xl text-slate-400">No complaints found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                    <p className="text-sm text-slate-400">
                      Code: {complaint.complaint_code}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}
                  >
                    {complaint.status}
                  </span>
                </div>

                <p className="text-slate-300 mb-4 line-clamp-2">
                  {complaint.description}
                </p>

                <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                  <span>Category: {complaint.category}</span>
                  <span>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>

                {complaint.address && (
                  <p className="text-sm text-slate-400 mb-4">
                    📍 {complaint.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicDashboard;
