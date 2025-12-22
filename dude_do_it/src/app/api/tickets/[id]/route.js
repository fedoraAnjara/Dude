import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import Comment from '@/lib/models/Comment';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer un ticket spécifique
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
    
    const ticket = await Ticket.findById(id)
      .populate('project', 'name description owner administrators team')
      .populate('creator', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
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
    
    return NextResponse.json({
      success: true,
      ticket
    });
    
  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour un ticket
export async function PUT(request, { params }) {
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
    const { title, description, status, estimatedDate, assignedTo } = await request.json();
    
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
    
    // Mettre à jour
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.status = status || ticket.status;
    ticket.estimatedDate = estimatedDate || ticket.estimatedDate;
    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo;
    }
    ticket.updatedAt = Date.now();
    
    await ticket.save();
    await ticket.populate([
      { path: 'project', select: 'name' },
      { path: 'creator', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Ticket mis à jour',
      ticket
    });
    
  } catch (error) {
    console.error('Erreur mise à jour ticket:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un ticket
export async function DELETE(request, { params }) {
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
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      );
    }
    
    // Seul le créateur peut supprimer
    if (ticket.creator.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul le créateur peut supprimer ce ticket' },
        { status: 403 }
      );
    }
    
    // Supprimer tous les commentaires associés
    await Comment.deleteMany({ ticket: id });
    
    // Supprimer le ticket
    await Ticket.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Ticket et commentaires associés supprimés'
    });
    
  } catch (error) {
    console.error('Erreur suppression ticket:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}