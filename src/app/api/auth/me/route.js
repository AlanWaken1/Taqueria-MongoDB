// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { protectRoute } from '@/lib/auth';
import Usuario from '@/models/Usuario';

export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = await protectRoute(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    // Buscar usuario
    const usuario = await Usuario.findById(authResult.user.id).select('-password');
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'Usuario no encontrado o inactivo' }, { status: 404 });
    }
    
    return NextResponse.json({ usuario });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}