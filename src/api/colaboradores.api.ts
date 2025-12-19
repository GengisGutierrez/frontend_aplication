import { apiClient } from './axios-client'
import type { Usuario } from '../types/usuario.types'

export const colaboradoresApi = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await apiClient.get<Usuario[]>('/colaboradores')
    return data
  },

  getById: async (id: string): Promise<Usuario> => {
    const { data } = await apiClient.get<Usuario>(`/colaboradores/${id}`)
    return data
  },
}