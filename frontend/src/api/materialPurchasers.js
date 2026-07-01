import api from "./axios";

export const getMappings = async () => {
  const { data } = await api.get("/material-purchasers");
  return data.data;
};

export const createMapping = async (payload) => {
  const { data } = await api.post("/material-purchasers", payload);
  return data.data;
};

export const deleteMapping = async (id) => {
  const { data } = await api.delete(`/material-purchasers/${id}`);
  return data.data;
};
