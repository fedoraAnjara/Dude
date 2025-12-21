import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; // Import named

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      success: true, 
      message: 'Connexion à MongoDB réussie !' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur de connexion',
      error: error.message 
    }, { status: 500 });
  }
}