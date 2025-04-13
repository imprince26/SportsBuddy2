import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Handle FormData requests (for file uploads)
    if (config.data instanceof FormData) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getCurrentUser = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const updatePassword = (data) => api.put("/auth/password", data);
export const getNotifications = () => api.get("/auth/notifications");
export const markNotificationAsRead = (id) => api.put(`/auth/notifications/${id}`);

// Event APIs
export const getAllEvents = (filters = {}) => api.get("/events", { params: filters });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post("/events", data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const joinEvent = (id) => api.post(`/events/${id}/join`);
export const leaveEvent = (id) => api.post(`/events/${id}/leave`);
export const getUserEvents = () => api.get("/events/user");

// Team APIs
export const createTeam = (eventId, data) => api.post(`/events/${eventId}/teams`, data);
export const updateTeam = (eventId, teamId, data) => api.put(`/events/${eventId}/teams/${teamId}`, data);
export const deleteTeam = (eventId, teamId) => api.delete(`/events/${eventId}/teams/${teamId}`);
export const joinTeam = (eventId, teamId) => api.post(`/events/${eventId}/teams/${teamId}/join`);
export const leaveTeam = (eventId, teamId) => api.post(`/events/${eventId}/teams/${teamId}/leave`);

// Chat APIs
export const getEventChat = (eventId) => api.get(`/events/${eventId}/chat`);
export const sendMessage = (eventId, message) => api.post(`/events/${eventId}/chat`, { message });

// Rating APIs
export const addRating = (eventId, data) => api.post(`/events/${eventId}/ratings`, data);
export const updateRating = (eventId, ratingId, data) => api.put(`/events/${eventId}/ratings/${ratingId}`, data);
export const deleteRating = (eventId, ratingId) => api.delete(`/events/${eventId}/ratings/${ratingId}`);

// Upload APIs
export const uploadEventImages = (formData) => api.post("/upload/event", formData);
export const uploadAvatar = (formData) => api.post("/upload/avatar", formData);

export default api;