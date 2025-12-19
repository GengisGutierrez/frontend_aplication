import { apiClient } from './axios-client'
import type { Estadisticas } from '../types/estadisticas.types'

export const estadisticasApi = {
  getByUsuario: async (usuarioId: string): Promise<Estadisticas> => {
    const { data } = await apiClient.get<Estadisticas>(`/estadisticas/${usuarioId}`)
    return data
  },
}