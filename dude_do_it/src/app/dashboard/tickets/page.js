'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';
import TicketCard from '@/components/TicketCard';
import Modal from '@/components/Modal';

export default function TicketsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const userRes = await fetchWithAuth('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
      }

      const projectsRes = await fetchWithAuth('/api/projects');
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
      }

      const ticketsRes = await fetchWithAuth('/api/tickets');
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

  const filteredTickets = tickets.filter(ticket => {
    // Filtre par statut
    if (filterStatus !== 'all' && ticket.status !== filterStatus) {
      return false;
    }

    // Filtre par projet
    if (filterProject !== 'all' && ticket.project?._id !== filterProject) {
      return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  const statusCounts = {
    'À faire': tickets.filter(t => t.status === 'À faire').length,
    'En cours': tickets.filter(t => t.status === 'En cours').length,
    'En validation': tickets.filter(t => t.status === 'En validation').length,
    'Terminé': tickets.filter(t => t.status === 'Terminé').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tous les Tickets
          </h1>
          <p className="text-gray-600">
            {tickets.length} ticket{tickets.length > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 mb-1">À faire</p>
                <p className="text-3xl font-bold text-yellow-900">{statusCounts['À faire']}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 mb-1">En cours</p>
                <p className="text-3xl font-bold text-blue-900">{statusCounts['En cours']}</p>
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800 mb-1">En validation</p>
                <p className="text-3xl font-bold text-purple-900">{statusCounts['En validation']}</p>
              </div>
              <div className="text-4xl">🔍</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Terminés</p>
                <p className="text-3xl font-bold text-green-900">{statusCounts['Terminé']}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Titre ou description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="En validation">En validation</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            {/* Filtre par projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projet
              </label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les projets</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton reset filtres */}
          {(filterStatus !== 'all' || filterProject !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterProject('all');
                setSearchQuery('');
              }}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Liste des tickets */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun ticket trouvé
            </h3>
            <p className="text-gray-600">
              {tickets.length === 0
                ? 'Commencez par créer un projet et ajoutez-y des tickets'
                : 'Essayez de modifier vos filtres'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className="cursor-pointer" onClick={() => router.push(`/dashboard/tickets/${ticket._id}`)}>
                <TicketCard ticket={ticket} showProject={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}