
// LessonCard component
// Displays a single lesson's info: title, date, time
// Controlled by props: lesson, onClick, isSelected
// Shows edit/delete buttons on hover
// On click, opens LessonContent as popup

import React from 'react';

interface LessonCardProps {
	lesson: {
		title: string;
		date: string;
		time: string;
	};
	onClick: () => void;
	isSelected: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, isSelected }) => {
	return (
			<div
				className={`lesson-card relative cursor-pointer rounded-lg mb-4 p-4 border ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
				onClick={onClick}
			>
				<div className="font-bold">{lesson.title}</div>
				<div>{lesson.date}</div>
				<div>{lesson.time}</div>
				<div className="lesson-card-actions absolute top-2 right-2 hidden group-hover:flex space-x-2">
					<button className="bg-gray-200 px-2 py-1 rounded hover:bg-blue-500 hover:text-white">Edit</button>
					<button className="bg-gray-200 px-2 py-1 rounded hover:bg-red-500 hover:text-white">Delete</button>
				</div>
			</div>
	);
};

export default LessonCard;
