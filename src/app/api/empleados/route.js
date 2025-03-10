// src/app/api/empleados/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los empleados
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT e.*, s.puesto, s.sueldo
        FROM Empleados e
        LEFT JOIN Sueldo s ON e.id_Sueldo = s.id_Sueldo
        ORDER BY e.nombre
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

// Insertar un empleado
export async function POST(request) {
  try {
    const { nombre, telefono, email, id_Sueldo } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado InsertarEmpleado
      const [rows] = await connection.execute(
        'CALL InsertarEmpleado(?, ?, ?, ?)',
        [nombre, telefono, email, id_Sueldo]
      );
      
      return rows[0];
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

// Actualizar un empleado
export async function PUT(request) {
  try {
    const { id_Empleado, nombre, telefono, email, id_Sueldo } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado ActualizarEmpleado
      const [rows] = await connection.execute(
        'CALL ActualizarEmpleado(?, ?, ?, ?, ?)',
        [id_Empleado, nombre, telefono, email, id_Sueldo]
      );
      
      return rows[0];
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

// Eliminar un empleado
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de empleado no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado EliminarEmpleado
      const [rows] = await connection.execute('CALL EliminarEmpleado(?)', [id]);
      return rows[0];
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