// Project card component displaying project details in a card format
import React from 'react';
import { Project } from '../../../utils/interfaces/interfaces';
import { Calendar, Users, GitBranch, Link, Clock, CheckCircle, Pause, Play, AlertTriangle, X } from 'lucide-react';
import Button from '../Button';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  showActions?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock size={16} className="text-gray-400" />;
      case 'active': return <Play size={16} className="text-green-400" />;
      case 'on-hold': return <Pause size={16} className="text-yellow-400" />;
      case 'completed': return <CheckCircle size={16} className="text-blue-400" />;
      case 'cancelled': return <X size={16} className="text-red-400" />;
      default: return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (endDate?: Date, status?: string) => {
    return endDate && status !== 'completed' && status !== 'cancelled' && new Date(endDate) < new Date();
  };

  return (
  <div
      className={`
        bg-gray-800 border-l-4 border-gray-700 rounded-lg p-4
    hover:border-gray-600 transition-colors cursor-pointer group relative
        ${getPriorityColor(project.priority)}
        ${project.status === 'completed' ? 'opacity-75' : ''}
        ${isOverdue(project.endDate, project.status) ? 'border-red-500' : ''}
      `}
      onClick={() => onClick?.(project)}
    >
      {/* Status indicator */}
      <div className={`w-full h-1 ${getStatusColor(project.status)} rounded-t mb-3`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(project.status)}
          <span className={`text-body font-medium ${project.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
            {project.name}
          </span>
        </div>

  {/* actions moved to bottom-right */}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-small text-gray-400 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(project.status)}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-small text-gray-400 mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Links */}
      {(project.githubLink || project.figmaLink) && (
        <div className="flex items-center gap-2 mb-3">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <GitBranch size={14} />
              <span className="text-xs">GitHub</span>
            </a>
          )}
          {project.figmaLink && (
            <a
              href={project.figmaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <Link size={14} />
              <span className="text-xs">Figma</span>
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-4 text-small text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(project.startDate)}</span>
          </div>
          {project.endDate && (
            <div className={`flex items-center gap-1 ${isOverdue(project.endDate, project.status) ? 'text-red-400' : ''}`}>
              <span>→</span>
              <span>{formatDate(project.endDate)}</span>
              {isOverdue(project.endDate, project.status) && <span>(Overdue)</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-small text-gray-400">
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{project.collaborators.length}</span>
            </div>
          )}
          {project.tasks && project.tasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle size={12} />
              <span>{project.tasks.length}</span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            action="edit"
            onClick={(e) => {
              e?.stopPropagation();
              onEdit?.(project);
            }}
            variant="ghost"
            size="sm"
            text=""
          />
          <Button
            action="delete"
            onClick={(e) => {
              e?.stopPropagation();
              onDelete?.(project._id);
            }}
            variant="ghost"
            size="sm"
            text=""
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
