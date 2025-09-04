
// LessonCard component
// Displays a single lesson's info: title, date, time
// Controlled by props: lesson, onClick, isSelected
// Shows edit/delete buttons on hover
// On click, opens LessonContent as popup


import React from 'react';
import { Lesson } from '../../../utils/interfaces/interfaces';

interface LessonCardProps {
    lesson: Lesson;
	onClick: () => void;
	isSelected: boolean;
}

const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, isSelected }) => {
	return (
        <div
            className={`lesson-card relative cursor-pointer rounded-lg mb-4 p-4 border ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={onClick}
        >
            <div className="font-bold">{lesson.title}</div>
            <div>{lesson.subject} ({lesson.type})</div>
            <div>{formatDate(lesson.date)} ({lesson.duration} min)</div>
            {lesson.location && <div>Location: {lesson.location}</div>}
            {lesson.instructor && <div>Instructor: {lesson.instructor}</div>}
            <div>Status: {lesson.completed ? 'Completed' : 'Pending'}</div>
            <div className="lesson-card-actions absolute top-2 right-2 hidden group-hover:flex space-x-2">
                <button className="bg-gray-200 px-2 py-1 rounded hover:bg-blue-500 hover:text-white">Edit</button>
                <button className="bg-gray-200 px-2 py-1 rounded hover:bg-red-500 hover:text-white">Delete</button>
            </div>
        </div>
	);
};

export default LessonCard;
