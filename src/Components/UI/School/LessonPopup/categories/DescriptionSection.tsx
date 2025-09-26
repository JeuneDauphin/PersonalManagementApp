import React from 'react';

const DescriptionSection: React.FC<{ description: string; onChange: (value: string) => void }> = ({ description, onChange }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Description</label>
      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        placeholder="Lesson description or notes"
      />
    </div>
  );
};

export default DescriptionSection;
