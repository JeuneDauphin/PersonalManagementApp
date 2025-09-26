import React, { useEffect, useMemo, useState } from 'react';
import ModalFrame from '../../Contacts/ContactPopup/ModalFrame';
import EditForm, { ProjectFormData } from './EditForm';
import ViewDetails from './ViewDetails';
import Button from '../../Button';
import { Contact, Project, Task } from '../../../../utils/interfaces/interfaces';
import TaskCardPopup from '../../Tasks/TaskCardPop';

export interface ProjectCardPopupProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (project: Project) => void;
  onDelete?: () => void;
  startInEdit?: boolean;
  onTasksChanged?: () => void;
  contacts?: Contact[];
  loadingContacts?: boolean;
  unassignedTasks?: Task[];
  loadingUnassignedTasks?: boolean;
  onAssignTaskToProject?: (taskId: string, projectId: string) => Promise<void> | void;
  onCreateTask?: (task: Task) => Promise<void> | void;
  onUpdateTask?: (taskId: string, data: Partial<Task>) => Promise<void> | void;
  onRefreshLists?: () => Promise<void> | void; // e.g., refresh contacts/unassigned tasks
}

const emptyForm: ProjectFormData = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  startDate: '',
  endDate: '',
  progress: 0,
  tags: [],
  githubLink: '',
  figmaLink: '',
  mailingList: '',
  tasks: [],
  collaborators: [],
};

const Main: React.FC<ProjectCardPopupProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
  onTasksChanged,
  contacts = [],
  loadingContacts = false,
  unassignedTasks = [],
  loadingUnassignedTasks = false,
  onAssignTaskToProject,
  onCreateTask,
  onUpdateTask,
  onRefreshLists,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [tempTask, setTempTask] = useState<Task | null>(null);
  const [selectedAssignTaskId, setSelectedAssignTaskId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: new Date(project.startDate).toISOString().slice(0, 16),
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 16) : '',
        progress: project.progress,
        tags: project.tags || [],
        githubLink: project.githubLink || '',
        figmaLink: project.figmaLink || '',
        mailingList: project.mailingList || '',
        tasks: project.tasks || [],
        collaborators: project.collaborators || [],
      });
      setIsEditing(!!startInEdit);
    } else {
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData({ ...emptyForm, startDate: toLocal(now), endDate: toLocal(end) });
      setIsEditing(true);
    }
    setTouched({});
    setErrors({});
    setAttemptedSubmit(false);
  }, [project, startInEdit]);

  const validate = (data: ProjectFormData) => {
    const next: Record<string, string> = {};
    if (!data.name.trim()) next.name = 'Project name is required';
    if (!data.description.trim()) next.description = 'Description is required';
    if (!data.startDate) next.startDate = 'Start date/time is required';
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (e <= s) next.endDate = 'End must be after start';
    }
    return next;
  };

  const isInvalid = useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);
  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => { const next = { ...prev, [field]: value } as ProjectFormData; setErrors(validate(next)); return next; });
  };
  const markTouched = (field: keyof ProjectFormData) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: keyof ProjectFormData | 'endDate') => (touched[field as string] || attemptedSubmit) && !!errors[field as string];

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
    setFormData(prev => ({ ...prev, collaborators: prev.collaborators.includes(id) ? prev.collaborators.filter(a => a !== id) : [...prev.collaborators, id] }));
  };

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    const data: Project = {
      _id: project?._id || `temp-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      progress: formData.progress,
      tags: formData.tags,
      githubLink: formData.githubLink || undefined,
      figmaLink: formData.figmaLink || undefined,
      mailingList: formData.mailingList || undefined,
      tasks: formData.tasks,
      collaborators: formData.collaborators,
      createdAt: project?.createdAt || new Date(),
      updatedAt: new Date(),
    } as Project;
    onSave?.(data);
  };

  const title = project ? (isEditing ? 'Edit Project' : 'Project Details') : 'New Project';

  // Task actions area (no API calls here; delegate to props callbacks)
  const handleAssign = async () => {
    if (!selectedAssignTaskId || !project?._id || !onAssignTaskToProject) return;
    try {
      setAssigning(true);
      await onAssignTaskToProject(selectedAssignTaskId, project._id);
      setSelectedAssignTaskId('');
      await onRefreshLists?.();
      onTasksChanged?.();
    } finally {
      setAssigning(false);
    }
  };

  const handleTaskSave = async (task: Task) => {
    if (!onCreateTask || !onUpdateTask) return;
    if (task._id.startsWith('temp-')) {
      const { _id, createdAt, updatedAt, ...data } = task as any;
      await onCreateTask({ ...(data as Task), projectId: project?._id } as any);
    } else {
      const { _id, createdAt, updatedAt, ...data } = task as any;
      await onUpdateTask(task._id, data as any);
    }
    setShowTaskPopup(false);
    setTempTask(null);
    await onRefreshLists?.();
    onTasksChanged?.();
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footerLeft={project && !isEditing ? (
        <>
          <Button text="Edit" onClick={() => setIsEditing(true)} variant="outline" />
          {onDelete && <Button text="Delete" onClick={onDelete} variant="outline" action="delete" />}
        </>
      ) : null}
      footerRight={isEditing ? (
        <>
          <Button text="Cancel" onClick={() => (project ? setIsEditing(false) : onClose())} variant="outline" />
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
          tagInput={tagInput}
          setTagInput={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          showStartCal={showStartCal}
          setShowStartCal={setShowStartCal}
          showEndCal={showEndCal}
          setShowEndCal={setShowEndCal}
          showStartTime={showStartTime}
          setShowStartTime={setShowStartTime}
          showEndTime={showEndTime}
          setShowEndTime={setShowEndTime}
          contacts={contacts}
          contactsLoading={loadingContacts}
          contactSearch={contactSearch}
          setContactSearch={setContactSearch}
          filteredContacts={filteredContacts}
          toggleContact={toggleContact}
        />
      ) : (
        project ? <ViewDetails project={project} contacts={contacts} /> : null
      )}

      {/* Task Actions in both modes if project exists */}
      {project?._id && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body font-medium text-gray-300">Task Actions</h3>
            <Button
              text="Create Task"
              variant="outline"
              size="sm"
              onClick={() => { setTempTask({ _id: `temp-${Date.now()}`, title: '', description: '', status: 'pending' as any, priority: 'medium' as any, dueDate: undefined, project: undefined } as any); setShowTaskPopup(true); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedAssignTaskId}
              onChange={(e) => setSelectedAssignTaskId(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Assign existing…</option>
              {loadingUnassignedTasks && <option>Loading…</option>}
              {!loadingUnassignedTasks && unassignedTasks.map(t => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
            <Button text={assigning ? 'Assigning…' : 'Assign'} variant="primary" size="sm" onClick={handleAssign} disabled={!selectedAssignTaskId || assigning} />
          </div>
        </div>
      )}

      {showTaskPopup && (
        <TaskCardPopup
          isOpen={showTaskPopup}
          onClose={() => { setShowTaskPopup(false); setTempTask(null); }}
          task={tempTask as any}
          onSave={handleTaskSave as any}
          startInEdit={true}
          defaultProjectId={project?._id}
        />
      )}
    </ModalFrame>
  );
};

export default Main;
