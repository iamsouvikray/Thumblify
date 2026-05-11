import axios from "axios";

const api = axios.create({
  baseURL: "https://thumblify-server-self-three.vercel.app",
  withCredentials: true
});

export default api;
