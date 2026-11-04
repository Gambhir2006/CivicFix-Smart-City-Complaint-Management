import api from "./api";

export const getAssignedTasks = async () => {
  const response = await api.get("/staff/tasks");
  return response.data;
};

export const acceptTask = async (complaintId) => {
  const response = await api.patch(`/staff/tasks/${complaintId}/accept`);
  return response.data;
};

export const updateTaskProgress = async (complaintId, remarks) => {
  const response = await api.patch(`/staff/tasks/${complaintId}/progress`, null, {
    params: { remarks }
  });
  return response.data;
};

export const resolveTask = async (complaintId, resolutionNotes) => {
  const response = await api.post(`/staff/tasks/${complaintId}/resolve`, {
    resolution_notes: resolutionNotes
  });
  return response.data;
};
