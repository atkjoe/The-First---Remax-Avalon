import { api } from "./api";

export const appointmentService = {
  list: () => api.get("/appointments").then((res) => res.data),
  create: (payload) => api.post("/appointments", payload).then((res) => res.data),
  update: (id, payload) => api.put(`/appointments/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/appointments/${id}`).then((res) => res.data)
};
