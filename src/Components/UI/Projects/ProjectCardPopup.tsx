// Project card popup modal for viewing/editing project details
import React, { useState, useEffect } from 'react';
import { X, Calendar, GitBranch, Link, Tag } from 'lucide-react';
import { Project } from '../../../utils/interfaces/interfaces';
import { Priority, ProjectStatus } from '../../../utils/types/types';
import Button from '../Button';

interface ProjectCardPopupProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (project: Project) => void;
  onDelete?: () => void;
  // If true and a project is provided, open directly in edit mode
  startInEdit?: boolean;
}

const ProjectCardPopup: React.FC<ProjectCardPopupProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as Priority,
    startDate: '',
    endDate: '',
    progress: 0,
    tags: [] as string[],
    githubLink: '',
    figmaLink: '',
    mailingList: '',
    tasks: [] as string[],
    collaborators: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: new Date(project.startDate).toISOString().slice(0, 10),
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
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
      const today = new Date().toISOString().slice(0, 10);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: today,
        endDate: '',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Project name"
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
                  placeholder="Project description"
                />
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

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Progress (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-small text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="text-white font-medium">{formData.progress}%</span>
                  <span>100%</span>
                </div>
              </div>

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
                    <div className="text-body text-white">{formatDate(project?.startDate?.toString() || '')}</div>
                  </div>
                </div>
                {project?.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">End Date</div>
                      <div className="text-body text-white">{formatDate(project.endDate.toString())}</div>
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
                  disabled={!formData.name.trim()}
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

export default ProjectCardPopup;
