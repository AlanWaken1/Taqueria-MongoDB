// src/app/api/ventas/route.js
import { executeTransaction } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Venta from '@/models/Venta';
import Platillo from '@/models/Platillo';
import mongoose from 'mongoose';
import { protectRoute, checkRole } from '@/lib/auth';

// Obtener todas las ventas o el total por rango de fechas
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin, encargado y tesorero pueden ver el historial de ventas
    if (!checkRole(authResult.user, ['admin', 'encargado', 'tesorero'])) {
      return NextResponse.json({ error: 'No tienes permisos para ver el historial de ventas' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');

    const result = await executeTransaction(async () => {
      if (fecha_inicio && fecha_fin) {
        // Si hay fechas, obtener el total de ventas en ese rango
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        fechaFin.setHours(23, 59, 59, 999); // Para incluir todo el día final
        
        const ventasEnRango = await Venta.find({
          fecha: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        });
        
        const total = ventasEnRango.reduce((sum, venta) => sum + venta.total, 0);
        
        return { total };
      } else {
        // Obtener todas las ventas ordenadas por fecha y hora
        const ventas = await Venta.find({})
          .sort({ fecha: -1, hora: -1 })
          .lean();
        
        return ventas;
      }
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error en GET ventas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Registrar una venta
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Varios roles pueden registrar ventas (meseros, encargados, admin)
    if (!checkRole(authResult.user, ['admin', 'encargado', 'mesero'])) {
      return NextResponse.json({ error: 'No tienes permisos para registrar ventas' }, { status: 403 });
    }

    const body = await request.json();
    console.log("Datos recibidos:", JSON.stringify(body));
    
    const { fecha, hora, metodo, detalles } = body;
    
    const result = await executeTransaction(async (session) => {
      // Validar que haya detalles
      if (!detalles || detalles.length === 0) {
        throw new Error('Una venta debe tener al menos un platillo');
      }
      
      // Preparar detalles de la venta
      const detallesVenta = [];
      let totalVenta = 0;
      
      for (const detalle of detalles) {
        // Obtener información del platillo
        const platillo = await Platillo.findById(detalle.platillo_id).session(session);
        if (!platillo) {
          throw new Error(`El platillo con ID ${detalle.platillo_id} no existe`);
        }
        
        // Validar cantidad
        if (detalle.cantidad <= 0) {
          throw new Error('La cantidad debe ser mayor a 0');
        }
        
        // Calcular subtotal
        const precio = detalle.precio || platillo.precio;
        const subtotal = detalle.cantidad * precio;
        totalVenta += subtotal;
        
        detallesVenta.push({
          platillo_id: platillo._id,
          nombre: platillo.nombre,
          cantidad: detalle.cantidad,
          precio: precio,
          subtotal: subtotal
        });
      }
      
      // Crear la venta con información de auditoría
      const fechaVenta = fecha ? new Date(fecha) : new Date();
      const horaVenta = hora || new Date().toTimeString().split(' ')[0].substring(0, 5);
      
      const venta = new Venta({
        fecha: fechaVenta,
        hora: horaVenta,
        total: totalVenta,
        metodo: metodo || 'efectivo',
        detalles: detallesVenta,
        // Campos de auditoría
        creadoPor: {
          id: authResult.user.id,
          email: authResult.user.email,
          rol: authResult.user.rol
        },
        fechaCreacion: new Date()
      });
      
      const ventaGuardada = await venta.save({ session });
      
      // Aquí podrías agregar más lógica como actualizar inventario,
      // registrar puntos de fidelidad para el cliente, etc.
      
      return { 
        Mensaje: "Venta registrada correctamente", 
        id_Venta: ventaGuardada._id 
      };
    });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error en POST ventas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar una venta
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Solo admin puede eliminar ventas
    if (!checkRole(authResult.user, ['admin'])) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar ventas' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de venta no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (session) => {
      // Verificar que la venta exista
      const venta = await Venta.findById(id).session(session);
      if (!venta) {
        throw new Error('La venta no existe');
      }
      
      // Obtener información de la venta para auditoría
      const ventaInfo = {
        id: venta._id,
        fecha: venta.fecha,
        hora: venta.hora,
        total: venta.total,
        metodo: venta.metodo,
        detalles: venta.detalles.map(d => ({
          platillo: d.nombre,
          cantidad: d.cantidad,
          precio: d.precio
        }))
      };
      
      // Eliminar la venta
      await Venta.findByIdAndDelete(id).session(session);
      
      // Aquí podrías agregar un registro de auditoría
      // await AuditoriaLog.create({
      //   accion: 'ELIMINAR_VENTA',
      //   entidad: 'Venta',
      //   entidadId: id,
      //   datos: ventaInfo,
      //   usuarioId: authResult.user.id,
      //   usuarioEmail: authResult.user.email,
      //   usuarioRol: authResult.user.rol,
      //   fecha: new Date()
      // }, { session });
      
      return { Mensaje: "La venta fue eliminada" };
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
  } catch (error) {
    console.error("Error en DELETE ventas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}