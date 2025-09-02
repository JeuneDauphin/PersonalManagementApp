// Projects page - manage all projects
import React from 'react';
import Layout from '../Components/Layout/Layout';

const ProjectsPage: React.FC = () => {
  return (
    <Layout title="Projects">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-large font-medium text-white mb-4">Projects</h3>
          <p className="text-gray-400">Projects management will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
