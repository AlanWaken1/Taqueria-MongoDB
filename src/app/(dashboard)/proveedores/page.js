'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario
  const [proveedorForm, setProveedorForm] = useState({
    nombre: '',
    telefono: '',
    email: ''
  });
  
  // Estado para modo edición - adaptado para MongoDB
  const [editMode, setEditMode] = useState({
    active: false,
    _id: null // Cambiado de id_Proveedor a _id
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/proveedores');
        if (!response.ok) throw new Error('Error al cargar proveedores');
        const data = await response.json();
        setProveedores(data);
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
    setProveedorForm({
      ...proveedorForm,
      [name]: value
    });
  };
  
  // Iniciar modo edición - adaptado para MongoDB
  const handleEditMode = (proveedor) => {
    setProveedorForm({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || '',
      email: proveedor.email || ''
    });
    
    setEditMode({
      active: true,
      _id: proveedor._id // Cambiado de id_Proveedor a _id
    });
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode({
      active: false,
      _id: null
    });
    
    setProveedorForm({
      nombre: '',
      telefono: '',
      email: ''
    });
  };
  
  // Enviar formulario (agregar o actualizar) - adaptado para MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proveedorForm.nombre) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }
    
    try {
      let url = '/api/proveedores';
      let method = 'POST';
      let body = proveedorForm;
      
      // Si estamos en modo edición
      if (editMode.active) {
        method = 'PUT';
        body = {
          ...proveedorForm,
          _id: editMode._id // Cambiado de id_Proveedor a _id
        };
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar proveedor');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de proveedores
      const proveedoresRes = await fetch('/api/proveedores');
      const proveedoresData = await proveedoresRes.json();
      setProveedores(proveedoresData);
      
      // Limpiar formulario y salir del modo edición
      setProveedorForm({
        nombre: '',
        telefono: '',
        email: ''
      });
      
      setEditMode({
        active: false,
        _id: null
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar proveedor - adaptado para MongoDB
  const handleDeleteProveedor = async (id) => {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/proveedores?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar proveedor');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de proveedores
      const proveedoresRes = await fetch('/api/proveedores');
      const proveedoresData = await proveedoresRes.json();
      setProveedores(proveedoresData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] rounded-full mb-3"></div>
          <div className="text-white">Cargando proveedores...</div>
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
        <h1 className="text-2xl font-bold text-white">Gestión de Proveedores</h1>
        <Link href="/" className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
          Volver al inicio
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de proveedor */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">
              {editMode.active ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#38bdf8]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar Proveedor
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#38bdf8]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Agregar Nuevo Proveedor
                </span>
              )}
            </h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Nombre del Proveedor *</label>
                <input
                  type="text"
                  name="nombre"
                  value={proveedorForm.nombre}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej. Distribuidora de Alimentos S.A."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Teléfono</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    name="telefono"
                    value={proveedorForm.telefono}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Ej. 555-123-4567"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={proveedorForm.email}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="proveedor@ejemplo.com"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                {editMode.active && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 p-3 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancelar
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 p-3 bg-[#38bdf8] text-white rounded-lg hover:bg-[#0ea5e9] transition-colors flex items-center justify-center"
                >
                  {editMode.active ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Actualizar Proveedor
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Agregar Proveedor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Lista de proveedores */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Proveedores Registrados</h2>
            <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
              {proveedores.length} total
            </span>
          </div>
          
          <div className="card-body">
            {proveedores.length > 0 ? (
              <div className="space-y-4">
                {proveedores.map(prov => (
                  <div 
                    key={prov._id} 
                    className="p-4 rounded-lg bg-[#1e293b] border border-[#334155] shine flex flex-col md:flex-row justify-between"
                  >
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-[#334155] rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">🚚</span>
                        </div>
                        <h3 className="text-white font-medium">{prov.nombre}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {prov.telefono && (
                          <div className="flex items-center text-[#94a3b8]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#38bdf8]" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {prov.telefono}
                          </div>
                        )}
                        {prov.email && (
                          <div className="flex items-center text-[#94a3b8]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#38bdf8]" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {prov.email}
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="bg-[#334155] text-[#38bdf8] text-xs px-2 py-1 rounded-full">
                            {prov.num_productos || 0} productos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEditMode(prov)}
                        className="p-2 bg-[#334155] text-[#38bdf8] rounded-lg hover:bg-[#475569] transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProveedor(prov._id)}
                        className={`p-2 ${prov.num_productos > 0 ? 'bg-[#334155] text-[#64748b] cursor-not-allowed' : 'bg-[#334155] text-[#f87171] hover:bg-[#475569]'} rounded-lg transition-colors`}
                        disabled={prov.num_productos > 0}
                        title={prov.num_productos > 0 ? 'Este proveedor tiene productos asignados' : 'Eliminar'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl mb-4">🚚</div>
                <p className="text-[#94a3b8] text-center">No hay proveedores registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega un proveedor utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}