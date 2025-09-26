import React from 'react';
import { X } from 'lucide-react';
import { Contact } from '../../../../../utils/interfaces/interfaces';

const AttendeesSection: React.FC<{
  contacts: Contact[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  selected: string[];
  toggle: (id: string) => void;
  getName: (id: string) => string;
}> = ({ contacts, loading, search, setSearch, selected, toggle, getName }) => (
  <div>
    <label className="block text-body text-gray-300 mb-2">Contacts</label>
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search contacts"
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
      />
      <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg divide-y divide-gray-700 bg-gray-750">
        {loading && <div className="p-3 text-small text-gray-400">Loading contacts...</div>}
        {!loading && contacts.length === 0 && (
          <div className="p-3 text-small text-gray-500">No contacts found</div>
        )}
        {!loading && contacts.map(c => {
          const isSelected = selected.includes(c._id);
          return (
            <button
              type="button"
              key={c._id}
              onClick={() => toggle(c._id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-small hover:bg-gray-700 transition ${isSelected ? 'bg-gray-700' : ''}`}
            >
              <span className="text-gray-200">{c.firstName} {c.lastName}</span>
              {isSelected && <span className="text-blue-400 text-xs">Selected</span>}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selected.map(cid => (
            <span key={cid} className="px-2 py-1 bg-blue-700/40 text-blue-300 text-small rounded flex items-center gap-1">
              {getName(cid)}
              <button onClick={() => toggle(cid)} className="text-blue-300 hover:text-white">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default AttendeesSection;
