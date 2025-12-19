import { useState, useEffect } from 'react'

interface Colaborador {
  id: string
  nombre: string
  operador_nombre: string
  index: number
}

export const useColaboradores = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const response = await fetch('/api/v1/colaboradores/')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          throw new Error('La respuesta no es un array')
        }
        
        // Agregar índice
        const colaboradoresConIndex = data.map((col, idx) => ({
          ...col,
          index: idx + 1
        }))
        
        setColaboradores(colaboradoresConIndex)
        setLoading(false)
        
      } catch (err) {
        setError(true)
        setLoading(false)
      }
    }

    fetchColaboradores()
  }, [])

  return { colaboradores, loading, error }
}