import { useState, useEffect } from 'react'
import { estadisticasApi } from '../api/estadisticas.api'
import type { Estadisticas } from '../types/estadisticas.types'

export const useEstadisticas = (usuarioId: string | null) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEstadisticas = async () => {
    if (!usuarioId) return

    setLoading(true)
    setError(null)

    try {
      const data = await estadisticasApi.getByUsuario(usuarioId)
      setEstadisticas(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar estadísticas')
      console.error('Error fetching estadisticas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstadisticas()
  }, [usuarioId])

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas,
  }
}