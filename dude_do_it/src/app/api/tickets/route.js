import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer tous les tickets de l'utilisateur
export async function GET(request) {
  try {
    await connectDB();
    
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    const status = searchParams.get('status');
    
    // Construire la requête
    let query = {};
    
    // Si projectId spécifié
    if (projectId) {
      query.project = projectId;
    } else {
      // Sinon, récupérer tous les projets accessibles par l'utilisateur
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { administrators: userId },
          { team: userId }
        ]
      }).select('_id');
      
      const projectIds = projects.map(p => p._id);
      query.project = { $in: projectIds };
    }
    
    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }
    
    const tickets = await Ticket.find(query)
      .populate('project', 'name')
      .populate('creator', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets
    });
    
  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer un nouveau ticket
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
    
    const { title, description, status, estimatedDate, project, assignedTo } = await request.json();
    
    // Validation
    if (!title || !description || !estimatedDate || !project) {
      return NextResponse.json(
        { success: false, message: 'Titre, description, date d\'estimation et projet obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le projet existe et que l'utilisateur y a accès
    const projectDoc = await Project.findById(project);
    
    if (!projectDoc) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    const hasAccess = 
      projectDoc.owner.toString() === userId ||
      projectDoc.administrators.some(admin => admin.toString() === userId) ||
      projectDoc.team.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'avez pas accès à ce projet' },
        { status: 403 }
      );
    }
    
    // Créer le ticket
    const ticket = await Ticket.create({
      title,
      description,
      status: status || 'À faire',
      estimatedDate,
      project,
      creator: userId,
      assignedTo: assignedTo || []
    });
    
    // Populer les données
    await ticket.populate([
      { path: 'project', select: 'name' },
      { path: 'creator', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Ticket créé',
      ticket
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur création ticket:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}