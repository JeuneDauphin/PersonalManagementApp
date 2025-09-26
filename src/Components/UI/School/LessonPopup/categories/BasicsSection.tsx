import React from 'react';
import { LessonType } from '../../../../../utils/types/types';

export interface BasicsSectionProps {
  title: string;
  subject: string;
  type: LessonType;
  onChange: (patch: Partial<Pick<BasicsSectionProps, 'title' | 'subject' | 'type'>>) => void;
}

const BasicsSection: React.FC<BasicsSectionProps> = ({ title, subject, type, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Lesson title"
        />
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Subject name"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-body text-gray-300 mb-2">Type</label>
        <select
          value={type}
          onChange={(e) => onChange({ type: e.target.value as LessonType })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="lecture">Lecture</option>
          <option value="seminar">Seminar</option>
          <option value="lab">Lab</option>
          <option value="tutorial">Tutorial</option>
          <option value="exam">Exam</option>
        </select>
      </div>
    </div>
  );
};

export default BasicsSection;
