// API configuration and service layer
import {
  Task,
  Project,
  Contact,
  Lesson,
  Test,
  CalendarEvent,
  Notification
} from '../interfaces/interfaces';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Tasks API
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(project: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Contacts API
  async getContacts(): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts');
  }

  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`);
  }

  async createContact(contact: Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Lessons API
  async getLessons(): Promise<Lesson[]> {
    return this.request<Lesson[]>('/lessons');
  }

  async getLesson(id: string): Promise<Lesson> {
    return this.request<Lesson>(`/lessons/${id}`);
  }

  async createLesson(lesson: Omit<Lesson, '_id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
    return this.request<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  }

  async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    });
  }

  async deleteLesson(id: string): Promise<void> {
    return this.request<void>(`/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  // Tests API
  async getTests(): Promise<Test[]> {
    return this.request<Test[]>('/tests');
  }

  async getTest(id: string): Promise<Test> {
    return this.request<Test>(`/tests/${id}`);
  }

  async createTest(test: Omit<Test, '_id' | 'createdAt' | 'updatedAt'>): Promise<Test> {
    return this.request<Test>('/tests', {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async updateTest(id: string, test: Partial<Test>): Promise<Test> {
    return this.request<Test>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(test),
    });
  }

  async deleteTest(id: string): Promise<void> {
    return this.request<void>(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  // Calendar Events API
  async getEvents(): Promise<CalendarEvent[]> {
    return this.request<CalendarEvent[]>('/events');
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/events/${id}`);
  }

  async createEvent(event: Omit<CalendarEvent, '_id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications API
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default ApiService;
// mongosh "mongodb+srv://cluster0.sfuiqi6.mongodb.net/" --apiVersion 1 --username estignardj_db_user --password OkeoKfemkbm9jxo1
// there is fake auto generated data in the database ; please remove it and post real data
