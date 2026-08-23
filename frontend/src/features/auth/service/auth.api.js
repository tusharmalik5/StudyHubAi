import api from "../../../app/axiosInstance.js";

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function verifyEmail(token) {
  try {
    const response = await api.get(`/api/auth/verify-email?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

export default api;
