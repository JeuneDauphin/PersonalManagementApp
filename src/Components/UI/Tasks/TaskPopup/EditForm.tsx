import React from 'react';
import { Contact, Lesson, Project } from '../../../../utils/interfaces/interfaces';
import { Priority, Status } from '../../../../utils/types/types';
import BasicsSection from './categories/BasicsSection';
import StatusPrioritySection from './categories/StatusPrioritySection';
import TypeSection from './categories/TypeSection';
import DueDateSection from './categories/DueDateSection';
import AssociationsSection from './categories/AssociationsSection';
import HoursSection from './categories/HoursSection';
import TagsSection from './categories/TagsSection';
import ContactsSection from './categories/ContactsSection';

export type TaskFormData = {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  type: string;
  dueDate: string; // ISO local (YYYY-MM-DDTHH:mm)
  projectId: string;
  lessonId: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  contacts: string[];
};

interface EditFormProps {
  formData: TaskFormData;
  errors: Record<string, string>;
  shouldShowError: (field: keyof TaskFormData | 'title') => boolean;
  onChange: (field: keyof TaskFormData, value: any) => void;
  onBlur: (field: keyof TaskFormData) => void;

  // Type selection controls
  presetTypes: string[];
  typeSelect: string;
  setTypeSelect: (val: string) => void;
  customType: string;
  setCustomType: (val: string) => void;

  // Date/time pickers
  showDueCal: boolean;
  setShowDueCal: (v: boolean) => void;
  showDueTime: boolean;
  setShowDueTime: (v: boolean) => void;
  withDateFrom: (original: string, newDate: Date) => string;
  withTime: (original: string, timeHHmm: string) => string;

  // Tags
  tagInput: string;
  setTagInput: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;

  // Associations
  projects: Project[];
  lessons: Lesson[];

  // Contacts
  contactsLoading?: boolean;
  contactSearch: string;
  setContactSearch: (v: string) => void;
  filteredContacts: Contact[];
  toggleContact: (id: string) => void;
  getContactName: (id: string) => string;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  errors,
  shouldShowError,
  onChange,
  onBlur,
  presetTypes,
  typeSelect,
  setTypeSelect,
  customType,
  setCustomType,
  showDueCal,
  setShowDueCal,
  showDueTime,
  setShowDueTime,
  withDateFrom,
  withTime,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  projects,
  lessons,
  contactsLoading,
  contactSearch,
  setContactSearch,
  filteredContacts,
  toggleContact,
  getContactName,
}) => {
  return (
    <div className="space-y-4">
      <BasicsSection
        formData={formData}
        errors={errors}
        shouldShowError={shouldShowError}
        onChange={onChange}
        onBlur={onBlur}
      />
      <StatusPrioritySection formData={formData} onChange={onChange} />
      <TypeSection
        presetTypes={presetTypes}
        typeSelect={typeSelect}
        setTypeSelect={setTypeSelect}
        customType={customType}
        setCustomType={setCustomType}
        onChange={onChange}
      />
      <DueDateSection
        formData={formData}
        showDueCal={showDueCal}
        setShowDueCal={setShowDueCal}
        showDueTime={showDueTime}
        setShowDueTime={setShowDueTime}
        withDateFrom={withDateFrom}
        withTime={withTime}
        onChange={onChange}
      />
      <AssociationsSection
        formData={formData}
        onChange={onChange}
        projects={projects}
        lessons={lessons}
      />
      <HoursSection formData={formData} onChange={onChange} />
      <TagsSection
        formData={formData}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />
      <ContactsSection
        formData={formData}
        contactsLoading={contactsLoading}
        contactSearch={contactSearch}
        setContactSearch={setContactSearch}
        filteredContacts={filteredContacts}
        toggleContact={toggleContact}
        getContactName={getContactName}
      />
    </div>
  );
};

export default EditForm;
