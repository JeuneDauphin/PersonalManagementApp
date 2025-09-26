import React from 'react';

const AllDayToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; }> = ({ checked, onChange }) => (
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      id="allDay"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
    />
    <label htmlFor="allDay" className="text-body text-gray-300">All day event</label>
  </div>
);

export default AllDayToggle;
