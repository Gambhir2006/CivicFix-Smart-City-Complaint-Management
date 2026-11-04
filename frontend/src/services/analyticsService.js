import api from "./api";

export const getPublicAnalytics = async () => {
  const response = await api.get("/analytics/public");
  return response.data;
};

export const getDetailedAnalytics = async () => {
  const response = await api.get("/analytics/detailed");
  return response.data;
};
