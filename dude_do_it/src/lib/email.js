import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // ⚠️ 465 = true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: `"Dude Do It" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Dude Do It',
      html: `<p>Cliquez ici : <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    console.log('Email envoyé:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Erreur email:', error);
    return { success: false, error };
  }
}
