'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SueldosPage() {
  const { fetchWithAuth } = useAuth();
  const [sueldos, setSueldos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario
  const [sueldoForm, setSueldoForm] = useState({
    puesto: '',
    sueldo: 0,
  });
  
  // Estado para edición
  const [editForm, setEditForm] = useState({
    _id: null, // Cambiado de id_Sueldo a _id para MongoDB
    puesto: '',
    sueldo: 0
  });
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchSueldos = async () => {
      try {
        const res = await fetchWithAuth('/api/sueldos');
        if (!res.ok) throw new Error('Error al cargar sueldos');
        const data = await res.json();
        setSueldos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchSueldos();
  }, [fetchWithAuth]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSueldoForm({
      ...sueldoForm,
      [name]: name === 'sueldo' ? parseFloat(value) : value
    });
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'sueldo' ? parseFloat(value) : value
    });
  };
  
  // Iniciar modo edición
  const handleEditMode = (sueldo) => {
    setEditForm({
      _id: sueldo._id, // Cambiado de id_Sueldo a _id
      puesto: sueldo.puesto,
      sueldo: sueldo.sueldo
    });
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditForm({
      _id: null, // Cambiado de id_Sueldo a _id
      puesto: '',
      sueldo: 0
    });
  };
  
  // Guardar sueldo editado
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editForm.puesto || editForm.sueldo < 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      const response = await fetchWithAuth('/api/sueldos', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar sueldo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de sueldos
      const res = await fetchWithAuth('/api/sueldos');
      const sueldosData = await res.json();
      setSueldos(sueldosData);
      
      // Resetear formulario de edición
      handleCancelEdit();
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Enviar formulario para nuevo sueldo
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sueldoForm.puesto || sueldoForm.sueldo < 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      const response = await fetchWithAuth('/api/sueldos', {
        method: 'POST',
        body: JSON.stringify(sueldoForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar sueldo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de sueldos
      const res = await fetchWithAuth('/api/sueldos');
      const sueldosData = await res.json();
      setSueldos(sueldosData);
      
      // Limpiar formulario
      setSueldoForm({
        puesto: '',
        sueldo: 0,
      });
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Eliminar sueldo
  const handleDeleteSueldo = async (id) => {
    if (!confirm('¿Está seguro de eliminar este puesto y sueldo? Esto puede afectar a los empleados asociados.')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/sueldos?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar sueldo');
      }
      
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      if (data.Mensaje) {
        alert(data.Mensaje);
      }
      
      // Actualizar lista de sueldos
      const res = await fetchWithAuth('/api/sueldos');
      const sueldosData = await res.json();
      setSueldos(sueldosData);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Formatear sueldo para mostrar (categoriza por rango)
  const getSueldoDisplay = (sueldo) => {
    if (sueldo >= 5000) return { label: 'Alto', color: 'bg-green-600' };
    if (sueldo >= 3500) return { label: 'Medio', color: 'bg-blue-600' };
    return { label: 'Base', color: 'bg-amber-600' };
  };
  
  // ... El resto del código de UI se mantiene similar
  
  return (
    <div className="p-4 md:p-6">
      {/* ... UI Code ... */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo sueldo */}
        <div className="card">
          {/* ... Card Header ... */}
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* ... Form Fields ... */}
            </form>
          </div>
        </div>
        
        {/* Lista de sueldos */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Puestos Registrados</h2>
            <span className="bg-[#38bdf8] text-white text-xs font-bold py-1 px-2 rounded-full">
              {sueldos.length} total
            </span>
          </div>
          
          <div className="card-body">
            {sueldos.length > 0 ? (
              <div className="space-y-4">
                {sueldos.map(sueldo => {
                  const sueldoInfo = getSueldoDisplay(sueldo.sueldo);
                  return (
                    <div 
                      key={sueldo._id} // Cambiado de id_Sueldo a _id
                      className="p-4 rounded-lg bg-[#1e293b] border border-[#334155] shine flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-2xl mr-2">💸</span>
                          <h3 className="text-white font-medium">{sueldo.puesto}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold py-1 px-2 rounded ${sueldoInfo.color}`}>
                            {sueldoInfo.label}
                          </span>
                          <span className="text-[#38bdf8] font-bold">
                            ${parseFloat(sueldo.sueldo).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditMode(sueldo)}
                          className="p-2 bg-[#334155] text-[#38bdf8] rounded-lg hover:bg-[#475569] transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSueldo(sueldo._id)} // Cambiado de id_Sueldo a _id
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
                <div className="text-5xl mb-4">💸</div>
                <p className="text-[#94a3b8] text-center">No hay puestos registrados</p>
                <p className="text-[#94a3b8] text-center text-sm mt-1">Agrega un puesto utilizando el formulario</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de edición */}
      {editForm._id && ( // Cambiado de id_Sueldo a _id
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* ... Modal Content ... */}
        </div>
      )}
    </div>
  );
}