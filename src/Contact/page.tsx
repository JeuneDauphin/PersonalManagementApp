// Contacts page - manage all contacts
import React from 'react';
import Layout from '../Components/Layout/Layout';

const ContactsPage: React.FC = () => {
  return (
    <Layout title="Contacts">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-large font-medium text-white mb-4">Contacts</h3>
          <p className="text-gray-400">Contact management will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage;
