import axios from "axios"

export const AUTH_TOKEN_STORAGE_KEY = "SportsBuddyToken"

export const getStoredAuthToken = () => {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const setStoredAuthToken = (token) => {
  if (!token) return

  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export const clearStoredAuthToken = () => {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
