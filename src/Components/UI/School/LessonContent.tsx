
// LessonContent component
// Displays full lesson details: title, date, time, description, files, links
// Main purpose: provide PDF for PdfReader
// Switches between Theory, Practice, Test views using ToggleSwitch
// Controlled by props: onClose, lesson


import React, { useState } from 'react';
import { Lesson } from '../../../utils/interfaces/interfaces';

interface LessonContentProps {
	onClose: () => void;
    lesson: Lesson;
}

const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const LessonContent: React.FC<LessonContentProps> = ({ onClose, lesson }) => {
	const [view, setView] = useState<'Theory' | 'Practice' | 'Test'>('Theory');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurry backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm" onClick={onClose}></div>
            {/* Popup content */}
            <div className="lesson-content-popup relative bg-white rounded-lg shadow-xl p-8 overflow-auto max-w-2xl w-full z-10">
                <button onClick={onClose} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-red-500 hover:text-white">Close</button>
                <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                <div className="mb-2">{lesson.subject} ({lesson.type})</div>
                <div className="mb-2">{formatDate(lesson.date)} ({lesson.duration} min)</div>
                {lesson.location && <div className="mb-2">Location: {lesson.location}</div>}
                {lesson.instructor && <div className="mb-2">Instructor: {lesson.instructor}</div>}
                <div className="mb-4">{lesson.description}</div>
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setView('Theory')} className={`px-3 py-1 rounded ${view === 'Theory' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Theory</button>
                    <button onClick={() => setView('Practice')} className={`px-3 py-1 rounded ${view === 'Practice' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Practice</button>
                    <button onClick={() => setView('Test')} className={`px-3 py-1 rounded ${view === 'Test' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Test</button>
                </div>
                <div className="mb-4">
                    {view === 'Theory' && <div>Theory View</div>}
                    {view === 'Practice' && <div>Practice View</div>}
                    {view === 'Test' && <div>Test View</div>}
                </div>
                <div className="mb-4">
                    {lesson.materials && lesson.materials.map((material, idx) => (
                        <div key={idx} className="mb-1">
                            {material.endsWith('.pdf') ? (
                                <span>PDF: {material}</span>
                            ) : material.startsWith('http') ? (
                                <span>Link: <a href={material} className="text-blue-500 underline">{material}</a></span>
                            ) : (
                                <span>File: {material}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div>Status: {lesson.completed ? 'Completed' : 'Pending'}</div>
                {/* TODO PdfReader component would be used here for PDFs */}
            </div>
        </div>
    );
};

export default LessonContent;

