// Main App component with routing and dashboard functionality
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './Dashboard/page';
import CalendarPage from './Calendar/page';
import TasksPage from './Tasks/page';
import ProjectsPage from './Projects/page';
import ProjectDetailPage from './Projects/[e]/page';
import SchoolPage from './School/page';
import LessonDetailPage from './School/[e]/page';
import ContactsPage from './Contact/page';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/school" element={<SchoolPage />} />
      <Route path="/school/:id" element={<LessonDetailPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
    </Routes>
  );
}
