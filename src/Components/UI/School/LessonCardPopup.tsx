// Lesson card popup modal for viewing/editing lesson details
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import { Lesson } from '../../../utils/interfaces/interfaces';
import { LessonType } from '../../../utils/types/types';
import Button from '../Button';

interface LessonCardPopupProps {
  lesson?: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (lesson: Lesson) => void;
  onDelete?: () => void;
}

const LessonCardPopup: React.FC<LessonCardPopupProps> = ({
  lesson,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    type: 'lecture' as LessonType,
    date: '',
    time: '',
    duration: 60,
    location: '',
    instructor: '',
    description: '',
    materials: [] as string[],
    completed: false,
  });
  const [materialInput, setMaterialInput] = useState('');

  useEffect(() => {
    if (lesson) {
      const lessonDate = new Date(lesson.date);
      setFormData({
        title: lesson.title,
        subject: lesson.subject,
        type: lesson.type,
        date: lessonDate.toISOString().slice(0, 10),
        time: lessonDate.toTimeString().slice(0, 5),
        duration: lesson.duration,
        location: lesson.location || '',
        instructor: lesson.instructor || '',
        description: lesson.description || '',
        materials: lesson.materials || [],
        completed: lesson.completed,
      });
      setIsEditing(false);
    } else {
      // New lesson
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      setFormData({
        title: '',
        subject: '',
        type: 'lecture',
        date: tomorrow.toISOString().slice(0, 10),
        time: '09:00',
        duration: 60,
        location: '',
        instructor: '',
        description: '',
        materials: [],
        completed: false,
      });
      setIsEditing(true);
    }
  }, [lesson]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    if (materialInput.trim() && !formData.materials.includes(materialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()]
      }));
      setMaterialInput('');
    }
  };

  const handleRemoveMaterial = (materialToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material !== materialToRemove)
    }));
  };

  const handleSave = () => {
    // Combine date and time
    const lessonDateTime = new Date(`${formData.date}T${formData.time}`);

    const lessonData: Lesson = {
      _id: lesson?._id || `temp-${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      type: formData.type,
      date: lessonDateTime,
      duration: formData.duration,
      location: formData.location || undefined,
      instructor: formData.instructor || undefined,
      description: formData.description || undefined,
      materials: formData.materials,
      completed: formData.completed,
      createdAt: lesson?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(lessonData);
  };

  const getTypeColor = (type: LessonType) => {
    switch (type) {
      case 'lecture': return 'text-blue-400 bg-blue-600';
      case 'seminar': return 'text-green-400 bg-green-600';
      case 'lab': return 'text-purple-400 bg-purple-600';
      case 'tutorial': return 'text-yellow-400 bg-yellow-600';
      case 'exam': return 'text-red-400 bg-red-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('en-US', {
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
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
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
            {lesson ? (isEditing ? 'Edit Lesson' : 'Lesson Details') : 'New Lesson'}
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
              {/* Title and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Lesson title"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Subject name"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as LessonType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lecture">Lecture</option>
                  <option value="seminar">Seminar</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              {/* Date, Time, and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              {/* Location and Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Room or location"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Instructor name"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Lesson description or notes"
                />
              </div>

              {/* Materials */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Materials</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add material URL..."
                  />
                  <Button
                    text="Add"
                    onClick={handleAddMaterial}
                    variant="outline"
                    size="sm"
                  />
                </div>
                {formData.materials.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.materials.map((material, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small"
                      >
                        <FileText size={12} />
                        <a
                          href={material}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white"
                        >
                          Material {index + 1}
                        </a>
                        <button
                          onClick={() => handleRemoveMaterial(material)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => handleInputChange('completed', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="completed" className="text-body text-gray-300">
                  Mark as completed
                </label>
              </div>
            </>
          ) : (
            // View Mode
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{lesson?.title}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-lg text-gray-300">{lesson?.subject}</span>
                    <span className={`px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(lesson?.type || 'lecture')}`}>
                      {lesson?.type?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-small font-medium ${lesson?.completed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>
                      {lesson?.completed ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DateTime and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-small text-gray-400">Date & Time</div>
                    <div className="text-body text-white">
                      {lesson && formatDateTime(formData.date, formData.time)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <div>
                    <div className="text-small text-gray-400">Duration</div>
                    <div className="text-body text-white">{formatDuration(lesson?.duration || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Location and Instructor */}
              {(lesson?.location || lesson?.instructor) && (
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

              {/* Description */}
              {lesson?.description && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-2">Description</h3>
                  <p className="text-body text-gray-400 leading-relaxed">{lesson.description}</p>
                </div>
              )}

              {/* Materials */}
              {lesson?.materials && lesson.materials.length > 0 && (
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {lesson && !isEditing && (
              <Button
                text="Edit"
                onClick={() => setIsEditing(true)}
                variant="outline"
              />
            )}
            {lesson && !isEditing && onDelete && (
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
                  onClick={() => lesson ? setIsEditing(false) : onClose()}
                  variant="outline"
                />
                <Button
                  text="Save"
                  onClick={handleSave}
                  variant="primary"
                  disabled={!formData.title.trim() || !formData.subject.trim()}
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

export default LessonCardPopup;
