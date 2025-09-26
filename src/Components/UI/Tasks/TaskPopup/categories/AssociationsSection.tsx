import React from 'react';
import { TaskFormData } from '../EditForm';
import { Lesson, Project } from '../../../../../utils/interfaces/interfaces';

interface Props {
  formData: TaskFormData;
  onChange: (field: keyof TaskFormData, value: any) => void;
  projects: Project[];
  lessons: Lesson[];
}

const AssociationsSection: React.FC<Props> = ({ formData, onChange, projects, lessons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Project</label>
        <select
          value={formData.projectId}
          onChange={(e) => onChange('projectId', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-body text-gray-300 mb-2">Lesson</label>
        <select
          value={formData.lessonId}
          onChange={(e) => onChange('lessonId', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None</option>
          {lessons.map(l => (
            <option key={l._id} value={l._id}>{l.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AssociationsSection;
