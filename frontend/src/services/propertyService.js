import { api } from "./api";

export const propertyService = {
  list: () => api.get("/properties").then((res) => res.data),
  create: (payload) =>
    api
      .post("/properties", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((res) => res.data)
};
