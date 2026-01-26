// Local Storage API service layer - No backend required
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  Project,
  Contact,
  Lesson,
  Test,
  CalendarEvent,
  Notification
} from '../interfaces/interfaces';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'pma_tasks',
  PROJECTS: 'pma_projects',
  CONTACTS: 'pma_contacts',
  LESSONS: 'pma_lessons',
  TESTS: 'pma_tests',
  EVENTS: 'pma_events',
  NOTIFICATIONS: 'pma_notifications',
  INITIALIZED: 'pma_initialized'
} as const;

// Helper to parse dates from JSON
function reviveDates<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => reviveDates(item)) as T;
  }

  const result = { ...obj } as any;
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      // Check if it's an ISO date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        result[key] = new Date(value);
      }
    } else if (typeof value === 'object') {
      result[key] = reviveDates(value);
    }
  }
  return result;
}

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return reviveDates(JSON.parse(data));
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
}

function createEntity<T extends { _id: string; createdAt: Date; updatedAt: Date }>(
  data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>
): T {
  const now = new Date();
  return {
    ...data,
    _id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  } as T;
}

function updateEntity<T extends { _id: string; updatedAt: Date }>(
  existing: T,
  updates: Partial<T>
): T {
  return {
    ...existing,
    ...updates,
    _id: existing._id, // Ensure _id is not overwritten
    updatedAt: new Date(),
  };
}

class LocalStorageApiService {
  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Check if already initialized
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      return;
    }

    // Create demo data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Demo Contacts
    const contacts: Contact[] = [
      createEntity<Contact>({
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice.martin@example.com',
        phone: '+33 6 12 34 56 78',
        company: 'Tech Corp',
        position: 'Lead Developer',
        type: 'work',
        notes: 'Met at React Conference 2025',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/alice-martin',
          github: 'https://github.com/alicemartin'
        }
      }),
      createEntity<Contact>({
        firstName: 'Thomas',
        lastName: 'Dubois',
        email: 'thomas.dubois@university.edu',
        phone: '+33 6 98 76 54 32',
        company: 'Université Paris-Saclay',
        position: 'Professor',
        type: 'school',
        notes: 'Computer Science professor'
      }),
      createEntity<Contact>({
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.b@gmail.com',
        phone: '+33 6 11 22 33 44',
        type: 'personal',
        notes: 'Friend from college'
      }),
      createEntity<Contact>({
        firstName: 'Marc',
        lastName: 'Leroy',
        email: 'marc.leroy@startup.io',
        company: 'InnoStart',
        position: 'CTO',
        type: 'client',
        notes: 'Potential collaboration on AI project'
      })
    ];
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);

    // Demo Projects
    const projects: Project[] = [
      createEntity<Project>({
        name: 'Personal Management App',
        description: 'A comprehensive app to manage tasks, projects, contacts, and calendar events. Built with React, TypeScript, and Tailwind CSS.',
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-06-30'),
        priority: 'high',
        progress: 75,
        tasks: [],
        collaborators: [contacts[0]._id],
        tags: ['react', 'typescript', 'tailwind', 'showcase'],
        githubLink: 'https://github.com/example/personal-management-app',
        figmaLink: 'https://figma.com/file/example'
      }),
      createEntity<Project>({
        name: 'Portfolio Website',
        description: 'Personal portfolio showcasing projects and skills',
        status: 'planning',
        startDate: nextWeek,
        priority: 'medium',
        progress: 10,
        tasks: [],
        tags: ['portfolio', 'nextjs', 'design']
      }),
      createEntity<Project>({
        name: 'Mobile App Prototype',
        description: 'React Native mobile app for task management on the go',
        status: 'on-hold',
        startDate: new Date('2025-09-01'),
        priority: 'low',
        progress: 30,
        tasks: [],
        tags: ['mobile', 'react-native']
      })
    ];
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);

    // Demo Tasks
    const tasks: Task[] = [
      createEntity<Task>({
        title: 'Implement local storage persistence',
        description: 'Replace backend API calls with localStorage for standalone operation',
        priority: 'high',
        status: 'completed',
        type: 'Development',
        dueDate: now,
        projectId: projects[0]._id,
        tags: ['backend', 'refactoring'],
        estimatedHours: 4,
        actualHours: 3
      }),
      createEntity<Task>({
        title: 'Design dashboard layout',
        description: 'Create wireframes and mockups for the main dashboard',
        priority: 'medium',
        status: 'in-progress',
        type: 'Design',
        dueDate: tomorrow,
        projectId: projects[0]._id,
        tags: ['ui', 'design'],
        estimatedHours: 6
      }),
      createEntity<Task>({
        title: 'Write documentation',
        description: 'Document all components and their usage',
        priority: 'low',
        status: 'pending',
        type: 'Documentation',
        dueDate: nextWeek,
        projectId: projects[0]._id,
        tags: ['docs']
      }),
      createEntity<Task>({
        title: 'Review portfolio design',
        description: 'Review and finalize the portfolio website design',
        priority: 'medium',
        status: 'pending',
        type: 'Review',
        dueDate: nextWeek,
        projectId: projects[1]._id,
        tags: ['design', 'review']
      }),
      createEntity<Task>({
        title: 'Prepare presentation',
        description: 'Prepare slides for project showcase',
        priority: 'high',
        status: 'pending',
        dueDate: tomorrow,
        tags: ['presentation']
      })
    ];
    // Update project task references
    projects[0].tasks = tasks.filter(t => t.projectId === projects[0]._id).map(t => t._id);
    projects[1].tasks = tasks.filter(t => t.projectId === projects[1]._id).map(t => t._id);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);

    // Demo Lessons
    const lessons: Lesson[] = [
      createEntity<Lesson>({
        title: 'Advanced React Patterns',
        subject: 'Web Development',
        type: 'lecture',
        date: tomorrow,
        duration: 90,
        location: 'Room 301',
        instructor: 'Prof. Thomas Dubois',
        description: 'Deep dive into advanced React patterns including compound components and render props',
        materials: [],
        completed: false
      }),
      createEntity<Lesson>({
        title: 'TypeScript Generics Workshop',
        subject: 'Programming',
        type: 'lab',
        date: nextWeek,
        duration: 120,
        location: 'Computer Lab A',
        instructor: 'Dr. Marie Curie',
        description: 'Hands-on workshop on TypeScript generics and type inference',
        materials: [],
        completed: false
      }),
      createEntity<Lesson>({
        title: 'Database Design Fundamentals',
        subject: 'Computer Science',
        type: 'lecture',
        date: new Date('2025-12-15'),
        duration: 60,
        location: 'Amphitheater B',
        instructor: 'Prof. Thomas Dubois',
        description: 'Introduction to relational database design',
        materials: [],
        completed: true
      })
    ];
    saveToStorage(STORAGE_KEYS.LESSONS, lessons);

    // Demo Tests
    const tests: Test[] = [
      createEntity<Test>({
        title: 'React Final Exam',
        subject: 'Web Development',
        type: 'final',
        date: nextMonth,
        duration: 180,
        location: 'Exam Hall A',
        totalMarks: 100,
        studyMaterials: ['React documentation', 'Course notes'],
        notes: 'Focus on hooks and context API'
      }),
      createEntity<Test>({
        title: 'TypeScript Quiz',
        subject: 'Programming',
        type: 'quiz',
        date: nextWeek,
        duration: 30,
        totalMarks: 20,
        studyMaterials: ['TypeScript handbook'],
        notes: 'Short quiz on type system basics'
      }),
      createEntity<Test>({
        title: 'Database Midterm',
        subject: 'Computer Science',
        type: 'midterm',
        date: new Date('2025-11-20'),
        duration: 120,
        location: 'Room 201',
        totalMarks: 50,
        achievedMarks: 45,
        grade: 'A',
        studyMaterials: [],
        notes: 'Covered normalization and SQL basics'
      })
    ];
    saveToStorage(STORAGE_KEYS.TESTS, tests);

    // Demo Calendar Events
    const events: CalendarEvent[] = [
      createEntity<CalendarEvent>({
        title: 'Team Standup',
        description: 'Daily standup meeting with the development team',
        startDate: new Date(now.setHours(9, 0, 0, 0)),
        endDate: new Date(now.setHours(9, 30, 0, 0)),
        isAllDay: false,
        type: 'meeting',
        location: 'Conference Room A',
        attendees: [contacts[0]._id],
        reminders: [15]
      }),
      createEntity<CalendarEvent>({
        title: 'Project Deadline',
        description: 'Submit the final version of the Personal Management App',
        startDate: nextMonth,
        endDate: nextMonth,
        isAllDay: true,
        type: 'deadline',
        reminders: [1440, 60] // 1 day and 1 hour before
      }),
      createEntity<CalendarEvent>({
        title: 'Coffee with Sophie',
        description: 'Catch up over coffee',
        startDate: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endDate: new Date(tomorrow.setHours(15, 0, 0, 0)),
        isAllDay: false,
        type: 'personal',
        location: 'Café de Flore',
        attendees: [contacts[2]._id],
        reminders: [30]
      }),
      createEntity<CalendarEvent>({
        title: 'Client Meeting',
        description: 'Discuss AI project requirements',
        startDate: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endDate: new Date(nextWeek.setHours(11, 30, 0, 0)),
        isAllDay: false,
        type: 'meeting',
        location: 'InnoStart Office',
        attendees: [contacts[3]._id],
        reminders: [60, 1440]
      })
    ];
    saveToStorage(STORAGE_KEYS.EVENTS, events);

    // Demo Notifications
    const notifications: Notification[] = [
      createEntity<Notification>({
        title: 'Task Due Soon',
        message: 'Design dashboard layout is due tomorrow',
        type: 'warning',
        read: false,
        entityType: 'task',
        entityId: tasks[1]._id
      }),
      createEntity<Notification>({
        title: 'Project Update',
        message: 'Personal Management App is now 75% complete!',
        type: 'success',
        read: false,
        entityType: 'project',
        entityId: projects[0]._id
      }),
      createEntity<Notification>({
        title: 'Welcome!',
        message: 'Welcome to Personal Management App. Start by exploring your dashboard.',
        type: 'info',
        read: false
      })
    ];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

    // Mark as initialized
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    console.log('✅ Demo data initialized successfully!');
  }

  // Method to reset all data to demo state
  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.initializeDemoData();
  }

  // Method to clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Recompute a project's progress based on its tasks (completed/total * 100),
   * then sync the new value to storage. Returns the computed progress.
   */
  async recomputeAndSyncProjectProgress(projectId: string): Promise<number> {
    try {
      const allTasks = await this.getTasks();
      const relevant = allTasks.filter(
        (t) => t.projectId === projectId
      );
      const total = relevant.length;
      const completed = relevant.filter((t) => t.status === 'completed').length;
      const nextProgress = total === 0 ? 0 : Math.round((completed / total) * 100);
      await this.updateProject(projectId, {
        progress: nextProgress,
        ...(nextProgress === 100 ? { status: 'completed' } : {}),
      });
      return nextProgress;
    } catch (e) {
      console.error('recomputeAndSyncProjectProgress failed', e);
      throw e;
    }
  }

  // Tasks API
  async getTasks(): Promise<Task[]> {
    return getFromStorage<Task>(STORAGE_KEYS.TASKS);
  }

  async getTask(id: string): Promise<Task> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t._id === id);
    if (!task) throw new Error(`Task not found: ${id}`);
    return task;
  }

  async createTask(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask = createEntity<Task>(task);
    tasks.push(newTask);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);

    // Update project's tasks array if projectId is set
    if (newTask.projectId) {
      const projects = await this.getProjects();
      const project = projects.find(p => p._id === newTask.projectId);
      if (project) {
        project.tasks = [...(project.tasks || []), newTask._id];
        project.updatedAt = new Date();
        saveToStorage(STORAGE_KEYS.PROJECTS, projects);
      }
    }

    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t._id === id);
    if (index === -1) throw new Error(`Task not found: ${id}`);

    const oldTask = tasks[index];
    const updatedTask = updateEntity(oldTask, updates);
    tasks[index] = updatedTask;
    saveToStorage(STORAGE_KEYS.TASKS, tasks);

    // Handle project association changes
    if ('projectId' in updates) {
      const projects = await this.getProjects();

      // Remove from old project
      if (oldTask.projectId) {
        const oldProject = projects.find(p => p._id === oldTask.projectId);
        if (oldProject) {
          oldProject.tasks = (oldProject.tasks || []).filter(tid => tid !== id);
          oldProject.updatedAt = new Date();
        }
      }

      // Add to new project
      if (updates.projectId) {
        const newProject = projects.find(p => p._id === updates.projectId);
        if (newProject && !(newProject.tasks || []).includes(id)) {
          newProject.tasks = [...(newProject.tasks || []), id];
          newProject.updatedAt = new Date();
        }
      }

      saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    }

    return updatedTask;
  }

  async setTaskContacts(taskId: string, contacts: string[]): Promise<Task> {
    return this.updateTask(taskId, { contacts });
  }

  async getTaskContacts(taskId: string): Promise<{ ids: string[]; contacts: Contact[] }> {
    const task = await this.getTask(taskId);
    const allContacts = await this.getContacts();
    const contactIds = task.contacts || [];
    const taskContacts = allContacts.filter(c => contactIds.includes(c._id));
    return { ids: contactIds, contacts: taskContacts };
  }

  async unassignTaskFromProject(taskId: string): Promise<Task> {
    return this.updateTask(taskId, { projectId: undefined } as any);
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t._id === id);
    const filtered = tasks.filter(t => t._id !== id);
    saveToStorage(STORAGE_KEYS.TASKS, filtered);

    // Remove from project's tasks array
    if (task?.projectId) {
      const projects = await this.getProjects();
      const project = projects.find(p => p._id === task.projectId);
      if (project) {
        project.tasks = (project.tasks || []).filter(tid => tid !== id);
        project.updatedAt = new Date();
        saveToStorage(STORAGE_KEYS.PROJECTS, projects);
      }
    }
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    return getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
  }

  async getProject(id: string): Promise<Project> {
    const projects = await this.getProjects();
    const project = projects.find(p => p._id === id);
    if (!project) throw new Error(`Project not found: ${id}`);
    return project;
  }

  async createProject(project: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = await this.getProjects();
    const newProject = createEntity<Project>({
      ...project,
      tasks: project.tasks || [],
      collaborators: project.collaborators || [],
      tags: project.tags || []
    });
    projects.push(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p._id === id);
    if (index === -1) throw new Error(`Project not found: ${id}`);

    const updatedProject = updateEntity(projects[index], updates);
    projects[index] = updatedProject;
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p._id !== id);
    saveToStorage(STORAGE_KEYS.PROJECTS, filtered);

    // Remove project reference from tasks
    const tasks = await this.getTasks();
    let updated = false;
    tasks.forEach(task => {
      if (task.projectId === id) {
        task.projectId = undefined;
        task.updatedAt = new Date();
        updated = true;
      }
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.TASKS, tasks);
    }
  }

  // Contacts API
  async getContacts(): Promise<Contact[]> {
    return getFromStorage<Contact>(STORAGE_KEYS.CONTACTS);
  }

  async getContact(id: string): Promise<Contact> {
    const contacts = await this.getContacts();
    const contact = contacts.find(c => c._id === id);
    if (!contact) throw new Error(`Contact not found: ${id}`);
    return contact;
  }

  async createContact(contact: Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contacts = await this.getContacts();
    const newContact = createEntity<Contact>(contact);
    contacts.push(newContact);
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
    return newContact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c._id === id);
    if (index === -1) throw new Error(`Contact not found: ${id}`);

    const updatedContact = updateEntity(contacts[index], updates);
    contacts[index] = updatedContact;
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter(c => c._id !== id);
    saveToStorage(STORAGE_KEYS.CONTACTS, filtered);
  }

  // Lessons API
  async getLessons(): Promise<Lesson[]> {
    return getFromStorage<Lesson>(STORAGE_KEYS.LESSONS);
  }

  async getLesson(id: string): Promise<Lesson> {
    const lessons = await this.getLessons();
    const lesson = lessons.find(l => l._id === id);
    if (!lesson) throw new Error(`Lesson not found: ${id}`);
    return lesson;
  }

  async createLesson(lesson: Omit<Lesson, '_id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
    const lessons = await this.getLessons();
    const newLesson = createEntity<Lesson>(lesson);
    lessons.push(newLesson);
    saveToStorage(STORAGE_KEYS.LESSONS, lessons);
    return newLesson;
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
    const lessons = await this.getLessons();
    const index = lessons.findIndex(l => l._id === id);
    if (index === -1) throw new Error(`Lesson not found: ${id}`);

    const updatedLesson = updateEntity(lessons[index], updates);
    lessons[index] = updatedLesson;
    saveToStorage(STORAGE_KEYS.LESSONS, lessons);
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    const lessons = await this.getLessons();
    const filtered = lessons.filter(l => l._id !== id);
    saveToStorage(STORAGE_KEYS.LESSONS, filtered);
  }

  // Tests API
  async getTests(): Promise<Test[]> {
    return getFromStorage<Test>(STORAGE_KEYS.TESTS);
  }

  async getTest(id: string): Promise<Test> {
    const tests = await this.getTests();
    const test = tests.find(t => t._id === id);
    if (!test) throw new Error(`Test not found: ${id}`);
    return test;
  }

  async createTest(test: Omit<Test, '_id' | 'createdAt' | 'updatedAt'>): Promise<Test> {
    const tests = await this.getTests();
    const newTest = createEntity<Test>(test);
    tests.push(newTest);
    saveToStorage(STORAGE_KEYS.TESTS, tests);
    return newTest;
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test> {
    const tests = await this.getTests();
    const index = tests.findIndex(t => t._id === id);
    if (index === -1) throw new Error(`Test not found: ${id}`);

    const updatedTest = updateEntity(tests[index], updates);
    tests[index] = updatedTest;
    saveToStorage(STORAGE_KEYS.TESTS, tests);
    return updatedTest;
  }

  async deleteTest(id: string): Promise<void> {
    const tests = await this.getTests();
    const filtered = tests.filter(t => t._id !== id);
    saveToStorage(STORAGE_KEYS.TESTS, filtered);
  }

  // Calendar Events API
  async getEvents(): Promise<CalendarEvent[]> {
    return getFromStorage<CalendarEvent>(STORAGE_KEYS.EVENTS);
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    const events = await this.getEvents();
    const event = events.find(e => e._id === id);
    if (!event) throw new Error(`Event not found: ${id}`);
    return event;
  }

  async createEvent(event: Omit<CalendarEvent, '_id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const events = await this.getEvents();
    const newEvent = createEntity<CalendarEvent>(event);
    events.push(newEvent);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e._id === id);
    if (index === -1) throw new Error(`Event not found: ${id}`);

    const updatedEvent = updateEntity(events[index], updates);
    events[index] = updatedEvent;
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter(e => e._id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, filtered);
  }

  // Notifications API
  async getNotifications(): Promise<Notification[]> {
    return getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  async markNotificationRead(id: string): Promise<void> {
    const notifications = await this.getNotifications();
    const index = notifications.findIndex(n => n._id === id);
    if (index !== -1) {
      notifications[index].read = true;
      notifications[index].updatedAt = new Date();
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  async createNotification(notification: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const notifications = await this.getNotifications();
    const newNotification = createEntity<Notification>(notification);
    notifications.push(newNotification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    const notifications = await this.getNotifications();
    const filtered = notifications.filter(n => n._id !== id);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  }
}

export const apiService = new LocalStorageApiService();
export default LocalStorageApiService;
