// src/app/api/platillos/route.js
import { executeTransaction } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener todos los platillos
export async function GET() {
  try {
    const result = await executeTransaction(async (connection) => {
      const [rows] = await connection.execute(`
        SELECT * FROM Platillos
        ORDER BY nombre
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

// Agregar un platillo usando el procedimiento almacenado
export async function POST(request) {
  try {
    const { nombre, precio, categoria } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_addPlatillo
      const [rows] = await connection.execute(
        'CALL sp_addPlatillo(?, ?, ?)',
        [nombre, precio, categoria]
      );
      
      // Extraer solo el mensaje o crear uno por defecto para evitar problemas de serialización
      return { 
        Mensaje: rows[0]?.Mensaje || "Platillo agregado correctamente" 
      };
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

// Actualizar un platillo
export async function PUT(request) {
  try {
    const { id_Platillo, nombre, precio, categoria } = await request.json();
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_updatePlatillo
      const [rows] = await connection.execute(
        'CALL sp_updatePlatillo(?, ?, ?, ?)',
        [id_Platillo, nombre, precio, categoria]
      );
      
      // Extraer solo el mensaje o crear uno por defecto
      return { 
        Mensaje: rows[0]?.Mensaje || "Platillo actualizado correctamente" 
      };
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

// Eliminar un platillo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID de platillo no proporcionado' }, { status: 400 });
    }
    
    const result = await executeTransaction(async (connection) => {
      // Llamar al procedimiento almacenado sp_deletePlatillo
      const [rows] = await connection.execute('CALL sp_deletePlatillo(?)', [id]);
      
      // Extraer solo el mensaje o crear uno por defecto
      return { 
        Mensaje: rows[0]?.Mensaje || "Platillo eliminado correctamente" 
      };
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