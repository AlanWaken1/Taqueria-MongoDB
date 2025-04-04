'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [sueldos, setSueldos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario - adaptado para MongoDB
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    id_Sueldo: '', // Esto se usa solo para el formulario, luego se transformará
  });
  
  // Estado para edición - adaptado para MongoDB
  const [editForm, setEditForm] = useState({
    _id: null, // Cambiado de id_Empleado a _id
    nombre: '',
    telefono: '',
    email: '',
    id_Sueldo: ''
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar empleados
        const empleadosRes = await fetch('/api/empleados');
        if (!empleadosRes.ok) throw new Error('Error al cargar empleados');
        const empleadosData = await empleadosRes.json();
        setEmpleados(empleadosData);
        
        // Cargar sueldos
        const sueldosRes = await fetch('/api/sueldos');
        if (!sueldosRes.ok) throw new Error('Error al cargar sueldos');
        const sueldosData = await sueldosRes.json();
        setSueldos(sueldosData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleadoForm({
      ...empleadoForm,
      [name]: value
    });
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };
  
  // Iniciar modo edición - adaptado para MongoDB
  const handleEditMode = (empleado) => {
    setEditForm({
      _id: empleado._id, // Cambiado de id_Empleado a _id
      nombre: empleado.nombre,
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      id_Sueldo: empleado.puesto?._id || '' // Cambiado para acceder a puesto._id
    });
  };
  
  // Cancelar edición - adaptado para MongoDB
  const handleCancelEdit = () => {
    setEditForm({
      _id: null, // Cambiado de id_Empleado a _id
      nombre: '',
      telefono: '',
      email: '',
      id_Sueldo: ''
    });
  };
  
  // Guardar empleado editado - adaptado para MongoDB
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editForm.nombre) {
      alert('El nombre del empleado es obligatorio');
      return;
    }
    
    try {
      const response = await fetch('/api/empleados', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar empleado');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de empleados
      const empleadosRes = await fetch('/api/empleados');
      const empleadosData = await empleadosRes.json();
      setEmpleados(empleadosData);
      
      // Resetear formulario de edición
      handleCancelEdit();
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Enviar formulario para nuevo empleado - adaptado para MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!empleadoForm.nombre) {
      alert('El nombre del empleado es obligatorio');
      return;
    }
    
    try {
      const response = await fetch('/api/empleados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadoForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar empleado');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de empleados
      const empleadosRes = await fetch('/api/empleados');
      const empleadosData = await empleadosRes.json();
      setEmpleados(empleadosData);
      
      // Limpiar formulario
      setEmpleadoForm({
        nombre: '',
        telefono: '',
        email: '',
        id_Sueldo: '',
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar empleado - adaptado para MongoDB
  const handleDeleteEmpleado = async (id) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/empleados?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar empleado');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de empleados
      const empleadosRes = await fetch('/api/empleados');
      const empleadosData = await empleadosRes.json();
      setEmpleados(empleadosData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando empleados...</div>
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
        <h1 className="text-2xl font-bold text-white">Gestión de Empleados</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo empleado */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Agregar Nuevo Empleado</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Nombre del Empleado *</label>
                <input
                  type="text"
                  name="nombre"
                  value={empleadoForm.nombre}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={empleadoForm.telefono}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej. 555-123-4567"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={empleadoForm.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Puesto y Sueldo</label>
                <select
                  name="id_Sueldo"
                  value={empleadoForm.id_Sueldo}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Seleccione un puesto</option>
                  {sueldos.map(s => (
                    <option key={s._id} value={s._id}>
                    {s.puesto} - ${parseFloat(s.sueldo).toFixed(2)}
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
                Agregar Empleado
              </button>
            </form>
          </div>
        </div>
        
        {/* Lista de empleados */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Empleados Registrados</h2>
            <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
              {empleados.length} total
            </span>
          </div>
          
          <div className="card-body">
            {empleados.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Puesto</th>
                      <th className="text-right">Sueldo</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map(empleado => (
                      <tr key={empleado._id}>
                        <td>{empleado._id.toString().substring(0, 8)}...</td>
                        <td className="font-medium">{empleado.nombre}</td>
                        <td>
                          {empleado.puesto ? (
                            <span className="bg-[#334155] text-white px-2 py-1 rounded text-xs">
                              {empleado.puesto.puesto}
                            </span>
                          ) : (
                            <span className="text-[#94a3b8] text-xs">No asignado</span>
                          )}
                        </td>
                        <td className="text-right">
                          {empleado.puesto ? (
                            <span className="text-[#38bdf8] font-medium">${parseFloat(empleado.puesto.sueldo).toFixed(2)}</span>
                          ) : (
                            <span className="text-[#94a3b8]">N/A</span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditMode(empleado)}
                              className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] rounded"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEmpleado(empleado._id)}
                              className="p-1 text-[#f87171] hover:text-[#ef4444] rounded"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl mb-4">👨‍🍳</div>
                <p className="text-[#94a3b8] text-center">No hay empleados registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega un empleado utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de edición */}
      {editForm._id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Editar Empleado</h2>
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
                <label className="form-label">Nombre del Empleado *</label>
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={editForm.telefono}
                  onChange={handleEditChange}
                  className="form-input"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="form-input"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Puesto y Sueldo</label>
                <select
                  name="id_Sueldo"
                  value={editForm.id_Sueldo}
                  onChange={handleEditChange}
                  className="form-select"
                >
                  <option value="">Seleccione un puesto</option>
                  {sueldos.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.puesto} - ${parseFloat(s.sueldo).toFixed(2)}
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