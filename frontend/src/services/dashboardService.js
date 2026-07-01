import { api } from "./api";

export const dashboardService = {
  stats: () => api.get("/dashboard").then((res) => res.data)
};
