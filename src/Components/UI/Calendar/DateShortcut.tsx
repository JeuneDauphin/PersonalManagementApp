// Mini calendar component for quick date navigation
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../../../utils/interfaces/interfaces';
import {
  startOfMonth,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';

interface DateShortcutProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events?: CalendarEvent[]; // events provided by parent to reflect live updates
}

const DateShortcut: React.FC<DateShortcutProps> = ({
  selectedDate,
  onDateSelect,
  events = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Always show 6 rows (6 weeks = 42 days)
  const endDate = addDays(startDate, 41);

  // Keep the mini calendar in sync with the externally selected date
  useEffect(() => {
    // If selectedDate moves to another month/year, update the visible month
    if (
      selectedDate.getMonth() !== currentMonth.getMonth() ||
      selectedDate.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return (events || []).some(evt => {
      const eventStart = new Date(evt.startDate);
      const eventEnd = new Date(evt.endDate);
      const isMultiDay = !isSameDay(eventStart, eventEnd);
      return isSameDay(eventStart, date) || (isMultiDay && isSameDay(eventEnd, date));
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  const renderDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayToRender = day;
      const isCurrentMonth = isSameMonth(dayToRender, monthStart);
      const isSelected = isSameDay(dayToRender, selectedDate);
      const isToday = isSameDay(dayToRender, new Date());
      const dayHasEvents = hasEvents(dayToRender);

      days.push(
        <button
          key={dayToRender.toString()}
          onClick={() => {
            onDateSelect(dayToRender);
            // If clicking a day outside the current month, move the mini calendar to that month immediately
            if (!isSameMonth(dayToRender, currentMonth)) {
              setCurrentMonth(dayToRender);
            }
          }}
          className={`
            relative w-8 h-8 text-small rounded-lg transition-colors cursor-pointer
            ${!isCurrentMonth
              ? 'text-gray-600 hover:text-gray-400'
              : isSelected
                ? 'bg-blue-600 text-white'
                : isToday
                  ? 'bg-gray-700 text-white border border-gray-500'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }
          `}
        >
          {format(dayToRender, 'd')}
          {dayHasEvents && isCurrentMonth && (
            <div className={`
              absolute bottom-0.5 left-1/2 transform -translate-x-1/2
              w-1 h-1 rounded-full
              ${isSelected ? 'bg-white' : 'bg-blue-400'}
            `} />
          )}
        </button>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  const renderWeeks = () => {
    const days = renderDays();
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <div key={i} className="grid grid-cols-7 gap-1">
          {days.slice(i, i + 7)}
        </div>
      );
    }

    return weeks;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        <h3 className="text-body font-medium text-white select-none cursor-default">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today button */}
      <div className="mb-3">
        <button
          onClick={goToToday}
          className="w-full px-3 py-1.5 text-small text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2 select-none cursor-default">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {renderWeeks()}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Has events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateShortcut;
