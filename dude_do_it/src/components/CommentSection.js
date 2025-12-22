'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authClient';

export default function CommentSection({ ticketId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          content: newComment,
          ticket: ticketId
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetchWithAuth(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editContent })
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        setEditContent('');
        loadComments();
      }
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    try {
      const response = await fetchWithAuth(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadComments();
      }
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">
        Commentaires ({comments.length})
      </h3>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Ajout...' : 'Ajouter un commentaire'}
        </button>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun commentaire pour le moment
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {comment.author?.firstName} {comment.author?.lastName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {comment.author?._id === currentUserId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment._id)}
                      className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}