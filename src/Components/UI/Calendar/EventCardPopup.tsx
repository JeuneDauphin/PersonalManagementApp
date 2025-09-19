// Event card popup modal for viewing/editing event details
import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { CalendarEvent, Contact } from '../../../utils/interfaces/interfaces';
import { EventType } from '../../../utils/types/types';
import Button from '../Button';
import { apiService } from '../../../utils/api/Api';
import { format as fmt } from 'date-fns';
import MiniCalendar from './MiniCalendar';

interface EventCardPopupProps {
  event?: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: () => void;
  // When provided, opening the popup without an event will prefill a new event on this date
  dayDate?: Date;
  // If true and an event is provided, open directly in edit mode
  startInEdit?: boolean;
}

const EventCardPopup: React.FC<EventCardPopupProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  dayDate,
  startInEdit,
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);

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
      setIsEditing(!!startInEdit);
    } else if (dayDate) {
      // Prefill a new event for the clicked day at current local time
      const base = new Date(dayDate);
      const now = new Date();
      base.setHours(now.getHours(), now.getMinutes(), 0, 0);
      const nextHour = new Date(base.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        startDate: base.toISOString().slice(0, 16),
        endDate: nextHour.toISOString().slice(0, 16),
        isAllDay: false,
        type: 'meeting' as EventType,
        location: '',
        attendees: [],
        reminders: [15],
      });
      setIsEditing(true);
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
  }, [event, dayDate, startInEdit]);

  // Fetch contacts when popup opens
  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    setContactsLoading(true);
    apiService.getContacts()
      .then(data => { if (!ignore) setContacts(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!ignore) setContactsLoading(false); });
    return () => { ignore = true; };
  }, [isOpen]);

  const filteredContacts = useMemo(() => {
    const term = contactSearch.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(c =>
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      (c.email?.toLowerCase().includes(term) ?? false)
    );
  }, [contacts, contactSearch]);

  const toggleContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(id)
        ? prev.attendees.filter(a => a !== id)
        : [...prev.attendees, id]
    }));
  };

  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    if (!c) return id;
    return `${c.firstName} ${c.lastName}`.trim();
  };

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

  // Helpers for local ISO strings compatible with datetime-local inputs
  const toIsoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const withDateFrom = (original: string, newDate: Date) => {
    const base = new Date(original || Date.now());
    const merged = new Date(newDate);
    merged.setHours(base.getHours(), base.getMinutes(), 0, 0);
    return toIsoLocal(merged);
  };
  const withTime = (original: string, timeHHmm: string) => {
    const [hh, mm] = timeHHmm.split(':').map(Number);
    const base = new Date(original || Date.now());
    base.setHours(hh, mm, 0, 0);
    return toIsoLocal(base);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      let next = { ...prev, [field]: value } as typeof prev;
      // Convenience: holidays default to all-day
      if (field === 'type' && value === 'holiday') {
        next.isAllDay = true;
      }
      // If user moves start beyond current end, auto-bump end to keep it valid
      if ((field === 'startDate' || field === 'endDate' || field === 'isAllDay') && next.startDate && next.endDate) {
        const s = new Date(next.startDate);
        const e = new Date(next.endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e <= s) {
          // Bump end by 1 hour for timed events, or 1 day for all-day
          if (next.isAllDay) {
            const bumped = new Date(s);
            bumped.setDate(bumped.getDate() + 1);
            next = { ...next, endDate: toIsoLocal(bumped) };
          } else {
            const bumped = new Date(s.getTime() + 60 * 60 * 1000);
            next = { ...next, endDate: toIsoLocal(bumped) };
          }
        }
      }
      setErrors(validate(next));
      return next;
    });
  };

  // (MiniCalendar moved to reusable component)

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: string) => (touched[field] || attemptedSubmit) && !!errors[field];

  const validate = (data: typeof formData) => {
    const nextErrors: Record<string, string> = {};
    if (!data.title.trim()) nextErrors.title = 'Title is required';
    if (!data.startDate) nextErrors.startDate = 'Start date/time is required';
    if (!data.endDate) nextErrors.endDate = 'End date/time is required';
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (e <= s) nextErrors.endDate = 'End must be after start';
    }
    return nextErrors;
  };

  const isInvalid = useMemo(() => Object.keys(validate(formData)).length > 0, [formData]);

  const handleSave = () => {
    setAttemptedSubmit(true);
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
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
      case 'holiday': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
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
                  onBlur={() => markTouched('title')}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 ${shouldShowError('title') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                  placeholder="Event title"
                />
                {shouldShowError('title') && (
                  <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                )}
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

              {/* Date and Time with mini calendars (no manual typing of dates) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Start selector */}
                <div className="relative">
                  <label className="block text-body text-gray-300 mb-2">Start</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowStartCal(v => !v); setShowEndCal(false); }}
                      className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('startDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="whitespace-nowrap">
                          {fmt(new Date(formData.startDate), 'PP')}
                        </span>
                      </div>
                    </button>
                    {!formData.isAllDay && (
                      <input
                        type="time"
                        value={fmt(new Date(formData.startDate), 'HH:mm')}
                        onChange={(e) => handleInputChange('startDate', withTime(formData.startDate, e.target.value))}
                        className="px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    )}
                  </div>
                  {showStartCal && (
                    <MiniCalendar
                      value={new Date(formData.startDate)}
                      onChange={(d) => handleInputChange('startDate', withDateFrom(formData.startDate, d))}
                      onClose={() => setShowStartCal(false)}
                    />
                  )}
                  {shouldShowError('startDate') && (
                    <p className="mt-1 text-xs text-red-400">{errors.startDate}</p>
                  )}
                </div>

                {/* End selector */}
                <div className="relative">
                  <label className="block text-body text-gray-300 mb-2">End</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowEndCal(v => !v); setShowStartCal(false); }}
                      className={`flex-1 min-w-0 px-3 py-2 bg-gray-700 border ${shouldShowError('endDate') ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white text-left`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="whitespace-nowrap">
                          {fmt(new Date(formData.endDate), 'PP')}
                        </span>
                      </div>
                    </button>
                    {!formData.isAllDay && (
                      <input
                        type="time"
                        value={fmt(new Date(formData.endDate), 'HH:mm')}
                        onChange={(e) => handleInputChange('endDate', withTime(formData.endDate, e.target.value))}
                        className="px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    )}
                  </div>
                  {showEndCal && (
                    <MiniCalendar
                      value={new Date(formData.endDate)}
                      onChange={(d) => handleInputChange('endDate', withDateFrom(formData.endDate, d))}
                      onClose={() => setShowEndCal(false)}
                      minDate={new Date(formData.startDate)}
                    />
                  )}
                  {shouldShowError('endDate') && (
                    <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>
                  )}
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
                  <option value="holiday">Holiday</option>
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

              {/* Contacts (Attendees) Selection */}
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
                      const selected = formData.attendees.includes(c._id);
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
                  {formData.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.attendees.map(cid => (
                        <span key={cid} className="px-2 py-1 bg-blue-700/40 text-blue-300 text-small rounded flex items-center gap-1">
                          {getContactName(cid)}
                          <button onClick={() => toggleContact(cid)} className="text-blue-300 hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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

                  {/* Attendees (Contacts) */}
                {event.attendees && event.attendees.length > 0 && (
                    <div className="flex flex-col gap-1 text-body text-blue-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-400" />
                        <span>{event.attendees.length} contact{event.attendees.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.attendees.map(id => {
                          const c = contacts.find(x => x._id === id);
                          const label = c ? `${c.firstName} ${c.lastName}` : id;
                          const href = c?.email ? `mailto:${c.email}` : (c?.phone ? `tel:${c.phone}` : undefined);
                          return href ? (
                            <a
                              key={id}
                              href={href}
                              className="px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-600/40 text-blue-200 text-small"
                            >{label}</a>
                          ) : (
                            <span
                              key={id}
                              className="px-2 py-1 rounded bg-blue-700/30 text-blue-200 text-small"
                            >{label}</span>
                          );
                        })}
                      </div>
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
                    className={isInvalid ? 'opacity-50 cursor-not-allowed' : ''}
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
