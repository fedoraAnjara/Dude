import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Générer un token JWT
export function generateToken(userId) {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// Vérifier un token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hacher un mot de passe
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Comparer un mot de passe
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Extraire le user ID depuis le token dans les headers
export function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  return decoded ? decoded.userId : null;
}