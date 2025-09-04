
// LessonsLists component
// Displays a list of LessonCard components for a subject
// Shows subject name as title, teacher contact link
// Controlled by props: lessons, subject, teacher, onLessonClick, isLoading, onEditLesson, onDeleteLesson

import React from 'react';
import LessonCard from './LessonCard';

interface TeacherContact {
	name: string;
	contactLink: string;
}

interface Lesson {
	title: string;
	date: string;
	time: string;
}

interface LessonsListsProps {
	lessons: Lesson[];
	subject: string;
	teacher: TeacherContact;
	onLessonClick: (lesson: Lesson) => void;
	isLoading: boolean;
	onEditLesson?: (lesson: Lesson) => void;
	onDeleteLesson?: (lesson: Lesson) => void;
}

const LessonsLists: React.FC<LessonsListsProps> = ({ lessons, subject, teacher, onLessonClick, isLoading }) => {
	return (
			<div className="lessons-lists-box border border-gray-300 rounded-lg p-4 mb-8">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold">{subject}</h3>
					<a href={teacher.contactLink} className="text-blue-500 underline">{teacher.name}</a>
				</div>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					lessons.map((lesson, idx) => (
						<LessonCard key={idx} lesson={lesson} onClick={() => onLessonClick(lesson)} isSelected={false} />
					))
				)}
			</div>
	);
};

export default LessonsLists;
