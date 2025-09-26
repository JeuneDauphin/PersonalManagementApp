import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format as fmt } from 'date-fns';
import MiniCalendar from '../../../Calendar/MiniCalendar';
import TimePicker from '../../../TimePicker';

export interface DateTimeSectionProps {
  date: string;
  time: string;
  duration?: number;
  onChange: (patch: Partial<Pick<DateTimeSectionProps, 'date' | 'time' | 'duration'>>) => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({ date, time, duration, onChange }) => {
  const [showDateCal, setShowDateCal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">Date *</label>
        <button
          type="button"
          onClick={() => setShowDateCal(v => !v)}
          className="w-full px-3 py-2 bg-gray-700 border rounded-lg text-left text-white border-gray-600"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} />
            <span>{date ? fmt(new Date(date), 'PP') : 'Select date'}</span>
          </div>
        </button>
        {showDateCal && date && (
          <MiniCalendar
            value={new Date(date)}
            onChange={(d) => {
              const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
              onChange({ date: iso });
            }}
            onClose={() => setShowDateCal(false)}
          />
        )}
      </div>

      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">Time *</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimePicker(v => !v)}
            className="w-full px-3 py-2 bg-gray-700 border rounded-lg text-white text-left border-gray-600"
          >
            {time || '--:--'}
          </button>
          {showTimePicker && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                <TimePicker
                  value={time}
                  onChange={(hhmm) => onChange({ time: hhmm })}
                  onClose={() => setShowTimePicker(false)}
                  minuteStep={5}
                  compact
                  itemHeight={24}
                  visibleCount={3}
                  className="w-full justify-between"
                  columnWidthClass="flex-1 min-w-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Duration (minutes)</label>
        <input
          type="number"
          value={duration || ''}
          onChange={(e) => onChange({ duration: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          min="1"
          placeholder="Optional"
        />
      </div>
    </div>
  );
};

export default DateTimeSection;
