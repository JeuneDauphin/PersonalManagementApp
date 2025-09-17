import React, { useState } from 'react';
import { addDays, addMonths, endOfMonth, endOfWeek, format as fmt, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

/**
 * Reusable mini calendar date picker (no manual typing) used across Event, Project, Lesson popups.
 */
export interface MiniCalendarProps {
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  minDate?: Date;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, onClose, minDate, className }) => {
  const [cursor, setCursor] = useState<Date>(startOfMonth(value || new Date()));
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`absolute z-50 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 w-72 ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <button className="px-2 py-1 hover:bg-gray-700 rounded" onClick={() => setCursor(addMonths(cursor, -1))}>{'<'}</button>
        <div className="text-white font-medium">{fmt(cursor, 'MMMM yyyy')}</div>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" onClick={() => setCursor(addMonths(cursor, 1))}>{'>'}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
        {weekdays.map(w => <div key={w}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const disabled = minDate ? d < startOfDay(minDate) : false;
          const inMonth = isSameMonth(d, cursor);
          const selected = isSameDay(d, value);
          return (
            <button
              key={d.toISOString()}
              disabled={disabled}
              onClick={() => { onChange(d); onClose(); }}
              className={`h-8 rounded flex items-center justify-center ${
                selected ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-500'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {fmt(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
