import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { CalendarEvent, Contact } from '../../../../../utils/interfaces/interfaces';

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'meeting': return 'text-blue-400';
    case 'deadline': return 'text-red-400';
    case 'appointment': return 'text-green-400';
    case 'reminder': return 'text-yellow-400';
    case 'personal': return 'text-purple-400';
    case 'holiday': return 'text-emerald-400';
    default: return 'text-gray-400';
  }
};

const ViewMode: React.FC<{ event: CalendarEvent; contacts: Contact[]; }> = ({ event, contacts }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <h3 className="text-large font-medium text-white">{event.title}</h3>
        <span className={`px-3 py-1 rounded-full text-small font-medium ${getEventTypeColor(event.type)} bg-gray-700`}>
          {event.type}
        </span>
      </div>

      {event.description && (
        <p className="text-body text-gray-300">{event.description}</p>
      )}

      <div className="flex items-center gap-2 text-body text-gray-300">
        <CalendarIcon size={16} />
        <span>
          {event.isAllDay ? (
            new Date(event.startDate).toLocaleDateString()
          ) : (
            `${formatDateTime(event.startDate.toString())} - ${formatDateTime(event.endDate.toString())}`
          )}
        </span>
      </div>

      {event.location && (
        <div className="flex items-center gap-2 text-body text-gray-300">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>
      )}

      {event.attendees && event.attendees.length > 0 && (
        <div className="flex flex-col gap-1 text-body text-blue-300">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            <span>{event.attendees.length} contact{event.attendees.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {event.attendees.map(id => {
              const c = contacts.find(x => x._id === id);
              const label = c ? `${c.firstName} ${c.lastName}` : id;
              const href = c?.email ? `mailto:${c.email}` : (c?.phone ? `tel:${c.phone}` : undefined);
              return href ? (
                <a key={id} href={href} className="px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-600/40 text-blue-200 text-small">{label}</a>
              ) : (
                <span key={id} className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small">{label}</span>
              );
            })}
          </div>
        </div>
      )}

      {event.reminders && event.reminders.length > 0 && (
        <div className="flex items-center gap-2 text-body text-gray-300">
          <Clock size={16} />
          <span>Reminders: {event.reminders.join(', ')} minutes before</span>
        </div>
      )}
    </>
  );
};

export default ViewMode;
