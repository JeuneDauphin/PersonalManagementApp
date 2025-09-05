
// Contact card component displaying contact details in a card format
import React from 'react';
import { Contact } from '../../../utils/interfaces/interfaces';
import { User, Mail, Phone, Building, Briefcase, Github, Linkedin, Twitter, School, Users } from 'lucide-react';
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

  const getSocialCount = () => {
    if (!contact.socialLinks) return 0;
    return Object.values(contact.socialLinks).filter(Boolean).length;
  };

  return (
    <div
      className={`
        bg-gray-800 border border-gray-700 rounded-lg p-4
        hover:border-gray-600 transition-colors cursor-pointer group
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

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Contact Information */}
      <div className="space-y-2 mb-3">
        {contact.email && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <Mail size={12} />
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <Phone size={12} />
            <span>{contact.phone}</span>
          </div>
        )}

        {contact.company && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <Building size={12} />
            <span className="truncate">{contact.company}</span>
          </div>
        )}

        {contact.position && (
          <div className="flex items-center gap-2 text-small text-gray-400">
            <Briefcase size={12} />
            <span className="truncate">{contact.position}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="mb-3">
          <p className="text-small text-gray-400 line-clamp-2">
            {contact.notes}
          </p>
        </div>
      )}

      {/* Social Links */}
      {contact.socialLinks && getSocialCount() > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            {contact.socialLinks.github && (
              <a
                href={contact.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
              >
                <Github size={12} />
              </a>
            )}
            {contact.socialLinks.linkedin && (
              <a
                href={contact.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-gray-700 hover:bg-blue-600 rounded text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin size={12} />
              </a>
            )}
            {contact.socialLinks.twitter && (
              <a
                href={contact.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-gray-700 hover:bg-blue-400 rounded text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={12} />
              </a>
            )}
            {getSocialCount() > 3 && (
              <div className="p-1.5 bg-gray-700 rounded text-gray-400 text-xs">
                +{getSocialCount() - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer - Metadata */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700 text-xs text-gray-500">
        <span>
          Added {new Date(contact.createdAt).toLocaleDateString()}
        </span>
        {getSocialCount() > 0 && (
          <div className="flex items-center gap-1">
            <span>{getSocialCount()} social link{getSocialCount() !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
