import React from 'react';
import { TaskFormData } from '../EditForm';
import { Contact } from '../../../../../utils/interfaces/interfaces';

interface Props {
  formData: TaskFormData;
  contactsLoading?: boolean;
  contactSearch: string;
  setContactSearch: (v: string) => void;
  filteredContacts: Contact[];
  toggleContact: (id: string) => void;
  getContactName: (id: string) => string;
}

const ContactsSection: React.FC<Props> = ({ formData, contactsLoading, contactSearch, setContactSearch, filteredContacts, toggleContact, getContactName }) => {
  return (
    <div>
      <label className="block text-body text-gray-300 mb-2">Contacts</label>
      <div className="space-y-2">
        <input
          type="text"
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          placeholder="Search contacts"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg divide-y divide-gray-700 bg-gray-750">
          {contactsLoading && (
            <div className="p-3 text-small text-gray-400">Loading contacts...</div>
          )}
          {!contactsLoading && filteredContacts.length === 0 && (
            <div className="p-3 text-small text-gray-500">No contacts found</div>
          )}
          {!contactsLoading && filteredContacts.map(c => {
            const selected = formData.contacts.includes(c._id);
            return (
              <button
                type="button"
                key={c._id}
                onClick={() => toggleContact(c._id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-small hover:bg-gray-700 transition ${selected ? 'bg-gray-700' : ''}`}
              >
                <span className="text-gray-200">{c.firstName} {c.lastName}</span>
                {selected && <span className="text-blue-400 text-xs">Selected</span>}
              </button>
            );
          })}
        </div>
        {formData.contacts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {formData.contacts.map(cid => (
              <span key={cid} className="px-2 py-1 bg-blue-700/40 text-blue-300 text-small rounded flex items-center gap-1">
                {getContactName(cid)}
                <button onClick={() => toggleContact(cid)} className="text-blue-300 hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsSection;
