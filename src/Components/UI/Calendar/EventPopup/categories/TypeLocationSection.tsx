import React from 'react';
import { EventType } from '../../../../../utils/types/types';

const TypeLocationSection: React.FC<{
  type: EventType;
  onTypeChange: (v: EventType) => void;
  location: string;
  onLocationChange: (v: string) => void;
}> = ({ type, onTypeChange, location, onLocationChange }) => (
  <>
    <div>
      <label className="block text-body text-gray-300 mb-2">Type</label>
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as EventType)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="meeting">Meeting</option>
        <option value="deadline">Deadline</option>
        <option value="appointment">Appointment</option>
        <option value="reminder">Reminder</option>
        <option value="personal">Personal</option>
        <option value="holiday">Holiday</option>
      </select>
    </div>
    <div>
      <label className="block text-body text-gray-300 mb-2">Location</label>
      <input
        type="text"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        placeholder="Event location"
      />
    </div>
  </>
);

export default TypeLocationSection;
