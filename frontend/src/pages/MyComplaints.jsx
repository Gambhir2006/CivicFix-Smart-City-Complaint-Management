import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyComplaints, deleteComplaint } from "../services/complaintService";
import toast from "react-hot-toast";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (error) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await deleteComplaint(id);
        toast.success("Complaint deleted successfully");
        fetchComplaints();
      } catch (error) {
        toast.error(error.response?.data?.detail || "Failed to delete complaint");
      }
    }
  };

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

  const getPriorityColor = (priority) => {
    const colors = {
      "Low": "bg-green-500",
      "Medium": "bg-yellow-500",
      "High": "bg-orange-500",
      "Urgent": "bg-red-500"
    };
    return colors[priority] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">My Complaints</h1>
          <Link
            to="/citizen/report"
            className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition"
          >
            + New Complaint
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
            <p className="text-xl text-slate-400 mb-4">No complaints yet</p>
            <Link
              to="/citizen/report"
              className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition inline-block"
            >
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                    <p className="text-sm text-slate-400">
                      Code: {complaint.complaint_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}
                    >
                      {complaint.priority}
                    </span>
                  </div>
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

                {complaint.image_urls && complaint.image_urls.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {complaint.image_urls.slice(0, 3).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Complaint image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                    {complaint.image_urls.length > 3 && (
                      <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        +{complaint.image_urls.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    View Details
                  </Link>
                  {complaint.status === "Submitted" && (
                    <button
                      onClick={() => handleDelete(complaint.id)}
                      className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;
