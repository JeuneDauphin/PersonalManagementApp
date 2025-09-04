
// LessonContent component
// Displays full lesson details: title, date, time, description, files, links
// Main purpose: provide PDF for PdfReader
// Switches between Theory, Practice, Test views using ToggleSwitch
// Controlled by props: onClose, lesson

import React, { useState } from 'react';

interface LessonContentProps {
	onClose: () => void;
	lesson: {
		title: string;
		date: string;
		time: string;
		description?: string;
		files?: string[];
		links?: string[];
	};
}

const LessonContent: React.FC<LessonContentProps> = ({ onClose, lesson }) => {
	const [view, setView] = useState<'Theory' | 'Practice' | 'Test'>('Theory');

	return (
			<div className="lesson-content-popup fixed inset-0 bg-white z-50 p-8 overflow-auto">
				<button onClick={onClose} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-red-500 hover:text-white">Close</button>
				<h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
				<div className="mb-2">{lesson.date} {lesson.time}</div>
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
					{lesson.files && lesson.files.map((file, idx) => (
						<div key={idx} className="mb-1">File: {file}</div>
					))}
					{lesson.links && lesson.links.map((link, idx) => (
						<div key={idx} className="mb-1">Link: <a href={link} className="text-blue-500 underline">{link}</a></div>
					))}
				</div>
				{/* TODO PdfReader component would be used here for PDFs */}
			</div>
	);
};

export default LessonContent;

