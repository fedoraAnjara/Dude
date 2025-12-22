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
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {showProject && ticket.project && (
            <span className="text-indigo-600 font-medium">
              {ticket.project.name}
            </span>
          )}
          <span className="text-gray-500">
            {formatDate(ticket.estimatedDate)}
          </span>
        </div>
        
        {ticket.assignedTo && ticket.assignedTo.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">👤</span>
            <span className="text-gray-700">{ticket.assignedTo.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}