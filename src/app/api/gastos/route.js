// src/app/api/gastos/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los gastos
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT g.*, e.nombre as empleado_nombre, c.fecha as compra_fecha
        FROM Gastos g
        LEFT JOIN Empleados e ON g.id_Empleado = e.id_Empleado
        LEFT JOIN Compras c ON g.id_Compra = c.id_Compra
        ORDER BY g.id_Gasto DESC
      `);
      return rows;
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
    const { concepto, total, id_Compra, id_Empleado } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado CrearGasto
      const [rows] = await connection.execute(
        'CALL CrearGasto(?, ?, ?, ?)',
        [concepto, total, id_Compra, id_Empleado]
      );
      
      return { Mensaje: "Gasto registrado correctamente" };
    });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar un gasto
export async function PUT(request) {
  try {
    const { id_Gasto, concepto, total, id_Compra, id_Empleado } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado ActualizarGasto
      const [rows] = await connection.execute(
        'CALL ActualizarGasto(?, ?, ?, ?, ?)',
        [id_Gasto, concepto, total, id_Compra, id_Empleado]
      );
      
      return { Mensaje: "Gasto actualizado correctamente" };
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

// Eliminar un gasto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de gasto no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado EliminarGasto
      const [rows] = await connection.execute('CALL EliminarGasto(?)', [id]);
      return { Mensaje: "Gasto eliminado correctamente" };
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