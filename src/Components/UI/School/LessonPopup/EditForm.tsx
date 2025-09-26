import React, { useEffect, useMemo, useState } from 'react';
import { Lesson } from '../../../../utils/interfaces/interfaces';
import { LessonType } from '../../../../utils/types/types';
import { BasicsSection, DateTimeSection, LocationInstructorSection, DescriptionSection, MaterialsSection, CompletedSection } from './categories';

export interface LessonEditFormProps {
  lesson: Lesson | null;
  onDraftChange: (draft: Lesson) => void;
  onValidityChange: (valid: boolean) => void;
}

type FormState = {
  title: string;
  subject: string;
  type: LessonType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  location: string;
  instructor: string;
  description: string;
  materials: string[];
  completed: boolean;
};

const buildInitial = (lesson: Lesson | null): FormState => {
  if (lesson) {
    const dt = new Date(lesson.date);
    return {
      title: lesson.title,
      subject: lesson.subject,
      type: lesson.type,
      date: dt.toISOString().slice(0, 10),
      time: dt.toTimeString().slice(0, 5),
      duration: lesson.duration,
      location: lesson.location || '',
      instructor: lesson.instructor || '',
      description: lesson.description || '',
      materials: lesson.materials || [],
      completed: lesson.completed,
    };
  }
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return {
    title: '',
    subject: '',
    type: 'lecture',
    date: tomorrow.toISOString().slice(0, 10),
    time: '09:00',
    duration: 60,
    location: '',
    instructor: '',
    description: '',
    materials: [],
    completed: false,
  };
};

const LessonEditForm: React.FC<LessonEditFormProps> = ({ lesson, onDraftChange, onValidityChange }) => {
  const [form, setForm] = useState<FormState>(() => buildInitial(lesson));

  useEffect(() => {
    setForm(buildInitial(lesson));
  }, [lesson]);

  const valid = useMemo(() => {
    if (!form.title.trim()) return false;
    if (!form.subject.trim()) return false;
    if (!form.date) return false;
    if (!form.time) return false;
    return true;
  }, [form]);

  useEffect(() => {
    onValidityChange(valid);
    const dateTime = new Date(`${form.date}T${form.time}`);
    const draft: Lesson = {
      _id: lesson?._id || `temp-${Date.now()}`,
      title: form.title,
      subject: form.subject,
      type: form.type,
      date: dateTime,
      duration: form.duration,
      location: form.location || undefined,
      instructor: form.instructor || undefined,
      description: form.description || undefined,
      materials: form.materials,
      completed: form.completed,
      createdAt: lesson?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onDraftChange(draft);
  }, [form, lesson, onDraftChange, onValidityChange, valid]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addMaterial = (url: string) => {
    if (!url.trim()) return;
    if (form.materials.includes(url.trim())) return;
    update('materials', [...form.materials, url.trim()]);
  };
  const removeMaterial = (url: string) => update('materials', form.materials.filter(m => m !== url));

  return (
    <div className="space-y-6">
      <BasicsSection
        title={form.title}
        subject={form.subject}
        type={form.type}
        onChange={(f: Partial<{ title: string; subject: string; type: LessonType }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <DateTimeSection
        date={form.date}
        time={form.time}
        duration={form.duration}
        onChange={(f: Partial<{ date: string; time: string; duration: number }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <LocationInstructorSection
        location={form.location}
        instructor={form.instructor}
        onChange={(f: Partial<{ location: string; instructor: string }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <DescriptionSection
        description={form.description}
        onChange={(description: string) => update('description', description)}
      />
      <MaterialsSection
        materials={form.materials}
        onAdd={addMaterial}
        onRemove={removeMaterial}
      />
      <CompletedSection
        completed={form.completed}
        onChange={(c: boolean) => update('completed', c)}
      />
    </div>
  );
};

export default LessonEditForm;
