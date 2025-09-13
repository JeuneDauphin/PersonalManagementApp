// Tasks page - manage all tasks with filtering and CRUD operations
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import TaskLists from '../Components/UI/Tasks/TaskLists';
import TaskCardPopup from '../Components/UI/Tasks/TaskCardPop';
import { useTasks } from '../utils/hooks/hooks';
import { Task } from '../utils/interfaces/interfaces';
import { useAdvancedFilter } from '../utils/hooks/hooks';
import { apiService } from '../utils/api/Api';

const TasksPage: React.FC = () => {
  const { data: tasks, loading, refresh } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  // Advanced filter and search functionality
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    setFilters
  } = useAdvancedFilter(
    tasks || [],
    // Search function
    (task: Task, search: string) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())),
    // Filter function
    (task: Task, activeFilters: Record<string, string[]>) => {
      // Check if task matches all active filters
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        switch (filterKey) {
          case 'status':
            if (!filterValues.includes(task.status)) return false;
            break;
          case 'priority':
            if (!filterValues.includes(task.priority)) return false;
            break;
          // Add more filter cases as needed
        }
      }
      return true;
    }
  );

  // Update search term
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Filter options for the filter component
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      values: [
        { value: 'pending', label: 'Pending', count: (tasks || []).filter(t => t.status === 'pending').length },
        { value: 'in-progress', label: 'In Progress', count: (tasks || []).filter(t => t.status === 'in-progress').length },
        { value: 'completed', label: 'Completed', count: (tasks || []).filter(t => t.status === 'completed').length },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      values: [
        { value: 'urgent', label: 'Urgent', count: (tasks || []).filter(t => t.priority === 'urgent').length },
        { value: 'high', label: 'High', count: (tasks || []).filter(t => t.priority === 'high').length },
        { value: 'medium', label: 'Medium', count: (tasks || []).filter(t => t.priority === 'medium').length },
        { value: 'low', label: 'Low', count: (tasks || []).filter(t => t.priority === 'low').length },
      ],
    },
  ];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      refresh();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    try {
      // Toggle task completion status
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await apiService.updateTask(task._id, { status: newStatus });
      refresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedTask(null);
    setShowTaskPopup(true);
  };

  const handleTaskSave = async (task: Task) => {
    try {
      if (task._id.startsWith('temp-')) {
        // Creating new task
        const { _id, createdAt, updatedAt, ...taskData } = task;
        await apiService.createTask(taskData as any);
      } else {
        // Updating existing task
        const { _id, createdAt, updatedAt, ...taskData } = task;
        await apiService.updateTask(task._id, taskData as any);
      }
      setShowTaskPopup(false);
      refresh();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Apply filters to the task list
    setFilters(filters);
  };

  return (
    <Layout
      title="Tasks"
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onAddNew={handleAddNew}
      addButtonText="Add Task"
      showFilters={true}
      filterOptions={filterOptions}
      onFilterChange={handleFilterChange}
    >
      <div className="h-full flex flex-col space-y-4">
        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Total Tasks</h3>
            <p className="text-xl font-semibold text-white">{(tasks || []).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Pending</h3>
            <p className="text-xl font-semibold text-yellow-400">
              {(tasks || []).filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">In Progress</h3>
            <p className="text-xl font-semibold text-blue-400">
              {(tasks || []).filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Completed</h3>
            <p className="text-xl font-semibold text-green-400">
              {(tasks || []).filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TaskLists
            tasks={filteredData}
            isLoading={loading}
            onTaskClick={handleTaskClick}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onTaskToggle={handleTaskToggle}
            showActions={true}
          />
        </div>
      </div>

      {/* Task Popup */}
      {showTaskPopup && (
        <TaskCardPopup
          task={selectedTask}
          isOpen={showTaskPopup}
          onClose={() => setShowTaskPopup(false)}
          onSave={handleTaskSave}
          onDelete={selectedTask ? () => handleTaskDelete(selectedTask._id) : undefined}
        />
      )}
    </Layout>
  );
};

export default TasksPage;
