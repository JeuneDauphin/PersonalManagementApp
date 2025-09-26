import React from 'react';
import Button from '../../../Button';
import { TaskFormData } from '../EditForm';

interface Props {
  formData: TaskFormData;
  tagInput: string;
  setTagInput: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

const TagsSection: React.FC<Props> = ({ formData, tagInput, setTagInput, onAddTag, onRemoveTag }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {formData.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-small rounded flex items-center gap-1">
            {tag}
            <button onClick={() => onRemoveTag(tag)} className="text-gray-400 hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Add tag"
        />
        <Button text="Add" onClick={onAddTag} variant="outline" size="sm" disabled={!tagInput.trim()} />
      </div>
    </div>
  );
};

export default TagsSection;
