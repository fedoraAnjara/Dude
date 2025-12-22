import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Le titre est obligatoire'],
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
      values: ['À faire', 'En cours', 'En validation', 'Terminé'],
      message: 'Le statut doit être: À faire, En cours, En validation ou Terminé'
    },
    default: 'À faire' 
  },
  estimatedDate: { 
    type: Date, 
    required: [true, "La date d'estimation est obligatoire"]
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, 'Le projet est obligatoire']
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Le créateur est obligatoire']
  },
  assignedTo: [{ 
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

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);