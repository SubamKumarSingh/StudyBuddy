import api from "./axios";

export const fetchNotes = () => api.get("resources/notes/");

export const addNote = (data) => api.post("resources/notes/", data);

export const removeNote = (id) => api.delete(`resources/notes/${id}/`);