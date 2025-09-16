// Calendar page - full calendar view with events management
import React, { useMemo, useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import EventLists from '../Components/UI/Calendar/EventLists';
import DateShortcut from '../Components/UI/Calendar/DateShortcut';
import EventCardPopup from '../Components/UI/Calendar/EventCardPopup';
import { useEvents, useProjects, useTasks } from '../utils/hooks/hooks';
import { CalendarEvent, Task, Project } from '../utils/interfaces/interfaces';
import { apiService } from '../utils/api/Api';
import Notification from '../Components/UI/Notification';
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
  const { data: events, loading, refresh } = useEvents();
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [startInEdit, setStartInEdit] = useState(false);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [notif, setNotif] = useState<{ open: boolean; type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }>(
    { open: false, type: 'error', title: '', message: '' }
  );

  // Determine the currently visible range based on the active calendar view
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

  // Helper: does an event intersect the range? (handles multi-day events)
  const eventIntersectsRange = (ev: CalendarEvent, start: Date, end: Date) => {
    const evStart = new Date(ev.startDate);
    const evEnd = new Date(ev.endDate);
    return evStart <= end && evEnd >= start;
  };

  // Convert tasks to synthetic all-day calendar events (due date only)
  const taskEvents: CalendarEvent[] = useMemo(() => {
    return (tasks || []).filter(t => !!t.dueDate).map((t: Task): CalendarEvent => ({
      _id: `task-${t._id}`,
      title: `Task: ${t.title}`,
      description: t.description,
      startDate: new Date(t.dueDate),
      endDate: new Date(t.dueDate),
      isAllDay: true,
      type: 'deadline',
      location: undefined,
      attendees: undefined,
      reminders: [],
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      // UI-only color to distinguish tasks
      ...({ color: '#ef4444' } as any),
    }));
  }, [tasks]);

  // Convert projects to synthetic all-day multi-day events spanning start..end or 1 day if no end
  const projectEvents: CalendarEvent[] = useMemo(() => {
    return (projects || []).filter(p => !!p.startDate).map((p: Project): CalendarEvent => {
      const s = new Date(p.startDate);
      const e = p.endDate ? new Date(p.endDate) : new Date(p.startDate);
      return {
        _id: `project-${p._id}`,
        title: `Project: ${p.name}`,
        description: p.description,
        startDate: s,
        endDate: e,
        isAllDay: true,
        type: 'personal',
        location: undefined,
        attendees: undefined,
        reminders: [],
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        // UI-only color to distinguish projects (purple)
        ...({ color: '#8b5cf6' } as any),
      } as any;
    });
  }, [projects]);

  // Merge API events with synthetic task/project events
  const mergedEvents: CalendarEvent[] = useMemo(() => {
    return [
      ...(events || []),
      ...taskEvents,
      ...projectEvents,
    ];
  }, [events, taskEvents, projectEvents]);

  // Filter events for the computed range (from merged)
  const eventsForList = useMemo(() => {
    return (mergedEvents || []).filter((ev) => eventIntersectsRange(ev, rangeStart, rangeEnd));
  }, [mergedEvents, rangeStart, rangeEnd]);

  const handleEventClick = (event: CalendarEvent) => {
    // Open the event details popup without changing the current calendar view or selected date
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
      const msg = error instanceof Error ? error.message : 'Failed to save event';
      setNotif({ open: true, type: 'error', title: 'Save failed', message: msg });
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
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
              />
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <Calendar
              events={mergedEvents}
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

      {/* Notification */}
      <Notification
        type={notif.type}
        title={notif.title}
        message={notif.message}
        isOpen={notif.open}
        onClose={() => setNotif(prev => ({ ...prev, open: false }))}
      />
    </Layout>
  );
};

export default CalendarPage;
