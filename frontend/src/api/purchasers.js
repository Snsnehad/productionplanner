import api from "./axios";

export const getPurchasers = async (params = {}) => {
  const { data } = await api.get("/purchasers", { params });
  return data.data;
};

export const createPurchaser = async (payload) => {
  const { data } = await api.post("/purchasers", payload);
  return data.data;
};

export const updatePurchaser = async ({ id, ...payload }) => {
  const { data } = await api.put(`/purchasers/${id}`, payload);
  return data.data;
};

export const deletePurchaser = async (id) => {
  const { data } = await api.delete(`/purchasers/${id}`);
  return data.data;
};
