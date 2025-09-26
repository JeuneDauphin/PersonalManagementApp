import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../Button';
import { CalendarEvent, Contact } from '../../../../utils/interfaces/interfaces';
import { EventType } from '../../../../utils/types/types';
import { apiService } from '../../../../utils/api/Api';
// Local helper (was in utils.ts)
const toIsoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
import TitleSection from './sections/TitleSection';
import DescriptionSection from './sections/DescriptionSection';
import AllDayToggle from './sections/AllDayToggle';
import DateTimeSection from './sections/DateTimeSection';
import TypeLocationSection from './sections/TypeLocationSection';
import AttendeesSection from './sections/AttendeesSection';
import ViewMode from './sections/ViewMode';

// Public Props kept compatible with current usage
export interface EventPopupProps {
  event?: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: () => void;
  dayDate?: Date;
  startInEdit?: boolean;
}


type FormData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  type: EventType;
  location: string;
  attendees: string[];
  reminders: number[];
};

const defaultForm = (): FormData => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: '',
    description: '',
    startDate: toIsoLocal(now),
    endDate: toIsoLocal(nextHour),
    isAllDay: false,
    type: 'meeting',
    location: '',
    attendees: [],
    reminders: [15],
  } as FormData;
};

// Validation
const validate = (data: FormData) => {
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

// (Sections are imported from ./sections/*)

const EventPopup: React.FC<EventPopupProps> = ({ event, isOpen, onClose, onSave, onDelete, dayDate, startInEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setForm({
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
      const base = new Date(dayDate);
      const now = new Date();
      base.setHours(now.getHours(), now.getMinutes(), 0, 0);
      const nextHour = new Date(base.getTime() + 60 * 60 * 1000);
      setForm({
        title: '', description: '', startDate: toIsoLocal(base), endDate: toIsoLocal(nextHour), isAllDay: false,
        type: 'meeting', location: '', attendees: [], reminders: [15],
      } as FormData);
      setIsEditing(true);
    } else {
      setForm(defaultForm());
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

  const setField = (field: keyof FormData, value: any) => {
    setForm(prev => {
      let next = { ...prev, [field]: value } as FormData;
      if (field === 'type' && value === 'holiday') next.isAllDay = true;
      if ((field === 'startDate' || field === 'endDate' || field === 'isAllDay') && next.startDate && next.endDate) {
        const s = new Date(next.startDate);
        const e = new Date(next.endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e <= s) {
          if (next.isAllDay) {
            const bumped = new Date(s); bumped.setDate(bumped.getDate() + 1);
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

  const markTouched = (field: keyof FormData) => setTouched(prev => ({ ...prev, [field]: true }));
  const shouldShowError = (field: keyof FormData) => (touched[field] && !!errors[field]);

  const handleSave = () => {
    const currentErrors = validate(form);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    const eventData: CalendarEvent = {
      _id: event?._id || `temp-${Date.now()}`,
      title: form.title,
      description: form.description,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      isAllDay: form.isAllDay,
      type: form.type,
      location: form.location,
      attendees: form.attendees,
      reminders: form.reminders,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave?.(eventData);
  };

  const toggleContact = (id: string) => setForm(prev => ({
    ...prev,
    attendees: prev.attendees.includes(id) ? prev.attendees.filter(a => a !== id) : [...prev.attendees, id]
  }));
  const getContactName = (id: string) => {
    const c = contacts.find(ct => ct._id === id);
    if (!c) return id;
    return `${c.firstName} ${c.lastName}`.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-h1 font-semibold text-white">{event ? (isEditing ? 'Edit Event' : 'Event Details') : 'New Event'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <TitleSection value={form.title} onChange={(v: string) => setField('title', v)} error={shouldShowError('title') ? errors.title : undefined} onBlur={() => markTouched('title')} />
              <DescriptionSection value={form.description} onChange={(v: string) => setField('description', v)} />
              <AllDayToggle checked={form.isAllDay} onChange={(v: boolean) => setField('isAllDay', v)} />
              <DateTimeSection
                isAllDay={form.isAllDay}
                startDate={form.startDate}
                endDate={form.endDate}
                onChangeStart={(v: string) => setField('startDate', v)}
                onChangeEnd={(v: string) => setField('endDate', v)}
                errors={{ startDate: shouldShowError('startDate') ? errors.startDate : undefined, endDate: shouldShowError('endDate') ? errors.endDate : undefined }}
              />
              <TypeLocationSection
                type={form.type}
                onTypeChange={(v: EventType) => setField('type', v)}
                location={form.location}
                onLocationChange={(v: string) => setField('location', v)}
              />
              <AttendeesSection
                contacts={filteredContacts}
                loading={contactsLoading}
                search={contactSearch}
                setSearch={setContactSearch}
                selected={form.attendees}
                toggle={toggleContact}
                getName={getContactName}
              />
            </>
          ) : (
            event && <ViewMode event={event} contacts={contacts} />
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div>
            {event && !isEditing && onDelete && (
              <Button action="delete" text="Delete" onClick={onDelete} variant="danger" />
            )}
          </div>
          <div className="flex items-center gap-3">
            {event && !isEditing ? (
              <>
                <Button text="Edit" action="edit" onClick={() => setIsEditing(true)} variant="outline" />
                <Button text="Close" action="cancel" onClick={onClose} variant="secondary" />
              </>
            ) : (
              <>
                <Button text="Cancel" action="cancel" onClick={() => { if (event) setIsEditing(false); else onClose(); }} variant="outline" />
                <Button text="Save" action="save" onClick={handleSave} variant="primary" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
