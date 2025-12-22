'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, isAuthenticated } from '@/lib/authClient';
import Navbar from '@/components/Navbar';
import ProjectCard from '@/components/ProjectCard';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes Projets
            </h1>
            <p className="text-gray-600">
              {projects.length} projet{projects.length > 1 ? 's' : ''} au total
            </p>
          </div>

          <Link
            href="/dashboard/projects/new"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            + Nouveau projet
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tous ({projects.length})
          </button>
          <button
            onClick={() => setFilter('Actif')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Actif'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Actifs ({projects.filter(p => p.status === 'Actif').length})
          </button>
          <button
            onClick={() => setFilter('Inactif')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Inactif'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Inactifs ({projects.filter(p => p.status === 'Inactif').length})
          </button>
          <button
            onClick={() => setFilter('Archiver')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Archiver'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Archivés ({projects.filter(p => p.status === 'Archiver').length})
          </button>
        </div>

        {/* Grille de projets */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Commencez par créer votre premier projet'
                : `Aucun projet avec le statut "${filter}"`}
            </p>
            {filter === 'all' && (
              <Link
                href="/dashboard/projects/new"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Créer un projet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}