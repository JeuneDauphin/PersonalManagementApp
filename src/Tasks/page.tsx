// Tasks page - manage all tasks with filtering and CRUD operations
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import TaskLists from '../Components/UI/Tasks/TaskLists';
import TaskCardPopup from '../Components/UI/Tasks/TaskCardPop';
import { useTasks } from '../utils/hooks/hooks';
import { Task } from '../utils/interfaces/interfaces';
import { useFilter } from '../utils/hooks/hooks';

const TasksPage: React.FC = () => {
  const { data: tasks, loading, refresh } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search functionality
  const { filteredData, setSearchTerm: setFilterSearchTerm } = useFilter(
    tasks,
    (task: Task, search: string) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  // Update search term in both states
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilterSearchTerm(value);
  };

  // Filter options for the filter component
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      values: [
        { value: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
        { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
        { value: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      values: [
        { value: 'urgent', label: 'Urgent', count: tasks.filter(t => t.priority === 'urgent').length },
        { value: 'high', label: 'High', count: tasks.filter(t => t.priority === 'high').length },
        { value: 'medium', label: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
        { value: 'low', label: 'Low', count: tasks.filter(t => t.priority === 'low').length },
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
    // This would delete the task via API
    console.log('Deleting task:', taskId);
    refresh();
  };

  const handleTaskToggle = async (task: Task) => {
    // Toggle task completion status
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    console.log('Toggling task status:', task._id, newStatus);
    refresh();
  };

  const handleAddNew = () => {
    setSelectedTask(null);
    setShowTaskPopup(true);
  };

  const handleTaskSave = async (task: Task) => {
    // This would save the task via API
    console.log('Saving task:', task);
    setShowTaskPopup(false);
    refresh();
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Apply filters to the task list
    console.log('Applying filters:', filters);
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
      <div className="space-y-6">
        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-small text-gray-400 mb-1">Total Tasks</h3>
            <p className="text-xl font-semibold text-white">{tasks.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-small text-gray-400 mb-1">Pending</h3>
            <p className="text-xl font-semibold text-yellow-400">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-small text-gray-400 mb-1">In Progress</h3>
            <p className="text-xl font-semibold text-blue-400">
              {tasks.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-small text-gray-400 mb-1">Completed</h3>
            <p className="text-xl font-semibold text-green-400">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Tasks List */}
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
