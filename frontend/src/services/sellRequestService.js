import { api } from "./api";

export const sellRequestService = {
  list: () => api.get("/sell-requests").then((res) => res.data),
  create: (payload) => api.post("/sell-requests", payload).then((res) => res.data),
  remove: (id) => api.delete(`/sell-requests/${id}`).then((res) => res.data)
};
