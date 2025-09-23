// Project card popup modal for viewing/editing project details
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, GitBranch, Link, Tag, Users } from 'lucide-react';
import MiniCalendar from '../Calendar/MiniCalendar';
import { format as fmt } from 'date-fns';
import { Project, Contact, Task } from '../../../utils/interfaces/interfaces';
import { Priority, ProjectStatus } from '../../../utils/types/types';
import Button from '../Button';
import { apiService } from '../../../utils/api/Api';
import TaskCardPopup from '../Tasks/TaskCardPop';
import TimePicker from '../TimePicker/TimePicker';

interface ProjectCardPopupProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (project: Project) => void;
  onDelete?: () => void;
  // If true and a project is provided, open directly in edit mode
  startInEdit?: boolean;
  // Notify parent that tasks linked to this project changed (created/assigned/updated)
  onTasksChanged?: () => void;
}

const ProjectCardPopup: React.FC<ProjectCardPopupProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
  onTasksChanged,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as Priority,
    startDate: '', // ISO local yyyy-MM-ddTHH:mm
    endDate: '',   // ISO local yyyy-MM-ddTHH:mm
    progress: 0,
    tags: [] as string[],
    githubLink: '',
    figmaLink: '',
    mailingList: '',
    tasks: [] as string[],
    collaborators: [] as string[],
  });
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Task actions state (create/assign) similar to ProjectCard
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAssignTaskId, setSelectedAssignTaskId] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [tempTask, setTempTask] = useState<Task | null>(null);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const isNewProject = !project || (typeof project._id === 'string' && project._id.startsWith('temp-'));

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
      // New project
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: toLocal(now),
        endDate: toLocal(end),
        progress: 0,
        tags: [],
        githubLink: '',
        figmaLink: '',
        mailingList: '',
        tasks: [],
        collaborators: [],
      });
      setIsEditing(true);
    }
  }, [project, startInEdit]);

  // Fetch contacts when popup opens
  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    setContactsLoading(true);
    apiService.getContacts()
      .then(data => { if (!ignore) setContacts(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!ignore) setContactsLoading(false); });
    return () => { ignore = true; };
  }, [isOpen]);

  // Load unassigned tasks when popup opens (for assignment)
  useEffect(() => {
    if (!isOpen) return;
    const loadUnassigned = async () => {
      setLoadingTasks(true);
      try {
        const all = await apiService.getTasks();
        setUnassignedTasks(all.filter((t: any) => !(t as any).project && !(t as any).projectId));
      } catch (e) {
        // ignore
      } finally {
        setLoadingTasks(false);
      }
    };
    loadUnassigned();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setErrors(validate(next));
      return next;
    });
  };

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: string) => (touched[field] || attemptedSubmit) && !!errors[field];

  const validate = (data: typeof formData) => {
    const nextErrors: Record<string, string> = {};
    if (!data.name.trim()) nextErrors.name = 'Project name is required';
    if (!data.description.trim()) nextErrors.description = 'Description is required';
    if (!data.startDate) nextErrors.startDate = 'Start date/time is required';
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (e <= s) nextErrors.endDate = 'End must be after start';
    }
    return nextErrors;
  };

  const isInvalid = useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    const projectData: Project = {
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
    };

    onSave?.(projectData);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-600';
      case 'high': return 'text-orange-400 bg-orange-600';
      case 'medium': return 'text-yellow-400 bg-yellow-600';
      case 'low': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning': return 'text-gray-400';
      case 'active': return 'text-green-400';
      case 'on-hold': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (input: unknown) => {
    if (!input) return '—';
    const d = input instanceof Date ? input : new Date(input as any);
    if (isNaN(d.getTime())) return '—';
    const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
    try {
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return d.toDateString();
    }
  };

  const filteredContacts = useMemo(() => {
    const term = contactSearch.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(c =>
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      (c.email?.toLowerCase().includes(term) ?? false)
    );
  }, [contacts, contactSearch]);

  const toggleContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.includes(id)
        ? prev.collaborators.filter(a => a !== id)
        : [...prev.collaborators, id]
    }));
  };

  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    if (!c) return id;
    return `${c.firstName} ${c.lastName}`.trim();
  };

  // Assign an existing task to this project
  const handleAssign = async () => {
    if (!selectedAssignTaskId || !project?._id) return;
    try {
      setAssigning(true);
      await apiService.updateTask(selectedAssignTaskId, { projectId: project._id } as any);
      setSelectedAssignTaskId('');
      // refresh unassigned list and recompute progress
      try {
        const all = await apiService.getTasks();
        setUnassignedTasks(all.filter((t: any) => !(t as any).project && !(t as any).projectId));
      } catch { }
      try { await apiService.recomputeAndSyncProjectProgress(project._id); } catch { }
      // notify parent so calendar/projects can refresh
      try { onTasksChanged?.(); } catch { /* noop */ }
    } catch (e) {
      // ignore
    } finally {
      setAssigning(false);
    }
  };

  // Save a task from the popup (create/update)
  const handleTaskSave = async (task: Task) => {
    try {
      if (task._id.startsWith('temp-')) {
        const { _id, createdAt, updatedAt, ...data } = task as any;
        await apiService.createTask({ ...data, projectId: project?._id } as any);
      } else {
        const { _id, createdAt, updatedAt, ...data } = task as any;
        await apiService.updateTask(task._id, data as any);
      }
      // recompute project progress after creation/update
      try { if (project?._id) await apiService.recomputeAndSyncProjectProgress(project._id); } catch { }
      setShowTaskPopup(false);
      setTempTask(null);
      // refresh unassigned list
      try {
        const all = await apiService.getTasks();
        setUnassignedTasks(all.filter((t: any) => !(t as any).project && !(t as any).projectId));
      } catch { }
      // notify parent about changes to tasks so it can refresh views
      try { onTasksChanged?.(); } catch { /* noop */ }
    } catch (e) {
      // ignore
    }
  };

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
            {project ? (isEditing ? 'Edit Project' : 'Project Details') : 'New Project'}
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
              {/* Name */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => markTouched('name')}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('name') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                  placeholder="Project name"
                />
                {shouldShowError('name') && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onBlur={() => markTouched('description')}
                  rows={4}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('description') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                  placeholder="Project description"
                />
                {shouldShowError('description') && (
                  <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
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
                    onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Dates with Mini Calendars and time inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Start */}
                <div className="relative">
                  <label className="block text-body text-gray-300 mb-2">Start *</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowStartCal(v => !v); setShowEndCal(false); }}
                      className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('startDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="whitespace-nowrap">{fmt(new Date(formData.startDate), 'PP')}</span>
                      </div>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowStartTime(v => !v); setShowEndTime(false); }}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
                        title="Pick time"
                      >
                        {formData.startDate ? fmt(new Date(formData.startDate), 'HH:mm') : '--:--'}
                      </button>
                      {showStartTime && formData.startDate && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-gray-800 rounded-md border border-gray-700">
                            <TimePicker
                              value={fmt(new Date(formData.startDate), 'HH:mm')}
                              onChange={(hhmm) => {
                                const [hh, mm] = hhmm.split(':').map(Number);
                                const d = new Date(formData.startDate);
                                d.setHours(hh, mm, 0, 0);
                                const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                handleInputChange('startDate', iso);
                              }}
                              onClose={() => setShowStartTime(false)}
                              minuteStep={5}
                              compact
                              itemHeight={24}
                              visibleCount={3}
                              columnWidthClass="w-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {showStartCal && formData.startDate && (
                    <MiniCalendar
                      value={new Date(formData.startDate)}
                      onChange={(d) => {
                        const base = new Date(formData.startDate);
                        d.setHours(base.getHours(), base.getMinutes(), 0, 0);
                        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        handleInputChange('startDate', iso);
                      }}
                      onClose={() => setShowStartCal(false)}
                    />
                  )}
                  {showStartTime && formData.startDate && (
                    <TimePicker
                      value={fmt(new Date(formData.startDate), 'HH:mm')}
                      onChange={(hhmm) => {
                        const [hh, mm] = hhmm.split(':').map(Number);
                        const d = new Date(formData.startDate);
                        d.setHours(hh, mm, 0, 0);
                        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        handleInputChange('startDate', iso);
                        setShowStartTime(false);
                      }}
                      onClose={() => setShowStartTime(false)}
                      minuteStep={5}
                      className="left-0"
                    />
                  )}
                  {shouldShowError('startDate') && (<p className="mt-1 text-xs text-red-400">{errors.startDate}</p>)}
                </div>
                {/* End */}
                <div className="relative">
                  <label className="block text-body text-gray-300 mb-2">End</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowEndCal(v => !v); setShowStartCal(false); }}
                      className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('endDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="whitespace-nowrap">{formData.endDate ? fmt(new Date(formData.endDate), 'PP') : 'No end date'}</span>
                      </div>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        disabled={!formData.endDate}
                        onClick={() => { if (formData.endDate) { setShowEndTime(v => !v); setShowStartTime(false); } }}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pick time"
                      >
                        {formData.endDate ? fmt(new Date(formData.endDate), 'HH:mm') : '--:--'}
                      </button>
                      {showEndTime && formData.endDate && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-gray-800 rounded-md border border-gray-700">
                            <TimePicker
                              value={fmt(new Date(formData.endDate), 'HH:mm')}
                              onChange={(hhmm) => {
                                const [hh, mm] = hhmm.split(':').map(Number);
                                const d = new Date(formData.endDate);
                                d.setHours(hh, mm, 0, 0);
                                const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                handleInputChange('endDate', iso);
                              }}
                              onClose={() => setShowEndTime(false)}
                              minuteStep={5}
                              compact
                              itemHeight={24}
                              visibleCount={3}
                              columnWidthClass="w-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {showEndCal && (
                    <MiniCalendar
                      value={formData.endDate ? new Date(formData.endDate) : new Date(formData.startDate || Date.now())}
                      onChange={(d) => {
                        if (!formData.startDate) return;
                        const base = formData.endDate ? new Date(formData.endDate) : new Date(formData.startDate);
                        d.setHours(base.getHours(), base.getMinutes(), 0, 0);
                        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        handleInputChange('endDate', iso);
                      }}
                      onClose={() => setShowEndCal(false)}
                      minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                    />
                  )}
                  {shouldShowError('endDate') && (<p className="mt-1 text-xs text-red-400">{errors.endDate}</p>)}
                </div>
                {showEndTime && formData.endDate && (
                  <TimePicker
                    value={fmt(new Date(formData.endDate), 'HH:mm')}
                    onChange={(hhmm) => {
                      const [hh, mm] = hhmm.split(':').map(Number);
                      const d = new Date(formData.endDate);
                      d.setHours(hh, mm, 0, 0);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      handleInputChange('endDate', iso);
                      setShowEndTime(false);
                    }}
                    onClose={() => setShowEndTime(false)}
                    minuteStep={5}
                    className="left-0"
                  />
                )}
              </div>

              {/* Progress (Read-only info) - only show when editing an existing (non-temp) project */}
              {!isNewProject && (
                <div>
                  <label className="block text-body text-gray-300 mb-1">Progress</label>
                  <div className="flex items-center justify-between bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-white font-medium">{formData.progress}%</span>
                    <span className="text-xs text-gray-400">Auto-calculated from completed tasks</span>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">
                    <GitBranch size={16} className="inline mr-2" />
                    GitHub Link
                  </label>
                  <input
                    type="url"
                    value={formData.githubLink}
                    onChange={(e) => handleInputChange('githubLink', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">
                    <Link size={16} className="inline mr-2" />
                    Figma Link
                  </label>
                  <input
                    type="url"
                    value={formData.figmaLink}
                    onChange={(e) => handleInputChange('figmaLink', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://figma.com/..."
                  />
                </div>
              </div>

              {/* Mailing List */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Mailing List</label>
                <input
                  type="email"
                  value={formData.mailingList}
                  onChange={(e) => handleInputChange('mailingList', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="project@example.com"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Tags</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                  <Button
                    text="Add"
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                  />
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small"
                      >
                        <Tag size={12} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Collaborators (Contacts) Selection */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Collaborators</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contacts"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg divide-y divide-gray-700 bg-gray-750">
                    {contactsLoading && (
                      <div className="p-3 text-small text-gray-400">Loading contacts...</div>
                    )}
                    {!contactsLoading && filteredContacts.length === 0 && (
                      <div className="p-3 text-small text-gray-500">No contacts found</div>
                    )}
                    {!contactsLoading && filteredContacts.map(c => {
                      const selected = formData.collaborators.includes(c._id);
                      return (
                        <button
                          type="button"
                          key={c._id}
                          onClick={() => toggleContact(c._id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-small hover:bg-gray-700 transition ${selected ? 'bg-gray-700' : ''}`}
                        >
                          <span className="text-gray-200">{c.firstName} {c.lastName}</span>
                          {selected && <span className="text-blue-400 text-xs">Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                  {formData.collaborators.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.collaborators.map(cid => (
                        <span key={cid} className="px-2 py-1 bg-blue-700/40 text-blue-300 text-small rounded flex items-center gap-1">
                          {getContactName(cid)}
                          <button onClick={() => toggleContact(cid)} className="text-blue-300 hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Actions */}
              {project?._id && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-body font-medium text-gray-300">Task Actions</h3>
                    <Button
                      text="Create Task"
                      variant="outline"
                      size="sm"
                      onClick={() => { setTempTask({ _id: `temp-${Date.now()}`, title: '', description: '', status: 'pending', priority: 'medium', dueDate: undefined, project: undefined } as any); setShowTaskPopup(true); }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAssignTaskId}
                      onChange={(e) => setSelectedAssignTaskId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Assign existing…</option>
                      {loadingTasks && <option>Loading…</option>}
                      {!loadingTasks && unassignedTasks.map(t => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                      ))}
                    </select>
                    <Button
                      text={assigning ? 'Assigning…' : 'Assign'}
                      variant="primary"
                      size="sm"
                      onClick={handleAssign}
                      disabled={!selectedAssignTaskId || assigning}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            // View Mode
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{project?.name}</h1>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${getStatusColor(project?.status || 'planning')} bg-gray-700`}>
                      {project?.status?.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${getPriorityColor(project?.priority || 'medium')}`}>
                      {project?.priority?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-small text-gray-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-white">{project?.progress}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${project?.progress || 0}%` }}
                />
              </div>

              {/* Description */}
              {project?.description && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-2">Description</h3>
                  <p className="text-body text-gray-400 leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-small text-gray-400">Start Date</div>
                      <div className="text-body text-white">{formatDate(project?.startDate)}</div>
                  </div>
                </div>
                {project?.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">End Date</div>
                        <div className="text-body text-white">{formatDate(project.endDate)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              {(project?.githubLink || project?.figmaLink) && (
                <div className="space-y-2">
                  <h3 className="text-body font-medium text-gray-300">Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                      >
                        <GitBranch size={16} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.figmaLink && (
                      <a
                        href={project.figmaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                      >
                        <Link size={16} />
                        <span>Figma</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project?.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

                {/* Collaborators */}
                {project?.collaborators && project.collaborators.length > 0 && (
                  <div>
                    <h3 className="text-body font-medium text-gray-300 mb-2">Collaborators</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-blue-300">{project.collaborators.length} contact{project.collaborators.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.collaborators.map(id => {
                        const c = contacts.find(x => x._id === id);
                        const label = c ? `${c.firstName} ${c.lastName}` : id;
                        const href = c?.email ? `mailto:${c.email}` : (c?.phone ? `tel:${c.phone}` : undefined);
                        return href ? (
                          <a
                            key={id}
                            href={href}
                            className="px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-600/40 text-blue-200 text-small"
                          >{label}</a>
                        ) : (
                          <span
                            key={id}
                            className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small"
                          >{label}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{project?.tasks?.length || 0}</div>
                  <div className="text-small text-gray-400">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{project?.collaborators?.length || 0}</div>
                  <div className="text-small text-gray-400">Collaborators</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {project?.startDate ? Math.ceil((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 3600 * 24)) : 0}
                  </div>
                  <div className="text-small text-gray-400">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{project?.tags?.length || 0}</div>
                  <div className="text-small text-gray-400">Tags</div>
                </div>
              </div>

                {/* Task Actions (also available in view mode) */}
                {project?._id && (
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-body font-medium text-gray-300">Task Actions</h3>
                      <Button
                        text="Create Task"
                        variant="outline"
                        size="sm"
                        onClick={() => { setTempTask({ _id: `temp-${Date.now()}`, title: '', description: '', status: 'pending', priority: 'medium', dueDate: undefined, project: undefined } as any); setShowTaskPopup(true); }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAssignTaskId}
                        onChange={(e) => setSelectedAssignTaskId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Assign existing…</option>
                        {loadingTasks && <option>Loading…</option>}
                        {!loadingTasks && unassignedTasks.map(t => (
                          <option key={t._id} value={t._id}>{t.title}</option>
                        ))}
                      </select>
                      <Button
                        text={assigning ? 'Assigning…' : 'Assign'}
                        variant="primary"
                        size="sm"
                        onClick={handleAssign}
                        disabled={!selectedAssignTaskId || assigning}
                      />
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {project && !isEditing && (
              <Button
                text="Edit"
                onClick={() => setIsEditing(true)}
                variant="outline"
              />
            )}
            {project && !isEditing && onDelete && (
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
                  onClick={() => project ? setIsEditing(false) : onClose()}
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
    </div>
  );
};

export default ProjectCardPopup;
