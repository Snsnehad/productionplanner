import api from "./axios";

export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });
  return data.data;
};

export const getNotification = async (id) => {
  const { data } = await api.get(`/notifications/${id}`);
  return data.data;
};

export const acknowledgeNotification = async (id) => {
  const { data } = await api.post(`/notifications/${id}/acknowledge`);
  return data.data;
};

export const resolveNotification = async (id) => {
  const { data } = await api.post(`/notifications/${id}/resolve`);
  return data.data;
};
