import React from 'react';
import { format as fmt } from 'date-fns';
import { Calendar } from 'lucide-react';
import MiniCalendar from '../../../Calendar/MiniCalendar';
import TimePicker from '../../../TimePicker';
import { ProjectFormData } from '../EditForm';

interface Props {
  formData: ProjectFormData;
  errors: Record<string, string>;
  shouldShowError: (field: keyof ProjectFormData | 'endDate') => boolean;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  showStartCal: boolean; setShowStartCal: (v: boolean) => void;
  showEndCal: boolean; setShowEndCal: (v: boolean) => void;
  showStartTime: boolean; setShowStartTime: (v: boolean) => void;
  showEndTime: boolean; setShowEndTime: (v: boolean) => void;
}

const DatesSection: React.FC<Props> = ({
  formData, errors, shouldShowError, onChange,
  showStartCal, setShowStartCal,
  showEndCal, setShowEndCal,
  showStartTime, setShowStartTime,
  showEndTime, setShowEndTime,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      {/* Start */}
      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">Start *</label>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowStartCal(!showStartCal); setShowEndCal(false); }}
            className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('startDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="whitespace-nowrap">{formData.startDate ? fmt(new Date(formData.startDate), 'PP') : 'Pick date'}</span>
            </div>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowStartTime(!showStartTime); setShowEndTime(false); }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
              title="Pick time"
            >
              {formData.startDate ? fmt(new Date(formData.startDate), 'HH:mm') : '--:--'}
            </button>
            {showStartTime && formData.startDate && (
              <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                  <TimePicker
                    value={fmt(new Date(formData.startDate), 'HH:mm')}
                    onChange={(hhmm: string) => {
                      const [hh, mm] = hhmm.split(':').map(Number);
                      const d = new Date(formData.startDate);
                      d.setHours(hh, mm, 0, 0);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      onChange('startDate', iso);
                    }}
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
        </div>
        {showStartCal && formData.startDate && (
          <MiniCalendar
            value={new Date(formData.startDate)}
            onChange={(d: Date) => {
              const base = new Date(formData.startDate);
              d.setHours(base.getHours(), base.getMinutes(), 0, 0);
              const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              onChange('startDate', iso);
            }}
            onClose={() => setShowStartCal(false)}
          />
        )}
        {shouldShowError('startDate') && (<p className="mt-1 text-xs text-red-400">{errors.startDate}</p>)}
      </div>
      {/* End */}
      <div className="relative">
        <label className="block text-body text-gray-300 mb-2">End</label>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowEndCal(!showEndCal); setShowStartCal(false); }}
            className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('endDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="whitespace-nowrap">{formData.endDate ? fmt(new Date(formData.endDate), 'PP') : 'No end date'}</span>
            </div>
          </button>
          <div className="relative">
            <button
              type="button"
              disabled={!formData.endDate}
              onClick={() => { if (formData.endDate) { setShowEndTime(!showEndTime); setShowStartTime(false); } }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left disabled:opacity-50 disabled:cursor-not-allowed"
              title="Pick time"
            >
              {formData.endDate ? fmt(new Date(formData.endDate), 'HH:mm') : '--:--'}
            </button>
            {showEndTime && formData.endDate && (
              <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="bg-gray-800 rounded-md border border-gray-700 w-full">
                  <TimePicker
                    value={fmt(new Date(formData.endDate), 'HH:mm')}
                    onChange={(hhmm: string) => {
                      const [hh, mm] = hhmm.split(':').map(Number);
                      const d = new Date(formData.endDate);
                      d.setHours(hh, mm, 0, 0);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      onChange('endDate', iso);
                    }}
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
        </div>
        {showEndCal && (
          <MiniCalendar
            value={formData.endDate ? new Date(formData.endDate) : (formData.startDate ? new Date(formData.startDate) : new Date())}
            onChange={(d: Date) => {
              if (!formData.startDate) return;
              const base = formData.endDate ? new Date(formData.endDate) : new Date(formData.startDate);
              d.setHours(base.getHours(), base.getMinutes(), 0, 0);
              const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              onChange('endDate', iso);
            }}
            onClose={() => setShowEndCal(false)}
            minDate={formData.startDate ? new Date(formData.startDate) : undefined}
          />
        )}
        {shouldShowError('endDate') && (<p className="mt-1 text-xs text-red-400">{errors.endDate}</p>)}
      </div>
    </div>
  );
};

export default DatesSection;
