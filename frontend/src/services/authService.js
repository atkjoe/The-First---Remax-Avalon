import { api } from "./api";

export const authService = {
  login: (payload) => api.post("/login", payload).then((res) => res.data)
};
