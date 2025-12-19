import { useState, useEffect } from 'react'
import { useColaboradores } from '../hooks/useColaboradores'
import { useApuestas } from '../hooks/useApuestas'
import '../styles/pages/OperadoresInventario.css'

interface Usuario {
  id: string
  nombre: string
  operador_nombre: string
  index: number
}

function OperadoresInventario() {
  const { colaboradores, loading: loadingColaboradores, error: errorColaboradores } = useColaboradores()
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  
  // Hook de apuestas que depende del usuario seleccionado
  const {
    apuestas,
    estadisticas,
    apuestaEditando,
    formData,
    loading: loadingApuestas,
    error: errorApuestas,
    handleInputChange,
    handleKeyPress,
    agregarApuesta,
    actualizarApuesta,
    eliminarApuesta,
    editarApuesta,
    cancelarEdicion,
    formatearFecha
  } = useApuestas(usuarioSeleccionado?.id || null)

  // Seleccionar automáticamente el primer colaborador cuando se carguen
  useEffect(() => {
    if (colaboradores.length > 0 && !usuarioSeleccionado) {
      setUsuarioSeleccionado(colaboradores[0])
    }
  }, [colaboradores, usuarioSeleccionado])

  // Mostrar loading mientras carga colaboradores
  if (loadingColaboradores) {
    return <div className="loading">Cargando colaboradores...</div>
  }

  // Mostrar error si falla la carga de colaboradores
  if (errorColaboradores) {
    return <div className="error">Error al cargar colaboradores. Por favor, intenta de nuevo.</div>
  }

  // Mostrar mensaje si no hay colaboradores
  if (colaboradores.length === 0) {
    return <div className="no-data">No hay colaboradores disponibles</div>
  }

  return (
    <>
      <div className="app">
        <div className="sidebar">
          <h2>Colaboradores</h2>
          <div className="usuarios-list">
            {colaboradores.map(usuario => (
              <div
                key={usuario.id}
                className={`usuario-item ${usuarioSeleccionado?.id === usuario.id ? 'active' : ''}`}
                onClick={() => setUsuarioSeleccionado(usuario)}
              >
                {usuario.index} - {usuario.nombre}
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          {usuarioSeleccionado && (
            <>
              <div className="header">
                <h1>{usuarioSeleccionado.nombre}</h1>
                <p className="operador-info">Operador: {usuarioSeleccionado.operador_nombre}</p>
              </div>

              {estadisticas && (
                <div className="estadisticas">
                  <div className="stat-card">
                    <h3>Balance Total</h3>
                    <p className={estadisticas.balance_total >= 0 ? 'positive' : 'negative'}>
                      S/. {estadisticas.balance_total.toFixed(2)}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Apostado</h3>
                    <p>S/. {estadisticas.total_apostado.toFixed(2)}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Apuestas</h3>
                    <p>{estadisticas.apuestas_ganadas}G / {estadisticas.apuestas_perdidas}P</p>
                  </div>
                  <div className="stat-card">
                    <h3>% Éxito</h3>
                    <p>{estadisticas.porcentaje_exito}%</p>
                  </div>
                </div>
              )}

              <div className="form-container">
                <h3>{apuestaEditando ? 'Editar Apuesta' : 'Nueva Apuesta'}</h3>
                <div className="form-grid">
                  <input
                    type="number"
                    name="monto_apostado"
                    placeholder="Monto Apostado"
                    value={formData.monto_apostado}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <select
                    name="resultado"
                    value={formData.resultado}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                  >
                    <option value="Ganancia">Ganancia</option>
                    <option value="Pérdida">Pérdida</option>
                  </select>
                  <input
                    type="text"
                    name="deporte"
                    placeholder="Deporte"
                    value={formData.deporte}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <input
                    type="number"
                    step="0.01"
                    name="cuota"
                    placeholder="Cuota/Odds"
                    value={formData.cuota}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="form-actions">
                  {apuestaEditando ? (
                    <>
                      <button onClick={actualizarApuesta} className="btn-primary">
                        Actualizar
                      </button>
                      <button onClick={cancelarEdicion} className="btn-secondary">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button onClick={agregarApuesta} className="btn-primary">
                      Agregar (Enter)
                    </button>
                  )}
                </div>
              </div>

              <div className="apuestas-list">
                <h3>Historial de Apuestas</h3>
                {loadingApuestas ? (
                  <p className="loading-text">Cargando apuestas...</p>
                ) : errorApuestas ? (
                  <p className="error-text">Error al cargar apuestas</p>
                ) : apuestas.length === 0 ? (
                  <p className="no-data">No hay apuestas registradas</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Deporte</th>
                        <th>Monto</th>
                        <th>Cuota</th>
                        <th>Resultado</th>
                        <th>Ganancia/Pérdida</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apuestas.map(apuesta => (
                        <tr key={apuesta.id}>
                          <td>{formatearFecha(apuesta.created_at)}</td>
                          <td>{apuesta.deporte}</td>
                          <td>S/. {apuesta.monto_apostado.toFixed(2)}</td>
                          <td>{apuesta.cuota.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${apuesta.resultado.toLowerCase()}`}>
                              {apuesta.resultado}
                            </span>
                          </td>
                          <td className={apuesta.monto_resultado >= 0 ? 'positive' : 'negative'}>
                            S/. {apuesta.monto_resultado.toFixed(2)}
                          </td>
                          <td>{apuesta.descripcion}</td>
                          <td>
                            <button
                              onClick={() => editarApuesta(apuesta)}
                              className="btn-edit"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarApuesta(apuesta.id)}
                              className="btn-delete"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default OperadoresInventario