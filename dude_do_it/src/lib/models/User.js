import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'Le prénom est obligatoire'],
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, 'Le nom est obligatoire'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: { 
    type: String, 
    required: [true, 'Le téléphone est obligatoire'],
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Éviter la recréation du modèle en hot-reload
export default mongoose.models.User || mongoose.model('User', UserSchema);