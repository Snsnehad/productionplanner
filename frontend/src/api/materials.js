import api from "./axios";

export const getMaterials = async (params = {}) => {
  const { data } = await api.get("/materials", { params });
  return data.data;
};

export const getMaterial = async (id) => {
  const { data } = await api.get(`/materials/${id}`);
  return data.data;
};

export const createMaterial = async (payload) => {
  const { data } = await api.post("/materials", payload);
  return data.data;
};

export const updateMaterial = async ({ id, ...payload }) => {
  const { data } = await api.put(`/materials/${id}`, payload);
  return data.data;
};

export const deleteMaterial = async (id) => {
  const { data } = await api.delete(`/materials/${id}`);
  return data.data;
};
