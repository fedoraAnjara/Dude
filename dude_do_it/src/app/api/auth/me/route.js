import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer le profil de l'utilisateur connecté
export async function GET(request) {
  try {
    await connectDB();
    
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour le profil
export async function PUT(request) {
  try {
    await connectDB();
    
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const { firstName, lastName, phone } = await request.json();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour',
      user
    });
    
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}