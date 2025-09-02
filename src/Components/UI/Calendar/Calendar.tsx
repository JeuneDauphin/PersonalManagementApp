// Google-like calendar component using FullCalendar
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from '../../../utils/interfaces/interfaces';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../Button';

interface CalendarProps {
  events: CalendarEvent[];
  currentDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  onViewChange?: (view: string) => void;
  editable?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  onEventDrop,
  view = 'dayGridMonth',
  onViewChange,
  editable = true,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Convert our events to FullCalendar format
  const calendarEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.isAllDay,
    backgroundColor: getEventColor(event.type),
    borderColor: getEventColor(event.type),
    extendedProps: {
      description: event.description,
      type: event.type,
      location: event.location,
      attendees: event.attendees,
    }
  }));

  function getEventColor(type: string): string {
    switch (type) {
      case 'meeting': return '#3b82f6'; // blue
      case 'deadline': return '#ef4444'; // red
      case 'appointment': return '#10b981'; // green
      case 'reminder': return '#f59e0b'; // amber
      case 'personal': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const event = events.find(e => e._id === eventId);
    if (event && onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateClick = (dateClickInfo: any) => {
    if (onDateClick) {
      onDateClick(new Date(dateClickInfo.date));
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const event = events.find(e => e._id === eventId);
    if (event && onEventDrop) {
      onEventDrop(event, new Date(dropInfo.event.start));
    }
  };

  const goToToday = () => {
    calendarRef.current?.getApi().today();
  };

  const goToPrevious = () => {
    calendarRef.current?.getApi().prev();
  };

  const goToNext = () => {
    calendarRef.current?.getApi().next();
  };

  const changeView = (newView: string) => {
    calendarRef.current?.getApi().changeView(newView);
    onViewChange?.(newView);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <Button
              text="Today"
              onClick={goToToday}
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            text="Month"
            onClick={() => changeView('dayGridMonth')}
            variant={view === 'dayGridMonth' ? 'primary' : 'ghost'}
            size="sm"
          />
          <Button
            text="Week"
            onClick={() => changeView('timeGridWeek')}
            variant={view === 'timeGridWeek' ? 'primary' : 'ghost'}
            size="sm"
          />
          <Button
            text="Day"
            onClick={() => changeView('timeGridDay')}
            variant={view === 'timeGridDay' ? 'primary' : 'ghost'}
            size="sm"
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container flex-1 min-h-0">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          initialDate={currentDate}
          events={calendarEvents}
          editable={editable}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          height={400}
          headerToolbar={false} // We're using our custom header
          dayHeaderFormat={{ weekday: 'short' }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          nowIndicator={true}
          slotDuration="01:00:00"
          slotLabelInterval="02:00:00"
          // Styling
          eventDisplay="block"
          eventTextColor="#ffffff"
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#3b82f6"
          // Dark theme
          dayHeaderClassNames="!bg-gray-700 !text-white !border-gray-600"
          dayCellClassNames="!bg-gray-800 !border-gray-600"
          eventClassNames="!text-white !rounded !shadow-sm"
        />
      </div>

      <style>{`
        .calendar-container {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
        }

        .fc {
          background: transparent;
          color: white;
        }

        .fc-view-harness {
          height: 100% !important;
        }

        .fc-scroller {
          overflow-y: auto !important;
          height: 100% !important;
        }

        .fc-timegrid-body {
          height: auto !important;
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: #4b5563;
        }

        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #4b5563;
        }

        .fc-col-header-cell {
          background-color: #374151 !important;
          padding: 4px !important;
          font-size: 12px !important;
        }

        .fc-daygrid-day {
          background-color: #1f2937 !important;
        }

        .fc-daygrid-day:hover {
          background-color: #374151 !important;
        }

        .fc-day-today {
          background-color: #1e3a8a !important;
        }

        .fc-event {
          border: none !important;
          font-size: 11px !important;
          margin: 1px;
          padding: 1px 3px !important;
        }

        .fc-event-title {
          font-weight: 500;
        }

        .fc-timegrid-slot {
          height: 40px !important;
        }

        .fc-timegrid-slot-label {
          font-size: 11px !important;
        }

        .fc-button-primary {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .fc-button-primary:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
