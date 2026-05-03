import api from "../api/axios";

export const logEvent = async (event) => {

  try {
    await api.post("/tracking/event/", event);
  } catch (err) {
    console.error("Event logging failed", err);
  }

};