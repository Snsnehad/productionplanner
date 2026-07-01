import api from "./axios";

export const getDashboardSummary = async () => {
  const { data } = await api.get("/dashboard/summary");
  return data.data;
};

export const getUpcomingPlans = async () => {
  const { data } = await api.get("/dashboard/upcoming-plans");
  return data.data;
};

export const getShortages = async () => {
  const { data } = await api.get("/dashboard/shortages");
  return data.data;
};
