import React, { useEffect, useMemo, useState } from 'react';
import { Test } from '../../../../utils/interfaces/interfaces';
import { TestType } from '../../../../utils/types/types';
import { BasicsSection, DateTimeSection, LocationSection, MarksSection, MaterialsSection, NotesSection } from './categories';

export interface TestEditFormProps {
  test: Test | null;
  onDraftChange: (draft: Test) => void;
  onValidityChange: (valid: boolean) => void;
}

type FormState = {
  title: string;
  subject: string;
  type: TestType;
  date: string;
  time: string;
  duration?: number;
  location: string;
  totalMarks?: number;
  achievedMarks?: number;
  grade: string;
  studyMaterials: string[];
  notes: string;
};

const buildInitial = (test: Test | null): FormState => {
  if (test) {
    const dt = new Date(test.date);
    return {
      title: test.title,
      subject: test.subject,
      type: test.type,
      date: dt.toISOString().slice(0, 10),
      time: dt.toTimeString().slice(0, 5),
      duration: test.duration,
      location: test.location || '',
      totalMarks: test.totalMarks,
      achievedMarks: test.achievedMarks,
      grade: test.grade || '',
      studyMaterials: test.studyMaterials || [],
      notes: test.notes || '',
    };
  }
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  return {
    title: '',
    subject: '',
    type: 'quiz',
    date: nextWeek.toISOString().slice(0, 10),
    time: '09:00',
    duration: 60,
    location: '',
    totalMarks: 100,
    achievedMarks: undefined,
    grade: '',
    studyMaterials: [],
    notes: '',
  };
};

const TestEditForm: React.FC<TestEditFormProps> = ({ test, onDraftChange, onValidityChange }) => {
  const [form, setForm] = useState<FormState>(() => buildInitial(test));

  useEffect(() => {
    setForm(buildInitial(test));
  }, [test]);

  const valid = useMemo(() => !!form.title.trim() && !!form.subject.trim() && !!form.date && !!form.time, [form]);

  useEffect(() => {
    onValidityChange(valid);
    const dateTime = new Date(`${form.date}T${form.time}`);
    const draft: Test = {
      _id: test?._id || `temp-${Date.now()}`,
      title: form.title,
      subject: form.subject,
      type: form.type,
      date: dateTime,
      duration: form.duration,
      location: form.location || undefined,
      totalMarks: form.totalMarks || undefined,
      achievedMarks: form.achievedMarks,
      grade: form.grade || undefined,
      studyMaterials: form.studyMaterials,
      notes: form.notes || undefined,
      createdAt: test?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onDraftChange(draft);
  }, [form, onDraftChange, onValidityChange, test]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const addMaterial = (url: string) => {
    if (!url.trim()) return;
    if (form.studyMaterials.includes(url.trim())) return;
    update('studyMaterials', [...form.studyMaterials, url.trim()]);
  };
  const removeMaterial = (url: string) => update('studyMaterials', form.studyMaterials.filter(m => m !== url));

  return (
    <div className="space-y-6">
      <BasicsSection
        title={form.title}
        subject={form.subject}
        type={form.type}
        onChange={(f: Partial<{ title: string; subject: string; type: TestType }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <DateTimeSection
        date={form.date}
        time={form.time}
        duration={form.duration}
        onChange={(f: Partial<{ date: string; time: string; duration?: number }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <LocationSection
        location={form.location}
        onChange={(f: Partial<{ location: string }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <MarksSection
        totalMarks={form.totalMarks}
        achievedMarks={form.achievedMarks}
        grade={form.grade}
        onChange={(f: Partial<{ totalMarks?: number; achievedMarks?: number; grade: string }>) => setForm(prev => ({ ...prev, ...f }))}
      />
      <MaterialsSection materials={form.studyMaterials} onAdd={addMaterial} onRemove={removeMaterial} />
      <NotesSection notes={form.notes} onChange={(v: string) => update('notes', v)} />
    </div>
  );
};

export default TestEditForm;
