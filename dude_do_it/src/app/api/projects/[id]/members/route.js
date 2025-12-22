import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer tous les membres d'un projet
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
      .populate('owner', 'firstName lastName email phone')
      .populate('administrators', 'firstName lastName email phone')
      .populate('team', 'firstName lastName email phone');
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier l'accès
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
    
    // Créer une liste de tous les membres avec leurs rôles
    const members = [];
    
    // Propriétaire
    members.push({
      ...project.owner.toObject(),
      role: 'owner'
    });
    
    // Administrateurs
    project.administrators.forEach(admin => {
      if (admin._id.toString() !== project.owner._id.toString()) {
        members.push({
          ...admin.toObject(),
          role: 'administrator'
        });
      }
    });
    
    // Équipe
    project.team.forEach(member => {
      if (
        member._id.toString() !== project.owner._id.toString() &&
        !project.administrators.some(admin => admin._id.toString() === member._id.toString())
      ) {
        members.push({
          ...member.toObject(),
          role: 'team'
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      count: members.length,
      members
    });
    
  } catch (error) {
    console.error('Erreur récupération membres:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}