import React from 'react';
import { ProjectFormData } from '../EditForm';

interface Props {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
}

const MailingSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Mailing List</label>
      <input
        type="email"
        value={formData.mailingList}
        onChange={(e) => onChange('mailingList', e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        placeholder="project@example.com"
      />
    </div>
  );
};

export default MailingSection;
