import React from 'react';
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import { Lesson } from '../../../../utils/interfaces/interfaces';

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

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

const getTypeColor = (type: Lesson['type']) => {
  switch (type) {
    case 'lecture':
      return 'text-blue-400 bg-blue-600';
    case 'seminar':
      return 'text-green-400 bg-green-600';
    case 'lab':
      return 'text-purple-400 bg-purple-600';
    case 'tutorial':
      return 'text-yellow-400 bg-yellow-600';
    case 'exam':
      return 'text-red-400 bg-red-600';
    default:
      return 'text-gray-400 bg-gray-600';
  }
};

const ViewDetails: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-300">{lesson.subject}</span>
            <span className={`px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(lesson.type)}`}>
              {lesson.type.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-small font-medium ${lesson.completed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>
              {lesson.completed ? 'COMPLETED' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <div className="text-small text-gray-400">Date & Time</div>
            <div className="text-body text-white">{formatDateTime(lesson.date)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <div>
            <div className="text-small text-gray-400">Duration</div>
            <div className="text-body text-white">{formatDuration(lesson.duration)}</div>
          </div>
        </div>
      </div>

      {(lesson.location || lesson.instructor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <div>
                <div className="text-small text-gray-400">Location</div>
                <div className="text-body text-white">{lesson.location}</div>
              </div>
            </div>
          )}
          {lesson.instructor && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <div>
                <div className="text-small text-gray-400">Instructor</div>
                <div className="text-body text-white">{lesson.instructor}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {lesson.description && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Description</h3>
          <p className="text-body text-gray-400 leading-relaxed">{lesson.description}</p>
        </div>
      )}

      {lesson.materials && lesson.materials.length > 0 && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Materials</h3>
          <div className="flex flex-wrap gap-3">
            {lesson.materials.map((material, index) => (
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
    </div>
  );
};

export default ViewDetails;
