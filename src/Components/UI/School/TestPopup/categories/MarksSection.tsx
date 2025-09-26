import React from 'react';

export interface MarksSectionProps {
  totalMarks?: number;
  achievedMarks?: number;
  grade: string;
  onChange: (patch: Partial<MarksSectionProps>) => void;
}

const MarksSection: React.FC<MarksSectionProps> = ({ totalMarks, achievedMarks, grade, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Total Marks</label>
        <input
          type="number"
          value={totalMarks ?? ''}
          onChange={(e) => onChange({ totalMarks: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          min="1"
        />
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Achieved Marks</label>
        <input
          type="number"
          value={achievedMarks ?? ''}
          onChange={(e) => onChange({ achievedMarks: e.target.value ? parseFloat(e.target.value) : undefined })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.1"
          placeholder="Leave empty if not graded"
        />
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Grade</label>
        <input
          type="text"
          value={grade}
          onChange={(e) => onChange({ grade: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="A, B+, etc."
        />
      </div>
    </div>
  );
};

export default MarksSection;
