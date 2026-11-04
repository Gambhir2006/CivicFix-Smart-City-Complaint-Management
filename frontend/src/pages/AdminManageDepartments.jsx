import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/departmentService";
import toast from "react-hot-toast";

function AdminManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDepartment(editingId, formData);
        toast.success("Department updated successfully");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "" });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      description: dept.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
        toast.success("Department deleted successfully");
        fetchDepartments();
      } catch (error) {
        toast.error("Failed to delete department");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
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
          <h1 className="text-3xl font-bold text-cyan-400">Manage Departments</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition"
            >
              + Add Department
            </button>
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {showForm && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Department" : "Add New Department"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  placeholder="e.g., Sanitation Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  placeholder="Department description..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {departments.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
              <p className="text-xl text-slate-400 mb-4">No departments yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition"
              >
                Create First Department
              </button>
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{dept.name}</h3>
                    {dept.description && (
                      <p className="text-slate-400">{dept.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageDepartments;
