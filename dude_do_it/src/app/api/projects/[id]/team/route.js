import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Ajouter un membre à l'équipe
export async function POST(request, { params }) {
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
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Email de l\'utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le projet
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Le propriétaire ou un admin peuvent ajouter des membres
    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.administrators.some(admin => admin.toString() === userId);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire ou un admin peut ajouter des membres' },
        { status: 403 }
      );
    }
    
    // Trouver l'utilisateur à ajouter
    const userToAdd = await User.findOne({ email: userEmail.toLowerCase() });
    
    if (!userToAdd) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que ce n'est pas le propriétaire
    if (userToAdd._id.toString() === project.owner.toString()) {
      return NextResponse.json(
        { success: false, message: 'Le propriétaire fait déjà partie du projet' },
        { status: 400 }
      );
    }
    
    // Vérifier s'il est déjà admin
    if (project.administrators.includes(userToAdd._id)) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur est administrateur (rôle supérieur)' },
        { status: 400 }
      );
    }
    
    // Vérifier s'il est déjà dans l'équipe
    if (project.team.includes(userToAdd._id)) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur est déjà membre de l\'équipe' },
        { status: 400 }
      );
    }
    
    // Ajouter à l'équipe
    project.team.push(userToAdd._id);
    
    await project.save();
    
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'administrators', select: 'firstName lastName email' },
      { path: 'team', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Membre ajouté à l\'équipe',
      project
    });
    
  } catch (error) {
    console.error('Erreur ajout membre équipe:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}

// Retirer un membre de l'équipe
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
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'ID du membre requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le projet
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Le propriétaire ou un admin peuvent retirer des membres
    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.administrators.some(admin => admin.toString() === userId);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire ou un admin peut retirer des membres' },
        { status: 403 }
      );
    }
    
    // Vérifier que l'utilisateur est dans l'équipe
    if (!project.team.some(member => member.toString() === memberId)) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur n\'est pas membre de l\'équipe' },
        { status: 400 }
      );
    }
    
    // Retirer le membre
    project.team = project.team.filter(
      member => member.toString() !== memberId
    );
    
    await project.save();
    
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'administrators', select: 'firstName lastName email' },
      { path: 'team', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Membre retiré de l\'équipe',
      project
    });
    
  } catch (error) {
    console.error('Erreur retrait membre équipe:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}