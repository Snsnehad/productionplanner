import api from "./axios";

export const getPlans = async (params = {}) => {
  const { data } = await api.get("/plans", { params });
  return data.data;
};

export const getPlan = async (id) => {
  const { data } = await api.get(`/plans/${id}`);
  return data.data; // { plan, materials }
};

export const createPlan = async (payload) => {
  const { data } = await api.post("/plans", payload);
  return data.data;
};

export const updatePlanStatus = async ({ id, status }) => {
  const { data } = await api.put(`/plans/${id}/status`, { status });
  return data.data;
};
