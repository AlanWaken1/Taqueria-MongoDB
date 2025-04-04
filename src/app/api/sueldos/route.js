// src/app/api/sueldos/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Sueldo from '@/models/Sueldo';
import Empleado from '@/models/Empleado';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todos los sueldos
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo roles administrativos pueden ver información de sueldos
    if (!checkRole(authResult.user, ['admin', 'encargado', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para ver información de sueldos' }, { status: 403 });
    }

    const result = await executeTransaction(async () => {
      const sueldos = await Sueldo.find({})
        .sort({ puesto: 1 })
        .lean();
      
      return sueldos;
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

// Insertar un sueldo
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin puede crear nuevos sueldos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para crear nuevos sueldos' }, { status: 403 });
    }

    const { puesto, sueldo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar campos obligatorios
      if (!puesto || puesto.trim() === '') {
        throw new Error('El puesto es obligatorio.');
      }
      
      // Validar que el sueldo sea positivo
      if (sueldo < 0) {
        throw new Error('El sueldo no puede ser negativo.');
      }
      
      // Verificar si ya existe un puesto con el mismo nombre
      const puestoExistente = await Sueldo.findOne({ puesto });
      if (puestoExistente) {
        throw new Error('Ya existe un puesto con ese nombre.');
      }
      
      // Crear el sueldo con información de auditoría
      const nuevoSueldo = await Sueldo.create({
        puesto,
        sueldo,
        // Campos de auditoría
        creadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        },
        fechaCreacion: new Date()
      });
      
      return { 
        Mensaje: 'Sueldo insertado correctamente.',
        sueldo: nuevoSueldo
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

// Actualizar un sueldo
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin puede actualizar sueldos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para actualizar sueldos' }, { status: 403 });
    }

    const { _id, puesto, sueldo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar que el sueldo exista
      const sueldoExistente = await Sueldo.findById(_id);
      if (!sueldoExistente) {
        throw new Error('El sueldo no existe.');
      }
      
      // Validar campos obligatorios
      if (!puesto || puesto.trim() === '') {
        throw new Error('El puesto es obligatorio.');
      }
      
      // Validar que el sueldo sea positivo
      if (sueldo < 0) {
        throw new Error('El sueldo no puede ser negativo.');
      }
      
      // Verificar si ya existe otro puesto con el mismo nombre
      const puestoExistente = await Sueldo.findOne({
        puesto,
        _id: { $ne: _id }
      });
      
      if (puestoExistente) {
        throw new Error('Ya existe otro puesto con ese nombre.');
      }
      
      // Iniciar sesión de transacción para actualizar empleados
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Actualizar el sueldo con información de auditoría
        const sueldoActualizado = await Sueldo.findByIdAndUpdate(
          _id,
          { 
            puesto, 
            sueldo,
            // Campos de auditoría para actualización
            actualizadoPor: {
              id: authResult.user.id,
              email: authResult.user.email,
              rol: authResult.user.rol
            },
            fechaActualizacion: new Date()
          },
          { new: true, session }
        );
        
        // Actualizar todos los empleados que tienen este puesto
        await Empleado.updateMany(
          { 'puesto._id': _id },
          { 
            'puesto.puesto': puesto,
            'puesto.sueldo': sueldo
          },
          { session }
        );
        
        // Registrar la actualización en un historial de cambios de sueldo
        // Esto podría ser útil para fines de auditoría y transparencia
        // await HistorialSueldo.create({
        //   puesto_id: _id,
        //   puestoNombre: puesto,
        //   sueldoAnterior: sueldoExistente.sueldo,
        //   sueldoNuevo: sueldo,
        //   cambioRealizado: new Date(),
        //   realizadoPor: {
        //     id: authResult.user.id,
        //     email: authResult.user.email,
        //     rol: authResult.user.rol
        //   }
        // }, { session });
        
        await session.commitTransaction();
        session.endSession();
        
        return { 
          Mensaje: 'Sueldo actualizado correctamente.',
          sueldo: sueldoActualizado
        };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
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

// Eliminar un sueldo
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin puede eliminar sueldos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar sueldos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de sueldo no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Verificar si hay empleados asociados a este sueldo
      const empleadosAsociados = await Empleado.countDocuments({
        'puesto._id': new mongoose.Types.ObjectId(id)
      });
      
      if (empleadosAsociados > 0) {
        throw new Error('No se puede eliminar el sueldo porque hay empleados asociados a este puesto.');
      }
      
      // Obtener información del sueldo antes de eliminarlo para auditoría
      const sueldo = await Sueldo.findById(id);
      if (!sueldo) {
        throw new Error('El sueldo no existe.');
      }
      
      // Guardar información para registro de auditoría
      const sueldoInfo = {
        id: sueldo._id,
        puesto: sueldo.puesto,
        sueldo: sueldo.sueldo
      };
      
      // Eliminar el sueldo
      await Sueldo.findByIdAndDelete(id);
      
      // Aquí podrías agregar un registro de auditoría
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_SUELDO',
      //   entidad: 'Sueldo',
      //   entidadId: id,
      //   datos: sueldoInfo,
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // });
      
      return { Mensaje: 'Sueldo eliminado correctamente.' };
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