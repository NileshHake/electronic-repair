import axios from "axios";
import { api } from "../../../config";
 

/**
 * ======================================================
 * AXIOS INSTANCE
 * ======================================================
 */
const axiosInstance = axios.create({
  baseURL: api.API_URL,
  timeout: 30000, // 30 seconds
});

/**
 * ======================================================
 * REQUEST INTERCEPTOR
 * Attach token dynamically
 * ======================================================
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const authUser = sessionStorage.getItem("authUser");

    if (authUser) {
      const parsed = JSON.parse(authUser);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ======================================================
 * RESPONSE INTERCEPTOR
 * Global error handling
 * ======================================================
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Always return response data directly
    return response.data;
  },
  (error) => {
    let message = "Something went wrong";

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message = "Unauthorized. Please login again.";
          sessionStorage.clear();
          break;
        case 403:
          message = "Access denied.";
          break;
        case 404:
          message = "Requested resource not found.";
          break;
        case 500:
          message = "Internal server error.";
          break;
        default:
          message = data?.message || message;
      }

      return Promise.reject({ message, status });
    }

    if (error.request) {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        status: null,
      });
    }

    return Promise.reject({
      message: error.message,
      status: null,
    });
  }
);

/**
 * ======================================================
 * AUTH HELPERS
 * ======================================================
 */
export const setAuthorization = (token) => {
  if (token) {
    sessionStorage.setItem("authUser", JSON.stringify({ token }));
  }
};

export const getLoggedinUser = () => {
  const user = sessionStorage.getItem("authUser");
  return user ? JSON.parse(user) : null;
};

export const clearAuthorization = () => {
  sessionStorage.removeItem("authUser");
};

/**
 * ======================================================
 * API CLIENT CLASS
 * ======================================================
 */
class APIClient {
  // GET
  get(url, params = {}) {
    return axiosInstance.get(url, { params });
  }

  // POST (JSON)
  post(url, data) {
    return axiosInstance.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });
  }

  // POST (FormData)
  postFormData(url, data) {
    return axiosInstance.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // PUT (JSON)
  put(url, data) {
    return axiosInstance.put(url, data, {
      headers: { "Content-Type": "application/json" },
    });
  }

  // PUT (FormData)
  putFormData(url, data) {
    return axiosInstance.put(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // PATCH
  patch(url, data) {
    return axiosInstance.patch(url, data);
  }

  // DELETE
  delete(url, config = {}) {
    return axiosInstance.delete(url, config);
  }
}

/**
 * ======================================================
 * EXPORT SINGLETON
 * ======================================================
 */
const apiClient = new APIClient();
export default apiClient;
