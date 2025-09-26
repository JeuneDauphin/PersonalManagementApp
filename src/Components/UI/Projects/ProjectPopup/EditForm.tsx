import React from 'react';
import { Contact } from '../../../../utils/interfaces/interfaces';
import { Priority, ProjectStatus } from '../../../../utils/types/types';
import BasicsSection from './categories/BasicsSection';
import StatusPrioritySection from './categories/StatusPrioritySection';
import DatesSection from './categories/DatesSection';
import LinksSection from './categories/LinksSection';
import MailingSection from './categories/MailingSection';
import TagsSection from './categories/TagsSection';
import CollaboratorsSection from './categories/CollaboratorsSection';

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  progress: number;
  tags: string[];
  githubLink: string;
  figmaLink: string;
  mailingList: string;
  tasks: string[];
  collaborators: string[];
}

interface EditFormProps {
  formData: ProjectFormData;
  errors: Record<string, string>;
  shouldShowError: (field: keyof ProjectFormData | 'endDate') => boolean;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBlur: (field: keyof ProjectFormData) => void;
  tagInput: string;
  setTagInput: (s: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  showStartCal: boolean;
  setShowStartCal: (v: boolean) => void;
  showEndCal: boolean;
  setShowEndCal: (v: boolean) => void;
  showStartTime: boolean;
  setShowStartTime: (v: boolean) => void;
  showEndTime: boolean;
  setShowEndTime: (v: boolean) => void;
  contacts: Contact[];
  contactsLoading?: boolean;
  contactSearch: string;
  setContactSearch: (s: string) => void;
  filteredContacts: Contact[];
  toggleContact: (id: string) => void;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  errors,
  shouldShowError,
  onChange,
  onBlur,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  showStartCal,
  setShowStartCal,
  showEndCal,
  setShowEndCal,
  showStartTime,
  setShowStartTime,
  showEndTime,
  setShowEndTime,
  contacts,
  contactsLoading,
  contactSearch,
  setContactSearch,
  filteredContacts,
  toggleContact,
}) => {
  return (
    <>
      <BasicsSection
        formData={formData}
        errors={errors}
        shouldShowError={(f) => shouldShowError(f)}
        onChange={onChange}
        onBlur={onBlur}
      />

      <StatusPrioritySection formData={formData} onChange={onChange} />

      <DatesSection
        formData={formData}
        errors={errors}
        shouldShowError={shouldShowError}
        onChange={onChange}
        showStartCal={showStartCal}
        setShowStartCal={setShowStartCal}
        showEndCal={showEndCal}
        setShowEndCal={setShowEndCal}
        showStartTime={showStartTime}
        setShowStartTime={setShowStartTime}
        showEndTime={showEndTime}
        setShowEndTime={setShowEndTime}
      />

      {/* Progress (readonly for existing) handled in Main if needed */}

      <LinksSection formData={formData} onChange={onChange} />

      <MailingSection formData={formData} onChange={onChange} />

      <TagsSection
        formData={formData}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />

      <CollaboratorsSection
        formData={formData}
        contacts={contacts}
        contactsLoading={contactsLoading}
        contactSearch={contactSearch}
        setContactSearch={setContactSearch}
        filteredContacts={filteredContacts}
        toggleContact={toggleContact}
      />
    </>
  );
};

export default EditForm;
