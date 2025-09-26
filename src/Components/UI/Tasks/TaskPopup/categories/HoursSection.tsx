import React from 'react';
import { TaskFormData } from '../EditForm';

interface Props {
  formData: TaskFormData;
  onChange: (field: keyof TaskFormData, value: any) => void;
}

const HoursSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Estimated Hours</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={formData.estimatedHours}
          onChange={(e) => onChange('estimatedHours', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-body text-gray-300 mb-2">Actual Hours</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={formData.actualHours}
          onChange={(e) => onChange('actualHours', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default HoursSection;
