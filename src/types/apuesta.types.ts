export interface Apuesta {
  id: number
  usuario_id: string
  monto_apostado: number
  resultado: string
  deporte: string
  cuota: number
  descripcion: string
  monto_resultado: number | null
  created_at: string
}

export interface ApuestaCreate {
  usuario_id: string
  deporte_slug: string
  monto_apostado: string
  cuota: string
  descripcion: string
  resultado?: string
}