// Calendar page - full calendar view with events management
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import EventLists from '../Components/UI/Calendar/EventLists';
import DateShortcut from '../Components/UI/Calendar/DateShortcut';
import EventCardPopup from '../Components/UI/Calendar/EventCardPopup';
import { useEvents } from '../utils/hooks/hooks';
import { CalendarEvent } from '../utils/interfaces/interfaces';
import { apiService } from '../utils/api/Api';

const CalendarPage: React.FC = () => {
  const { data: events, loading, refresh } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Filter events for selected date
  const selectedDateEvents = (events || []).filter(event => {
    const eventDate = new Date(event.startDate);
    const selected = new Date(selectedDate);
    return eventDate.toDateString() === selected.toDateString();
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddNew = () => {
    // Create new event
    setSelectedEvent(null);
    setShowEventPopup(true);
  };

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      if (event._id.startsWith('temp-')) {
        // Creating new event
        const { _id, createdAt, updatedAt, ...eventData } = event;
        await apiService.createEvent(eventData);
      } else {
        // Updating existing event
        const { _id, createdAt, updatedAt, ...eventData } = event;
        await apiService.updateEvent(event._id, eventData);
      }
      setShowEventPopup(false);
      refresh();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await apiService.deleteEvent(eventId);
      refresh();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  return (
    <Layout
      title="Calendar"
      onAddNew={handleAddNew}
      addButtonText="Add Event"
    >
      <div className="h-full flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar */}
        <div className="lg:w-80 flex-shrink-0 flex flex-col space-y-4 overflow-hidden">
          {/* Date Shortcuts */}
          <DateShortcut
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Events List for Selected Date */}
          <div className="bg-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-large font-semibold text-white mb-3 flex-shrink-0">
              Events for {selectedDate.toLocaleDateString()}
            </h3>
            <div className="flex-1 overflow-y-auto min-h-0">
              <EventLists
                events={selectedDateEvents}
                isLoading={loading}
                onEventClick={handleEventClick}
                onEventEdit={(event: CalendarEvent) => {
                  setSelectedEvent(event);
                  setShowEventPopup(true);
                }}
                onEventDelete={handleEventDelete}
              />
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <Calendar
              events={events}
              currentDate={selectedDate}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              view={calendarView}
              onViewChange={(view) => setCalendarView(view as any)}
              editable={true}
            />
          </div>
        </div>
      </div>

      {/* Event Popup */}
      {showEventPopup && (
        <EventCardPopup
          event={selectedEvent}
          isOpen={showEventPopup}
          onClose={() => setShowEventPopup(false)}
          onSave={handleEventSave}
          onDelete={selectedEvent ? () => handleEventDelete(selectedEvent._id) : undefined}
        />
      )}
    </Layout>
  );
};

export default CalendarPage;
