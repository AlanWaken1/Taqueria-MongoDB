// src/app/api/gastos/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Gasto from '@/models/Gasto';
import Empleado from '@/models/Empleado';
import Compra from '@/models/Compra';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todos los gastos
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede ver gastos (información financiera sensible)
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para ver los gastos' }, { status: 403 });
    }

    const result = await executeTransaction(async () => {
      const gastos = await Gasto.find({})
        .sort({ createdAt: -1 })
        .lean();
      
      return gastos;
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

// Crear un gasto
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin y encargado pueden registrar gastos
    if (!checkRole(authResult.user, ['admin', 'encargado'])) {
      return NextResponse.json({ error: 'No tienes permisos para registrar gastos' }, { status: 403 });
    }

    const { concepto, total, compra_id, empleado_id, tipo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Validar el concepto
      if (!concepto || concepto.trim() === '') {
        throw new Error('El concepto es requerido');
      }
      
      // Validar que el total no sea negativo
      if (total < 0) {
        throw new Error('El total no puede ser negativo');
      }
      
      // Preparar el objeto gasto
      const gastoData = {
        concepto,
        total: parseFloat(total) || 0, // Convertir explícitamente a número
        fecha: new Date(),
        tipo: tipo || 'otro',
        // Información de auditoría
        creadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        },
        fechaCreacion: new Date()
      };
      
      // Si hay una compra asociada, obtener sus datos
      if (compra_id) {
        const compra = await Compra.findById(compra_id);
        if (!compra) {
          throw new Error('La compra especificada no existe');
        }
        gastoData.compra_id = compra._id;
      }
      
      // Si hay un empleado asociado, obtener sus datos
      if (empleado_id) {
        const empleado = await Empleado.findById(empleado_id);
        if (!empleado) {
          throw new Error('El empleado especificado no existe');
        }
        gastoData.empleado = {
          _id: empleado._id,
          nombre: empleado.nombre
        };
      }
      
      // Crear el gasto
      const gasto = await Gasto.create(gastoData);
      
      return { 
        Mensaje: "Gasto registrado correctamente",
        gasto
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

// Actualizar un gasto
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede modificar gastos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para modificar gastos' }, { status: 403 });
    }

    const { _id, concepto, total, compra_id, empleado_id, tipo } = await request.json();
    
    const result = await executeTransaction(async () => {
      // Verificar que el gasto exista
      const gasto = await Gasto.findById(_id);
      if (!gasto) {
        throw new Error('El gasto no existe');
      }
      
      // Validar el concepto
      if (!concepto || concepto.trim() === '') {
        throw new Error('El concepto es requerido');
      }
      
      // Validar que el total no sea negativo
      if (total < 0) {
        throw new Error('El total no puede ser negativo');
      }
      
      // Preparar el objeto de actualización
      const updateData = {
        concepto,
        total: parseFloat(total) || 0, // Convertir explícitamente a número
        tipo: tipo || gasto.tipo,
        // Información de auditoría
        actualizadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        },
        fechaActualizacion: new Date()
      };
      
      // Actualizar la compra asociada si es necesario
      if (compra_id !== undefined) {
        if (compra_id) {
          const compra = await Compra.findById(compra_id);
          if (!compra) {
            throw new Error('La compra especificada no existe');
          }
          updateData.compra_id = compra._id;
        } else {
          updateData.compra_id = null;
        }
      }
      
      // Actualizar el empleado asociado si es necesario
      if (empleado_id !== undefined) {
        if (empleado_id) {
          const empleado = await Empleado.findById(empleado_id);
          if (!empleado) {
            throw new Error('El empleado especificado no existe');
          }
          updateData.empleado = {
            _id: empleado._id,
            nombre: empleado.nombre
          };
        } else {
          updateData.empleado = null;
        }
      }
      
      // Actualizar el gasto
      const gastoActualizado = await Gasto.findByIdAndUpdate(
        _id, 
        updateData,
        { new: true, runValidators: true }
      );
      
      return { 
        Mensaje: "Gasto actualizado correctamente",
        gasto: gastoActualizado
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

// Eliminar un gasto
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Verificar roles - solo admin puede eliminar gastos
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar gastos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de gasto no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async () => {
      // Guardar información del gasto para registro de auditoría
      const gasto = await Gasto.findById(id);
      if (!gasto) {
        throw new Error('El gasto no existe');
      }
      
      // Eliminar el gasto
      await Gasto.findByIdAndDelete(id);
      
      // Aquí podrías crear un registro de eliminación en una colección de auditoría
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_GASTO',
      //   entidad: 'Gasto',
      //   entidadId: id,
      //   datos: {
      //     concepto: gasto.concepto,
      //     total: gasto.total,
      //     fecha: gasto.fecha
      //   },
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // });
      
      return { Mensaje: "Gasto eliminado correctamente" };
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