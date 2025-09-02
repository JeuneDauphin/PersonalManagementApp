// Calendar page - full calendar view with events management
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import EventLists from '../Components/UI/Calendar/EventLists';
import DateShortcut from '../Components/UI/Calendar/DateShortcut';
import EventCardPopup from '../Components/UI/Calendar/EventCardPopup';
import { useEvents } from '../utils/hooks/hooks';
import { CalendarEvent } from '../utils/interfaces/interfaces';

const CalendarPage: React.FC = () => {
  const { data: events, loading, refresh } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  // Filter events for selected date
  const selectedDateEvents = events.filter(event => {
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
    // This would save the event via API
    console.log('Saving event:', event);
    setShowEventPopup(false);
    refresh();
  };

  const handleEventDelete = async (eventId: string) => {
    // This would delete the event via API
    console.log('Deleting event:', eventId);
    refresh();
  };

  return (
    <Layout
      title="Calendar"
      onAddNew={handleAddNew}
      addButtonText="Add Event"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Date Shortcuts */}
          <DateShortcut
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Events List for Selected Date */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-large font-semibold text-white mb-4">
              Events for {selectedDate.toLocaleDateString()}
            </h3>
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

        {/* Main Calendar */}
        <div className="lg:col-span-3">
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
