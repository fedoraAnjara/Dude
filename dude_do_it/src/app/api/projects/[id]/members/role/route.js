import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getUserFromRequest } from '@/lib/auth';

// Changer le rôle d'un membre (team <-> administrator)
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
    const { memberId, newRole } = await request.json();
    
    // Validation
    if (!memberId || !newRole) {
      return NextResponse.json(
        { success: false, message: 'memberId et newRole requis' },
        { status: 400 }
      );
    }
    
    if (!['administrator', 'team'].includes(newRole)) {
      return NextResponse.json(
        { success: false, message: 'newRole doit être "administrator" ou "team"' },
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
    
    // Seul le propriétaire peut changer les rôles
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut changer les rôles' },
        { status: 403 }
      );
    }
    
    // Vérifier que ce n'est pas le propriétaire
    if (memberId === project.owner.toString()) {
      return NextResponse.json(
        { success: false, message: 'Impossible de changer le rôle du propriétaire' },
        { status: 400 }
      );
    }
    
    // Trouver le membre actuel
    const isAdmin = project.administrators.some(admin => admin.toString() === memberId);
    const isTeam = project.team.some(member => member.toString() === memberId);
    
    if (!isAdmin && !isTeam) {
      return NextResponse.json(
        { success: false, message: 'Cet utilisateur n\'est pas membre du projet' },
        { status: 400 }
      );
    }
    
    // Changer le rôle
    if (newRole === 'administrator') {
      // Team -> Admin
      if (isTeam) {
        project.team = project.team.filter(m => m.toString() !== memberId);
        project.administrators.push(memberId);
      }
    } else {
      // Admin -> Team
      if (isAdmin) {
        project.administrators = project.administrators.filter(a => a.toString() !== memberId);
        project.team.push(memberId);
      }
    }
    
    await project.save();
    
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'administrators', select: 'firstName lastName email' },
      { path: 'team', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: `Rôle changé en ${newRole}`,
      project
    });
    
  } catch (error) {
    console.error('Erreur changement rôle:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}