import React from 'react';
import { TaskFormData } from '../EditForm';

interface Props {
  presetTypes: string[];
  typeSelect: string;
  setTypeSelect: (v: string) => void;
  customType: string;
  setCustomType: (v: string) => void;
  onChange: (field: keyof TaskFormData, value: any) => void;
}

const TypeSection: React.FC<Props> = ({ presetTypes, typeSelect, setTypeSelect, customType, setCustomType, onChange }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Type</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select
          value={typeSelect}
          onChange={(e) => {
            const v = e.target.value;
            setTypeSelect(v);
            if (v !== '__custom__') onChange('type', v);
          }}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select type</option>
          {presetTypes.map((pt) => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
          <option value="__custom__">Custom…</option>
        </select>
        {typeSelect === '__custom__' && (
          <input
            type="text"
            value={customType}
            onChange={(e) => { setCustomType(e.target.value); onChange('type', e.target.value); }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom type"
          />
        )}
      </div>
    </div>
  );
};

export default TypeSection;
