import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import { getUserFromRequest } from '@/lib/auth';

// Mettre à jour un commentaire
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
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Le contenu est obligatoire' },
        { status: 400 }
      );
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }
    
    // Seul l'auteur peut modifier
    if (comment.author.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul l\'auteur peut modifier ce commentaire' },
        { status: 403 }
      );
    }
    
    // Mettre à jour
    comment.content = content;
    comment.updatedAt = Date.now();
    
    await comment.save();
    await comment.populate([
      { path: 'ticket', select: 'title' },
      { path: 'author', select: 'firstName lastName email' }
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Commentaire mis à jour',
      comment
    });
    
  } catch (error) {
    console.error('Erreur mise à jour commentaire:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Supprimer un commentaire
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
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }
    
    // Seul l'auteur peut supprimer
    if (comment.author.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Seul l\'auteur peut supprimer ce commentaire' },
        { status: 403 }
      );
    }
    
    await Comment.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé'
    });
    
  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}