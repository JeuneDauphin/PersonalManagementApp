import React from 'react';
import { ProjectFormData } from '../EditForm';

interface Props {
  formData: ProjectFormData;
  errors: Record<string, string>;
  shouldShowError: (field: keyof ProjectFormData) => boolean;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBlur: (field: keyof ProjectFormData) => void;
}

const BasicsSection: React.FC<Props> = ({ formData, errors, shouldShowError, onChange, onBlur }) => {
  return (
    <>
      <div>
        <label className="block text-body text-gray-300 mb-2">Project Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          onBlur={() => onBlur('name')}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('name') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
          placeholder="Project name"
        />
        {shouldShowError('name') && (<p className="mt-1 text-xs text-red-400">{errors.name}</p>)}
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={() => onBlur('description')}
          rows={4}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('description') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
          placeholder="Project description"
        />
        {shouldShowError('description') && (<p className="mt-1 text-xs text-red-400">{errors.description}</p>)}
      </div>
    </>
  );
};

export default BasicsSection;
