import React from 'react';

const TitleSection: React.FC<{ value: string; onChange: (v: string) => void; error?: string; onBlur?: () => void; }> = ({ value, onChange, error, onBlur }) => (
  <div>
    <label className="block text-body text-gray-300 mb-2">Title *</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
      placeholder="Event title"
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export default TitleSection;
