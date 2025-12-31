'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';
import CommentSection from '@/components/CommentSection';
import Modal from '@/components/Modal';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;

  const [user, setUser] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [ticketId, router]);

  const loadData = async () => {
    try {
      const userRes = await fetchWithAuth('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
      }

      const ticketRes = await fetchWithAuth(`/api/tickets/${ticketId}`);
      const ticketData = await ticketRes.json();
      if (ticketData.success) {
        setTicket(ticketData.ticket);
        setEditForm({
          title: ticketData.ticket.title,
          description: ticketData.ticket.description,
          status: ticketData.ticket.status,
          estimatedDate: ticketData.ticket.estimatedDate.split('T')[0],
        });

        //Charger les membres du projet
        const membersRes = await fetchWithAuth(
          `/api/projects/${ticketData.ticket.project._id}/members`
        );
        const membersData = await membersRes.json();
        if (membersData.success) {
          setProjectMembers(membersData.members);
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/dashboard/projects/${ticket.project._id}`);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        loadData();
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  //Assigner/Désassigner un membre
  const handleToggleAssignment = async (memberId) => {
    try {
      const currentAssignedIds = ticket.assignedTo?.map(a => a._id) || [];
      let newAssignedIds;

      if (currentAssignedIds.includes(memberId)) {
        // Retirer l'assignation
        newAssignedIds = currentAssignedIds.filter(id => id !== memberId);
      } else {
        // Ajouter l'assignation
        newAssignedIds = [...currentAssignedIds, memberId];
      }

      const response = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ assignedTo: newAssignedIds })
      });

      const data = await response.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur assignation:', error);
      alert('Erreur lors de l\'assignation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ticket non trouvé</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'À faire':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'En cours':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En validation':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Terminé':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isCreator = ticket.creator._id === user?.id;
  const canEdit = isCreator;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Fil d'Ariane */}
        <div className="mb-6 text-sm text-gray-600">
          <button onClick={() => router.push('/dashboard')} className="hover:text-indigo-600">
            Dashboard
          </button>
          <span className="mx-2">/</span>
          <button onClick={() => router.push(`/dashboard/projects/${ticket.project._id}`)} className="hover:text-indigo-600">
            {ticket.project.name}
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{ticket.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête du ticket */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                  {ticket.title}
                </h1>
                <div className="flex gap-2">
                  {canEdit && (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={handleDeleteTicket}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>Créé par {ticket.creator.firstName} {ticket.creator.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Date d'estimation: {formatDate(ticket.estimatedDate)}</span>
                </div>
              </div>
            </div>

            {/* Commentaires */}
            <div className="bg-white rounded-xl shadow p-6">
              <CommentSection ticketId={ticketId} currentUserId={user?.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Statut</h3>
              <div className="space-y-2">
                {['À faire', 'En cours', 'En validation', 'Terminé'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-medium transition ${
                      ticket.status === status
                        ? getStatusColor(status) + ' border-current'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Projet */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Projet</h3>
              <button
                onClick={() => router.push(`/dashboard/projects/${ticket.project._id}`)}
                className="w-full text-left p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                <p className="font-medium text-indigo-900">{ticket.project.name}</p>
                <p className="text-sm text-indigo-700 mt-1">{ticket.project.description}</p>
              </button>
            </div>

            {/*Assignations */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Assigné à ({ticket.assignedTo?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                >
                  Gérer
                </button>
              </div>
              
              {ticket.assignedTo && ticket.assignedTo.length > 0 ? (
                <div className="space-y-2">
                  {ticket.assignedTo.map(person => (
                    <div key={person._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {person.firstName[0]}{person.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {person.firstName} {person.lastName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{person.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Non assigné
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Modifier Ticket */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le ticket"
      >
        <form onSubmit={handleEditTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="En validation">En validation</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'estimation
              </label>
              <input
                type="date"
                value={editForm.estimatedDate}
                onChange={(e) => setEditForm({ ...editForm, estimatedDate: e.target.value })}
                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/*Modal Assignation */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Gérer les assignations"
      >
        <div className="space-y-3">
          {projectMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun membre dans ce projet
            </p>
          ) : (
            projectMembers.map((member) => {
              const isAssigned = ticket.assignedTo?.some(a => a._id === member._id);
              
              return (
                <div
                  key={member._id}
                  onClick={() => handleToggleAssignment(member._id)}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition ${
                    isAssigned
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    isAssigned ? 'bg-indigo-600' : 'bg-gray-400'
                  }`}>
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                      {member.role === 'owner' && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Propriétaire
                        </span>
                      )}
                      {member.role === 'administrator' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{member.email}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {isAssigned ? (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowAssignModal(false)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Terminer
          </button>
        </div>
      </Modal>
    </div>
  );
}