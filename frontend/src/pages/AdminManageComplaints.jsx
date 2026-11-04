import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints, updateComplaintStatus, assignComplaint, getAllStaff } from "../services/adminService";
import toast from "react-hot-toast";

function AdminManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsData, staffData] = await Promise.all([
        getAllComplaints(),
        getAllStaff()
      ]);
      setComplaints(complaintsData);
      setStaff(staffData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast.success("Status updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaff) {
      toast.error("Please select complaint and staff");
      return;
    }

    try {
      await assignComplaint(selectedComplaint, parseInt(selectedStaff));
      toast.success("Complaint assigned successfully");
      setSelectedComplaint(null);
      setSelectedStaff("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to assign complaint");
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
          <h1 className="text-3xl font-bold text-cyan-400">Manage Complaints</h1>
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Assignment Panel */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign Complaint to Staff</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Complaint
              </label>
              <select
                value={selectedComplaint || ""}
                onChange={(e) => setSelectedComplaint(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              >
                <option value="">Select a complaint</option>
                {complaints
                  .filter(c => c.status === "Submitted" || c.status === "Under Review")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.complaint_code} - {c.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Staff
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              >
                <option value="">Select staff member</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAssign}
                className="w-full px-4 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition font-semibold"
              >
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
              <p className="text-xl text-slate-400">No complaints yet</p>
            </div>
          ) : (
            complaints.map((complaint) => (
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

                <div className="flex gap-2 flex-wrap">
                  {complaint.status === "Submitted" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(complaint.id, "Under Review")}
                        className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition text-sm"
                      >
                        Mark Under Review
                      </button>
                    </>
                  )}
                  {complaint.status === "Under Review" && (
                    <button
                      onClick={() => handleStatusUpdate(complaint.id, "Assigned")}
                      className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition text-sm"
                    >
                      Mark Assigned
                    </button>
                  )}
                  {complaint.status === "Resolved" && (
                    <button
                      onClick={() => handleStatusUpdate(complaint.id, "Closed")}
                      className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-600 transition text-sm"
                    >
                      Close Complaint
                    </button>
                  )}
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageComplaints;
