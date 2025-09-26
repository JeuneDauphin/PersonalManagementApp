import React from 'react';
import { Calendar, Clock, MapPin, Trophy, FileText, Star } from 'lucide-react';
import { Test } from '../../../../utils/interfaces/interfaces';

const formatDateTime = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (duration?: number) => {
  if (!duration) return 'Not specified';
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

const getTypeColor = (type: Test['type']) => {
  switch (type) {
    case 'quiz':
      return 'text-green-400 bg-green-600';
    case 'midterm':
      return 'text-orange-400 bg-orange-600';
    case 'final':
      return 'text-red-400 bg-red-600';
    case 'assignment':
      return 'text-blue-400 bg-blue-600';
    case 'project':
      return 'text-purple-400 bg-purple-600';
    default:
      return 'text-gray-400 bg-gray-600';
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

const isPast = (date: Date) => new Date(date) < new Date();

const calculatePercentage = (achieved?: number, total?: number) => {
  if (achieved !== undefined && total) return Math.round((achieved / total) * 100);
  return null;
};

const ViewDetails: React.FC<{ test: Test }> = ({ test }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-300">{test.subject}</span>
            <span className={`px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(test.type)}`}>
              {test.type.toUpperCase()}
            </span>
          </div>
        </div>
        {isPast(test.date) && test.grade && (
          <div className="text-center">
            <div className="text-small text-gray-400 mb-1">Grade</div>
            <div className={`text-3xl font-bold ${getGradeColor(test.grade)}`}>{test.grade}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <div className="text-small text-gray-400">Date & Time</div>
            <div className="text-body text-white">{formatDateTime(test.date)}</div>
          </div>
        </div>
        {test.duration && (
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">Duration</div>
              <div className="text-body text-white">{formatDuration(test.duration)}</div>
            </div>
          </div>
        )}
      </div>

      {test.location && (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <div>
            <div className="text-small text-gray-400">Location</div>
            <div className="text-body text-white">{test.location}</div>
          </div>
        </div>
      )}

      {isPast(test.date) && (test.achievedMarks !== undefined || test.totalMarks) && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-small text-gray-400">Score</span>
            </div>
            {test.achievedMarks !== undefined && test.totalMarks && (
              <div>
                <span className="text-xl font-bold text-white">
                  {test.achievedMarks}/{test.totalMarks}
                </span>
                <div className="text-small text-gray-400">({calculatePercentage(test.achievedMarks, test.totalMarks)}%)</div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star size={16} className="text-blue-400" />
              <span className="text-small text-gray-400">Grade</span>
            </div>
            {test.grade && <span className={`text-xl font-bold ${getGradeColor(test.grade)}`}>{test.grade}</span>}
          </div>
        </div>
      )}

      {test.studyMaterials && test.studyMaterials.length > 0 && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Study Materials</h3>
          <div className="flex flex-wrap gap-3">
            {test.studyMaterials.map((material, index) => (
              <a
                key={index}
                href={material}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                <FileText size={16} />
                <span>Material {index + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {test.notes && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Notes</h3>
          <p className="text-body text-gray-400 leading-relaxed">{test.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ViewDetails;
