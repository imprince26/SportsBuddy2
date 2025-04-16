import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Handle FormData requests (for file uploads)
//     if (config.data instanceof FormData) {
//       config.headers = {
//         ...config.headers,
//         'Content-Type': 'multipart/form-data',
//       };
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized access
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );


export default api;