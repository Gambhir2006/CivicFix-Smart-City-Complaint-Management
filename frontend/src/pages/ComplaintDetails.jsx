import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getComplaintById } from "../services/complaintService";
import toast from "react-hot-toast";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data);
    } catch (error) {
      toast.error("Failed to fetch complaint details");
      navigate("/citizen/complaints");
    } finally {
      setLoading(false);
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
        <div className="text-xl">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Complaint not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/citizen/complaints"
          className="inline-block mb-6 text-cyan-400 hover:underline"
        >
          ← Back to My Complaints
        </Link>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{complaint.title}</h1>
              <p className="text-slate-400">Code: {complaint.complaint_code}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}
              >
                {complaint.status}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(complaint.priority)}`}
              >
                {complaint.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Category</p>
              <p className="font-semibold">{complaint.category}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Submitted On</p>
              <p className="font-semibold">
                {new Date(complaint.created_at).toLocaleString()}
              </p>
            </div>
            {complaint.updated_at && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Last Updated</p>
                <p className="font-semibold">
                  {new Date(complaint.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {(complaint.latitude || complaint.longitude || complaint.address) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              {complaint.address && (
                <p className="text-slate-300 mb-2">📍 {complaint.address}</p>
              )}
              {complaint.latitude && complaint.longitude && (
                <p className="text-slate-400 text-sm">
                  Coordinates: {complaint.latitude}, {complaint.longitude}
                </p>
              )}
            </div>
          )}

          {complaint.image_urls && complaint.image_urls.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complaint.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Complaint image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-semibold mb-3">Status Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Submitted</p>
                  <p className="text-sm text-slate-400">
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {complaint.status !== "Submitted" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold">{complaint.status}</p>
                    <p className="text-sm text-slate-400">
                      {complaint.updated_at
                        ? new Date(complaint.updated_at).toLocaleString()
                        : "In progress"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
