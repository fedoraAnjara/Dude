import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Ajouter un administrateur
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
    
    // Seul le propriétaire peut ajouter des admins
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut ajouter des administrateurs' },
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
        { success: false, message: 'Le propriétaire est déjà administrateur' },
        { status: 400 }
      );
    }
    
    // Vérifier s'il est déjà admin
    if (project.administrators.includes(userToAdd._id)) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur est déjà administrateur' },
        { status: 400 }
      );
    }
    
    // Ajouter comme admin
    project.administrators.push(userToAdd._id);
    
    // S'il est dans l'équipe, le retirer (car admin > équipe)
    project.team = project.team.filter(
      memberId => memberId.toString() !== userToAdd._id.toString()
    );
    
    await project.save();
    
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'administrators', select: 'firstName lastName email' },
      { path: 'team', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Administrateur ajouté',
      project
    });
    
  } catch (error) {
    console.error('Erreur ajout administrateur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}

// Retirer un administrateur
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
    const adminId = searchParams.get('adminId');
    
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'ID de l\'administrateur requis' },
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
    
    // Seul le propriétaire peut retirer des admins
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut retirer des administrateurs' },
        { status: 403 }
      );
    }
    
    // Vérifier que l'utilisateur est admin
    if (!project.administrators.some(admin => admin.toString() === adminId)) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur n\'est pas administrateur' },
        { status: 400 }
      );
    }
    
    // Retirer l'admin
    project.administrators = project.administrators.filter(
      admin => admin.toString() !== adminId
    );
    
    await project.save();
    
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'administrators', select: 'firstName lastName email' },
      { path: 'team', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Administrateur retiré',
      project
    });
    
  } catch (error) {
    console.error('Erreur retrait administrateur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}