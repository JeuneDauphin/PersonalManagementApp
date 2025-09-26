import React from 'react';

export interface LocationSectionProps {
  location: string;
  onChange: (patch: Partial<LocationSectionProps>) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({ location, onChange }) => {
  return (
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
  );
};

export default LocationSection;
