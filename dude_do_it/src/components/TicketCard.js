'use client';

import Link from 'next/link';

export default function TicketCard({ ticket, showProject = true }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'À faire':
        return 'bg-yellow-100 text-yellow-700';
      case 'En cours':
        return 'bg-blue-100 text-blue-700';
      case 'En validation':
        return 'bg-purple-100 text-purple-700';
      case 'Terminé':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{ticket.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-3">
          {showProject && ticket.project && (
            <span className="text-indigo-600 font-medium">
              📦 {ticket.project.name}
            </span>
          )}
          <span className="text-gray-500">
            📅 {formatDate(ticket.estimatedDate)}
          </span>
        </div>
      </div>

      {/*Affichage des assignés */}
      {ticket.assignedTo && ticket.assignedTo.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Assigné à:</span>
          <div className="flex -space-x-2">
            {ticket.assignedTo.slice(0, 3).map((person) => (
              <div
                key={person._id}
                className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                title={`${person.firstName} ${person.lastName}`}
              >
                {person.firstName[0]}{person.lastName[0]}
              </div>
            ))}
            {ticket.assignedTo.length > 3 && (
              <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                +{ticket.assignedTo.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}