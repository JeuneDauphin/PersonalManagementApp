import React from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { ContactType } from '../../../../utils/types/types';
import { getContextualFields } from './contextualFields';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  type: ContactType;
  notes: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
  };
}

interface EditFormProps {
  formData: ContactFormData;
  errors: Record<string, string>;
  shouldShowError: (field: string) => boolean;
  onChange: (field: keyof ContactFormData, value: any) => void;
  onSocialChange: (platform: keyof ContactFormData['socialLinks'], value: string) => void;
  onBlur: (field: keyof ContactFormData) => void;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  errors,
  shouldShowError,
  onChange,
  onSocialChange,
  onBlur,
}) => {
  const contextual = getContextualFields(formData.type);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-body text-gray-300 mb-2">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            onBlur={() => onBlur('firstName')}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('firstName') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
            placeholder="First name"
          />
          {shouldShowError('firstName') && (
            <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-body text-gray-300 mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            onBlur={() => onBlur('lastName')}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('lastName') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
            placeholder="Last name"
          />
          {shouldShowError('lastName') && (
            <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Type</label>
        <select
          value={formData.type}
          onChange={(e) => onChange('type', e.target.value as ContactType)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="school">School</option>
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-body text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-body text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-body text-gray-300 mb-2">{contextual.companyLabel}</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => onChange('company', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder={contextual.companyLabel.toLowerCase()}
          />
        </div>
        <div>
          <label className="block text-body text-gray-300 mb-2">{contextual.positionLabel}</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => onChange('position', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            placeholder={contextual.positionLabel.toLowerCase()}
          />
        </div>
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Social Links</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Linkedin size={16} className="text-blue-500" />
            <input
              type="url"
              value={formData.socialLinks.linkedin}
              onChange={(e) => onSocialChange('linkedin', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="flex items-center gap-3">
            <Twitter size={16} className="text-blue-400" />
            <input
              type="url"
              value={formData.socialLinks.twitter}
              onChange={(e) => onSocialChange('twitter', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://twitter.com/username"
            />
          </div>
          <div className="flex items-center gap-3">
            <Github size={16} className="text-gray-400" />
            <input
              type="url"
              value={formData.socialLinks.github}
              onChange={(e) => onSocialChange('github', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes about this contact..."
        />
      </div>
    </>
  );
};

export default EditForm;
