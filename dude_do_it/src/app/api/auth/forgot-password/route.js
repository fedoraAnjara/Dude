import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      );
    }
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Pour des raisons de sécurité, on renvoie toujours le même message
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }
    
    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hacher le token avant de le sauvegarder
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Sauvegarder le token et sa date d'expiration (1 heure)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();
    
    // Envoyer l'email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error);
      // On ne révèle pas l'erreur à l'utilisateur pour des raisons de sécurité
    }
    
    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
    
  } catch (error) {
    console.error('Erreur forgot password:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}