// frontend/src/api/axios-client.ts
import axios from 'axios'

// En Databricks Apps, usa URL relativa (sin localhost)
// La app está servida desde el mismo dominio que el backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

console.log('🌐 API Base URL:', API_BASE_URL)

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado a 30 segundos para Databricks
})

// Request interceptor (SIN token por ahora)
apiClient.interceptors.request.use(
  (config) => {
    console.log('➡️ Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor (manejo de errores mejorado)
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)