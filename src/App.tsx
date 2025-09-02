// Main App component with routing and dashboard functionality
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import DashboardPage from './Dashboard/page';
import CalendarPage from './Calendar/page';
import TasksPage from './Tasks/page';
import ProjectsPage from './Projects/page';
import SchoolPage from './School/page';
import ContactsPage from './Contact/page';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/school" element={<SchoolPage />} />
      <Route path="/school/:id" element={<SchoolPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
    </Routes>
  );
}
