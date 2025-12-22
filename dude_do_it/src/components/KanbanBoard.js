'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchWithAuth } from '@/lib/authClient';

export default function KanbanBoard({ tickets, onTicketUpdate }) {
  const statuses = ['À faire', 'En cours', 'En validation', 'Terminé'];

  const ticketsByStatus = statuses.reduce((acc, status) => {
    acc[status] = tickets.filter(t => t.status === status);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Pas de destination ou même position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId;
    const ticketId = draggableId;

    // Mise à jour optimiste de l'UI
    if (onTicketUpdate) {
      onTicketUpdate();
    }

    // Mise à jour sur le serveur
    try {
      const response = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success && onTicketUpdate) {
        onTicketUpdate();
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors du changement de statut');
      if (onTicketUpdate) {
        onTicketUpdate(); // Recharger pour annuler le changement optimiste
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'À faire':
        return 'bg-yellow-50 border-yellow-200';
      case 'En cours':
        return 'bg-blue-50 border-blue-200';
      case 'En validation':
        return 'bg-purple-50 border-purple-200';
      case 'Terminé':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid md:grid-cols-4 gap-6">
        {statuses.map((status) => (
          <div key={status} className={`rounded-xl border-2 p-4 ${getStatusColor(status)}`}>
            <h3 className="font-bold text-gray-900 mb-4">
              {status} ({ticketsByStatus[status].length})
            </h3>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-white bg-opacity-50 rounded-lg' : ''
                  }`}
                >
                  {ticketsByStatus[status].map((ticket, index) => (
                    <Draggable
                      key={ticket._id}
                      draggableId={ticket._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition ${
                            snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                          }`}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {ticket.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {ticket.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatDate(ticket.estimatedDate)}</span>
                            {ticket.assignedTo && ticket.assignedTo.length > 0 && (
                              <span>👤 {ticket.assignedTo.length}</span>
                            )}
                          </div>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {ticket.attachments.length} fichier(s)
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {ticketsByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Glissez un ticket ici
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}