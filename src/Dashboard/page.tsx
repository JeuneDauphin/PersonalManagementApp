// Dashboard page component - main overview page
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import Calendar from '../Components/UI/Calendar/Calendar';
import TaskLists from '../Components/UI/Tasks/TaskLists';
import { useTasks, useEvents, useProjects } from '../utils/hooks/hooks';
import { CalendarEvent, Task, Project } from '../utils/interfaces/interfaces';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { data: tasks, loading: tasksLoading } = useTasks();
  const { data: events, loading: eventsLoading } = useEvents();
  const { data: projects, loading: projectsLoading } = useProjects();
  const [currentDate] = useState(new Date());

  // Get this week's events for calendar
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  // Get pending tasks sorted by due date
  const pendingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6); // Show only first 6 tasks

  // Get last worked on project
  const lastProject = projects
    .filter(project => project.status === 'active')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-h1 font-semibold text-white mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-300">
            Here's what's happening with your tasks and projects today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-small text-gray-400 mb-1">Total Tasks</h3>
            <p className="text-2xl font-semibold text-white">{tasks.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-small text-gray-400 mb-1">Pending Tasks</h3>
            <p className="text-2xl font-semibold text-yellow-400">{pendingTasks.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-small text-gray-400 mb-1">Active Projects</h3>
            <p className="text-2xl font-semibold text-blue-400">
              {projects.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-small text-gray-400 mb-1">This Week Events</h3>
            <p className="text-2xl font-semibold text-green-400">{thisWeekEvents.length}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section - Week View */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-large font-semibold text-white mb-4">This Week</h3>
              <Calendar
                events={thisWeekEvents}
                currentDate={currentDate}
                view="timeGridWeek"
                editable={false}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-large font-semibold text-white">Pending Tasks</h3>
                <a
                  href="/tasks"
                  className="text-blue-400 hover:text-blue-300 text-small"
                >
                  View all
                </a>
              </div>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task._id} className="border border-gray-700 rounded-lg p-3">
                      <p className="text-body text-white font-medium mb-1">{task.title}</p>
                      <p className="text-small text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${task.priority === 'urgent' ? 'bg-red-600 text-white' :
                            task.priority === 'high' ? 'bg-orange-600 text-white' :
                              task.priority === 'medium' ? 'bg-yellow-600 text-white' :
                                'bg-green-600 text-white'
                          }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No pending tasks</p>
              )}
            </div>

            {/* Last Project */}
            {lastProject && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-large font-semibold text-white">Current Project</h3>
                  <a
                    href="/projects"
                    className="text-blue-400 hover:text-blue-300 text-small"
                  >
                    View all
                  </a>
                </div>
                <div className="border border-gray-700 rounded-lg p-4">
                  <h4 className="text-body text-white font-medium mb-2">{lastProject.name}</h4>
                  <p className="text-small text-gray-400 mb-3">{lastProject.description}</p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-small text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{lastProject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${lastProject.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-small text-gray-400">
                    Due: {new Date(lastProject.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
