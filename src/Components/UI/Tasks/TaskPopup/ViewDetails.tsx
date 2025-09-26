import React from 'react';
import { Calendar, Clock, Hash, School, Tag, Users, CheckSquare } from 'lucide-react';
import { Contact, Lesson, Project, Task } from '../../../../utils/interfaces/interfaces';
import { Priority, Status } from '../../../../utils/types/types';

interface ViewDetailsProps {
  task: Task;
  contacts: Contact[];
  projects: Project[];
  lessons: Lesson[];
}

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

const ViewDetails: React.FC<ViewDetailsProps> = ({ task, contacts, projects, lessons }) => {
  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    return c ? `${c.firstName} ${c.lastName}`.trim() : id;
  };
  const getProjectName = (id?: string) => {
    if (!id) return undefined;
    const p = projects.find(pr => pr._id === id);
    return p?.name ?? id;
  };
  const getLessonTitle = (id?: string) => {
    if (!id) return undefined;
    const l = lessons.find(ls => ls._id === id);
    return l?.title ?? id;
  };

  const formattedDue = task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date';

  return (
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

      {/* Associations */}
      {(task as any).projectId || (task as any).lessonId ? (
        <div className="flex flex-col gap-1 mt-2">
          {(task as any).projectId && (
            <div className="flex items-center gap-2 text-body text-blue-400">
              <Hash size={16} />
              <a href="/projects" className="hover:text-blue-300">
                {getProjectName((task as any).projectId)}
              </a>
            </div>
          )}
          {(task as any).lessonId && (
            <div className="flex items-center gap-2 text-body text-purple-300">
              <School size={16} />
              <a href="/school" className="hover:text-purple-200">
                {getLessonTitle((task as any).lessonId)}
              </a>
            </div>
          )}
        </div>
      ) : null}

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
        <span>Due: {formattedDue}</span>
      </div>

      {/* Hours */}
      {(task.estimatedHours || task.actualHours) && (
        <div className="flex items-center gap-2 text-body text-gray-300">
          <Clock size={16} />
          <span>
            {task.estimatedHours ? `Estimated: ${task.estimatedHours}h` : ''}
            {task.estimatedHours && task.actualHours ? ' • ' : ''}
            {task.actualHours ? `Actual: ${task.actualHours}h` : ''}
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-small rounded">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      {(task.contacts && task.contacts.length > 0) && (
        <div className="flex flex-col gap-1 text-body text-blue-300">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            <span>{task.contacts.length} contact{task.contacts.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.contacts.map(id => (
              <span key={id} className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small">
                {getContactName(id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewDetails;
