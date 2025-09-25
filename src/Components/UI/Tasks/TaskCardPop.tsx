// Task card popup modal for viewing/editing task details
import React, { useState, useEffect} from 'react';
import { X, Calendar, Clock, Tag, CheckSquare, Hash, Users, School } from 'lucide-react';
import { format as fmt } from 'date-fns';
import MiniCalendar from '../Calendar/MiniCalendar';
import { Task, Contact, Project, Lesson } from '../../../utils/interfaces/interfaces';
import { Priority, Status } from '../../../utils/types/types';
import Button from '../Button';
import { apiService } from '../../../utils/api/Api';
import TimePicker from '../TimePicker';

interface TaskCardPopupProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: () => void;
  // If true and a task is provided, open directly in edit mode
  startInEdit?: boolean;
  defaultProjectId?: string; // pre-associate new task with a project
}

const TaskCardPopup: React.FC<TaskCardPopupProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
  defaultProjectId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: 'pending' as Status,
    type: '',
    dueDate: '',
    projectId: '',
    lessonId: '',
    tags: [] as string[],
    estimatedHours: 0,
    actualHours: 0,
    contacts: [] as string[],
  });
  const [showDueCal, setShowDueCal] = useState(false);
  const [showDueTime, setShowDueTime] = useState(false);
  const presetTypes = ['Homework', 'Sub-Project mission'];
  const [typeSelect, setTypeSelect] = useState<string>('');
  const [customType, setCustomType] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        type: task.type || '',
        // Some legacy tasks might not have a dueDate; guard accordingly
        dueDate: task.dueDate ? toIsoLocal(new Date(task.dueDate)) : '',
        projectId: (task as any).projectId || (task as any).project || '',
        lessonId: (task as any).lessonId || (task as any).lesson || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        contacts: task.contacts || [],
      });
      // initialize type selector
      const t = task.type || '';
      if (t && presetTypes.includes(t)) {
        setTypeSelect(t);
        setCustomType('');
      } else if (t) {
        setTypeSelect('__custom__');
        setCustomType(t);
      } else {
        setTypeSelect('');
        setCustomType('');
      }
      setIsEditing(!!startInEdit);
    } else {
      // New task
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDue = toIsoLocal(tomorrow);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        type: '',
        dueDate: defaultDue,
        projectId: defaultProjectId || '',
        lessonId: '',
        tags: [],
        estimatedHours: 1,
        actualHours: 0,
        contacts: [],
      });
      setTypeSelect('');
      setCustomType('');
      setIsEditing(true);
    }
  }, [task, startInEdit, defaultProjectId]);

  // Helpers for local ISO strings compatible with datetime/time inputs
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

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    setContactsLoading(true);
    apiService.getContacts()
      .then(data => { if (!ignore) setContacts(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!ignore) setContactsLoading(false); });
    apiService.getProjects()
      .then(data => { if (!ignore) setProjects(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { /* noop */ });
    apiService.getLessons()
      .then(data => { if (!ignore) setLessons(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { /* noop */ });
    return () => { ignore = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (data: typeof formData) => {
    const nextErrors: Record<string, string> = {};
    if (!data.title.trim()) nextErrors.title = 'Title is required';
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

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: string) => (touched[field] || attemptedSubmit) && !!errors[field];

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
    // Compute final type
    let finalType: string | undefined = undefined;
    if (typeSelect === '__custom__') {
      const t = customType.trim();
      finalType = t.length ? t : undefined;
    } else if (typeSelect) {
      finalType = typeSelect;
    } else if (formData.type?.trim()) {
      finalType = formData.type.trim();
    }
    const taskData: Task = {
      _id: task?._id || `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      type: finalType,
      dueDate: new Date(formData.dueDate),
      projectId: formData.projectId || undefined,
      lessonId: formData.lessonId || undefined,
      tags: formData.tags,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      contacts: formData.contacts,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(taskData);
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

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (input: unknown) => {
    if (!input) return 'No due date';
    let d: Date;
    if (input instanceof Date) {
      d = input;
    } else if (typeof input === 'string' || typeof input === 'number') {
      d = new Date(input);
    } else {
      // fallback if an unexpected type is passed
      d = new Date(String(input));
    }

    if (isNaN(d.getTime())) return 'No due date';

    const locale = typeof navigator !== 'undefined' ? navigator.language : undefined;
    return d.toLocaleString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredContacts = React.useMemo(() => {
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
      contacts: prev.contacts.includes(id)
        ? prev.contacts.filter(a => a !== id)
        : [...prev.contacts, id]
    }));
  };

  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    if (!c) return id;
    return `${c.firstName} ${c.lastName}`.trim();
  };

  const getProjectName = (id: string) => {
    const p = projects.find(pr => pr._id === id);
    return p ? p.name : id;
  };

  const getLessonTitle = (id: string) => {
    const l = lessons.find(ls => ls._id === id);
    return l ? l.title : id;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-h1 font-semibold text-white">
            {task ? (isEditing ? 'Edit Task' : 'Task Details') : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isEditing ? (
            // Edit Mode
            <>
              {/* Title */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onBlur={() => markTouched('title')}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('title') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                  placeholder="Task title"
                />
                {shouldShowError('title') && (
                  <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Task description"
                />
              </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {/* Type */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    value={typeSelect}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTypeSelect(v);
                      if (v !== '__custom__') {
                        // sync to formData for completeness
                        handleInputChange('type', v);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {presetTypes.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                    <option value="__custom__">Custom…</option>
                  </select>
                  {typeSelect === '__custom__' && (
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => {
                        setCustomType(e.target.value);
                        handleInputChange('type', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom type"
                    />
                  )}
                </div>
              </div>
              {/* Due Date (Mini calendar + read-only time input) */}
              <div className="relative">
                <label className="block text-body text-gray-300 mb-2">Due Date</label>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDueCal(v => !v)}
                    className="flex-1 min-w-0 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="whitespace-nowrap">
                        {formData.dueDate ? fmt(new Date(formData.dueDate), 'PP') : 'Select date'}
                      </span>
                    </div>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDueTime(v => !v)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[96px] text-left"
                      title="Pick time"
                    >
                      {formData.dueDate ? fmt(new Date(formData.dueDate), 'HH:mm') : '--:--'}
                    </button>
                    {showDueTime && formData.dueDate && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gray-800 rounded-md border border-gray-700">
                          <TimePicker
                            value={fmt(new Date(formData.dueDate), 'HH:mm')}
                            onChange={(hhmm) => { handleInputChange('dueDate', withTime(formData.dueDate, hhmm)); }}
                            onClose={() => setShowDueTime(false)}
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
                {showDueCal && formData.dueDate && (
                  <MiniCalendar
                    value={new Date(formData.dueDate)}
                    onChange={(d) => handleInputChange('dueDate', withDateFrom(formData.dueDate, d))}
                    onClose={() => setShowDueCal(false)}
                  />
                )}
                {/* Wheel is rendered inline inside the button above */}
              </div>

              {/* Associations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body text-gray-300 mb-2">Lesson</label>
                  <select
                    value={formData.lessonId}
                    onChange={(e) => handleInputChange('lessonId', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {lessons.map(l => (
                      <option key={l._id} value={l._id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-body text-gray-300 mb-2">Actual Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actualHours}
                    onChange={(e) => handleInputChange('actualHours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-small rounded flex items-center gap-1"
                    >
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tag"
                  />
                  <Button
                    text="Add"
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    disabled={!tagInput.trim()}
                  />
                </div>
              </div>

              {/* Contacts Selection */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Contacts</label>
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
                      const selected = formData.contacts.includes(c._id);
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
                  {formData.contacts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.contacts.map(cid => (
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
            </>
          ) : (
            // View Mode
            task && (
              <>
                {/* Title with Priority */}
                <div className="flex items-start justify-between">
                  <h3 className="text-large font-medium text-white">{task.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-small font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className={getStatusColor(task.status)} />
                  <span className={`text-body ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                {/* Associations (Project / Lesson) */}
                {(task.projectId || (task as any).projectId || (task as any).project || task.lessonId || (task as any).lessonId || (task as any).lesson) && (
                  <div className="flex flex-col gap-1 mt-2">
                    {((task as any).projectId || (task as any).project || task.projectId) && (
                      <div className="flex items-center gap-2 text-body text-blue-400">
                        <Hash size={16} />
                        <a href={`/projects`} className="hover:text-blue-300">
                          {getProjectName((task as any).projectId || (task as any).project || task.projectId!)}
                        </a>
                      </div>
                    )}
                    {((task as any).lessonId || (task as any).lesson || task.lessonId) && (
                      <div className="flex items-center gap-2 text-body text-purple-300">
                        <School size={16} />
                        <a href={`/school`} className="hover:text-purple-200">
                          {getLessonTitle((task as any).lessonId || (task as any).lesson || task.lessonId!)}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {/* Type */}
                {task.type && (
                  <div className="flex items-center gap-2 text-body text-purple-300">
                    <span className="px-2 py-0.5 rounded bg-purple-700/40 border border-purple-600 text-small">{task.type}</span>
                  </div>
                )}

                {/* Description */}
                {task.description && (
                  <p className="text-body text-gray-300">{task.description}</p>
                )}

                {/* Due Date */}
                <div className="flex items-center gap-2 text-body text-gray-300">
                  <Calendar size={16} />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>

                {/* Hours */}
                {(task.estimatedHours || task.actualHours) && (
                  <div className="flex items-center gap-2 text-body text-gray-300">
                    <Clock size={16} />
                    <span>
                      {task.estimatedHours && `Estimated: ${task.estimatedHours}h`}
                      {task.estimatedHours && task.actualHours && ' • '}
                      {task.actualHours && `Actual: ${task.actualHours}h`}
                    </span>
                  </div>
                )}

                {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-small rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Contacts (UI-only) */}
                  {formData.contacts && formData.contacts.length > 0 && (
                    <div className="flex flex-col gap-1 text-body text-blue-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-400" />
                        <span>{formData.contacts.length} contact{formData.contacts.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.contacts.map(id => (
                          <span key={id} className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small">
                            {getContactName(id)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Associations moved above */}
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div>
            {task && !isEditing && onDelete && (
              <Button
                action="delete"
                text="Delete"
                onClick={onDelete}
                variant="danger"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {task && !isEditing ? (
              <>
                <Button
                  text="Edit"
                  action="edit"
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                />
                <Button
                  text="Close"
                  action="cancel"
                  onClick={onClose}
                  variant="secondary"
                />
              </>
            ) : (
              <>
                <Button
                  text="Cancel"
                  action="cancel"
                  onClick={() => {
                    if (task) {
                      setIsEditing(false);
                    } else {
                      onClose();
                    }
                  }}
                  variant="outline"
                />
                <Button
                  text="Save"
                  action="save"
                  onClick={handleSave}
                  variant="primary"
                    className={isInvalid ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCardPopup;
