import React from 'react';
import { TaskFormData } from '../EditForm';

interface Props {
  formData: TaskFormData;
  errors: Record<string, string>;
  shouldShowError: (field: keyof TaskFormData | 'title') => boolean;
  onChange: (field: keyof TaskFormData, value: any) => void;
  onBlur: (field: keyof TaskFormData) => void;
}

const BasicsSection: React.FC<Props> = ({ formData, errors, shouldShowError, onChange, onBlur }) => {
  return (
    <>
      <div>
        <label className="block text-body text-gray-300 mb-2">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          onBlur={() => onBlur('title')}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('title') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
          placeholder="Task title"
        />
        {shouldShowError('title') && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-body text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Task description"
        />
      </div>
    </>
  );
};

export default BasicsSection;
