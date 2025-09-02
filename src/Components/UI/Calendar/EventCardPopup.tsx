// Event card popup modal for viewing/editing event details
import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { CalendarEvent } from '../../../utils/interfaces/interfaces';
import { EventType } from '../../../utils/types/types';
import Button from '../Button';

interface EventCardPopupProps {
  event?: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: () => void;
}

const EventCardPopup: React.FC<EventCardPopupProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    type: 'meeting' as EventType,
    location: '',
    attendees: [] as string[],
    reminders: [15] as number[],
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        isAllDay: event.isAllDay,
        type: event.type,
        location: event.location || '',
        attendees: event.attendees || [],
        reminders: event.reminders || [15],
      });
      setIsEditing(false);
    } else {
      // New event
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        startDate: now.toISOString().slice(0, 16),
        endDate: nextHour.toISOString().slice(0, 16),
        isAllDay: false,
        type: 'meeting' as EventType,
        location: '',
        attendees: [],
        reminders: [15],
      });
      setIsEditing(true);
    }
  }, [event]);

  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const eventData: CalendarEvent = {
      _id: event?._id || `temp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      isAllDay: formData.isAllDay,
      type: formData.type,
      location: formData.location,
      attendees: formData.attendees,
      reminders: formData.reminders,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(eventData);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-blue-400';
      case 'deadline': return 'text-red-400';
      case 'appointment': return 'text-green-400';
      case 'reminder': return 'text-yellow-400';
      case 'personal': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-h1 font-semibold text-white">
            {event ? (isEditing ? 'Edit Event' : 'Event Details') : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isEditing ? (
            // Edit Mode
            <>
              {/* Title */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Event title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Event description"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formData.isAllDay}
                  onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allDay" className="text-body text-gray-300">All day event</label>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body text-gray-300 mb-2">Start</label>
                  <input
                    type={formData.isAllDay ? "date" : "datetime-local"}
                    value={formData.isAllDay ? formData.startDate.split('T')[0] : formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-body text-gray-300 mb-2">End</label>
                  <input
                    type={formData.isAllDay ? "date" : "datetime-local"}
                    value={formData.isAllDay ? formData.endDate.split('T')[0] : formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="appointment">Appointment</option>
                  <option value="reminder">Reminder</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-body text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location"
                />
              </div>
            </>
          ) : (
            // View Mode
            event && (
              <>
                {/* Title */}
                <div className="flex items-start justify-between">
                  <h3 className="text-large font-medium text-white">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-small font-medium ${getEventTypeColor(event.type)} bg-gray-700`}>
                    {event.type}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-body text-gray-300">{event.description}</p>
                )}

                {/* Date and Time */}
                <div className="flex items-center gap-2 text-body text-gray-300">
                  <Calendar size={16} />
                  <span>
                    {event.isAllDay ? (
                      new Date(event.startDate).toLocaleDateString()
                    ) : (
                      `${formatDateTime(event.startDate.toString())} - ${formatDateTime(event.endDate.toString())}`
                    )}
                  </span>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-body text-gray-300">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                )}

                {/* Attendees */}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-2 text-body text-gray-300">
                    <Users size={16} />
                    <span>{event.attendees.length} attendees</span>
                  </div>
                )}

                {/* Reminders */}
                {event.reminders && event.reminders.length > 0 && (
                  <div className="flex items-center gap-2 text-body text-gray-300">
                    <Clock size={16} />
                    <span>Reminders: {event.reminders.join(', ')} minutes before</span>
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div>
            {event && !isEditing && onDelete && (
              <Button
                action="delete"
                text="Delete"
                onClick={onDelete}
                variant="danger"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {event && !isEditing ? (
              <>
                <Button
                  text="Edit"
                  action="edit"
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                />
                <Button
                  text="Close"
                  action="cancel"
                  onClick={onClose}
                  variant="secondary"
                />
              </>
            ) : (
              <>
                <Button
                  text="Cancel"
                  action="cancel"
                  onClick={() => {
                    if (event) {
                      setIsEditing(false);
                    } else {
                      onClose();
                    }
                  }}
                  variant="outline"
                />
                <Button
                  text="Save"
                  action="save"
                  onClick={handleSave}
                  variant="primary"
                  disabled={!formData.title}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardPopup;
