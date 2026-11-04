import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAllComplaints = async () => {
  const response = await api.get("/admin/complaints");
  return response.data;
};

export const updateComplaintStatus = async (id, status, remarks) => {
  const response = await api.patch(`/admin/complaints/${id}/status`, null, {
    params: { new_status: status, remarks }
  });
  return response.data;
};

export const assignComplaint = async (complaintId, staffId) => {
  const response = await api.post("/admin/assign", {
    complaint_id: complaintId,
    staff_id: staffId
  });
  return response.data;
};

export const getAllStaff = async () => {
  const response = await api.get("/admin/staff");
  return response.data;
};

export const getComplaintHistory = async (id) => {
  const response = await api.get(`/admin/complaints/${id}/history`);
  return response.data;
};
