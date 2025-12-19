import { useState, useEffect } from 'react'

interface Apuesta {
  id: number
  usuario_id: string
  monto_apostado: number
  resultado: string
  deporte: string
  cuota: number
  descripcion: string
  monto_resultado: number
  created_at: string
}

interface Estadisticas {
  balance_total: number
  total_apostado: number
  apuestas_ganadas: number
  apuestas_perdidas: number
  total_apuestas: number
  porcentaje_exito: number
}

interface FormData {
  monto_apostado: string
  resultado: string
  deporte: string
  cuota: string
  descripcion: string
}

export const useApuestas = (usuarioId: string | null) => {
  const [apuestas, setApuestas] = useState<Apuesta[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [apuestaEditando, setApuestaEditando] = useState<Apuesta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    monto_apostado: '',
    resultado: 'Ganancia',
    deporte: '',
    cuota: '',
    descripcion: ''
  })

  useEffect(() => {
    if (usuarioId) {
      cargarApuestas(usuarioId)
    }
  }, [usuarioId])

  useEffect(() => {
    if (apuestas.length > 0) {
      calcularEstadisticas()
    } else {
      setEstadisticas(null)
    }
  }, [apuestas])

  const cargarApuestas = async (usuarioId: string) => {
    try {
      setLoading(true)
      setError(false)
      
      const response = await fetch(`/api/v1/apuestas/usuario/${usuarioId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      const apuestasFormateadas = data.map((apuesta: any) => ({
        ...apuesta,
        monto_apostado: parseFloat(apuesta.monto_apostado) || 0,
        cuota: parseFloat(apuesta.cuota) || 0,
        monto_resultado: parseFloat(apuesta.monto_resultado) || 0,
        id: parseInt(apuesta.id) || apuesta.id
      }))
      
      setApuestas(Array.isArray(apuestasFormateadas) ? apuestasFormateadas : [])
      setLoading(false)
      
    } catch (err) {
      console.error('Error al cargar apuestas:', err)
      setError(true)
      setLoading(false)
      setApuestas([])
    }
  }

  const calcularEstadisticas = () => {
    const balance_total = apuestas.reduce((sum, a) => sum + a.monto_resultado, 0)
    const total_apostado = apuestas.reduce((sum, a) => sum + a.monto_apostado, 0)
    const apuestas_ganadas = apuestas.filter(a => a.resultado === 'Ganancia').length
    const apuestas_perdidas = apuestas.filter(a => a.resultado === 'Pérdida').length
    const total_apuestas = apuestas.length
    const porcentaje_exito = total_apuestas > 0 
      ? parseFloat(((apuestas_ganadas / total_apuestas) * 100).toFixed(2))
      : 0

    setEstadisticas({
      balance_total,
      total_apostado,
      apuestas_ganadas,
      apuestas_perdidas,
      total_apuestas,
      porcentaje_exito
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const agregarApuesta = async () => {
    if (!formData.monto_apostado || !formData.deporte || !formData.cuota || !usuarioId) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const monto = parseFloat(formData.monto_apostado)
    const cuota = parseFloat(formData.cuota)
    const monto_resultado = formData.resultado === 'Ganancia' 
      ? monto * cuota - monto
      : -monto

    const nuevaApuesta = {
      usuario_id: usuarioId,
      monto_apostado: monto,
      resultado: formData.resultado,
      deporte: formData.deporte,
      cuota: cuota,
      descripcion: formData.descripcion,
      monto_resultado: monto_resultado
    }

    try {
      const response = await fetch('/api/v1/apuestas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaApuesta)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await cargarApuestas(usuarioId)
      
      resetFormData()
      
    } catch (err) {
      console.error('Error al agregar apuesta:', err)
      alert('Error al agregar la apuesta. Por favor intenta de nuevo.')
    }
  }

  const actualizarApuesta = async () => {
    if (!apuestaEditando || !usuarioId) return

    const monto = parseFloat(formData.monto_apostado)
    const cuota = parseFloat(formData.cuota)
    const monto_resultado = formData.resultado === 'Ganancia' 
      ? monto * cuota - monto
      : -monto

    const apuestaActualizada = {
      monto_apostado: monto,
      resultado: formData.resultado,
      deporte: formData.deporte,
      cuota: cuota,
      descripcion: formData.descripcion,
      monto_resultado: monto_resultado
    }

    try {
      const response = await fetch(`/api/v1/apuestas/${apuestaEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apuestaActualizada)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await cargarApuestas(usuarioId)
      
      setApuestaEditando(null)
      resetFormData()
      
    } catch (err) {
      console.error('Error al actualizar apuesta:', err)
      alert('Error al actualizar la apuesta. Por favor intenta de nuevo.')
    }
  }

  const eliminarApuesta = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta apuesta?') || !usuarioId) return

    try {
      const response = await fetch(`/api/v1/apuestas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await cargarApuestas(usuarioId)
      
    } catch (err) {
      console.error('Error al eliminar apuesta:', err)
      alert('Error al eliminar la apuesta. Por favor intenta de nuevo.')
    }
  }

  const editarApuesta = (apuesta: Apuesta) => {
    setApuestaEditando(apuesta)
    setFormData({
      monto_apostado: apuesta.monto_apostado.toString(),
      resultado: apuesta.resultado,
      deporte: apuesta.deporte,
      cuota: apuesta.cuota.toString(),
      descripcion: apuesta.descripcion || ''
    })
  }

  const cancelarEdicion = () => {
    setApuestaEditando(null)
    resetFormData()
  }

  const resetFormData = () => {
    setFormData({
      monto_apostado: '',
      resultado: 'Ganancia',
      deporte: '',
      cuota: '',
      descripcion: ''
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (apuestaEditando) {
        actualizarApuesta()
      } else {
        agregarApuesta()
      }
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return {
    // Estados
    apuestas,
    estadisticas,
    apuestaEditando,
    formData,
    loading,
    error,
    
    // Funciones
    handleInputChange,
    handleKeyPress,
    agregarApuesta,
    actualizarApuesta,
    eliminarApuesta,
    editarApuesta,
    cancelarEdicion,
    formatearFecha
  }
}