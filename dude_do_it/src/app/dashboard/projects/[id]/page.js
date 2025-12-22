'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';
import TicketCard from '@/components/TicketCard';
import Modal from '@/components/Modal';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Formulaires
  const [editForm, setEditForm] = useState({});
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    status: 'À faire',
    estimatedDate: '',
    assignedTo: []
  });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [projectId, router]);

  const loadData = async () => {
    try {
      const userRes = await fetchWithAuth('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
      }

      const projectRes = await fetchWithAuth(`/api/projects/${projectId}`);
      const projectData = await projectRes.json();
      if (projectData.success) {
        setProject(projectData.project);
        setEditForm({
          name: projectData.project.name,
          description: projectData.project.description,
          status: projectData.project.status
        });
      }

      const ticketsRes = await fetchWithAuth(`/api/projects/${projectId}/tickets`);
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth(`/api/projects/${projectId}`, {
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

  const handleDeleteProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Tous les tickets seront également supprimés.')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard/projects');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          ...ticketForm,
          project: projectId
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowTicketModal(false);
        setTicketForm({
          title: '',
          description: '',
          status: 'À faire',
          estimatedDate: '',
          assignedTo: []
        });
        loadData();
      }
    } catch (error) {
      console.error('Erreur création ticket:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth(`/api/projects/${projectId}/team`, {
        method: 'POST',
        body: JSON.stringify({ userEmail: memberEmail })
      });

      const data = await response.json();
      if (data.success) {
        setMemberEmail('');
        loadData();
        alert('Membre ajouté avec succès');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erreur ajout membre:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Projet non trouvé</div>
      </div>
    );
  }

  const isOwner = project.owner._id === user?.id;
  const isAdmin = project.administrators?.some(admin => admin._id === user?.id);
  const canEdit = isOwner || isAdmin;

  const ticketsByStatus = {
    'À faire': tickets.filter(t => t.status === 'À faire'),
    'En cours': tickets.filter(t => t.status === 'En cours'),
    'En validation': tickets.filter(t => t.status === 'En validation'),
    'Terminé': tickets.filter(t => t.status === 'Terminé')
};
return (
<div className="min-h-screen bg-gray-50">
<Navbar user={user} />
  <div className="container mx-auto px-4 py-8">
    {/* En-tête */}
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {project.name}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'Actif' ? 'bg-green-100 text-green-700' :
              project.status === 'Inactif' ? 'bg-gray-100 text-gray-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👤 Propriétaire: {project.owner.firstName} {project.owner.lastName}</span>
            <span>👥 {project.administrators?.length || 0} admin(s)</span>
            <span>👥 {project.team?.length || 0} membre(s)</span>
          </div>
        </div>

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
                onClick={() => setShowMembersModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Membres
              </button>
            </>
          )}
          {isOwner && (
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Tickets */}
    <div className="mb-6 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Tickets ({tickets.length})
      </h2>
      <button
        onClick={() => setShowTicketModal(true)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        + Nouveau ticket
      </button>
    </div>

    {/* Board Kanban */}
    <div className="grid md:grid-cols-4 gap-6">
      {Object.entries(ticketsByStatus).map(([status, statusTickets]) => (
        <div key={status} className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-900 mb-4">
            {status} ({statusTickets.length})
          </h3>
          <div className="space-y-3">
            {statusTickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} showProject={false} />
            ))}
            {statusTickets.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">
                Aucun ticket
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Modal Modifier Projet */}
  <Modal
    isOpen={showEditModal}
    onClose={() => setShowEditModal(false)}
    title="Modifier le projet"
  >
    <form onSubmit={handleEditProject} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du projet
        </label>
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
          rows="4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statut
        </label>
        <select
          value={editForm.status}
          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="Archiver">Archiver</option>
        </select>
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

  {/* Modal Créer Ticket */}
  <Modal
    isOpen={showTicketModal}
    onClose={() => setShowTicketModal(false)}
    title="Nouveau ticket"
  >
    <form onSubmit={handleCreateTicket} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>
        <input
          type="text"
          value={ticketForm.title}
          onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={ticketForm.description}
          onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
          rows="4"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={ticketForm.status}
            onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
            value={ticketForm.estimatedDate}
            onChange={(e) => setTicketForm({ ...ticketForm, estimatedDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Créer le ticket
        </button>
        <button
          type="button"
          onClick={() => setShowTicketModal(false)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  </Modal>

  {/* Modal Membres */}
  <Modal
    isOpen={showMembersModal}
    onClose={() => setShowMembersModal(false)}
    title="Gérer les membres"
  >
    <div className="space-y-6">
      {/* Ajouter un membre */}
      {canEdit && (
        <form onSubmit={handleAddMember} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Ajouter un membre (par email)
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Ajouter
            </button>
          </div>
        </form>
      )}

      {/* Liste des membres */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Propriétaire</h3>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="font-medium">{project.owner.firstName} {project.owner.lastName}</p>
          <p className="text-sm text-gray-600">{project.owner.email}</p>
        </div>

        {project.administrators && project.administrators.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-900 mb-3">Administrateurs</h3>
            <div className="space-y-2 mb-4">
              {project.administrators.map(admin => (
                <div key={admin._id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{admin.firstName} {admin.lastName}</p>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {project.team && project.team.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-900 mb-3">Équipe</h3>
            <div className="space-y-2">
              {project.team.map(member => (
                <div key={member._id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </Modal>
</div>
);
}