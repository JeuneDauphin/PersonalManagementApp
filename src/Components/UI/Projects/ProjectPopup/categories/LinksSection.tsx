import React from 'react';
import { GitBranch, Link as LinkIcon } from 'lucide-react';
import { ProjectFormData } from '../EditForm';

interface Props {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
}

const LinksSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">
          <GitBranch size={16} className="inline mr-2" />
          GitHub Link
        </label>
        <input
          type="url"
          value={formData.githubLink}
          onChange={(e) => onChange('githubLink', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/..."
        />
      </div>
      <div>
        <label className="block text-body text-gray-300 mb-2">
          <LinkIcon size={16} className="inline mr-2" />
          Figma Link
        </label>
        <input
          type="url"
          value={formData.figmaLink}
          onChange={(e) => onChange('figmaLink', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="https://figma.com/..."
        />
      </div>
    </div>
  );
};

export default LinksSection;
