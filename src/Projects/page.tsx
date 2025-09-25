// Projects page - manage all projects with filtering and CRUD operations
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import ProjectLists from '../Components/UI/Projects/ProjectLists';
import ProjectCardPopup from '../Components/UI/Projects/ProjectCardPopup';
import { useProjects } from '../utils/hooks/hooks';
import { Project } from '../utils/interfaces/interfaces';
import { useAdvancedFilter } from '../utils/hooks/hooks';
import { apiService } from '../utils/api/Api';
import { useNavigate } from 'react-router-dom';
import { effectiveProjectStatus } from '../utils/projectUtils';

const ProjectsPage: React.FC = () => {
  const { data: projects, loading, refresh } = useProjects();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectPopup, setShowProjectPopup] = useState(false);

  // Advanced filter and search functionality
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    setFilters
  } = useAdvancedFilter(
    projects || [],
    // Search function
    (project: Project, search: string) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())),
    // Filter function
    (project: Project, activeFilters: Record<string, string[]>) => {
      // Check if project matches all active filters
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        switch (filterKey) {
          case 'status':
            if (!filterValues.includes(effectiveProjectStatus(project.status as any, project.progress))) return false;
            break;
          case 'priority':
            if (!filterValues.includes(project.priority)) return false;
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
        { value: 'planning', label: 'Planning', count: (projects || []).filter(p => effectiveProjectStatus(p.status as any, p.progress) === 'planning').length },
        { value: 'active', label: 'Active', count: (projects || []).filter(p => effectiveProjectStatus(p.status as any, p.progress) === 'active').length },
        { value: 'on-hold', label: 'On Hold', count: (projects || []).filter(p => effectiveProjectStatus(p.status as any, p.progress) === 'on-hold').length },
        { value: 'completed', label: 'Completed', count: (projects || []).filter(p => effectiveProjectStatus(p.status as any, p.progress) === 'completed').length },
        { value: 'cancelled', label: 'Cancelled', count: (projects || []).filter(p => effectiveProjectStatus(p.status as any, p.progress) === 'cancelled').length },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      values: [
        { value: 'urgent', label: 'Urgent', count: (projects || []).filter(p => p.priority === 'urgent').length },
        { value: 'high', label: 'High', count: (projects || []).filter(p => p.priority === 'high').length },
        { value: 'medium', label: 'Medium', count: (projects || []).filter(p => p.priority === 'medium').length },
        { value: 'low', label: 'Low', count: (projects || []).filter(p => p.priority === 'low').length },
      ],
    },
  ];

  const handleProjectClick = (project: Project) => {
    // Navigate to detail page instead of opening a popup
    navigate(`/projects/${project._id}`);
  };

  const handleProjectEdit = (project: Project) => {
    navigate(`/projects/${project._id}`, { state: { startInEdit: true } });
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await apiService.deleteProject(projectId);
      refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setShowProjectPopup(true); // Keep popup for creating a new one (no detail page for new)
  };

  const handleProjectSave = async (project: Project) => {
    try {
      if (project._id.startsWith('temp-')) {
        // Creating new project
        const { _id, createdAt, updatedAt, ...projectData } = project;
        await apiService.createProject(projectData);
      } else {
        // Updating existing project
        const { _id, createdAt, updatedAt, ...projectData } = project;
        await apiService.updateProject(project._id, projectData);
      }
      setShowProjectPopup(false);
      refresh();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Apply filters to the project list
    setFilters(filters);
  };

  return (
    <Layout
      title="Projects"
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onAddNew={handleAddNew}
      addButtonText="Add Project"
      showFilters={true}
      filterOptions={filterOptions}
      onFilterChange={handleFilterChange}
    >
      <div className="h-full flex flex-col space-y-4">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Total Projects</h3>
            <p className="text-xl font-semibold text-white">{(projects || []).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Planning</h3>
            <p className="text-xl font-semibold text-gray-400">
              {(projects || []).filter(p => p.status === 'planning').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Active</h3>
            <p className="text-xl font-semibold text-green-400">
              {(projects || []).filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">On Hold</h3>
            <p className="text-xl font-semibold text-yellow-400">
              {(projects || []).filter(p => p.status === 'on-hold').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Completed</h3>
            <p className="text-xl font-semibold text-blue-400">
              {(projects || []).filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ProjectLists
            projects={filteredData}
            isLoading={loading}
            onProjectClick={handleProjectClick}
            onProjectEdit={handleProjectEdit}
            onProjectDelete={handleProjectDelete}
            showActions={true}
          />
        </div>
      </div>

      {/* Project Popup */}
      {showProjectPopup && (
        <ProjectCardPopup
          project={selectedProject}
          isOpen={showProjectPopup}
          onClose={() => setShowProjectPopup(false)}
          onSave={handleProjectSave}
          onDelete={selectedProject ? () => handleProjectDelete(selectedProject._id) : undefined}
        />
      )}
    </Layout>
  );
};

export default ProjectsPage;
