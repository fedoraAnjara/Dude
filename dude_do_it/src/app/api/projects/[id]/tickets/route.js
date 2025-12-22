import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer tous les tickets d'un projet spécifique
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
    
    // Vérifier l'accès au projet
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
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
    
    // Récupérer les tickets
    const tickets = await Ticket.find({ project: id })
      .populate('creator', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets
    });
    
  } catch (error) {
    console.error('Erreur récupération tickets du projet:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}