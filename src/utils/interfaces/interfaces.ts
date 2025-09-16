//this file is used to define all interfaces in the application

import { Priority, Status, ProjectStatus, LessonType, TestType, EventType, ContactType } from '../types/types';

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  // Freeform label for task kind, e.g., "Homework" or "Sub-Project mission"
  type?: string;
  dueDate: Date;
  projectId?: string;
  lessonId?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  // UI-only: associated contacts (persisted locally to avoid backend changes)
  contacts?: string[];
}

export interface Project extends BaseEntity {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  priority: Priority;
  progress: number; // 0-100
  tasks?: string[]; // Task IDs
  collaborators?: string[]; // Contact IDs
  tags: string[];
  githubLink?: string;
  figmaLink?: string;
  mailingList?: string;
}

export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  type: ContactType;
  notes?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface Lesson extends BaseEntity {
  title: string;
  subject: string;
  type: LessonType;
  date: Date;
  duration: number; // in minutes
  location?: string;
  instructor?: string;
  description?: string;
  materials: string[]; // URLs or file paths
  completed: boolean;
}

export interface Test extends BaseEntity {
  title: string;
  subject: string;
  type: TestType;
  date: Date;
  duration?: number; // in minutes
  location?: string;
  totalMarks?: number;
  achievedMarks?: number;
  grade?: string;
  studyMaterials: string[];
  notes?: string;
}

export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  type: EventType;
  location?: string;
  attendees?: string[]; // Contact IDs
  reminders: number[]; // Minutes before event
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    count?: number;
  };
}

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  entityType?: 'task' | 'project' | 'event' | 'lesson' | 'test';
  entityId?: string;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultView: 'dashboard' | 'calendar' | 'tasks' | 'projects';
    notifications: {
      email: boolean;
      push: boolean;
    };
    timezone: string;
  };
}
