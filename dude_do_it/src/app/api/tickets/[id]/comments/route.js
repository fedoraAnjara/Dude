import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import Ticket from '@/lib/models/Ticket';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer tous les commentaires d'un ticket
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Vérifier que le ticket existe et que l'utilisateur y a accès
    const ticket = await Ticket.findById(id).populate('project');
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier l'accès au projet
    const project = ticket.project;
    const hasAccess = 
      project.owner.toString() === userId ||
      project.administrators.some(admin => admin.toString() === userId) ||
      project.team.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    // Récupérer les commentaires
    const comments = await Comment.find({ ticket: id })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: 1 }); // Du plus ancien au plus récent
    
    return NextResponse.json({
      success: true,
      count: comments.length,
      comments
    });
    
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}