import React from 'react';
import MiniCalendar from '../../../Calendar/MiniCalendar';
import TimePicker from '../../../TimePicker';
import { TaskFormData } from '../EditForm';

interface Props {
  formData: TaskFormData;
  showDueCal: boolean;
  setShowDueCal: (v: boolean) => void;
  showDueTime: boolean;
  setShowDueTime: (v: boolean) => void;
  withDateFrom: (original: string, newDate: Date) => string;
  withTime: (original: string, timeHHmm: string) => string;
  onChange: (field: keyof TaskFormData, value: any) => void;
}

const DueDateSection: React.FC<Props> = ({ formData, showDueCal, setShowDueCal, showDueTime, setShowDueTime, withDateFrom, withTime, onChange }) => {
  return (
    <div className="relative">
      <label className="block text-body text-gray-300 mb-2">Due Date</label>
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDueCal(!showDueCal)}
          className="flex-1 min-w-0 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left"
        >
          {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Select date'}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDueTime(!showDueTime)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
            title="Pick time"
          >
            {formData.dueDate ? new Date(formData.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </button>
          {showDueTime && formData.dueDate && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                <TimePicker
                  value={new Date(formData.dueDate).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  onChange={(hhmm) => onChange('dueDate', withTime(formData.dueDate, hhmm))}
                  onClose={() => setShowDueTime(false)}
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
      {showDueCal && formData.dueDate && (
        <MiniCalendar
          value={new Date(formData.dueDate)}
          onChange={(d) => onChange('dueDate', withDateFrom(formData.dueDate, d))}
          onClose={() => setShowDueCal(false)}
        />
      )}
    </div>
  );
};

export default DueDateSection;
