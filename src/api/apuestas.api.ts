import { apiClient } from './axios-client'
import type { Apuesta, ApuestaCreate } from '../types/apuesta.types'

export const apuestasApi = {
  getByUsuario: async (usuarioId: string): Promise<Apuesta[]> => {
    const { data } = await apiClient.get<Apuesta[]>(`/apuestas/usuario/${usuarioId}`)
    return data
  },

  create: async (apuesta: ApuestaCreate): Promise<Apuesta> => {
    const { data } = await apiClient.post<Apuesta>('/apuestas', apuesta)
    return data
  },

  updateResultado: async (
    apuestaId: number,
    resultado: string,
    montoResultado: number
  ): Promise<void> => {
    await apiClient.patch(`/apuestas/${apuestaId}`, {
      resultado,
      monto_resultado: montoResultado,
    })
  },
}