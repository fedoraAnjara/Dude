import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Créer un utilisateur de test
    const user = await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@test.com',
      phone: '+261340123456',
      password: 'password123'
    });
    
    // Compter les utilisateurs
    const count = await User.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Modèle User fonctionne !',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      totalUsers: count
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur',
      error: error.message 
    }, { status: 500 });
  }
}

// Route pour nettoyer les données de test
export async function DELETE() {
  try {
    await connectDB();
    await User.deleteMany({ email: 'jean.dupont@test.com' });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur de test supprimé' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}