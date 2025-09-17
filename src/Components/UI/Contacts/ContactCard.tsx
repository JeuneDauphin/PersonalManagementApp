
// Contact card component displaying contact details in a card format
import React from 'react';
import { Contact } from '../../../utils/interfaces/interfaces';
import { User, Building, Briefcase, School, Users } from 'lucide-react';
import Button from '../Button';

interface ContactCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  showActions?: boolean;
  isSelected?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  isSelected = false,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-blue-500';
      case 'work': return 'bg-green-500';
      case 'school': return 'bg-purple-500';
      case 'client': return 'bg-orange-500';
      case 'vendor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personal': return <User size={14} className="text-white" />;
      case 'work': return <Briefcase size={14} className="text-white" />;
      case 'school': return <School size={14} className="text-white" />;
      case 'client': return <Users size={14} className="text-white" />;
      case 'vendor': return <Building size={14} className="text-white" />;
      default: return <User size={14} className="text-white" />;
    }
  };

  // Compact card: only avatar, name, type badge.

  return (
  <div
      className={`
    bg-gray-800 border border-gray-700 rounded-lg p-4
    hover:border-gray-600 transition-colors cursor-pointer group relative
        ${isSelected ? 'border-blue-500' : ''}
      `}
      onClick={() => onClick?.(contact)}
    >
      {/* Type indicator */}
      <div className={`w-full h-1 ${getTypeColor(contact.type)} rounded-t mb-3`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-gray-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-body font-medium text-white truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(contact.type)} mt-1`}>
              {getTypeIcon(contact.type)}
              <span>{contact.type.toUpperCase()}</span>
            </div>
          </div>
        </div>

  {/* actions moved to bottom-right */}
      </div>

      {/* Compact card intentionally omits email, phone, company, position, notes, social links, and metadata */}

      {showActions && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            action="edit"
            onClick={(e) => {
              e?.stopPropagation();
              onEdit?.(contact);
            }}
            variant="ghost"
            size="sm"
            text=""
          />
          <Button
            action="delete"
            onClick={(e) => {
              e?.stopPropagation();
              onDelete?.(contact._id);
            }}
            variant="ghost"
            size="sm"
            text=""
          />
        </div>
      )}
    </div>
  );
};

export default ContactCard;
