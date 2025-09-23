// Task list component displaying tasks in a grid layout
import React from 'react';
import { Task } from '../../../utils/interfaces/interfaces';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import Button from '../Button';

interface TaskListsProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskToggle?: (task: Task) => void;
  // Optional unassign action for contexts like project detail
  onTaskUnassign?: (taskId: string) => void;
  showActions?: boolean;
}

const TaskLists: React.FC<TaskListsProps> = ({
  tasks,
  isLoading = false,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskToggle,
  onTaskUnassign,
  showActions = true,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare size={16} className="text-green-400" />;
      case 'in-progress': return <Clock size={16} className="text-blue-400" />;
      case 'pending': return <AlertTriangle size={16} className="text-yellow-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: Date, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if ((tasks || []).length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks found</h3>
        <p className="text-gray-500">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(tasks || []).map((task) => (
    <div
          key={task._id}
          className={`
            bg-gray-800 border border-gray-700 rounded-lg p-4
      hover:border-gray-600 transition-colors cursor-pointer group relative
            ${task.status === 'completed' ? 'opacity-75' : ''}
            ${isOverdue(task.dueDate, task.status) ? 'border-red-500' : ''}
          `}
          onClick={() => onTaskClick?.(task)}
        >
          {/* Priority indicator */}
          <div className={`w-full h-1 ${getPriorityColor(task.priority)} rounded-t mb-3`} />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <span className={`text-body font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                }`}>
                {task.title}
              </span>
            </div>

            {/* actions moved to bottom-right */}
          </div>

          {/* Type badge */}
          {task.type && (
            <div className="mb-2">
              <span className="inline-block px-2 py-0.5 rounded bg-purple-700/40 border border-purple-600 text-purple-200 text-xs">
                {task.type}
              </span>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className="text-small text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <div className={`text-small ${isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-gray-400'
              }`}>
              Due: {formatDate(task.dueDate)}
              {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
            </div>
          </div>

          {showActions && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskToggle?.(task);
                }}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
              >
                <CheckSquare size={14} />
              </button>
              {onTaskUnassign && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTaskUnassign(task._id); }}
                  className="px-2 py-1 text-xs text-orange-300 hover:text-white hover:bg-orange-700/30 rounded transition-colors"
                  title="Unassign from project"
                >
                  Unassign
                </button>
              )}
              <Button
                action="edit"
                onClick={(e) => {
                  e?.stopPropagation();
                  onTaskEdit?.(task);
                }}
                variant="ghost"
                size="sm"
                text=""
              />
              <Button
                action="delete"
                onClick={(e) => {
                  e?.stopPropagation();
                  onTaskDelete?.(task._id);
                }}
                variant="ghost"
                size="sm"
                text=""
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskLists;
