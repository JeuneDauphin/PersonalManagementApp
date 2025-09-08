// Custom Google-like calendar component (no external calendar package)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, addWeeks, differenceInMinutes, endOfMonth, endOfWeek, format, isAfter, isSameDay, isSameMonth, isToday, parseISO, setHours, setMinutes, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { CalendarEvent } from '../../../utils/interfaces/interfaces';
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
}

const HOURS_START = 0;
const HOURS_END = 23;

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

const Calendar: React.FC<CalendarProps> = ({
  events,
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  onEventDrop: _onEventDrop,
  view = 'dayGridMonth',
  onViewChange,
  editable: _editable = true,
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

  const goToToday = () => setVisibleDate(new Date());
  const goToPrevious = () => {
    setVisibleDate(prev => activeView === 'dayGridMonth' ? addMonths(prev, -1) : activeView === 'timeGridWeek' ? addWeeks(prev, -1) : addDays(prev, -1));
  };
  const goToNext = () => {
    setVisibleDate(prev => activeView === 'dayGridMonth' ? addMonths(prev, 1) : activeView === 'timeGridWeek' ? addWeeks(prev, 1) : addDays(prev, 1));
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
    color: getEventColor(e.type)
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
            <button onClick={goToPrevious} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToNext} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
            <Button text="Today" onClick={goToToday} variant="outline" size="sm" />
          </div>
          <div className="text-white text-lg md:text-xl font-semibold">{headerLabel}</div>
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
          <MonthView date={visibleDate} events={eventsNormalized} onDateClick={onDateClick} onEventClick={onEventClick} />
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
const MonthView: React.FC<{ date: Date; events: (CalendarEvent & { color: string })[]; onDateClick?: (d: Date) => void; onEventClick?: (e: CalendarEvent) => void; }> = ({ date, events, onDateClick, onEventClick }) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; !isAfter(d, end); d = addDays(d, 1)) days.push(d);

  // group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, (CalendarEvent & { color: string })[]>();
    days.forEach(d => map.set(d.toDateString(), []));
    events.forEach(e => {
      const s = startOfDay(e.startDate);
      const eEnd = startOfDay(e.endDate);
      for (let d = s; !isAfter(d, eEnd); d = addDays(d, 1)) {
        const key = d.toDateString();
        if (map.has(key)) map.get(key)!.push(e);
      }
    });
    // sort each day by start time
    map.forEach(list => list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    return map;
  }, [events, days]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-700 text-gray-300 text-xs">
        {weekdayLabels.map(d => (
          <div key={d} className="px-2 py-2 text-center">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0 overflow-auto">
        {days.map((d) => {
          const key = d.toDateString();
          const dayEvents = eventsByDay.get(key) || [];
          const showAll = expanded[key];
          const limit = 3;
          const extra = Math.max(0, dayEvents.length - limit);
          return (
            <div
              key={key}
              className={`border border-gray-700 p-1.5 md:p-2 overflow-hidden ${!isSameMonth(d, date) ? 'bg-gray-900/40 text-gray-500' : 'bg-gray-800'} ${isToday(d) ? 'ring-1 ring-blue-500' : ''}`}
              onClick={(e) => {
                // avoid day click when clicking event button
                if ((e.target as HTMLElement).closest('[data-event]')) return;
                onDateClick?.(d);
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs md:text-sm ${isToday(d) ? 'bg-blue-600 text-white rounded-full px-2 py-0.5' : 'text-gray-300'}`}>{format(d, 'd')}</span>
              </div>
              <div className="space-y-1">
                {(showAll ? dayEvents : dayEvents.slice(0, limit)).map(ev => (
                  <button
                    key={ev._id}
                    data-event
                    className="w-full text-left truncate px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: (ev as any).color }}
                    onClick={() => onEventClick?.(ev)}
                    title={ev.title}
                  >
                    {ev.isAllDay ? 'All day • ' : ''}{ev.title}
                  </button>
                ))}
                {extra > 0 && !showAll && (
                  <button data-event className="text-xs text-blue-400 hover:text-blue-300" onClick={() => toggleExpand(key)}>+{extra} more</button>
                )}
                {extra > 0 && showAll && (
                  <button data-event className="text-xs text-blue-400 hover:text-blue-300" onClick={() => toggleExpand(key)}>Show less</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Overlap layout helper
type PositionedEvent = CalendarEvent & { top: number; height: number; left: number; width: number; color: string };

function layoutDayEvents(dayEvents: (CalendarEvent & { color: string })[], day: Date): PositionedEvent[] {
  // filter to timed events within this day
  const startBoundary = setHours(setMinutes(startOfDay(day), 0), HOURS_START);
  // const endBoundary = setHours(setMinutes(startOfDay(day), 0), HOURS_END);

  const items = dayEvents
    .filter(e => !e.isAllDay && isSameDay(e.startDate, day))
    .map(e => ({ ...e }));

  // Sort by start time
  items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Assign columns for overlap
  type Active = { end: number; col: number };
  const actives: Active[] = [];
  const positioned: (PositionedEvent & { col: number; cols: number })[] = [];

  items.forEach(ev => {
    const startMs = new Date(ev.startDate).getTime();
    const endMs = new Date(ev.endDate).getTime();
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
    positioned.push({
      ...(ev as any),
      col,
      cols,
      top: Math.max(0, (differenceInMinutes(new Date(ev.startDate), startBoundary) / ((HOURS_END - HOURS_START) * 60)) * 100),
      height: Math.max(2, (differenceInMinutes(new Date(ev.endDate), new Date(ev.startDate)) / ((HOURS_END - HOURS_START) * 60)) * 100),
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
    const nowTop = ((now.getHours() + now.getMinutes() / 60 - HOURS_START) / (HOURS_END - HOURS_START)) * 100;

    return (
      <div
        className="grid flex-1 min-h-0 h-full"
        style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {/* Time labels */}
        <div className="border-r border-gray-700 relative">
          {hours.map((h, idx) => (
            <div
              key={h}
              className={`relative h-12 md:h-9 text-[10px] md:text-xs text-gray-400${idx === 0 ? ' mt-2' : ''}`}
            >
              <div className="absolute -top-2 right-2">{format(setHours(setMinutes(new Date(), 0), h), 'HH:mm')}</div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayKey = day.toDateString();
          const allDay = (events || []).filter(e => e.isAllDay && isSameDay(e.startDate, day));
          const timed = layoutDayEvents((events || []).filter(e => isSameDay(e.startDate, day)), day);
          return (
            <div key={dayKey} className="relative border-r border-gray-700">
              {/* All-day lane */}
              <div className="h-8 border-b border-gray-700 px-1.5 py-1">
                <div className="flex gap-1 overflow-hidden">
                  {allDay.map(ev => (
                    <button
                      key={ev._id}
                      className="px-2 py-0.5 rounded text-[10px] text-white truncate"
                      style={{ backgroundColor: (ev as any).color }}
                      onClick={() => onEventClick?.(ev)}
                      title={ev.title}
                    >{ev.title}</button>
                  ))}
                </div>
              </div>

              {/* Hour grid */}
              <div className="absolute inset-x-0 bottom-0 top-8">
                {/* hour lines */}
                {hours.map((h, idx) => (
                  <div key={h} className={`border-b border-gray-700 ${idx === 0 ? 'mt-2' : 'h-12 md:h-9'}`} />
                ))}

                {/* now indicator */}
                {showNow && isToday(day) && nowTop >= 0 && nowTop <= 100 && (
                  <div className="absolute left-0 right-0" style={{ top: `${nowTop}%` }}>
                    <div className="absolute -translate-y-1/2 left-0 right-0 h-0.5 bg-red-500" />
                  </div>
                )}

                {/* events */}
                {timed.map(ev => (
                  <div
                    key={ev._id}
                    className="absolute rounded p-1 md:p-1.5 text-[10px] md:text-xs text-white overflow-hidden shadow"
                    style={{
                      top: `${ev.top}%`,
                      height: `${ev.height}%`,
                      left: `${ev.left}%`,
                      width: `${ev.width}%`,
                      backgroundColor: ev.color,
                    }}
                    onClick={() => onEventClick?.(ev)}
                    title={ev.title}
                  >
                    <div className="font-medium truncate">{ev.title}</div>
                    <div className="opacity-80 truncate">{format(ev.startDate, 'HH:mm')} – {format(ev.endDate, 'HH:mm')}</div>
                  </div>
                ))}
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
