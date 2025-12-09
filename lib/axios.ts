import axios from "axios"
import { toast } from "react-hot-toast"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

// Detect if a message from API is in French
function detectLang(text: string): "fr" | "en" {
  const frenchWords = ["le", "la", "une", "pas", "de", "pour", "avec", "et", "sur"]
  const lower = text?.toLowerCase() || ""
  const score = frenchWords.filter((w) => lower.includes(w)).length
  return score > 2 ? "fr" : "en"
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  const url = config.url || ""
  const isLoginRequest = url.includes("/auth/login")
  const isRefreshRequest = url.includes("/auth/refresh")
  if (token && !isLoginRequest && !isRefreshRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // 🚫 Handle permission errors - redirect to login
    const errorMessage = error.response?.data?.details || error.response?.data?.detail || error.response?.data?.error || ""
    if (errorMessage.includes("You do not have permission to perform this action")) {
      localStorage.clear()
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      window.location.href = "/login"
      return Promise.reject(error)
    }

    // 🔁 Handle token refresh for 401 errors
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refresh = localStorage.getItem("refresh_token")

        if (!refresh) {
          throw new Error("No refresh token available")
        }

        const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}auth/refresh`, { refresh })
        const newToken = res.data.access

        // Update both localStorage and cookies
        localStorage.setItem("access_token", newToken)
        const isProduction = process.env.NODE_ENV === "production"
        const cookieOptions = isProduction ? "path=/; max-age=604800; secure; samesite=strict" : "path=/; max-age=604800; samesite=strict"
        document.cookie = `access_token=${newToken}; ${cookieOptions}`

        api.defaults.headers.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`

        return api(original)
      } catch (refreshError) {
        // Token refresh failed - clear tokens and redirect to login
        localStorage.clear()
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    // 🌍 Smart language-aware error display with specific status code handling
    const userLang = navigator.language.startsWith("fr") ? "fr" : "en"
    const statusCode = error.response?.status

    let displayMessage: string

    // Handle specific HTTP status codes with French messages
    if (statusCode >= 500) {
      // Server errors (500+)
      displayMessage = "Erreur interne du serveur. Veuillez réessayer plus tard."
    } else if (statusCode === 404) {
      // Not found errors
      displayMessage = "Ressource introuvable. Veuillez vérifier vos données."
    } else if (statusCode >= 400 && statusCode < 500) {
      // Client errors (400-499) - use backend message if available
      const backendMsg =
        error.response?.data?.details ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null)

      if (backendMsg && backendMsg.trim()) {
        displayMessage = backendMsg
      } else {
        // Fallback for client errors without specific message
        displayMessage = "Erreur de requête. Veuillez vérifier vos données et réessayer."
      }
    } else {
      // Network errors or other unrecognized errors
      const backendMsg =
        error.response?.data?.details ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null)

      if (backendMsg && backendMsg.trim()) {
        displayMessage = backendMsg
      } else {
        // Fallback for network/other errors
        displayMessage = "Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer."
      }
    }

    // Don't show toast for authentication errors that are being handled or permission errors (redirecting)
    const isPermissionError = displayMessage.includes("You do not have permission to perform this action")
    if ((error.response?.status !== 401 || !original._retry) && !isPermissionError) {
      toast.error(displayMessage, {
        style: {
          direction: "ltr",
          fontFamily: "sans-serif",
        },
      })
    }

    return Promise.reject(error)
  },
)

export default api
