import React from 'react';

export interface LocationInstructorSectionProps {
  location: string;
  instructor: string;
  onChange: (patch: Partial<LocationInstructorSectionProps>) => void;
}

const LocationInstructorSection: React.FC<LocationInstructorSectionProps> = ({ location, instructor, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body text-gray-300 mb-2">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => onChange({ location: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Room or location"
        />
      </div>

      <div>
        <label className="block text-body text-gray-300 mb-2">Instructor</label>
        <input
          type="text"
          value={instructor}
          onChange={(e) => onChange({ instructor: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Instructor name"
        />
      </div>
    </div>
  );
};

export default LocationInstructorSection;
