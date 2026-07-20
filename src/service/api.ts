import axios from "axios";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie
} from "./authCookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // importante para cookie refreshToken
});


// manda o access token automaticamente
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});



// quando receber 401 tenta renovar
api.interceptors.response.use(
  response => response,

  async error => {

    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh");


    if(
      originalRequest &&
      error.response?.status === 401 &&
      !isAuthRoute &&
      !originalRequest._retry
    ){

      originalRequest._retry = true;


      try {

        const response = await api.post(
          "/auth/refresh"
        );


        const newToken =
          response.data.accessToken;
        const newRefreshToken =
          response.data.refreshToken;


        localStorage.setItem(
          "token",
          newToken
        );

        if (newRefreshToken) {
          setRefreshTokenCookie(newRefreshToken);
        }


        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;


        return api(originalRequest);


      } catch(refreshError){

        localStorage.removeItem("token");

        clearRefreshTokenCookie();

        window.location.href = "/";

        return Promise.reject(refreshError);
      }

    }


    return Promise.reject(error);

  }
);


export default api;
