import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Récupérer tous les projets de l'utilisateur
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
    
    // Trouver les projets où l'utilisateur est owner, admin ou membre de l'équipe
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { administrators: userId },
        { team: userId }
      ]
    })
    .populate('owner', 'firstName lastName email')
    .populate('administrators', 'firstName lastName email')
    .populate('team', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: projects.length,
      projects
    });
    
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer un nouveau projet
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
    
    const { name, description, status } = await request.json();
    
    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Nom et description obligatoires' },
        { status: 400 }
      );
    }
    
    // Créer le projet
    const project = await Project.create({
      name,
      description,
      status: status || 'Actif',
      owner: userId,
      administrators: [], // Le propriétaire est admin par défaut
      team: []
    });
    
    // Populer les données
    await project.populate('owner', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      message: 'Projet créé',
      project
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur création projet:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}