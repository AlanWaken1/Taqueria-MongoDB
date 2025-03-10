// src/app/api/sueldos/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los sueldos
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT * FROM Sueldo
        ORDER BY puesto
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

// Insertar un sueldo
export async function POST(request) {
  try {
    const { puesto, sueldo } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado InsertarSueldo
      const [rows] = await connection.execute(
        'CALL InsertarSueldo(?, ?)',
        [puesto, sueldo]
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

// Actualizar un sueldo
export async function PUT(request) {
  try {
    const { id_Sueldo, puesto, sueldo } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado ActualizarSueldo
      const [rows] = await connection.execute(
        'CALL ActualizarSueldo(?, ?, ?)',
        [id_Sueldo, puesto, sueldo]
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

// Eliminar un sueldo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de sueldo no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado EliminarSueldo
      const [rows] = await connection.execute('CALL EliminarSueldo(?)', [id]);
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