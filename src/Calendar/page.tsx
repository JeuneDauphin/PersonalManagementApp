// Calendar page - full calendar view with events management
import React, { useMemo, useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import EventLists from '../Components/UI/Calendar/EventLists';
import DateShortcut from '../Components/UI/Calendar/DateShortcut';
import EventCardPopup from '../Components/UI/Calendar/EventCardPopup';
import { useEvents } from '../utils/hooks/hooks';
import { CalendarEvent } from '../utils/interfaces/interfaces';
import { apiService } from '../utils/api/Api';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';

const CalendarPage: React.FC = () => {
  // Compute visible range first, then fetch events just for that window
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { rangeStart, rangeEnd, listTitle } = useMemo(() => {
    const base = selectedDate;
    if (calendarView === 'timeGridDay') {
      return {
        rangeStart: startOfDay(base),
        rangeEnd: endOfDay(base),
        listTitle: `Events for ${format(base, 'PP')}`,
      } as const;
    }
    if (calendarView === 'timeGridWeek') {
      const s = startOfWeek(base, { weekStartsOn: 1 });
      const e = endOfWeek(base, { weekStartsOn: 1 });
      return {
        rangeStart: s,
        rangeEnd: e,
        listTitle: `This week (${format(s, 'PP')} – ${format(e, 'PP')})`,
      } as const;
    }
    const s = startOfMonth(base);
    const e = endOfMonth(base);
    return {
      rangeStart: s,
      rangeEnd: e,
      listTitle: `${format(base, 'MMMM yyyy')}`,
    } as const;
  }, [selectedDate, calendarView]);

  const { data: events, loading, refresh } = useEvents({ from: rangeStart, to: rangeEnd });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [startInEdit, setStartInEdit] = useState(false);

  // Determine the currently visible range based on the active calendar view

  // Helper: does an event intersect the range? (handles multi-day events)
  const eventIntersectsRange = (ev: CalendarEvent, start: Date, end: Date) => {
    const evStart = new Date(ev.startDate);
    const evEnd = new Date(ev.endDate);
    return evStart <= end && evEnd >= start;
  };

  // Filter events for the computed range
  const eventsForList = useMemo(() => {
    return (events || []).filter((ev) => eventIntersectsRange(ev, rangeStart, rangeEnd));
  }, [events, rangeStart, rangeEnd]);

  const handleEventClick = (event: CalendarEvent) => {
    // Sync calendar/date shortcut selection to the event's start day
    const eventDay = new Date(event.startDate);
    setSelectedDate(eventDay);
    setCalendarView('timeGridDay');
    // Open the event details
    setSelectedEvent(event);
    setDayPopupDate(null);
    setStartInEdit(false);
    setShowEventPopup(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setDayPopupDate(date);
    setStartInEdit(true);
    setShowEventPopup(true);
    // Ensure the list focuses on the selected day
    setCalendarView('timeGridDay');
  };

  const handleAddNew = () => {
    // Create new event
    setSelectedEvent(null);
    setDayPopupDate(null);
    setStartInEdit(true);
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
            onDateSelect={(date) => {
              setSelectedDate(date);
              // Keep current view; Calendar centers via currentDate prop
            }}
            events={events}
          />

          {/* Events List for Selected Date */}
          <div className="bg-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-large font-semibold text-white mb-3 flex-shrink-0">
              {listTitle}
            </h3>
            <div className="flex-1 overflow-y-auto min-h-0">
              <EventLists
                events={eventsForList}
                isLoading={loading}
                onEventClick={handleEventClick}
                onEventEdit={(event: CalendarEvent) => {
                  setSelectedEvent(event);
                  setDayPopupDate(null);
                  setStartInEdit(true);
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
              onVisibleDateChange={(d) => setSelectedDate(d)}
            />
          </div>
        </div>
      </div>

      {/* Event Popup */}
      {showEventPopup && (
        <EventCardPopup
          event={selectedEvent}
          isOpen={showEventPopup}
          onClose={() => { setShowEventPopup(false); setDayPopupDate(null); }}
          onSave={handleEventSave}
          onDelete={selectedEvent ? () => handleEventDelete(selectedEvent._id) : undefined}
          dayDate={dayPopupDate ?? undefined}
          startInEdit={startInEdit}
        />
      )}
    </Layout>
  );
};

export default CalendarPage;
