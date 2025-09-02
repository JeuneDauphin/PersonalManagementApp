// this is the component for the lesson card it will be used in the LessonLists component
// each card represent one lesson from one day not one subject 
// those card will be displayed in the LessonLists component and regrouped by subject(for example math, physics, chemistry,...) in boxes with the subject name as title
// it will display the lesson information such as title, date, time, link to the lessonContent component
// it is a controlled component that receives the lesson data as props
// it is used in the LessonLists component
// Interface; 
// - lesson: the lesson data to display
// - onClick: a function to open the LessonContent component
// - isSelected: a boolean to highlight the card if it is selected
// information displayed:
// - lesson title
// - lesson date
// - lesson time
// - edit button on hover
// - delete button on hover
// when LessonCard is clicked ; open as pop-up the LessonContent component
