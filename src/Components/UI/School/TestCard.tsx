
// TestCard component
// Displays test info: title, date, time, subject color tag
// Controlled by props: test, onClick, isSelected
// Shows edit/delete buttons on hover
// On click, opens LessonContent at Test view

import React from 'react';

interface TestCardProps {
	test: {
		title: string;
		date: string;
		time: string;
		subjectType: string;
		subjectColor: string;
	};
	onClick: () => void;
	isSelected: boolean;
}

const TestCard: React.FC<TestCardProps> = ({ test, onClick, isSelected }) => {
	return (
			<div
				className={`test-card relative cursor-pointer rounded-lg mb-4 p-4 border ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
				onClick={onClick}
			>
				<div className="font-bold">{test.title}</div>
				<div>{test.date}</div>
				<div>{test.time}</div>
			<span className={`ml-2 px-2 py-1 rounded text-white ${test.subjectColor}`}>{test.subjectType}</span>
				<div className="test-card-actions absolute top-2 right-2 hidden group-hover:flex space-x-2">
					<button className="bg-gray-200 px-2 py-1 rounded hover:bg-blue-500 hover:text-white">Edit</button>
					<button className="bg-gray-200 px-2 py-1 rounded hover:bg-red-500 hover:text-white">Delete</button>
				</div>
			</div>
	);
};

export default TestCard;
