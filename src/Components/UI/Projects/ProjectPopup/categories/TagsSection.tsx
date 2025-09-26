import React from 'react';
import Button from '../../../Button';
import { Tag as TagIcon } from 'lucide-react';
import { ProjectFormData } from '../EditForm';

interface Props {
  formData: ProjectFormData;
  tagInput: string;
  setTagInput: (s: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

const TagsSection: React.FC<Props> = ({ formData, tagInput, setTagInput, onAddTag, onRemoveTag }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Tags</label>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Add a tag..."
        />
        <Button text="Add" onClick={onAddTag} variant="outline" size="sm" />
      </div>
      {formData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small">
              <TagIcon size={12} />
              {tag}
              <button onClick={() => onRemoveTag(tag)} className="text-gray-400 hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsSection;
