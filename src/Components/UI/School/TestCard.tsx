
// Test card component displaying test details in a card format
import React from 'react';
import { Test } from '../../../utils/interfaces/interfaces';
import { Calendar, Clock, MapPin, Trophy, FileText, Star } from 'lucide-react';
import Button from '../Button';

interface TestCardProps {
  test: Test;
  onClick?: (test: Test) => void;
  onEdit?: (test: Test) => void;
  onDelete?: (testId: string) => void;
  showActions?: boolean;
  isSelected?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({
  test,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  isSelected = false,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-green-500';
      case 'midterm': return 'bg-orange-500';
      case 'final': return 'bg-red-500';
      case 'assignment': return 'bg-blue-500';
      case 'project': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-400';
    const upperGrade = grade.toUpperCase();
    if (upperGrade.includes('A')) return 'text-green-400';
    if (upperGrade.includes('B')) return 'text-blue-400';
    if (upperGrade.includes('C')) return 'text-yellow-400';
    if (upperGrade.includes('D')) return 'text-orange-400';
    if (upperGrade.includes('F')) return 'text-red-400';
    return 'text-gray-400';
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

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const calculatePercentage = () => {
    if (test.totalMarks && test.achievedMarks !== undefined) {
      return Math.round((test.achievedMarks / test.totalMarks) * 100);
    }
    return null;
  };

  const isPast = () => {
    return new Date(test.date) < new Date();
  };

  const isUpcoming = () => {
    const testDate = new Date(test.date);
    const now = new Date();
    const timeDiff = testDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 && daysDiff <= 7;
  };

  return (
    <div
      className={`
        bg-gray-800 border border-gray-700 rounded-lg p-4
        hover:border-gray-600 transition-colors cursor-pointer group
        ${isSelected ? 'border-blue-500' : ''}
        ${isUpcoming() ? 'border-yellow-500' : ''}
      `}
      onClick={() => onClick?.(test)}
    >
      {/* Type indicator */}
      <div className={`w-full h-1 ${getTypeColor(test.type)} rounded-t mb-3`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-body font-medium text-white mb-1">{test.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-small text-gray-300">{test.subject}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(test.type)}`}>
              {test.type.toUpperCase()}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              action="edit"
              onClick={(e) => {
                e?.stopPropagation();
                onEdit?.(test);
              }}
              variant="ghost"
              size="sm"
              text=""
            />
            <Button
              action="delete"
              onClick={(e) => {
                e?.stopPropagation();
                onDelete?.(test._id);
              }}
              variant="ghost"
              size="sm"
              text=""
            />
          </div>
        )}
      </div>

      {/* Date and Duration */}
      <div className="flex items-center gap-4 mb-3 text-small text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(test.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTime(test.date)}</span>
        </div>
        {test.duration && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDuration(test.duration)}</span>
          </div>
        )}
      </div>

      {/* Location */}
      {test.location && (
        <div className="flex items-center gap-2 mb-3 text-small text-gray-400">
          <MapPin size={12} />
          <span>{test.location}</span>
        </div>
      )}

      {/* Scores and Grade */}
      {isPast() && (test.achievedMarks !== undefined || test.grade) && (
        <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-small text-gray-400">Score</span>
            </div>
            {test.achievedMarks !== undefined && test.totalMarks && (
              <div>
                <span className="text-body font-medium text-white">
                  {test.achievedMarks}/{test.totalMarks}
                </span>
                <div className="text-small text-gray-400">
                  ({calculatePercentage()}%)
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={14} className="text-blue-400" />
              <span className="text-small text-gray-400">Grade</span>
            </div>
            {test.grade && (
              <span className={`text-lg font-bold ${getGradeColor(test.grade)}`}>
                {test.grade}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Study Materials */}
      {test.studyMaterials && test.studyMaterials.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-small text-gray-400 mb-1">
            <FileText size={12} />
            <span>Study Materials ({test.studyMaterials.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {test.studyMaterials.slice(0, 2).map((material, index) => (
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
            {test.studyMaterials.length > 2 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                +{test.studyMaterials.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {test.notes && (
        <div className="pt-3 border-t border-gray-700">
          <p className="text-small text-gray-400 line-clamp-2">
            {test.notes}
          </p>
        </div>
      )}

      {/* Status indicator */}
      {isUpcoming() && (
        <div className="mt-3 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded text-center">
          Upcoming Test
        </div>
      )}
    </div>
  );
};

export default TestCard;
