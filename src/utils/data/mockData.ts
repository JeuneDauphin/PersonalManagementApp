// Mock data for testing the application
import { Task, CalendarEvent, Project } from '../interfaces/interfaces';

// Mock Tasks
export const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Complete React dashboard',
    description: 'Build the main dashboard with calendar integration and task management',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date('2025-09-05'),
    tags: ['react', 'frontend', 'dashboard'],
    estimatedHours: 8,
    actualHours: 5,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-02'),
  },
  {
    _id: '2',
    title: 'Review code',
    description: 'Review pull requests and provide feedback',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2025-09-03'),
    tags: ['review', 'code'],
    estimatedHours: 2,
    actualHours: 0,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
  },
  {
    _id: '3',
    title: 'Update documentation',
    description: 'Update API documentation with new endpoints',
    priority: 'low',
    status: 'completed',
    dueDate: new Date('2025-09-01'),
    tags: ['documentation', 'api'],
    estimatedHours: 3,
    actualHours: 4,
    createdAt: new Date('2025-08-28'),
    updatedAt: new Date('2025-09-01'),
  },
  {
    _id: '4',
    title: 'Fix urgent bug',
    description: 'Critical bug affecting user login functionality',
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date('2025-09-02'),
    tags: ['bug', 'urgent', 'auth'],
    estimatedHours: 4,
    actualHours: 0,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
  }
];

// Mock Events
export const mockEvents: CalendarEvent[] = [
  {
    _id: '1',
    title: 'Team Standup',
    description: 'Daily standup meeting with development team',
    startDate: new Date('2025-09-03T09:00:00'),
    endDate: new Date('2025-09-03T09:30:00'),
    isAllDay: false,
    type: 'meeting',
    location: 'Conference Room A',
    attendees: ['john@example.com', 'jane@example.com'],
    reminders: [15, 5],
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
  },
  {
    _id: '2',
    title: 'Project Deadline',
    description: 'Final submission for Q3 project deliverables',
    startDate: new Date('2025-09-15T17:00:00'),
    endDate: new Date('2025-09-15T18:00:00'),
    isAllDay: false,
    type: 'deadline',
    reminders: [1440, 720, 60], // 24h, 12h, 1h before
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-08-15'),
  },
  {
    _id: '3',
    title: 'Doctor Appointment',
    description: 'Annual health checkup',
    startDate: new Date('2025-09-07T14:00:00'),
    endDate: new Date('2025-09-07T15:00:00'),
    isAllDay: false,
    type: 'appointment',
    location: 'Medical Center',
    reminders: [60],
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-08-20'),
  },
  {
    _id: '4',
    title: 'Weekend Trip',
    description: 'Family weekend getaway',
    startDate: new Date('2025-09-06'),
    endDate: new Date('2025-09-08'),
    isAllDay: true,
    type: 'personal',
    location: 'Mountain Resort',
    reminders: [2880], // 2 days before
    createdAt: new Date('2025-08-10'),
    updatedAt: new Date('2025-08-10'),
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    _id: '1',
    name: 'Personal Management App',
    description: 'Full-stack personal productivity application with calendar, tasks, and project management',
    status: 'active',
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-10-15'),
    priority: 'high',
    progress: 65,
    tasks: ['1', '2'],
    collaborators: [],
    tags: ['react', 'typescript', 'mongodb'],
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-09-02'),
  },
  {
    _id: '2',
    name: 'API Documentation',
    description: 'Comprehensive API documentation for all endpoints',
    status: 'completed',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-08-31'),
    priority: 'medium',
    progress: 100,
    tasks: ['3'],
    collaborators: [],
    tags: ['documentation', 'api'],
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-09-01'),
  }
];
