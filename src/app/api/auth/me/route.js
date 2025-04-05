// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { protectRoute } from '@/lib/auth';
import Usuario from '@/models/Usuario';
import { connectToDatabase } from '@/lib/mongodb'; // Asegúrate de importar esto

export async function GET(request) {
  try {
    // Conectar a la base de datos primero
    await connectToDatabase();
    
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Buscar usuario usando mongoose correctamente
    const usuario = await Usuario.findById(authResult.user.id)
      .select('-password')
      .lean();
      
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 404 });
    }
    
    return NextResponse.json({ usuario });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}