import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssignedTasks, acceptTask, resolveTask } from "../services/staffService";
import toast from "react-hot-toast";

function StaffDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getAssignedTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (complaintId) => {
    try {
      await acceptTask(complaintId);
      toast.success("Task accepted");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to accept task");
    }
  };

  const handleResolve = async (complaintId) => {
    const notes = prompt("Enter resolution notes:");
    if (notes) {
      try {
        await resolveTask(complaintId, notes);
        toast.success("Task resolved successfully");
        fetchTasks();
      } catch (error) {
        toast.error("Failed to resolve task");
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">CivicFix</h1>
          <div className="flex gap-4 items-center">
            <span className="text-slate-300">Staff Dashboard</span>
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
        <h2 className="text-3xl font-bold mb-6">My Assigned Tasks</h2>

        {tasks.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
            <p className="text-xl text-slate-400 mb-4">No tasks assigned yet</p>
            <p className="text-slate-500">Tasks will appear here when an admin assigns complaints to you</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-400">
                      Code: {task.complaint_code}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </div>

                <p className="text-slate-300 mb-4 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                  <span>Category: {task.category}</span>
                  <span>Priority: {task.priority}</span>
                </div>

                {task.address && (
                  <p className="text-sm text-slate-400 mb-4">
                    📍 {task.address}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    to={`/complaints/${task.id}`}
                    className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    View Details
                  </Link>
                  {task.status === "Assigned" && (
                    <button
                      onClick={() => handleAccept(task.id)}
                      className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
                    >
                      Accept Task
                    </button>
                  )}
                  {task.status === "In Progress" && (
                    <button
                      onClick={() => handleResolve(task.id)}
                      className="px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition"
                    >
                      Mark Resolved
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

export default StaffDashboard;
