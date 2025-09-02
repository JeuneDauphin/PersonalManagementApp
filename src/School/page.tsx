// School page - manage lessons and tests
import React from 'react';
import Layout from '../Components/Layout/Layout';

const SchoolPage: React.FC = () => {
  return (
    <Layout title="School">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-large font-medium text-white mb-4">School</h3>
          <p className="text-gray-400">School management (lessons, tests) will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolPage;
