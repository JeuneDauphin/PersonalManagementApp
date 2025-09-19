// Event list component for displaying events in a sorted list
import React from 'react';
import { CalendarEvent } from '../../../utils/interfaces/interfaces';
import { Clock, MapPin, Users } from 'lucide-react';
import Button from '../Button';

interface EventListsProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  showActions?: boolean;
  // Optional range to clip display times (useful for day/week/month lists)
  rangeStart?: Date;
  rangeEnd?: Date;
}

const EventLists: React.FC<EventListsProps> = ({
  events,
  isLoading = false,
  onEventClick,
  onEventEdit,
  onEventDelete,
  showActions = true,
  rangeStart,
  rangeEnd,
}) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'appointment': return 'bg-green-500';
      case 'reminder': return 'bg-yellow-500';
      case 'personal': return 'bg-purple-500';
      case 'holiday': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const clamp = (d: Date, min?: Date, max?: Date) => {
    let t = new Date(d);
    if (min && t < min) t = new Date(min);
    if (max && t > max) t = new Date(max);
    return t;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-start gap-3 p-3 border border-gray-700 rounded-lg">
              <div className="w-3 h-3 bg-gray-700 rounded-full mt-1"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ((events || []).length === 0) {
    return (
      <div className="text-center py-6">
        <Clock size={32} className="mx-auto text-gray-500 mb-2" />
        <p className="text-gray-400 text-body">No events for this date</p>
      </div>
    );
  }

  // Build display items: show each event once; optionally clip to provided range
  type ListItem = CalendarEvent & { _displayStart: Date; _displayEnd: Date };
  const items: ListItem[] = (events || []).map((event) => {
    const s = new Date(event.startDate);
    const e = new Date(event.endDate);
    const displayStart = clamp(s, rangeStart, rangeEnd);
    const displayEnd = clamp(e, rangeStart, rangeEnd);
    return { ...(event as any), _displayStart: displayStart, _displayEnd: displayEnd };
  });

  // Sort by display start time
  const sortedEvents = items.sort((a, b) => a._displayStart.getTime() - b._displayStart.getTime());

  return (
    <div className="space-y-2">
      {sortedEvents.map((event) => (
    <div
      key={`${event._id}-${(event as any)._displayStart?.getTime?.() ?? ''}`}
          className={`
            border border-gray-700 rounded-lg p-3
      hover:border-gray-600 transition-colors cursor-pointer
      group relative
          `}
          onClick={() => onEventClick?.(event)}
        >
          <div className="flex items-start gap-3">
            {/* Event type indicator */}
            <div className={`w-3 h-3 ${getEventTypeColor(event.type)} rounded-full mt-1.5 flex-shrink-0`} />

            <div className="flex-1 min-w-0">
              {/* Title and time */}
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-body text-white font-medium truncate">
                  {event.title}
                </h4>
                {/* actions moved to bottom-right */}
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-small text-gray-400 mb-1">
                <Clock size={12} />
                {event.isAllDay ? (
                  'All day'
                ) : (
                  <>
                    {formatTime((event as any)._displayStart)} - {formatTime((event as any)._displayEnd)}
                    <span className="mx-1">•</span>
                    {formatDuration((event as any)._displayStart, (event as any)._displayEnd)}
                  </>
                )}
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1 text-small text-gray-400 mb-1">
                  <MapPin size={12} />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Attendees count */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-1 text-small text-gray-400">
                  <Users size={12} />
                  <span>{event.attendees.length} attendees</span>
                </div>
              )}

              {/* Description preview */}
              {event.description && (
                <p className="text-small text-gray-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}

              {/* Event type badge */}
              <div className="mt-2">
                <span className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${event.type === 'meeting' ? 'bg-blue-600 text-blue-100' :
                    event.type === 'deadline' ? 'bg-red-600 text-red-100' :
                      event.type === 'appointment' ? 'bg-green-600 text-green-100' :
                        event.type === 'reminder' ? 'bg-yellow-600 text-yellow-900' :
                          event.type === 'personal' ? 'bg-purple-600 text-purple-100' :
                          event.type === 'holiday' ? 'bg-emerald-600 text-emerald-100' :
                            'bg-gray-600 text-gray-100'
                  }
                `}>
                  {event.type}
                </span>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                action="edit"
                onClick={(e) => {
                  e?.stopPropagation();
                  onEventEdit?.(event);
                }}
                variant="ghost"
                size="sm"
                text=""
              />
              <Button
                action="delete"
                onClick={(e) => {
                  e?.stopPropagation();
                  onEventDelete?.(event._id);
                }}
                variant="ghost"
                size="sm"
                text=""
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventLists;
