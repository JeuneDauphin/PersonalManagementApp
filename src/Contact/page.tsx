// Contacts page - manage all contacts with filtering and CRUD operations
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import ContactList from '../Components/UI/Contacts/ContactList';
import ContactCardPopUp from '../Components/UI/Contacts/ContactCardPopUp';
import { useContacts } from '../utils/hooks/hooks';
import { Contact } from '../utils/interfaces/interfaces';
import { useAdvancedFilter } from '../utils/hooks/hooks';
import { apiService } from '../utils/api/Api';

const ContactsPage: React.FC = () => {
  const { data: contacts, loading, refresh } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Advanced filter and search functionality
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters
  } = useAdvancedFilter(
    contacts || [],
    // Search function
    (contact: Contact, search: string) =>
      contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
      (contact.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (contact.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (contact.position || '').toLowerCase().includes(search.toLowerCase()) ||
      (contact.notes || '').toLowerCase().includes(search.toLowerCase()),
    // Filter function
    (contact: Contact, activeFilters: Record<string, string[]>) => {
      // Check if contact matches all active filters
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        switch (filterKey) {
          case 'type':
            if (!filterValues.includes(contact.type)) return false;
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
      key: 'type',
      label: 'Type',
      values: [
        { value: 'personal', label: 'Personal', count: (contacts || []).filter(c => c.type === 'personal').length },
        { value: 'work', label: 'Work', count: (contacts || []).filter(c => c.type === 'work').length },
        { value: 'school', label: 'School', count: (contacts || []).filter(c => c.type === 'school').length },
        { value: 'client', label: 'Client', count: (contacts || []).filter(c => c.type === 'client').length },
        { value: 'vendor', label: 'Vendor', count: (contacts || []).filter(c => c.type === 'vendor').length },
      ],
    },
  ];

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactPopup(true);
  };

  const handleContactEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactPopup(true);
  };

  const handleContactDelete = async (contactId: string) => {
    try {
      await apiService.deleteContact(contactId);
      refresh();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedContact(null);
    setShowContactPopup(true);
  };

  const handleContactSave = async (contact: Contact) => {
    try {
      if (contact._id.startsWith('temp-')) {
        // Creating new contact
        const { _id, createdAt, updatedAt, ...contactData } = contact;
        await apiService.createContact(contactData);
      } else {
        // Updating existing contact
        const { _id, createdAt, updatedAt, ...contactData } = contact;
        await apiService.updateContact(contact._id, contactData);
      }
      setShowContactPopup(false);
      refresh();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Apply filters to the contact list
    setFilters(filters);
  };

  // Get contacts with social links
  const getContactsWithSocial = () => {
    return (contacts || []).filter(contact =>
      contact.socialLinks && Object.values(contact.socialLinks).some(Boolean)
    );
  };

  // Get work contacts
  const getWorkContacts = () => {
    return (contacts || []).filter(contact =>
      contact.type === 'work' || contact.type === 'client' || contact.type === 'vendor'
    );
  };

  // Get contacts by type counts
  const getTypeCounts = () => {
    const counts = { personal: 0, work: 0, school: 0, client: 0, vendor: 0 };
    (contacts || []).forEach(contact => {
      counts[contact.type] = (counts[contact.type] || 0) + 1;
    });
    return counts;
  };

  const typeCounts = getTypeCounts();

  return (
    <Layout
      title="Contacts"
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onAddNew={handleAddNew}
      addButtonText="Add Contact"
      showFilters={true}
      filterOptions={filterOptions}
      onFilterChange={handleFilterChange}
    >
      <div className="h-full flex flex-col space-y-4">
        {/* Contact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Total Contacts</h3>
            <p className="text-xl font-semibold text-white">{(contacts || []).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Personal</h3>
            <p className="text-xl font-semibold text-blue-400">{typeCounts.personal}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Work</h3>
            <p className="text-xl font-semibold text-green-400">{getWorkContacts().length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">School</h3>
            <p className="text-xl font-semibold text-purple-400">{typeCounts.school}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">With Social</h3>
            <p className="text-xl font-semibold text-orange-400">{getContactsWithSocial().length}</p>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ContactList
            contacts={filteredData}
            isLoading={loading}
            onContactClick={handleContactClick}
            onContactEdit={handleContactEdit}
            onContactDelete={handleContactDelete}
            showActions={true}
          />
        </div>
      </div>

      {/* Contact Popup */}
      {showContactPopup && (
        <ContactCardPopUp
          contact={selectedContact}
          isOpen={showContactPopup}
          onClose={() => setShowContactPopup(false)}
          onSave={handleContactSave}
          onDelete={selectedContact ? () => handleContactDelete(selectedContact._id) : undefined}
        />
      )}
    </Layout>
  );
};

export default ContactsPage;
