// src/app/api/empleados/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Empleado from '@/models/Empleado';
import Sueldo from '@/models/Sueldo';
import Gasto from '@/models/Gasto';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todos los empleados
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin y encargado pueden ver empleados
    if (!checkRole(authResult.user, ['admin', 'encargado'])) {
      return NextResponse.json({ error: 'No tienes permisos para ver la lista de empleados' }, { status: 403 });
    }

    const result = await executeTransaction(async () => {
      // En MongoDB, ya tenemos la información del puesto embebida en el empleado
      const empleados = await Empleado.find({})
        .sort({ nombre: 1 })
        .lean();
      
      return empleados;
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Insertar un empleado
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede crear empleados
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para crear empleados' }, { status: 403 });
    }

    const { nombre, telefono, email, id_Sueldo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar campos obligatorios
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre es obligatorio.');
      }
      
      // Validar formato de correo electrónico
      if (email && !(/\S+@\S+\.\S+/).test(email)) {
        throw new Error('El formato del correo electrónico no es válido.');
      }
      
      // Obtener información del sueldo si se especificó
      let puestoInfo = null;
      if (id_Sueldo) {
        const sueldo = await Sueldo.findById(id_Sueldo);
        if (!sueldo) {
          throw new Error('El puesto especificado no existe.');
        }
        
        puestoInfo = {
          _id: sueldo._id,
          puesto: sueldo.puesto,
          sueldo: sueldo.sueldo
        };
      }
      
      // Crear el empleado con información de auditoría
      const empleado = await Empleado.create({
        nombre,
        telefono,
        email,
        puesto: puestoInfo,
        // Agregar información del usuario que crea el empleado
        creadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        }
      });
      
      return { 
        Mensaje: 'Empleado insertado correctamente.',
        empleado 
      };
    });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar un empleado
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede modificar empleados
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para modificar empleados' }, { status: 403 });
    }

    const { _id, nombre, telefono, email, id_Sueldo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar que el empleado exista
      const empleado = await Empleado.findById(_id);
      if (!empleado) {
        throw new Error('El empleado no existe.');
      }
      
      // Validar campos obligatorios
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre es obligatorio.');
      }
      
      // Validar formato de correo electrónico
      if (email && !(/\S+@\S+\.\S+/).test(email)) {
        throw new Error('El formato del correo electrónico no es válido.');
      }
      
      // Obtener información del sueldo si se actualizó
      let puestoInfo = empleado.puesto;
      if (id_Sueldo && (!empleado.puesto || empleado.puesto._id.toString() !== id_Sueldo)) {
        const sueldo = await Sueldo.findById(id_Sueldo);
        if (!sueldo) {
          throw new Error('El puesto especificado no existe.');
        }
        
        puestoInfo = {
          _id: sueldo._id,
          puesto: sueldo.puesto,
          sueldo: sueldo.sueldo
        };
      }
      
      // Actualizar el empleado con información de auditoría
      const empleadoActualizado = await Empleado.findByIdAndUpdate(
        _id,
        {
          nombre,
          telefono,
          email,
          puesto: puestoInfo,
          // Registrar quién realizó la actualización
          actualizadoPor: {
            id: authResult.user.id,
            email: authResult.user.email,
            rol: authResult.user.rol
          },
          fechaActualizacion: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return { 
        Mensaje: 'Empleado actualizado correctamente.',
        empleado: empleadoActualizado
      };
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar un empleado
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede eliminar empleados
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar empleados' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de empleado no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Verificar si hay gastos asociados al empleado
      const gastosAsociados = await Gasto.countDocuments({
        'empleado._id': new mongoose.Types.ObjectId(id)
      });
      
      if (gastosAsociados > 0) {
        throw new Error('No se puede eliminar el empleado porque tiene gastos asociados.');
      }
      
      // Guardar información del empleado para el registro de auditoría
      const empleado = await Empleado.findById(id);
      if (!empleado) {
        throw new Error('El empleado no existe.');
      }
      
      // Eliminar el empleado
      await Empleado.findByIdAndDelete(id);
      
      // Aquí podrías crear un registro de auditoría en una colección separada si lo deseas
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_EMPLEADO',
      //   entidad: 'Empleado',
      //   entidadId: id,
      //   entidadNombre: empleado.nombre,
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // });
      
      return { Mensaje: 'Empleado eliminado correctamente.' };
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ Mensaje: `Error: ${result.error}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}