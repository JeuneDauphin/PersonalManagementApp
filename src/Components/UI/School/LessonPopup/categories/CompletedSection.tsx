import React from 'react';

const CompletedSection: React.FC<{ completed: boolean; onChange: (val: boolean) => void }> = ({ completed, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="completed"
        checked={completed}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
      />
      <label htmlFor="completed" className="text-body text-gray-300">
        Mark as completed
      </label>
    </div>
  );
};

export default CompletedSection;
