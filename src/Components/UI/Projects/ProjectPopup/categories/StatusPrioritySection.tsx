import React from 'react';
import { ProjectFormData } from '../EditForm';
import { Priority, ProjectStatus } from '../../../../../utils/types/types';

interface Props {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
}

const StatusPrioritySection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => onChange('status', e.target.value as ProjectStatus)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-body text-gray-300 mb-2">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => onChange('priority', e.target.value as Priority)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>
  );
};

export default StatusPrioritySection;
