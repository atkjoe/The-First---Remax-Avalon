import { api } from "./api";

export const requestService = {
  list: () => api.get("/requests").then((res) => res.data),
  create: (payload) => api.post("/requests", payload).then((res) => res.data)
};
