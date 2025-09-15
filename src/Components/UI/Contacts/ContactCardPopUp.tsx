
// Contact card popup modal for viewing/editing contact details
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, Github, Linkedin, Twitter, School, Users as UsersIcon } from 'lucide-react';
import { Contact } from '../../../utils/interfaces/interfaces';
import { ContactType } from '../../../utils/types/types';
import Button from '../Button';

interface ContactCardPopUpProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contact: Contact) => void;
  onDelete?: () => void;
  // If true and a contact is provided, open directly in edit mode
  startInEdit?: boolean;
}

const ContactCardPopUp: React.FC<ContactCardPopUpProps> = ({
  contact,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    type: 'personal' as ContactType,
    notes: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
    },
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        position: contact.position || '',
        type: contact.type,
        notes: contact.notes || '',
        socialLinks: {
          linkedin: contact.socialLinks?.linkedin || '',
          twitter: contact.socialLinks?.twitter || '',
          github: contact.socialLinks?.github || '',
        },
      });
      setIsEditing(!!startInEdit);
    } else {
      // New contact
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        type: 'personal',
        notes: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: '',
        },
      });
      setIsEditing(true);
    }
  }, [contact, startInEdit]);

  if (!isOpen) return null;

  const validate = (data: typeof formData) => {
    const nextErrors: Record<string, string> = {};
    if (!data.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!data.lastName.trim()) nextErrors.lastName = 'Last name is required';
    return nextErrors;
  };

  const isInvalid = React.useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setErrors(validate(next));
      return next;
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    // Filter out empty social links
    const socialLinks = Object.entries(formData.socialLinks)
      .filter(([_, url]) => url.trim())
      .reduce((acc, [platform, url]) => ({ ...acc, [platform]: url }), {});

    const contactData: Contact = {
      _id: contact?._id || `temp-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      position: formData.position || undefined,
      type: formData.type,
      notes: formData.notes || undefined,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      createdAt: contact?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(contactData);
  };

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: string) => (touched[field] || attemptedSubmit) && !!errors[field];

  const getTypeColor = (type: ContactType) => {
    switch (type) {
      case 'personal': return 'text-blue-400 bg-blue-600';
      case 'work': return 'text-green-400 bg-green-600';
      case 'school': return 'text-purple-400 bg-purple-600';
      case 'client': return 'text-orange-400 bg-orange-600';
      case 'vendor': return 'text-red-400 bg-red-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getTypeIcon = (type: ContactType) => {
    switch (type) {
      case 'personal': return <User size={16} className="text-white" />;
      case 'work': return <Briefcase size={16} className="text-white" />;
      case 'school': return <School size={16} className="text-white" />;
      case 'client': return <UsersIcon size={16} className="text-white" />;
      case 'vendor': return <Building size={16} className="text-white" />;
      default: return <User size={16} className="text-white" />;
    }
  };

  const getContextualFields = (type: ContactType) => {
    switch (type) {
      case 'work':
      case 'client':
      case 'vendor':
        return { companyLabel: 'Company', positionLabel: 'Position' };
      case 'school':
        return { companyLabel: 'School/Institution', positionLabel: 'Subject/Role' };
      case 'personal':
      default:
        return { companyLabel: 'Organization', positionLabel: 'Role' };
    }
  };

  const contextualFields = getContextualFields(formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-h1 font-semibold text-white">
            {contact ? (isEditing ? 'Edit Contact' : 'Contact Details') : 'New Contact'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            // Edit Mode
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={() => markTouched('firstName')}
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
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={() => markTouched('lastName')}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('lastName') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                    placeholder="Last name"
                  />
                  {shouldShowError('lastName') && (
                    <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Type */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as ContactType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="school">School</option>
                  <option value="client">Client</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Organization Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">{contextualFields.companyLabel}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={contextualFields.companyLabel.toLowerCase()}
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">{contextualFields.positionLabel}</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={contextualFields.positionLabel.toLowerCase()}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Social Links</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Linkedin size={16} className="text-blue-500" />
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter size={16} className="text-blue-400" />
                    <input
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Github size={16} className="text-gray-400" />
                    <input
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this contact..."
                />
              </div>
            </>
          ) : (
            // View Mode
            <>
              {/* Header Info */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={32} className="text-gray-400" />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {contact?.firstName} {contact?.lastName}
                  </h1>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(contact?.type || 'personal')}`}>
                    {getTypeIcon(contact?.type || 'personal')}
                    <span>{contact?.type?.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contact?.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">Email</div>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-body text-white hover:text-blue-400 transition-colors"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">Phone</div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-body text-white hover:text-blue-400 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {contact?.company && (
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">
                        {getContextualFields(contact.type).companyLabel}
                      </div>
                      <div className="text-body text-white">{contact.company}</div>
                    </div>
                  </div>
                )}

                {contact?.position && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">
                        {getContextualFields(contact.type).positionLabel}
                      </div>
                      <div className="text-body text-white">{contact.position}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {contact?.socialLinks && Object.values(contact.socialLinks).some(Boolean) && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-3">Social Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {contact.socialLinks.linkedin && (
                      <a
                        href={contact.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                      >
                        <Linkedin size={16} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {contact.socialLinks.twitter && (
                      <a
                        href={contact.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg text-white transition-colors"
                      >
                        <Twitter size={16} />
                        <span>Twitter</span>
                      </a>
                    )}
                    {contact.socialLinks.github && (
                      <a
                        href={contact.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <Github size={16} />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact?.notes && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-2">Notes</h3>
                  <p className="text-body text-gray-400 leading-relaxed">{contact.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <div className="text-small text-gray-400">Added</div>
                  <div className="text-body text-white">
                    {contact && new Date(contact.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-small text-gray-400">Last Updated</div>
                  <div className="text-body text-white">
                    {contact && new Date(contact.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {contact && !isEditing && (
              <Button
                text="Edit"
                onClick={() => setIsEditing(true)}
                variant="outline"
              />
            )}
            {contact && !isEditing && onDelete && (
              <Button
                text="Delete"
                onClick={onDelete}
                variant="outline"
                action="delete"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button
                  text="Cancel"
                  onClick={() => contact ? setIsEditing(false) : onClose()}
                  variant="outline"
                />
                <Button
                  text="Save"
                  onClick={handleSave}
                  variant="primary"
                  className={isInvalid ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </>
            )}
            {!isEditing && (
              <Button
                text="Close"
                onClick={onClose}
                variant="outline"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCardPopUp;
