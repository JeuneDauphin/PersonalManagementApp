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

// Paginated response interface
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

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
  async getTasks(params?: { projectId?: string }): Promise<Task[]> {
    const query = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}&limit=500` : '';
    const response = await this.request<PaginatedResponse<Task>>(`/tasks${query}`);
    return response.items || [];
  }

  // Fetch tasks filtered by project id
  async getTasksByProject(projectId: string): Promise<Task[]> {
    if (!projectId) return [];
    const response = await this.request<PaginatedResponse<Task>>(`/tasks?projectId=${encodeURIComponent(projectId)}&limit=500`);
    return response.items || [];
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const created = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    try {
      const projectId = (created as any).projectId || (created as any).project;
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { projectId } }));
    } catch { }
    return created;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const updated = await this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
    try {
      const projectId = (updated as any).projectId || (updated as any).project || (task as any).projectId || (task as any).project;
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { projectId } }));
    } catch { }
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    // We don't know the project after deletion; callers should trigger refresh via toggle flows
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    const response = await this.request<PaginatedResponse<Project>>('/projects');
    return response.items || [];
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
    const response = await this.request<PaginatedResponse<Contact>>('/contacts');
    return response.items || [];
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
    const response = await this.request<PaginatedResponse<Lesson>>('/lessons');
    return response.items || [];
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
    const response = await this.request<PaginatedResponse<Test>>('/tests');
    return response.items || [];
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
    const response = await this.request<PaginatedResponse<CalendarEvent>>('/events');
    return response.items || [];
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
    const response = await this.request<PaginatedResponse<Notification>>('/notifications');
    return response.items || [];
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
