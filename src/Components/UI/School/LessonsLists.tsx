
// Lessons list component displaying lessons in a grid layout
import React from 'react';
import { Lesson } from '../../../utils/interfaces/interfaces';
import { BookOpen } from 'lucide-react';
import LessonCard from './LessonCard';

interface LessonsListsProps {
  lessons: Lesson[];
  isLoading?: boolean;
  onLessonClick?: (lesson: Lesson) => void;
  onLessonEdit?: (lesson: Lesson) => void;
  onLessonDelete?: (lessonId: string) => void;
  onLessonToggle?: (lesson: Lesson) => void;
  showActions?: boolean;
}

const LessonsLists: React.FC<LessonsListsProps> = ({
  lessons,
  isLoading = false,
  onLessonClick,
  onLessonEdit,
  onLessonDelete,
  onLessonToggle,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-1 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ((lessons || []).length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No lessons found</h3>
        <p className="text-gray-500">Create your first lesson to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(lessons || []).map((lesson) => (
        <LessonCard
          key={lesson._id}
          lesson={lesson}
          onClick={onLessonClick}
          onEdit={onLessonEdit}
          onDelete={onLessonDelete}
          onToggle={onLessonToggle}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default LessonsLists;
