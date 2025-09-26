import React, { useEffect, useMemo, useState } from 'react';
import ModalFrame from '../../Contacts/ContactPopup/ModalFrame';
import EditForm, { TaskFormData } from './EditForm';
import ViewDetails from './ViewDetails';
import Button from '../../Button';
import { Contact, Lesson, Project, Task } from '../../../../utils/interfaces/interfaces';
import { Priority, Status } from '../../../../utils/types/types';

export interface TaskCardPopupProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: () => void;
  startInEdit?: boolean;
  defaultProjectId?: string;

  // Provide data from page; keep UI API-free
  contacts?: Contact[];
  loadingContacts?: boolean;
  projects?: Project[];
  lessons?: Lesson[];
}

const presetTypes = ['Homework', 'Sub-Project mission'];

const toIsoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const withDateFrom = (original: string, newDate: Date) => {
  const base = new Date(original || Date.now());
  const merged = new Date(newDate);
  merged.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return toIsoLocal(merged);
};
const withTime = (original: string, timeHHmm: string) => {
  const [hh, mm] = timeHHmm.split(':').map(Number);
  const base = new Date(original || Date.now());
  base.setHours(hh, mm, 0, 0);
  return toIsoLocal(base);
};

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium' as Priority,
  status: 'pending' as Status,
  type: '',
  dueDate: '',
  projectId: '',
  lessonId: '',
  tags: [],
  estimatedHours: 0,
  actualHours: 0,
  contacts: [],
};

const Main: React.FC<TaskCardPopupProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
  defaultProjectId,
  contacts = [],
  loadingContacts = false,
  projects = [],
  lessons = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [typeSelect, setTypeSelect] = useState<string>('');
  const [customType, setCustomType] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showDueCal, setShowDueCal] = useState(false);
  const [showDueTime, setShowDueTime] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        type: task.type || '',
        dueDate: task.dueDate ? toIsoLocal(new Date(task.dueDate)) : '',
        projectId: (task as any).projectId || (task as any).project || '',
        lessonId: (task as any).lessonId || (task as any).lesson || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        contacts: task.contacts || [],
      });
      const t = task.type || '';
      if (t && presetTypes.includes(t)) { setTypeSelect(t); setCustomType(''); }
      else if (t) { setTypeSelect('__custom__'); setCustomType(t); }
      else { setTypeSelect(''); setCustomType(''); }
      setIsEditing(!!startInEdit);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        ...emptyForm,
        dueDate: toIsoLocal(tomorrow),
        projectId: defaultProjectId || '',
        estimatedHours: 1,
      });
      setTypeSelect('');
      setCustomType('');
      setIsEditing(true);
    }
    setTouched({});
    setErrors({});
    setAttemptedSubmit(false);
  }, [task, startInEdit, defaultProjectId]);

  const validate = (data: TaskFormData) => {
    const next: Record<string, string> = {};
    if (!data.title.trim()) next.title = 'Title is required';
    return next;
  };
  const isInvalid = useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => { const next = { ...prev, [field]: value } as TaskFormData; setErrors(validate(next)); return next; });
  };
  const markTouched = (field: keyof TaskFormData) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: keyof TaskFormData | 'title') => (touched[field as string] || attemptedSubmit) && !!errors[field as string];

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const filteredContacts = useMemo(() => {
    const term = contactSearch.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(c => c.firstName.toLowerCase().includes(term) || c.lastName.toLowerCase().includes(term) || (c.email?.toLowerCase().includes(term) ?? false));
  }, [contacts, contactSearch]);

  const toggleContact = (id: string) => {
    setFormData(prev => ({ ...prev, contacts: prev.contacts.includes(id) ? prev.contacts.filter(a => a !== id) : [...prev.contacts, id] }));
  };
  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    return c ? `${c.firstName} ${c.lastName}`.trim() : id;
  };

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    let finalType: string | undefined = undefined;
    if (typeSelect === '__custom__') {
      const t = customType.trim();
      finalType = t.length ? t : undefined;
    } else if (typeSelect) {
      finalType = typeSelect;
    } else if (formData.type?.trim()) {
      finalType = formData.type.trim();
    }

    const data: Task = {
      _id: task?._id || `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      type: finalType,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      projectId: formData.projectId || undefined,
      lessonId: formData.lessonId || undefined,
      tags: formData.tags,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      contacts: formData.contacts,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    } as Task;
    onSave?.(data);
  };

  const title = task ? (isEditing ? 'Edit Task' : 'Task Details') : 'New Task';

  return (
    <ModalFrame
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footerLeft={task && !isEditing ? (
        <>
          <Button text="Edit" onClick={() => setIsEditing(true)} variant="outline" />
          {onDelete && <Button text="Delete" onClick={onDelete} variant="outline" action="delete" />}
        </>
      ) : null}
      footerRight={isEditing ? (
        <>
          <Button text="Cancel" onClick={() => (task ? setIsEditing(false) : onClose())} variant="outline" />
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
          onBlur={markTouched}
          presetTypes={presetTypes}
          typeSelect={typeSelect}
          setTypeSelect={setTypeSelect}
          customType={customType}
          setCustomType={setCustomType}
          showDueCal={showDueCal}
          setShowDueCal={setShowDueCal}
          showDueTime={showDueTime}
          setShowDueTime={setShowDueTime}
          withDateFrom={withDateFrom}
          withTime={withTime}
          tagInput={tagInput}
          setTagInput={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          projects={projects}
          lessons={lessons}
          contactsLoading={loadingContacts}
          contactSearch={contactSearch}
          setContactSearch={setContactSearch}
          filteredContacts={filteredContacts}
          toggleContact={toggleContact}
          getContactName={getContactName}
        />
      ) : (
        task ? <ViewDetails task={task} contacts={contacts} projects={projects} lessons={lessons} /> : null
      )}
    </ModalFrame>
  );
};

export default Main;
