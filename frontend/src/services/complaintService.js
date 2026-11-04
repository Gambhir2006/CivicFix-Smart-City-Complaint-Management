import api from "./api";

export const createComplaint = async (formData) => {
  const response = await api.post("/complaints/", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get("/complaints/my");
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const getPublicComplaints = async () => {
  const response = await api.get("/complaints/public");
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.patch(`/complaints/${id}`, data);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};
