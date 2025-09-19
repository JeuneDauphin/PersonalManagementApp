//this file will contain all the types used in the application

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type LessonType = 'lecture' | 'seminar' | 'lab' | 'tutorial' | 'exam';
export type TestType = 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
export type EventType = 'meeting' | 'deadline' | 'appointment' | 'reminder' | 'personal' | 'holiday';
export type ContactType = 'personal' | 'work' | 'school' | 'client' | 'vendor';

export type FilterCriteria = {
  priority?: Priority[];
  status?: Status[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
};

export type SortOption = 'date' | 'priority' | 'name' | 'status';
export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'list' | 'card' | 'calendar';
