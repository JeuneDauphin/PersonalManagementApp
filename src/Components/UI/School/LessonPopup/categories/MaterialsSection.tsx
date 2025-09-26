import React, { useState } from 'react';
import Button from '../../../Button';
import { FileText, X } from 'lucide-react';

export interface MaterialsSectionProps {
  materials: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}

const MaterialsSection: React.FC<MaterialsSectionProps> = ({ materials, onAdd, onRemove }) => {
  const [input, setInput] = useState('');
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Materials</label>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), input.trim() && onAdd(input), setInput(''))}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Add material URL..."
        />
        <Button text="Add" variant="outline" size="sm" onClick={() => input.trim() && (onAdd(input), setInput(''))} />
      </div>
      {materials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {materials.map((material, index) => (
            <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small">
              <FileText size={12} />
              <a href={material} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Material {index + 1}
              </a>
              <button onClick={() => onRemove(material)} className="text-gray-400 hover:text-white">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsSection;
