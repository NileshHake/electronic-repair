import axios from "axios";
import { api } from "../config";

 
axios.defaults.baseURL = api.API_URL;

 
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.headers.put["Content-Type"] = "multipart/form-data";

 
const tokenData = sessionStorage.getItem("authUser");
const token = tokenData ? JSON.parse(tokenData).token : null;

 
if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

 
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    let message;
    switch (error.status) {
      case 500:
        message = "Internal Server Error";
        break;
      case 401:
        message = "Invalid credentials";
        break;
      case 404:
        message = "Sorry! the data you are looking for could not be found";
        break;
      default:
        message = error.message || error;
    }
    return Promise.reject(message);
  }
);

 
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

 class APIClient {
 
  get = (url, params) => {
    let response;
    let paramKeys = [];

    if (params) {
      Object.keys(params).map((key) => {
        paramKeys.push(key + "=" + params[key]);
        return paramKeys;
      });

      const queryString =
        paramKeys && paramKeys.length ? paramKeys.join("&") : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };

 
  create = (url, data) => {
    return axios.post(url, data);
  };

 
  createFormData = async (url, formData) => {
    try {
      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
 
  put = (url, data) => {
    return axios.put(url, data);
  };
 
  putFormData = (url, formData) => {
    return axios.put(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

 
  update = (url, data) => {
    return axios.patch(url, data);
  };

 
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}

 
const getLoggedinUser = () => {
  const user = sessionStorage.getItem("authUser");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };
