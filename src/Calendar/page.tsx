// Calendar page - full calendar view with events management
import React, { useMemo, useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import EventLists from '../Components/UI/Calendar/EventLists';
import DateShortcut from '../Components/UI/Calendar/DateShortcut';
import EventCardPopup from '../Components/UI/Calendar/EventCardPopup';
import TaskCardPopup from '../Components/UI/Tasks/TaskCardPop';
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
  const { data: tasks, refresh: refreshTasks } = useTasks();
  const { data: projects, refresh: refreshProjects } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [startInEdit, setStartInEdit] = useState(false);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [notif, setNotif] = useState<{ open: boolean; type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }>(
    { open: false, type: 'error', title: '', message: '' }
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [taskStartInEdit, setTaskStartInEdit] = useState(false);

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

  // Helpers to ensure events have sensible times in time-grid views
  const isTimeGrid = calendarView !== 'dayGridMonth';
  const withDefaultTime = (d: Date, hour = 9, minute = 0) => {
    const date = new Date(d);
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      date.setHours(hour, minute, 0, 0);
    }
    return date;
  };

  const oneHourAfter = (d: Date) => new Date(d.getTime() + 60 * 60 * 1000);

  // Build quick lookup of tasks by project to enrich project events and prevent duplicate task rendering
  const tasksByProjectId = useMemo(() => {
    const map = new Map<string, Task[]>();
    (tasks || []).forEach((t: any) => {
      const pid: string | undefined = t.projectId || t.project; // tolerate either field from API
      if (!pid) return;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(t as Task);
    });
    return map;
  }, [tasks]);

  // Convert tasks without a project to synthetic events (project-linked tasks will be shown inside project bars)
  const taskEvents: CalendarEvent[] = useMemo(() => {
    return (tasks || [])
      .filter((t: any) => !((t.projectId || t.project)))
      .filter((t: Task) => !!t.dueDate)
      .map((t: Task): CalendarEvent => {
      const base = new Date(t.dueDate);
      if (isTimeGrid) {
        const start = withDefaultTime(base, 9, 0);
        const end = oneHourAfter(start);
        return {
          _id: `task-${t._id}`,
          title: `Task: ${t.title}`,
          description: t.description,
          startDate: start,
          endDate: end,
          isAllDay: false,
          type: 'deadline',
          location: undefined,
          attendees: undefined,
          reminders: [],
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          ...({ color: '#ef4444' } as any),
        } as any;
      }
      // Month view: keep all-day on the due date
      return {
        _id: `task-${t._id}`,
        title: `Task: ${t.title}`,
        description: t.description,
        startDate: base,
        endDate: base,
        isAllDay: true,
        type: 'deadline',
        location: undefined,
        attendees: undefined,
        reminders: [],
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        ...({ color: '#ef4444' } as any),
      } as any;
    });
  }, [tasks, isTimeGrid]);

  // Convert projects to synthetic events and attach their tasks for display inside the project color button
  const projectEvents: CalendarEvent[] = useMemo(() => {
    return (projects || []).filter(p => !!p.startDate).flatMap((p: Project): CalendarEvent[] => {
      const rawStart = new Date(p.startDate);
      const hasEnd = !!p.endDate;
      const rawEnd = hasEnd ? new Date(p.endDate as Date) : new Date(p.startDate);
      const projTasks = tasksByProjectId.get(p._id) || [];
      if (isTimeGrid) {
        // In week/day views, render as timed events
        const start = withDefaultTime(rawStart, 9, 0);
        const end = hasEnd ? withDefaultTime(rawEnd, 18, 0) : oneHourAfter(start);
        // If multi-day, keep as a spanning event so start/end markers appear at the correct times
        return [{
          _id: `project-${p._id}`,
          title: `Project: ${p.name}`,
          description: p.description,
          startDate: start,
          endDate: end,
          isAllDay: false,
          type: 'personal',
          location: undefined,
          attendees: undefined,
          reminders: [],
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          ...({ color: '#8b5cf6', tasks: projTasks } as any),
        } as any];
      }
      // Month view: keep as all-day spanning
      return [{
        _id: `project-${p._id}`,
        title: `Project: ${p.name}`,
        description: p.description,
        startDate: rawStart,
        endDate: rawEnd,
        isAllDay: true,
        type: 'personal',
        location: undefined,
        attendees: undefined,
        reminders: [],
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        ...({ color: '#8b5cf6', tasks: projTasks } as any),
      } as any];
    });
  }, [projects, isTimeGrid, tasksByProjectId]);

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
      // Route save based on event origin
      if (event._id.startsWith('project-')) {
        // Synthetic project event => update the underlying project dates
        const projectId = event._id.replace(/^project-/, '');
        await apiService.updateProject(projectId, {
          startDate: event.startDate,
          endDate: event.endDate,
        });
        // Refresh projects to reflect the change in the calendar
        await refreshProjects();
      } else if (event._id.startsWith('task-')) {
        // Synthetic task event => update the task due date from startDate
        const taskId = event._id.replace(/^task-/, '');
        await apiService.updateTask(taskId, {
          dueDate: event.startDate,
        } as any);
        await refreshTasks();
      } else if (event._id.startsWith('temp-')) {
      // Creating new real calendar event
        const { _id, createdAt, updatedAt, ...eventData } = event;
        await apiService.createEvent(eventData);
        await refresh();
      } else {
        // Updating existing real calendar event
        const { _id, createdAt, updatedAt, ...eventData } = event;
        await apiService.updateEvent(event._id, eventData);
        await refresh();
      }
      setShowEventPopup(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save event';
      setNotif({ open: true, type: 'error', title: 'Save failed', message: msg });
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      if (eventId.startsWith('project-')) {
        const projectId = eventId.replace(/^project-/, '');
        await apiService.deleteProject(projectId);
        // Deleting a project may detach tasks from it; refresh both
        await Promise.all([refreshProjects(), refreshTasks()]);
        return;
      }
      if (eventId.startsWith('task-')) {
        const taskId = eventId.replace(/^task-/, '');
        await apiService.deleteTask(taskId);
        await refreshTasks();
        return;
      }
      // Real calendar event
      await apiService.deleteEvent(eventId);
      await refresh();
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
              onTaskDotClick={(task: Task) => {
                setSelectedTask(task);
                setTaskStartInEdit(false);
                setShowTaskPopup(true);
              }}
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

      {/* Task Popup */}
      {showTaskPopup && (
        <TaskCardPopup
          task={selectedTask ?? undefined}
          isOpen={showTaskPopup}
          onClose={() => setShowTaskPopup(false)}
          onSave={async (task: Task) => {
            try {
              if (task._id.startsWith('temp-')) {
                const { _id, createdAt, updatedAt, ...taskData } = task as any;
                await apiService.createTask(taskData);
              } else {
                const { _id, createdAt, updatedAt, ...taskData } = task as any;
                await apiService.updateTask(task._id, taskData);
              }
              setShowTaskPopup(false);
              await refreshTasks();
            } catch (e) {
              console.error(e);
            }
          }}
          onDelete={selectedTask ? async () => {
            try {
              await apiService.deleteTask(selectedTask._id);
              setShowTaskPopup(false);
              await refreshTasks();
            } catch (e) { console.error(e); }
          } : undefined}
          startInEdit={taskStartInEdit}
        />
      )}
    </Layout>
  );
};

export default CalendarPage;
