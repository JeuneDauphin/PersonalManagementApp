
// Lesson card component displaying lesson details in a card format
import React from 'react';
import { Lesson } from '../../../utils/interfaces/interfaces';
import { Calendar, Clock, MapPin, User, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../Button';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: (lesson: Lesson) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  onToggle?: (lesson: Lesson) => void;
  showActions?: boolean;
  isSelected?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  onEdit,
  onDelete,
  onToggle,
  showActions = true,
  isSelected = false,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-500';
      case 'seminar': return 'bg-green-500';
      case 'lab': return 'bg-purple-500';
      case 'tutorial': return 'bg-yellow-500';
      case 'exam': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (completed: boolean) => {
    return completed
      ? <CheckCircle size={16} className="text-green-400" />
      : <AlertTriangle size={16} className="text-yellow-400" />;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div
      className={`
        bg-gray-800 border border-gray-700 rounded-lg p-4
        hover:border-gray-600 transition-colors cursor-pointer group
        ${lesson.completed ? 'opacity-75' : ''}
        ${isSelected ? 'border-blue-500' : ''}
      `}
      onClick={() => onClick?.(lesson)}
    >
      {/* Type indicator */}
      <div className={`w-full h-1 ${getTypeColor(lesson.type)} rounded-t mb-3`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(lesson.completed)}
          <span className={`text-body font-medium ${lesson.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {lesson.title}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(lesson);
              }}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              title={lesson.completed ? 'Mark as pending' : 'Mark as completed'}
            >
              <CheckCircle size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Subject and Type */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={14} className="text-gray-400" />
        <span className="text-small text-gray-300">{lesson.subject}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(lesson.type)}`}>
          {lesson.type.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {lesson.description && (
        <p className="text-small text-gray-400 mb-3 line-clamp-2">
          {lesson.description}
        </p>
      )}

      {/* Date and Duration */}
      <div className="flex items-center gap-4 mb-3 text-small text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(lesson.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTime(lesson.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatDuration(lesson.duration)}</span>
        </div>
      </div>

      {/* Location and Instructor */}
      <div className="space-y-1 mb-3">
        {lesson.location && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <MapPin size={12} />
            <span>{lesson.location}</span>
          </div>
        )}
        {lesson.instructor && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <User size={12} />
            <span>{lesson.instructor}</span>
          </div>
        )}
      </div>

      {/* Materials */}
      {lesson.materials && lesson.materials.length > 0 && (
        <div className="mb-3">
          <div className="text-small text-gray-400 mb-1">Materials ({lesson.materials.length})</div>
          <div className="flex flex-wrap gap-1">
            {lesson.materials.slice(0, 2).map((material, index) => (
              <a
                key={index}
                href={material}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
              >
                Material {index + 1}
              </a>
            ))}
            {lesson.materials.length > 2 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                +{lesson.materials.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {showActions && (
        <div className="flex items-center justify-end pt-3 border-t border-gray-700">
          <div className="flex items-center gap-1">
            <Button
              action="edit"
              onClick={(e) => {
                e?.stopPropagation();
                onEdit?.(lesson);
              }}
              variant="ghost"
              size="sm"
              text=""
            />
            <Button
              action="delete"
              onClick={(e) => {
                e?.stopPropagation();
                onDelete?.(lesson._id);
              }}
              variant="ghost"
              size="sm"
              text=""
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonCard;
