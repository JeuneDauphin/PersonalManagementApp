import React from 'react';
import { User, Mail, Phone, Building, Briefcase, Github, Linkedin, Twitter } from 'lucide-react';
import { Contact } from '../../../../utils/interfaces/interfaces';
import { getContextualFields } from './contextualFields';
import TypeBadge from './TypeBadge';

const ViewDetails: React.FC<{ contact: Contact }> = ({ contact }) => {
  const labels = getContextualFields(contact.type);
  return (
    <>
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            {contact.firstName} {contact.lastName}
          </h1>
          <TypeBadge type={contact.type} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contact.email && (
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">Email</div>
              <a href={`mailto:${contact.email}`} className="text-body text-white hover:text-blue-400 transition-colors">
                {contact.email}
              </a>
            </div>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">Phone</div>
              <a href={`tel:${contact.phone}`} className="text-body text-white hover:text-blue-400 transition-colors">
                {contact.phone}
              </a>
            </div>
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-3">
            <Building size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">{labels.companyLabel}</div>
              <div className="text-body text-white">{contact.company}</div>
            </div>
          </div>
        )}
        {contact.position && (
          <div className="flex items-center gap-3">
            <Briefcase size={16} className="text-gray-400" />
            <div>
              <div className="text-small text-gray-400">{labels.positionLabel}</div>
              <div className="text-body text-white">{contact.position}</div>
            </div>
          </div>
        )}
      </div>

      {contact.socialLinks && Object.values(contact.socialLinks).some(Boolean) && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-3">Social Links</h3>
          <div className="flex flex-wrap gap-3">
            {contact.socialLinks.linkedin && (
              <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            )}
            {contact.socialLinks.twitter && (
              <a href={contact.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg text-white transition-colors">
                <Twitter size={16} />
                <span>Twitter</span>
              </a>
            )}
            {contact.socialLinks.github && (
              <a href={contact.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors">
                <Github size={16} />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      )}

      {contact.notes && (
        <div>
          <h3 className="text-body font-medium text-gray-300 mb-2">Notes</h3>
          <p className="text-body text-gray-400 leading-relaxed">{contact.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div>
          <div className="text-small text-gray-400">Added</div>
          <div className="text-body text-white">
            {new Date(contact.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div>
          <div className="text-small text-gray-400">Last Updated</div>
          <div className="text-body text-white">
            {new Date(contact.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetails;
