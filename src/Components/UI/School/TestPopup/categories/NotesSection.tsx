import React from 'react';

const NotesSection: React.FC<{ notes: string; onChange: (v: string) => void }> = ({ notes, onChange }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        placeholder="Additional notes or study tips"
      />
    </div>
  );
};

export default NotesSection;
