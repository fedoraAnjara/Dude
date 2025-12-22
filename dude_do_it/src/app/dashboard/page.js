'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      // Charger le profil
      const userRes = await fetchWithAuth('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) {
        setUser(userData.user);
      }

      // Charger les projets
      const projectsRes = await fetchWithAuth('/api/projects');
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
      }

      // Charger les tickets
      const ticketsRes = await fetchWithAuth('/api/tickets');
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  const ticketsByStatus = {
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
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de vos projets et tickets
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Projets</p>
                <p className="text-3xl font-bold text-indigo-600">{projects.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">À faire</p>
                <p className="text-3xl font-bold text-yellow-600">{ticketsByStatus['À faire']}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En cours</p>
                <p className="text-3xl font-bold text-blue-600">{ticketsByStatus['En cours']}</p>
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terminés</p>
                <p className="text-3xl font-bold text-green-600">{ticketsByStatus['Terminé']}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Projets récents */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Projets récents</h2>
            <Link
              href="/dashboard/projects/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Nouveau projet
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun projet. Créez-en un pour commencer !
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'Actif' ? 'bg-green-100 text-green-700' :
                      project.status === 'Inactif' ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tickets récents */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tickets récents</h2>
            <Link
              href="/dashboard/tickets"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>

          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun ticket pour le moment
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{ticket.project?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'À faire' ? 'bg-yellow-100 text-yellow-700' :
                      ticket.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'En validation' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}