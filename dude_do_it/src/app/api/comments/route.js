import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import Ticket from '@/lib/models/Ticket';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Créer un nouveau commentaire
export async function POST(request) {
  try {
    await connectDB();
    
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const { content, ticket } = await request.json();
    
    // Validation
    if (!content || !ticket) {
      return NextResponse.json(
        { success: false, message: 'Contenu et ticket obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le ticket existe et que l'utilisateur y a accès
    const ticketDoc = await Ticket.findById(ticket).populate('project');
    
    if (!ticketDoc) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier l'accès au projet
    const project = ticketDoc.project;
    const hasAccess = 
      project.owner.toString() === userId ||
      project.administrators.some(admin => admin.toString() === userId) ||
      project.team.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'avez pas accès à ce ticket' },
        { status: 403 }
      );
    }
    
    // Créer le commentaire
    const comment = await Comment.create({
      content,
      ticket,
      author: userId
    });
    
    // Populer les données
    await comment.populate([
      { path: 'ticket', select: 'title' },
      { path: 'author', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Commentaire créé',
      comment
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}