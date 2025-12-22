import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Ticket from '@/lib/models/Ticket';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer un projet spécifique
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
    
    const project = await Project.findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('administrators', 'firstName lastName email')
      .populate('team', 'firstName lastName email');
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur a accès au projet
    const hasAccess = 
      project.owner._id.toString() === userId ||
      project.administrators.some(admin => admin._id.toString() === userId) ||
      project.team.some(member => member._id.toString() === userId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      project
    });
    
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour un projet
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
    const { name, description, status } = await request.json();
    
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est owner ou admin
    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.administrators.some(admin => admin.toString() === userId);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire ou un admin peut modifier' },
        { status: 403 }
      );
    }
    
    // Mettre à jour
    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.updatedAt = Date.now();
    
    await project.save();
    await project.populate('owner administrators team', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour',
      project
    });
    
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un projet
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
    
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Seul le propriétaire peut supprimer
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut supprimer' },
        { status: 403 }
      );
    }
    
    // Supprimer tous les tickets associés
    await Ticket.deleteMany({ project: id });
    
    // Supprimer le projet
    await Project.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Projet et tickets associés supprimés'
    });
    
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}