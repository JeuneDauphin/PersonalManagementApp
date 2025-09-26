import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format as fmt } from 'date-fns';
import MiniCalendar from '../../MiniCalendar';
import TimePicker from '../../../TimePicker';

// Local helpers (migrated from utils)
const toIsoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const withDateFrom = (original: string, newDate: Date) => {
  const base = new Date(original || Date.now());
  const merged = new Date(newDate);
  merged.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return toIsoLocal(merged);
};
const withTime = (original: string, timeHHmm: string) => {
  const [hh, mm] = timeHHmm.split(':').map(Number);
  const base = new Date(original || Date.now());
  base.setHours(hh, mm, 0, 0);
  return toIsoLocal(base);
};

const DateTimeSection: React.FC<{
  isAllDay: boolean;
  startDate: string;
  endDate: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  errors: { startDate?: string; endDate?: string };
}> = ({ isAllDay, startDate, endDate, onChangeStart, onChangeEnd, errors }) => {
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">Start</label>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowStartCal(v => !v); setShowEndCal(false); }}
            className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${errors.startDate ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} />
              <span className="whitespace-nowrap">{fmt(new Date(startDate), 'PP')}</span>
            </div>
          </button>
          {!isAllDay && (
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowStartTime(v => !v); setShowEndTime(false); }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
                title="Pick time"
              >
                {fmt(new Date(startDate), 'HH:mm')}
              </button>
              {showStartTime && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                    <TimePicker
                      value={fmt(new Date(startDate), 'HH:mm')}
                      onChange={(hhmm: string) => onChangeStart(withTime(startDate, hhmm))}
                      onClose={() => setShowStartTime(false)}
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
          )}
        </div>
        {showStartCal && (
          <MiniCalendar
            value={new Date(startDate)}
            onChange={(d: Date) => onChangeStart(withDateFrom(startDate, d))}
            onClose={() => setShowStartCal(false)}
          />
        )}
        {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate}</p>}
      </div>

      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">End</label>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowEndCal(v => !v); setShowStartCal(false); }}
            className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${errors.endDate ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} />
              <span className="whitespace-nowrap">{fmt(new Date(endDate), 'PP')}</span>
            </div>
          </button>
          {!isAllDay && (
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowEndTime(v => !v); setShowStartTime(false); }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
                title="Pick time"
              >
                {fmt(new Date(endDate), 'HH:mm')}
              </button>
              {showEndTime && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                    <TimePicker
                      value={fmt(new Date(endDate), 'HH:mm')}
                      onChange={(hhmm: string) => onChangeEnd(withTime(endDate, hhmm))}
                      onClose={() => setShowEndTime(false)}
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
          )}
        </div>
        {showEndCal && (
          <MiniCalendar
            value={new Date(endDate)}
            onChange={(d: Date) => onChangeEnd(withDateFrom(endDate, d))}
            onClose={() => setShowEndCal(false)}
            minDate={new Date(startDate)}
          />
        )}
        {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>}
      </div>
    </div>
  );
};

export default DateTimeSection;
