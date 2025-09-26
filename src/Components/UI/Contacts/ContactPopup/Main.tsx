import React, { useEffect, useMemo, useState } from 'react';
import ModalFrame from './ModalFrame';
import EditForm, { ContactFormData } from './EditForm';
import ViewDetails from './ViewDetails';
import Button from '../../Button';
import { Contact } from '../../../../utils/interfaces/interfaces';
import { ContactType } from '../../../../utils/types/types';

export interface ContactCardPopUpProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contact: Contact) => void;
  onDelete?: () => void;
  startInEdit?: boolean;
}

const emptyForm: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  type: 'personal',
  notes: '',
  socialLinks: { linkedin: '', twitter: '', github: '' },
};

const Main: React.FC<ContactCardPopUpProps> = ({ contact, isOpen, onClose, onSave, onDelete, startInEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);
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
      setFormData(emptyForm);
      setIsEditing(true);
    }
    setTouched({});
    setErrors({});
    setAttemptedSubmit(false);
  }, [contact, startInEdit]);

  const validate = (data: ContactFormData) => {
    const next: Record<string, string> = {};
    if (!data.firstName.trim()) next.firstName = 'First name is required';
    if (!data.lastName.trim()) next.lastName = 'Last name is required';
    return next;
  };

  const isInvalid = useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);

  const handleChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value } as ContactFormData;
      setErrors(validate(next));
      return next;
    });
  };

  const handleSocialChange = (platform: keyof ContactFormData['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const markTouched = (field: keyof ContactFormData) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: string) => (touched[field] || attemptedSubmit) && !!errors[field];

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    const socialLinks = Object.entries(formData.socialLinks)
      .filter(([, url]) => url.trim())
      .reduce((acc, [platform, url]) => ({ ...acc, [platform]: url }), {} as Record<string, string>);

    const data: Contact = {
      _id: contact?._id || `temp-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      position: formData.position || undefined,
      type: formData.type as ContactType,
      notes: formData.notes || undefined,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
      createdAt: contact?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave?.(data);
  };

  const title = contact ? (isEditing ? 'Edit Contact' : 'Contact Details') : 'New Contact';

  return (
    <ModalFrame
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footerLeft={contact && !isEditing ? (
        <>
          <Button text="Edit" onClick={() => setIsEditing(true)} variant="outline" />
          {onDelete && (
            <Button text="Delete" onClick={onDelete} variant="outline" action="delete" />
          )}
        </>
      ) : null}
      footerRight={isEditing ? (
        <>
          <Button text="Cancel" onClick={() => (contact ? setIsEditing(false) : onClose())} variant="outline" />
          <Button text="Save" onClick={handleSave} variant="primary" className={isInvalid ? 'opacity-50 cursor-not-allowed' : ''} />
        </>
      ) : (
        <Button text="Close" onClick={onClose} variant="outline" />
      )}
    >
      {isEditing ? (
        <EditForm
          formData={formData}
          errors={errors}
          shouldShowError={shouldShowError}
          onChange={handleChange}
          onSocialChange={handleSocialChange}
          onBlur={markTouched}
        />
      ) : (
        contact ? <ViewDetails contact={contact} /> : null
      )}
    </ModalFrame>
  );
};

export default Main;
