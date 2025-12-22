import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: [true, 'Le contenu du commentaire est obligatoire'],
    trim: true 
  },
  ticket: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: [true, 'Le ticket est obligatoire']
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "L'auteur est obligatoire"]
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
  timestamps: true
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);