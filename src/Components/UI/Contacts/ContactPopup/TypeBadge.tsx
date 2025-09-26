import React from 'react';
import { User, Briefcase, School, Users as UsersIcon, Building } from 'lucide-react';
import { ContactType } from '../../../../utils/types/types';

export const getTypeColor = (type: ContactType) => {
  switch (type) {
    case 'personal': return 'text-blue-400 bg-blue-600';
    case 'work': return 'text-green-400 bg-green-600';
    case 'school': return 'text-purple-400 bg-purple-600';
    case 'client': return 'text-orange-400 bg-orange-600';
    case 'vendor': return 'text-red-400 bg-red-600';
    default: return 'text-gray-400 bg-gray-600';
  }
};

export const getTypeIcon = (type: ContactType) => {
  switch (type) {
    case 'personal': return <User size={16} className="text-white" />;
    case 'work': return <Briefcase size={16} className="text-white" />;
    case 'school': return <School size={16} className="text-white" />;
    case 'client': return <UsersIcon size={16} className="text-white" />;
    case 'vendor': return <Building size={16} className="text-white" />;
    default: return <User size={16} className="text-white" />;
  }
};

const TypeBadge: React.FC<{ type: ContactType }> = ({ type }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-small font-medium text-white ${getTypeColor(type)}`}>
      {getTypeIcon(type)}
      <span>{type.toUpperCase()}</span>
    </div>
  );
};

export default TypeBadge;
