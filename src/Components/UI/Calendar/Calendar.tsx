// Custom Google-like calendar component (no external calendar package)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, addWeeks, differenceInCalendarDays, differenceInMinutes, endOfMonth, endOfWeek, format, isAfter, isSameDay, isSameMonth, isToday, parseISO, setHours, setMinutes, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { CalendarEvent, Task } from '../../../utils/interfaces/interfaces';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../Button';

interface CalendarProps {
  events: CalendarEvent[];
  currentDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void; // currently not implemented in custom view
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  onViewChange?: (view: string) => void;
  editable?: boolean; // currently unused; reserved for future drag/drop
  onVisibleDateChange?: (date: Date) => void; // notify parent when user navigates
  onTaskDotClick?: (task: Task) => void; // open task details when clicking task dot
}

const HOURS_START = 0;
const HOURS_END = 23;
const TOTAL_HOURS = HOURS_END - HOURS_START + 1; // inclusive range (24 hours)

function getEventColor(type: string): string {
  switch (type) {
    case 'meeting': return '#3b82f6'; // blue
    case 'deadline': return '#ef4444'; // red
    case 'appointment': return '#10b981'; // green
    case 'reminder': return '#f59e0b'; // amber
    case 'personal': return '#8b5cf6'; // purple
    case 'holiday': return '#22c55e'; // green (distinct bright)
    default: return '#6b7280'; // gray
  }
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  onEventDrop: _onEventDrop,
  view = 'dayGridMonth',
  onViewChange,
  editable: _editable = true,
  onVisibleDateChange,
  onTaskDotClick,
}) => {
  const [visibleDate, setVisibleDate] = useState<Date>(currentDate);
  const [activeView, setActiveView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>(view);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleDate(currentDate);
  }, [currentDate]);

  useEffect(() => {
    setActiveView(view);
  }, [view]);

  const goToToday = () => {
    const d = new Date();
    setVisibleDate(d);
    onVisibleDateChange?.(d);
  };
  const goToPrevious = () => {
    setVisibleDate(prev => {
      const next = activeView === 'dayGridMonth' ? addMonths(prev, -1) : activeView === 'timeGridWeek' ? addWeeks(prev, -1) : addDays(prev, -1);
      onVisibleDateChange?.(next);
      return next;
    });
  };
  const goToNext = () => {
    setVisibleDate(prev => {
      const next = activeView === 'dayGridMonth' ? addMonths(prev, 1) : activeView === 'timeGridWeek' ? addWeeks(prev, 1) : addDays(prev, 1);
      onVisibleDateChange?.(next);
      return next;
    });
  };
  const changeView = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setActiveView(newView);
    onViewChange?.(newView);
  };

  // Helpers
  const normalizeDate = (d: Date | string) => typeof d === 'string' ? parseISO(d) : new Date(d);
  const eventsNormalized = useMemo(() => (events || []).map(e => ({
    ...e,
    startDate: normalizeDate(e.startDate),
    endDate: normalizeDate(e.endDate),
    // Respect a provided color (for synthetic events like tasks/projects), else fallback by type
    color: (e as any).color || getEventColor(e.type)
  })), [events]);

  // Header label
  const headerLabel = useMemo(() => {
    if (activeView === 'dayGridMonth') return format(visibleDate, 'MMMM yyyy');
    if (activeView === 'timeGridWeek') {
      const start = startOfWeek(visibleDate, { weekStartsOn: 1 });
      const end = endOfWeek(visibleDate, { weekStartsOn: 1 });
      const sameMonth = isSameMonth(start, end);
      return sameMonth
        ? `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
        : `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    return format(visibleDate, 'EEEE, MMM d, yyyy');
  }, [visibleDate, activeView]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 h-full flex flex-col overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5">
            <button onClick={goToPrevious} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToNext} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <ChevronRight size={18} />
            </button>
            <Button text="Today" onClick={goToToday} variant="outline" size="sm" />
          </div>
          <div className="text-white text-lg md:text-xl font-semibold select-none cursor-default">{headerLabel}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button text="Month" onClick={() => changeView('dayGridMonth')} variant={activeView === 'dayGridMonth' ? 'primary' : 'ghost'} size="sm" />
          <Button text="Week" onClick={() => changeView('timeGridWeek')} variant={activeView === 'timeGridWeek' ? 'primary' : 'ghost'} size="sm" />
          <Button text="Day" onClick={() => changeView('timeGridDay')} variant={activeView === 'timeGridDay' ? 'primary' : 'ghost'} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'dayGridMonth' && (
          <MonthView date={visibleDate} events={eventsNormalized} onDateClick={onDateClick} onEventClick={onEventClick} onTaskDotClick={onTaskDotClick} />
        )}
        {activeView === 'timeGridWeek' && (
          <WeekView date={visibleDate} events={eventsNormalized} onEventClick={onEventClick} />
        )}
        {activeView === 'timeGridDay' && (
          <DayView date={visibleDate} events={eventsNormalized} onEventClick={onEventClick} />
        )}
      </div>
    </div>
  );
};

// Month View
const MonthView: React.FC<{ date: Date; events: (CalendarEvent & { color: string })[]; onDateClick?: (d: Date) => void; onEventClick?: (e: CalendarEvent) => void; onTaskDotClick?: (task: Task) => void; }> = ({ date, events, onDateClick, onEventClick, onTaskDotClick }) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; !isAfter(d, end); d = addDays(d, 1)) days.push(d);

  // Removed per-day count/expand logic; weekly overlay is scrollable so no need for +N indicator.

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const ROW_HEIGHT = 18; // px per lane
  const TOP_OFFSET = 36; // px below the day number row (more space between date and bar)
  const MAX_VISIBLE_LANES = 4; // before scrolling (week overlay scrolls independently now)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-700 text-gray-300 text-xs select-none cursor-default">
        {weekdayLabels.map(d => (
          <div key={d} className="px-2 py-2 text-center">{d}</div>
        ))}
      </div>

      {/* Weeks grid with continuous event bars overlay */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col h-full">
          {Array.from({ length: 6 }).map((_, wIdx) => {
            const weekStart = addDays(start, wIdx * 7);
            const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

            // Build event segments that overlap this week
            type Seg = { event: CalendarEvent & { color: string }; startCol: number; endCol: number; isStart: boolean; isEnd: boolean };
            const overlapping: Seg[] = (events || [])
              .filter(ev => {
                const evStart = startOfDay(ev.startDate as Date);
                const evEnd = startOfDay(ev.endDate as Date);
                return !(isAfter(weekStart, evEnd) || isAfter(evStart, weekEnd));
              })
              .map(ev => {
                const evStart = startOfDay(ev.startDate as Date);
                const evEnd = startOfDay(ev.endDate as Date);
                const segStartDay = isAfter(evStart, weekStart) ? evStart : weekStart;
                const segEndDay = isAfter(weekEnd, evEnd) ? evEnd : weekEnd;
                const startCol = Math.max(0, Math.min(6, differenceInCalendarDays(segStartDay, weekStart)));
                const endCol = Math.max(0, Math.min(6, differenceInCalendarDays(segEndDay, weekStart)));
                const isStart = isSameDay(segStartDay, evStart);
                const isEnd = isSameDay(segEndDay, evEnd);
                return { event: ev as any, startCol, endCol, isStart, isEnd };
              })
              .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

            // Assign to lanes (rows) to avoid overlaps
            const lanes: Seg[][] = [];
            overlapping.forEach(seg => {
              let placed = false;
              for (const lane of lanes) {
                const last = lane[lane.length - 1];
                if (!last || seg.startCol > last.endCol) {
                  lane.push(seg);
                  placed = true;
                  break;
                }
              }
              if (!placed) lanes.push([seg]);
            });

            // Compute lane heights: if a lane contains a project with tasks, make it taller
            const laneHeights = lanes.map(lane => {
              const hasProjWithTasks = lane.some(seg => {
                const id = (seg.event as any)?._id as string | undefined;
                const tasks = (seg.event as any)?.tasks as any[] | undefined;
                return !!id && id.startsWith('project-') && Array.isArray(tasks) && tasks.length > 0;
              });
              return hasProjWithTasks ? ROW_HEIGHT + 10 : ROW_HEIGHT; // add extra height for task dots
            });
            const reservedHeight = Math.max(laneHeights.slice(0, MAX_VISIBLE_LANES).reduce((a, b) => a + b, 0) + 6, 24);

            return (
              <div key={wIdx} className="relative" style={{ height: `${100 / 6}%` }}>
                {/* Day cells for this week */}
                <div className="grid grid-cols-7 h-full">
                  {weekDays.map((d) => (
                    <div
                      key={d.toDateString()}
                      className={`border border-gray-700 p-1.5 md:p-2 overflow-hidden ${!isSameMonth(d, date) ? 'bg-gray-900/40 text-gray-500' : 'bg-gray-800'} cursor-pointer`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('[data-event]')) return;
                        onDateClick?.(d);
                      }}
                    >
                      <div className="flex items-center justify-center mb-1 select-none cursor-default">
                        <span className={`text-xs md:text-sm ${isToday(d) ? 'bg-blue-600 text-white rounded-full px-2 py-0.5' : 'text-gray-300'}`}>{format(d, 'd')}</span>
                      </div>
                      {/* Reserve vertical space matching the visible lanes' heights */}
                      <div style={{ height: reservedHeight }} />
                    </div>
                  ))}
                </div>

                {/* Overlay continuous bars for this week
                    Made scrollable: container now fills vertical space between date header (TOP_OFFSET) and week row bottom.
                    This prevents visual overflow when there are many lanes; users can scroll vertically inside the week.
                */}
                <div
                  className="absolute inset-x-0 bottom-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                  style={{ top: TOP_OFFSET }}
                >
                  {/* Inner list keeps natural height (lanes * ROW_HEIGHT) enabling scroll if it exceeds available space */}
                  <div style={{ position: 'relative', paddingBottom: 2 }}>
                    {lanes.map((lane, li) => (
                      <div key={li} className="relative" style={{ height: laneHeights[li] }}>
                        {lane.map(seg => {
                          const widthCols = seg.endCol - seg.startCol + 1;
                          const left = `calc(${seg.startCol} * (100% / 7))`;
                          const width = `calc(${widthCols} * (100% / 7) - 2px)`;
                          const showTitle = seg.isStart || seg.startCol === 0; // show at start of event or when a new week segment begins
                          // Build compact label for project events with tasks
                          const isProject = typeof (seg.event as any)._id === 'string' && (seg.event as any)._id.startsWith('project-');
                          const tasks: any[] = isProject ? ((seg.event as any).tasks || []) : [];
                          const tooltip = `${seg.event.title}${tasks.length ? `\nTasks: ${tasks.map((t: any) => t.title).join(', ')}` : ''}`;
                          // Compute dot positions within this weekly segment for each task's dueDate
                          const segStartDate = addDays(weekStart, seg.startCol);
                          // Helper: color per task (priority first, then status fallback)
                          const colorForTask = (t: any) => {
                            const p = t.priority as string | undefined;
                            switch (p) {
                              case 'urgent': return '#ef4444'; // red-500
                              case 'high': return '#f97316'; // orange-500
                              case 'medium': return '#f59e0b'; // amber-500
                              case 'low': return '#10b981'; // emerald-500
                            }
                            const s = t.status as string | undefined;
                            switch (s) {
                              case 'completed': return '#22c55e'; // green-500
                              case 'in-progress': return '#3b82f6'; // blue-500
                              case 'pending': return '#a855f7'; // purple-500
                              case 'cancelled': return '#6b7280'; // gray-500
                              default: return '#ffffff';
                            }
                          };

                          // Group tasks by day index, but keep individual tasks to render one dot per task
                          const tasksByDay = new Map<number, { task: any; date: Date }[]>();
                          (tasks || [])
                            .filter((t: any) => !!t.dueDate)
                            .forEach((t: any) => {
                              const d = new Date(t.dueDate);
                              if (isAfter(startOfDay(d), endOfWeek(segStartDate, { weekStartsOn: 1 })) || isAfter(startOfDay(segStartDate), startOfDay(d))) return;
                              const dayIdx = Math.max(0, Math.min(widthCols - 1, differenceInCalendarDays(startOfDay(d), startOfDay(segStartDate))));
                              if (!tasksByDay.has(dayIdx)) tasksByDay.set(dayIdx, []);
                              tasksByDay.get(dayIdx)!.push({ task: t, date: d });
                            });

                          const DOT_SPACING = 20; // px between dots in the same day (even wider gap for larger dots)
                          const taskDots = Array.from(tasksByDay.entries()).flatMap(([dayIdx, arr]) => {
                            const frac = (dayIdx + 0.5) / widthCols;
                            const basePct = frac * 100;
                            const offsets = Array.from({ length: arr.length }, (_, i) => (i - (arr.length - 1) / 2) * DOT_SPACING);
                            return arr.map((entry, i) => ({
                              leftPct: basePct,
                              offsetPx: offsets[i],
                              color: colorForTask(entry.task),
                              title: `${entry.task.title}${entry.task.priority ? ` • ${entry.task.priority}` : ''} (${format(entry.date, 'PP')})`,
                              task: entry.task,
                            }));
                          });
                          return (
                            <button
                              key={`${seg.event._id}-${seg.startCol}-${seg.endCol}`}
                              data-event
                              className={`absolute text-left text-xs text-white px-2 cursor-pointer ${(seg.isStart || seg.startCol === 0) ? 'rounded-l' : ''} ${(seg.isEnd || seg.endCol === 6) ? 'rounded-r' : ''}`}
                              style={{ left, width, top: 2, height: laneHeights[li] - 4, lineHeight: `${laneHeights[li] - 4}px`, backgroundColor: (seg.event as any).color, zIndex: 10 as any }}
                              onClick={() => onEventClick?.(seg.event)}
                              title={tooltip}
                            >
                              {/* Label */}
                              {showTitle ? `${seg.event.title}` : '\u00A0'}
                              {/* Dot overlay for project tasks within this segment */}
                              {isProject && taskDots.length > 0 && (
                                <div className="pointer-events-none absolute inset-0">
                                  {taskDots.map((dot, idx) => (
                                    <button
                                      key={idx}
                                      className="absolute block w-3 h-3 rounded-full ring-2 ring-white/90 shadow-sm pointer-events-auto hover:scale-110 transition-transform"
                                      style={{ left: `calc(${dot.leftPct}% + ${dot.offsetPx}px)`, top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: (dot as any).color }}
                                      title={(dot as any).title}
                                      onClick={(e) => { e.stopPropagation(); const t = (dot as any).task as Task | undefined; if (t) onTaskDotClick?.(t); }}
                                      aria-label={(dot as any).title}
                                    />
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Overlap layout helper
type PositionedEvent = CalendarEvent & { top: number; height: number; left: number; width: number; color: string; displayRole?: 'normal' | 'start' | 'end' };

function layoutDayEvents(allEvents: (CalendarEvent & { color: string })[], day: Date): PositionedEvent[] {
  const startBoundary = setHours(setMinutes(startOfDay(day), 0), HOURS_START);

  // Build day items: single-day as normal; multi-day -> start/end markers only
  const MARKER_MINUTES = 15; // small visual marker height
  const items: (CalendarEvent & { color: string; displayRole?: 'normal' | 'start' | 'end'; __start?: Date; __end?: Date })[] = [];

  (allEvents || []).forEach(event => {
    if (event.isAllDay) return; // handled separately in all-day lane
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const isMultiDay = !isSameDay(eventStart, eventEnd);
    if (!isMultiDay) {
      if (isSameDay(eventStart, day)) items.push({ ...(event as any), displayRole: 'normal', __start: eventStart, __end: eventEnd });
      return;
    }
    if (isSameDay(eventStart, day)) {
      const endMarker = new Date(eventStart.getTime() + MARKER_MINUTES * 60 * 1000);
      items.push({ ...(event as any), displayRole: 'start', __start: eventStart, __end: endMarker });
    }
    if (isSameDay(eventEnd, day)) {
      const endMarkerEnd = new Date(eventEnd.getTime() + MARKER_MINUTES * 60 * 1000);
      items.push({ ...(event as any), displayRole: 'end', __start: eventEnd, __end: endMarkerEnd });
    }
  });

  // Sort by start time
  items.sort((a, b) => (a.__start as Date).getTime() - (b.__start as Date).getTime());

  // Assign columns for overlap
  type Active = { end: number; col: number };
  const actives: Active[] = [];
  const positioned: (PositionedEvent & { col: number; cols: number })[] = [];

  items.forEach(ev => {
    const startMs = (ev.__start as Date).getTime();
    const endMs = (ev.__end as Date).getTime();
    // free columns whose end <= start
    for (let i = actives.length - 1; i >= 0; i--) {
      if (actives[i].end <= startMs) actives.splice(i, 1);
    }
    // find first free column index
    const usedCols = actives.map(a => a.col);
    let col = 0;
    while (usedCols.includes(col)) col++;
    actives.push({ end: endMs, col });
    actives.sort((a, b) => a.col - b.col);
    const cols = Math.max(1, actives.length);
  const top = Math.max(0, (differenceInMinutes(ev.__start as Date, startBoundary) / (TOTAL_HOURS * 60)) * 100);
  const height = Math.max(2, (differenceInMinutes(ev.__end as Date, ev.__start as Date) / (TOTAL_HOURS * 60)) * 100);
    positioned.push({
      ...(ev as any),
      col,
      cols,
      top,
      height,
      left: 0,
      width: 0,
      color: (ev as any).color,
    });
  });

  // determine group widths: recompute width per overlapping group
  const result: PositionedEvent[] = positioned.map(p => {
    const width = 100 / p.cols;
    const left = p.col * width;
    return { ...p, width, left };
  });

  return result;
}

const TimeGridHeader: React.FC<{ days: Date[] }> = ({ days }) => (
  <div
    className="grid border-b border-gray-700 text-gray-300 text-xs"
    style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
  >
    <div className="px-2 py-2" />
    {days.map((d) => (
      <div key={d.toDateString()} className="px-2 py-2 text-center">
        <div className="text-gray-400">{format(d, 'EEE')}</div>
        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full mt-1 ${isToday(d) ? 'bg-blue-600 text-white' : 'text-gray-200'}`}>{format(d, 'd')}</div>
      </div>
    ))}
  </div>
);

const TimeGridBody: React.FC<{ days: Date[]; events: (CalendarEvent & { color: string })[]; onEventClick?: (e: CalendarEvent) => void; }>
  = ({ days, events, onEventClick }) => {
    const hours = Array.from({ length: HOURS_END - HOURS_START + 1 }, (_, i) => HOURS_START + i);
    const now = new Date();
    const showNow = days.some(d => isToday(d));
  const nowTop = ((now.getHours() + now.getMinutes() / 60 - HOURS_START) / TOTAL_HOURS) * 100;

    return (
      <div
        className="grid flex-1 min-h-0 h-full"
        style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {/* Time labels */}
  <div className="border-r border-gray-700 relative">
          {hours.map((h) => (
            <div
              key={h}
              className="relative h-14 md:h-12 text-[10px] md:text-xs text-gray-400"
            >
              <div className="absolute top-1/2 -translate-y-1/2 right-2">{format(setHours(setMinutes(new Date(), 0), h), 'HH:mm')}</div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayKey = day.toDateString();
          const allDay = (events || []).filter(e => e.isAllDay && (isSameDay(e.startDate, day) || isSameDay(e.endDate, day)));
          const hasAllDay = allDay.length > 0;
          const timed = layoutDayEvents((events || []), day);
          return (
            <div key={dayKey} className="relative border-r border-gray-700">
              {/* All-day lane (render only if present) */}
              {hasAllDay && (
                <div className="h-8 border-b border-gray-700 px-1.5 py-1">
                  <div className="flex gap-1 overflow-hidden">
                    {allDay.map(ev => {
                      const isProject = typeof (ev as any)._id === 'string' && (ev as any)._id.startsWith('project-');
                      const tasks: any[] = isProject ? ((ev as any).tasks || []) : [];
                      const tasksPreview = tasks.length > 0 ? ` · ${tasks[0].title}${tasks.length > 1 ? ` +${tasks.length - 1}` : ''}` : '';
                      const tooltip = `${ev.title}${tasks.length ? `\nTasks: ${tasks.map((t: any) => t.title).join(', ')}` : ''}`;
                      return (
                        <button
                          key={ev._id}
                          className="px-2 py-0.5 rounded text-[10px] text-white truncate cursor-pointer"
                          style={{ backgroundColor: (ev as any).color }}
                          onClick={() => onEventClick?.(ev)}
                          title={tooltip}
                        >{`${ev.title}${isProject ? tasksPreview : ''}`}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hour grid */}
              <div className="absolute inset-x-0 bottom-0" style={{ top: hasAllDay ? '2rem' as any : 0 }}>
                {/* hour lines */}
                {hours.map((h, idx) => (
                  <div key={h} className={`border-b border-gray-700 h-14 md:h-12 ${idx === hours.length - 1 ? 'border-b-0' : ''}`} />
                ))}

                {/* now indicator */}
                {showNow && isToday(day) && nowTop >= 0 && nowTop <= 100 && (
                  <div className="absolute left-0 right-0" style={{ top: `${nowTop}%` }}>
                    <div className="absolute -translate-y-1/2 left-0 right-0 h-0.5 bg-red-500" />
                  </div>
                )}

                {/* events */}
                {timed.map(ev => {
                  const isProject = typeof (ev as any)._id === 'string' && (ev as any)._id.startsWith('project-');
                  const tasks: any[] = isProject ? ((ev as any).tasks || []) : [];
                  const tasksPreview = tasks.length > 0 ? ` · ${tasks[0].title}${tasks.length > 1 ? ` +${tasks.length - 1}` : ''}` : '';
                  const tooltip = `${ev.title}${tasks.length ? `\nTasks: ${tasks.map((t: any) => t.title).join(', ')}` : ''}`;
                  return (
                    <div
                      key={ev._id}
                      className="absolute rounded p-1 md:p-1.5 text-[10px] md:text-xs text-white overflow-hidden shadow cursor-pointer"
                      style={{
                        top: `${ev.top}%`,
                        height: `${ev.height}%`,
                        left: `${ev.left}%`,
                        width: `${ev.width}%`,
                        backgroundColor: ev.color,
                      }}
                      onClick={() => onEventClick?.(ev)}
                      title={tooltip}
                    >
                      <div className="font-medium truncate">{`${ev.title}${isProject ? tasksPreview : ''}`}</div>
                      <div className="opacity-80 truncate">
                        {format(ev.startDate, 'HH:mm')} – {format(ev.endDate, 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

const WeekView: React.FC<{ date: Date; events: (CalendarEvent & { color: string })[]; onEventClick?: (e: CalendarEvent) => void; }>
  = ({ date, events, onEventClick }) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return (
      <div className="h-full flex flex-col">
        <TimeGridHeader days={days} />
        <div className="flex-1 min-h-0 overflow-auto">
          <TimeGridBody days={days} events={events} onEventClick={onEventClick} />
        </div>
      </div>
    );
  };

const DayView: React.FC<{ date: Date; events: (CalendarEvent & { color: string })[]; onEventClick?: (e: CalendarEvent) => void; }>
  = ({ date, events, onEventClick }) => {
    return (
      <div className="h-full flex flex-col">
        <TimeGridHeader days={[date]} />
        <div className="flex-1 min-h-0 overflow-auto">
          <TimeGridBody days={[date]} events={events} onEventClick={onEventClick} />
        </div>
      </div>
    );
  };

export default Calendar;
