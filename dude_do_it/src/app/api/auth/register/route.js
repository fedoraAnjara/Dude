import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { firstName, lastName, email, phone, password } = await request.json();
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword
    });
    
    // Générer le token
    const token = generateToken(user._id);
    
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}