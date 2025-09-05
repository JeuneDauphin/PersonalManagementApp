
// Contact list component displaying contacts in a grid layout
import React from 'react';
import { Contact } from '../../../utils/interfaces/interfaces';
import { Users } from 'lucide-react';
import ContactCard from './ContactCard';

interface ContactListProps {
  contacts: Contact[];
  isLoading?: boolean;
  onContactClick?: (contact: Contact) => void;
  onContactEdit?: (contact: Contact) => void;
  onContactDelete?: (contactId: string) => void;
  showActions?: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading = false,
  onContactClick,
  onContactEdit,
  onContactDelete,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-1 bg-gray-700 rounded mb-3"></div>
            <div className="flex gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ((contacts || []).length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No contacts found</h3>
        <p className="text-gray-500">Create your first contact to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(contacts || []).map((contact) => (
        <ContactCard
          key={contact._id}
          contact={contact}
          onClick={onContactClick}
          onEdit={onContactEdit}
          onDelete={onContactDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ContactList;
