import { api } from "./api";

export const clientNoteService = {
  list: () => api.get("/client-notes").then((res) => res.data),
  create: (payload) => api.post("/client-notes", payload).then((res) => res.data),
  update: (id, payload) => api.put(`/client-notes/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/client-notes/${id}`).then((res) => res.data)
};
