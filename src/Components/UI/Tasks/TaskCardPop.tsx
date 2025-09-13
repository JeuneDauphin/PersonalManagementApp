// Task card popup modal for viewing/editing task details
import React, { useState, useEffect} from 'react';
import { X, Calendar, Clock, Tag, CheckSquare, Hash, Users } from 'lucide-react';
import { Task, Contact } from '../../../utils/interfaces/interfaces';
import { Priority, Status } from '../../../utils/types/types';
import Button from '../Button';
import { apiService } from '../../../utils/api/Api';

interface TaskCardPopupProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: () => void;
}

const TaskCardPopup: React.FC<TaskCardPopupProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: 'pending' as Status,
    dueDate: '',
    projectId: '',
    tags: [] as string[],
    estimatedHours: 0,
    actualHours: 0,
    contacts: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        projectId: task.projectId || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        contacts: task.contacts || [],
      });
      setIsEditing(false);
    } else {
      // New task
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: tomorrow.toISOString().slice(0, 16),
        projectId: '',
        tags: [],
        estimatedHours: 1,
        actualHours: 0,
        contacts: [],
      });
      setIsEditing(true);
    }
  }, [task]);

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

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

    const taskData: Task = {
      _id: task?._id || `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: new Date(formData.dueDate),
      projectId: formData.projectId || undefined,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
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
              {/* Due Date */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
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

                {/* Description */}
                {task.description && (
                  <p className="text-body text-gray-300">{task.description}</p>
                )}

                {/* Due Date */}
                <div className="flex items-center gap-2 text-body text-gray-300">
                  <Calendar size={16} />
                  <span>Due: {formatDate(task.dueDate.toString())}</span>
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

                {/* Project Link */}
                {task.projectId && (
                  <div className="flex items-center gap-2 text-body text-blue-400">
                    <Hash size={16} />
                    <a href={`/projects`} className="hover:text-blue-300">
                      View Project
                    </a>
                  </div>
                )}
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
                    disabled={!formData.title}
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
