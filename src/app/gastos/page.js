'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario
  const [gastoForm, setGastoForm] = useState({
    concepto: '',
    total: 0,
    id_Compra: '',
    id_Empleado: ''
  });
  
  // Estado para edición
  const [editForm, setEditForm] = useState({
    id_Gasto: null,
    concepto: '',
    total: 0,
    id_Compra: '',
    id_Empleado: ''
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar gastos
        const gastosRes = await fetch('/api/gastos');
        if (!gastosRes.ok) throw new Error('Error al cargar gastos');
        const gastosData = await gastosRes.json();
        setGastos(gastosData);
        
        // Cargar empleados
        const empleadosRes = await fetch('/api/empleados');
        if (!empleadosRes.ok) throw new Error('Error al cargar empleados');
        const empleadosData = await empleadosRes.json();
        setEmpleados(empleadosData);
        
        // Cargar compras
        const comprasRes = await fetch('/api/compras');
        if (!comprasRes.ok) throw new Error('Error al cargar compras');
        const comprasData = await comprasRes.json();
        setCompras(comprasData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGastoForm({
      ...gastoForm,
      [name]: name === 'total' ? parseFloat(value) : value
    });
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'total' ? parseFloat(value) : value
    });
  };
  
  // Iniciar modo edición
  const handleEditMode = (gasto) => {
    setEditForm({
      id_Gasto: gasto.id_Gasto,
      concepto: gasto.concepto,
      total: gasto.total,
      id_Compra: gasto.id_Compra || '',
      id_Empleado: gasto.id_Empleado || ''
    });
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditForm({
      id_Gasto: null,
      concepto: '',
      total: 0,
      id_Compra: '',
      id_Empleado: ''
    });
  };
  
  // Guardar gasto editado - SOLUCIÓN IMPLEMENTADA
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editForm.concepto || editForm.total <= 0) {
      alert('Por favor complete el concepto y el total correctamente');
      return;
    }
    
    // Crear una copia del formulario para la solicitud
    const formData = {
      ...editForm,
      // Convertir cadenas vacías a null para campos de ID
      id_Compra: editForm.id_Compra === '' ? null : editForm.id_Compra,
      id_Empleado: editForm.id_Empleado === '' ? null : editForm.id_Empleado
    };
    
    try {
      const response = await fetch('/api/gastos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar gasto');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de gastos
      const gastosRes = await fetch('/api/gastos');
      const gastosData = await gastosRes.json();
      setGastos(gastosData);
      
      // Resetear formulario de edición
      handleCancelEdit();
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Enviar formulario para nuevo gasto - SOLUCIÓN IMPLEMENTADA
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gastoForm.concepto || gastoForm.total <= 0) {
      alert('Por favor complete el concepto y el total correctamente');
      return;
    }
    
    // Crear una copia del formulario para la solicitud
    const formData = {
      ...gastoForm,
      // Convertir cadenas vacías a null para campos de ID
      id_Compra: gastoForm.id_Compra === '' ? null : gastoForm.id_Compra,
      id_Empleado: gastoForm.id_Empleado === '' ? null : gastoForm.id_Empleado
    };
    
    try {
      const response = await fetch('/api/gastos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar gasto');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de gastos
      const gastosRes = await fetch('/api/gastos');
      const gastosData = await gastosRes.json();
      setGastos(gastosData);
      
      // Limpiar formulario
      setGastoForm({
        concepto: '',
        total: 0,
        id_Compra: '',
        id_Empleado: ''
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar gasto
  const handleDeleteGasto = async (id) => {
    if (!confirm('¿Está seguro de eliminar este gasto?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/gastos?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar gasto');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de gastos
      const gastosRes = await fetch('/api/gastos');
      const gastosData = await gastosRes.json();
      setGastos(gastosData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Categorizar tipo de gasto para la UI
  const getTipoGasto = (gasto) => {
    if (gasto.id_Compra) return { label: 'Compra', icon: '🛒' };
    if (gasto.id_Empleado) return { label: 'Empleado', icon: '👨‍🍳' };
    return { label: 'General', icon: '📝' };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando gastos...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-[#172231] rounded-lg text-center border border-[#38bdf8]">
        <h2 className="text-lg font-semibold text-[#60a5fa] mb-2">Error al cargar datos</h2>
        <p className="text-[#94a3b8]">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#38bdf8] text-white rounded-lg hover:bg-[#0ea5e9]"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Gastos</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo gasto */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Registrar Nuevo Gasto</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Concepto *</label>
                <input
                  type="text"
                  name="concepto"
                  value={gastoForm.concepto}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej. Pago de servicios, materiales, etc."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Total *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="total"
                    value={gastoForm.total}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className="form-input pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Relacionado con Compra (opcional)</label>
                <select
                  name="id_Compra"
                  value={gastoForm.id_Compra}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Ninguna</option>
                  {compras.map(c => (
                    <option key={c.id_Compra} value={c.id_Compra}>
                      Compra #{c.id_Compra} - ${parseFloat(c.total).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Relacionado con Empleado (opcional)</label>
                <select
                  name="id_Empleado"
                  value={gastoForm.id_Empleado}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Ninguno</option>
                  {empleados.map(e => (
                    <option key={e.id_Empleado} value={e.id_Empleado}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full p-3 rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Registrar Gasto
              </button>
            </form>
          </div>
        </div>
        
        {/* Lista de gastos */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Historial de Gastos</h2>
            <div className="flex items-center space-x-2">
              <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
                {gastos.length} total
              </span>
              {gastos.length > 0 && (
                <span className="bg-[#f87171] text-white text-xs font-bold py-1 px-2 rounded-full">
                  ${gastos.reduce((sum, g) => sum + parseFloat(g.total), 0).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <div className="card-body">
            {gastos.length > 0 ? (
              <div className="space-y-4">
                {gastos.map(gasto => {
                  const tipoGasto = getTipoGasto(gasto);
                  return (
                    <div 
                      key={gasto.id_Gasto} 
                      className="p-4 rounded-lg bg-[#1e293b] border border-[#334155] shine flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-2xl mr-2">{tipoGasto.icon}</span>
                          <h3 className="text-white font-medium">{gasto.concepto}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-[#334155] text-white text-xs px-2 py-1 rounded-full">
                            Tipo: {tipoGasto.label}
                          </span>
                          {gasto.empleado_nombre && (
                            <span className="bg-[#334155] text-[#38bdf8] text-xs px-2 py-1 rounded-full">
                              Empleado: {gasto.empleado_nombre}
                            </span>
                          )}
                          {gasto.compra_fecha && (
                            <span className="bg-[#334155] text-[#38bdf8] text-xs px-2 py-1 rounded-full">
                              Compra: {new Date(gasto.compra_fecha).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-[#f87171] font-bold text-sm">
                            ${parseFloat(gasto.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditMode(gasto)}
                          className="p-2 bg-[#334155] text-[#38bdf8] rounded-lg hover:bg-[#475569] transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGasto(gasto.id_Gasto)}
                          className="p-2 bg-[#334155] text-[#f87171] rounded-lg hover:bg-[#475569] transition-colors"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-[#94a3b8] text-center">No hay gastos registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Registra un gasto utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de edición */}
      {editForm.id_Gasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Editar Gasto</h2>
              <button 
                onClick={handleCancelEdit}
                className="text-[#94a3b8] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="mb-4">
                <label className="form-label">Concepto *</label>
                <input
                  type="text"
                  name="concepto"
                  value={editForm.concepto}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Total *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="total"
                    value={editForm.total}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    className="form-input pl-7"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Relacionado con Compra</label>
                <select
                  name="id_Compra"
                  value={editForm.id_Compra}
                  onChange={handleEditChange}
                  className="form-select"
                >
                  <option value="">Ninguna</option>
                  {compras.map(c => (
                    <option key={c.id_Compra} value={c.id_Compra}>
                      Compra #{c.id_Compra} - ${parseFloat(c.total).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Relacionado con Empleado</label>
                <select
                  name="id_Empleado"
                  value={editForm.id_Empleado}
                  onChange={handleEditChange}
                  className="form-select"
                >
                  <option value="">Ninguno</option>
                  {empleados.map(e => (
                    <option key={e.id_Empleado} value={e.id_Empleado}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-[#334155] text-white rounded hover:bg-[#475569]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#38bdf8] text-white rounded hover:bg-[#0ea5e9]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}