// Project list component displaying projects in a grid layout
import React from 'react';
import { Project } from '../../../utils/interfaces/interfaces';
import { FolderOpen } from 'lucide-react';
import ProjectCard from './ProjectCard';

interface ProjectListsProps {
  projects: Project[];
  isLoading?: boolean;
  onProjectClick?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  showActions?: boolean;
}

const ProjectLists: React.FC<ProjectListsProps> = ({
  projects,
  isLoading = false,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-1 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-2 bg-gray-700 rounded mb-3"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ((projects || []).length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No projects found</h3>
        <p className="text-gray-500">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 group">
      {(projects || []).map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onClick={onProjectClick}
          onEdit={onProjectEdit}
          onDelete={onProjectDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ProjectLists;
