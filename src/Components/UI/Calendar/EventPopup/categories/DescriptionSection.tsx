import React from 'react';

const DescriptionSection: React.FC<{ value: string; onChange: (v: string) => void; }> = ({ value, onChange }) => (
  <div>
    <label className="block text-body text-gray-300 mb-2">Description</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
      placeholder="Event description"
    />
  </div>
);

export default DescriptionSection;
