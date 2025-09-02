// this component is used to display the list of lessonCard component for a specific subject 
// it will regrouped the lessonCards by subject in boxes with the subject name as title(top left of the container)and the link to the contact of the teacher of the subject in question(to right of the box)
// we will be able to create either a new LessonsLists component or a new lessonCard component with the create button located in the navbar
// interface:
// - lessons: array of lessonCard objects to display
// - subject: the subject name to display as title of the box
// - teacher: the teacher contact object to display the link to the contact of the teacher
// - onLessonClick: function to handle lesson card click
// - isLoading: boolean to indicate if the data is still loading
// - onEditLesson: function to handle the editing of a lesson
// - onDeleteLesson: function to handle the deletion of a lesson
// Example usage:
// <LessonsLists 
//    lessons={lessons}
//    subject="Math"
//    teacher={teacherContact}
//    onLessonClick={handleLessonClick} 
// />
