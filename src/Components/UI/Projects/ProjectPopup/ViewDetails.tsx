import React from 'react';
import { Calendar, GitBranch, Link, Tag, Users } from 'lucide-react';
import { Project, Contact } from '../../../../utils/interfaces/interfaces';
import { Priority, ProjectStatus } from '../../../../utils/types/types';
import { effectiveProjectStatus } from '../../../../utils/projectUtils';

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

const formatDate = (input?: Date) => {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '—';
  const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
  try {
    return d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d.toDateString();
  }
};

const ViewDetails: React.FC<{ project: Project; contacts: Contact[] }> = ({ project, contacts }) => {
  const uiStatus = effectiveProjectStatus(project.status as any, project.progress || 0);
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-small font-medium ${getStatusColor(uiStatus as any)} bg-gray-700`}>
              {uiStatus.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-small font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-small text-gray-400 mb-1">Progress</div>
          <div className="text-2xl font-bold text-white">{project.progress}%</div>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2">
        {(() => {
          const barColor =
            uiStatus === 'planning' ? 'bg-gray-500' :
              uiStatus === 'active' ? 'bg-green-500' :
                uiStatus === 'on-hold' ? 'bg-yellow-500' :
                  uiStatus === 'completed' ? 'bg-blue-500' :
                    uiStatus === 'cancelled' ? 'bg-red-500' : 'bg-gray-500';
          return (
            <div className={`h-2 rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${project.progress || 0}%` }} />
          );
        })()}
      </div>

      {project.description && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Description</h3>
          <p className="text-body text-gray-400 leading-relaxed">{project.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <div className="text-small text-gray-400">Start Date</div>
            <div className="text-body text-white">{formatDate(project.startDate)}</div>
          </div>
        </div>
        {project.endDate && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">End Date</div>
              <div className="text-body text-white">{formatDate(project.endDate as any)}</div>
            </div>
          </div>
        )}
      </div>

      {(project.githubLink || project.figmaLink) && (
        <div className="space-y-2">
          <h3 className="text-body font-medium text-gray-300">Links</h3>
          <div className="flex flex-wrap gap-3">
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
                <GitBranch size={16} />
                <span>GitHub</span>
              </a>
            )}
            {project.figmaLink && (
              <a href={project.figmaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
                <Link size={16} />
                <span>Figma</span>
              </a>
            )}
          </div>
        </div>
      )}

      {project.tags && project.tags.length > 0 && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.collaborators && project.collaborators.length > 0 && (
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
                <a key={id} href={href} className="px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-600/40 text-blue-200 text-small">{label}</a>
              ) : (
                <span key={id} className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small">{label}</span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewDetails;
