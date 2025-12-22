'use client';

import Link from 'next/link';

export default function ProjectCard({ project }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Actif':
        return 'bg-green-100 text-green-700';
      case 'Inactif':
        return 'bg-gray-100 text-gray-700';
      case 'Archiver':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Link
      href={`/dashboard/projects/${project._id}`}
      className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span>👤</span>
          <span>{project.owner?.firstName} {project.owner?.lastName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{(project.administrators?.length || 0) + (project.team?.length || 0)} membres</span>
        </div>
      </div>
    </Link>
  );
}