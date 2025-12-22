import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Le nom du projet est obligatoire'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'La description est obligatoire'],
    trim: true 
  },
  status: { 
    type: String, 
    enum: {
      values: ['Actif', 'Inactif', 'Archiver'],
      message: 'Le statut doit être: Actif, Inactif ou Archiver'
    },
    default: 'Actif' 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Le propriétaire est obligatoire']
  },
  administrators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  team: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);