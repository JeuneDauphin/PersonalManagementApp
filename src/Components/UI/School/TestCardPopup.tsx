// Test card popup modal for viewing/editing test details
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Trophy, FileText, Star } from 'lucide-react';
import { Test } from '../../../utils/interfaces/interfaces';
import { TestType } from '../../../utils/types/types';
import Button from '../Button';
import TimePicker from '../TimePicker';

interface TestCardPopupProps {
  test?: Test | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (test: Test) => void;
  onDelete?: () => void;
  // If true and a test is provided, open directly in edit mode
  startInEdit?: boolean;
}

const TestCardPopup: React.FC<TestCardPopupProps> = ({
  test,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    type: 'quiz' as TestType,
    date: '',
    time: '',
    duration: 60,
    location: '',
    totalMarks: 100,
    achievedMarks: undefined as number | undefined,
    grade: '',
    studyMaterials: [] as string[],
    notes: '',
  });
  const [materialInput, setMaterialInput] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (test) {
      const testDate = new Date(test.date);
      setFormData({
        title: test.title,
        subject: test.subject,
        type: test.type,
        date: testDate.toISOString().slice(0, 10),
        time: testDate.toTimeString().slice(0, 5),
        duration: test.duration || 60,
        location: test.location || '',
        totalMarks: test.totalMarks || 100,
        achievedMarks: test.achievedMarks,
        grade: test.grade || '',
        studyMaterials: test.studyMaterials || [],
        notes: test.notes || '',
      });
      setIsEditing(!!startInEdit);
    } else {
      // New test
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(9, 0, 0, 0);

      setFormData({
        title: '',
        subject: '',
        type: 'quiz',
        date: nextWeek.toISOString().slice(0, 10),
        time: '09:00',
        duration: 60,
        location: '',
        totalMarks: 100,
        achievedMarks: undefined,
        grade: '',
        studyMaterials: [],
        notes: '',
      });
      setIsEditing(true);
    }
  }, [test, startInEdit]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    if (materialInput.trim() && !formData.studyMaterials.includes(materialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        studyMaterials: [...prev.studyMaterials, materialInput.trim()]
      }));
      setMaterialInput('');
    }
  };

  const handleRemoveMaterial = (materialToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      studyMaterials: prev.studyMaterials.filter(material => material !== materialToRemove)
    }));
  };

  const handleSave = () => {
    // Combine date and time
    const testDateTime = new Date(`${formData.date}T${formData.time}`);

    const testData: Test = {
      _id: test?._id || `temp-${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      type: formData.type,
      date: testDateTime,
      duration: formData.duration || undefined,
      location: formData.location || undefined,
      totalMarks: formData.totalMarks || undefined,
      achievedMarks: formData.achievedMarks,
      grade: formData.grade || undefined,
      studyMaterials: formData.studyMaterials,
      notes: formData.notes || undefined,
      createdAt: test?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(testData);
  };

  const getTypeColor = (type: TestType) => {
    switch (type) {
      case 'quiz': return 'text-green-400 bg-green-600';
      case 'midterm': return 'text-orange-400 bg-orange-600';
      case 'final': return 'text-red-400 bg-red-600';
      case 'assignment': return 'text-blue-400 bg-blue-600';
      case 'project': return 'text-purple-400 bg-purple-600';
      default: return 'text-gray-400 bg-gray-600';
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

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Not specified';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const calculatePercentage = () => {
    if (formData.totalMarks && formData.achievedMarks !== undefined) {
      return Math.round((formData.achievedMarks / formData.totalMarks) * 100);
    }
    return null;
  };

  const isPast = () => {
    const testDateTime = new Date(`${formData.date}T${formData.time}`);
    return testDateTime < new Date();
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
            {test ? (isEditing ? 'Edit Test' : 'Test Details') : 'New Test'}
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
                    placeholder="Test title"
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
                  onChange={(e) => handleInputChange('type', e.target.value as TestType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
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

                <div className="relative">
                  <label className="block text-body text-gray-300 mb-2">Time *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(v => !v)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left"
                    >
                      {formData.time || '--:--'}
                    </button>
                    {showTimePicker && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center">
                        <div className="bg-gray-800 rounded-md border border-gray-700">
                          <TimePicker
                            value={formData.time}
                            onChange={(hhmm) => { setFormData(prev => ({ ...prev, time: hhmm })); }}
                            onClose={() => setShowTimePicker(false)}
                            minuteStep={5}
                            compact
                            itemHeight={24}
                            visibleCount={3}
                            columnWidthClass="w-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    min="1"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Location */}
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

              {/* Marks and Grade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks || ''}
                    onChange={(e) => handleInputChange('totalMarks', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Achieved Marks</label>
                  <input
                    type="number"
                    value={formData.achievedMarks !== undefined ? formData.achievedMarks : ''}
                    onChange={(e) => handleInputChange('achievedMarks', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    placeholder="Leave empty if not graded"
                  />
                </div>

                <div>
                  <label className="block text-body text-gray-300 mb-2">Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="A, B+, etc."
                  />
                </div>
              </div>

              {/* Study Materials */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Study Materials</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add study material URL..."
                  />
                  <Button
                    text="Add"
                    onClick={handleAddMaterial}
                    variant="outline"
                    size="sm"
                  />
                </div>
                {formData.studyMaterials.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.studyMaterials.map((material, index) => (
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

              {/* Notes */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or study tips"
                />
              </div>
            </>
          ) : (
            // View Mode
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{test?.title}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-lg text-gray-300">{test?.subject}</span>
                    <span className={`px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(test?.type || 'quiz')}`}>
                      {test?.type?.toUpperCase()}
                    </span>
                  </div>
                </div>
                {test && isPast() && test.grade && (
                  <div className="text-center">
                    <div className="text-small text-gray-400 mb-1">Grade</div>
                    <div className={`text-3xl font-bold ${getGradeColor(test.grade)}`}>
                      {test.grade}
                    </div>
                  </div>
                )}
              </div>

              {/* DateTime and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-small text-gray-400">Date & Time</div>
                    <div className="text-body text-white">
                      {test && formatDateTime(formData.date, formData.time)}
                    </div>
                  </div>
                </div>
                {test?.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <div className="text-small text-gray-400">Duration</div>
                      <div className="text-body text-white">{formatDuration(test.duration)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              {test?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <div className="text-small text-gray-400">Location</div>
                    <div className="text-body text-white">{test.location}</div>
                  </div>
                </div>
              )}

              {/* Scores */}
              {test && isPast() && (test.achievedMarks !== undefined || test.totalMarks) && (
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
                        <div className="text-small text-gray-400">
                          ({calculatePercentage()}%)
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star size={16} className="text-blue-400" />
                      <span className="text-small text-gray-400">Grade</span>
                    </div>
                    {test.grade && (
                      <span className={`text-xl font-bold ${getGradeColor(test.grade)}`}>
                        {test.grade}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Study Materials */}
              {test?.studyMaterials && test.studyMaterials.length > 0 && (
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

              {/* Notes */}
              {test?.notes && (
                <div>
                  <h3 className="text-body font-medium text-gray-300 mb-2">Notes</h3>
                  <p className="text-body text-gray-400 leading-relaxed">{test.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {test && !isEditing && (
              <Button
                text="Edit"
                onClick={() => setIsEditing(true)}
                variant="outline"
              />
            )}
            {test && !isEditing && onDelete && (
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
                  onClick={() => test ? setIsEditing(false) : onClose()}
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

export default TestCardPopup;
