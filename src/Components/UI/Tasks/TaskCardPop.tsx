// this component is a card that displays tasks information about school or project in the TaskLists component
// each task will be a card with a title which is about what needs to be done, date, time
// no link to more details because all the details and links will be on this TaskCard component
// it is a controlled component that receives the task data as props 
// it is used in the TaskLists component
//Interface; 
// - task: the task data to display
// - onClick: a function to open the TaskDetails component
// - isSelected: a boolean to highlight the card if it is selected
// information displayed:
// - task title(in cororelation with the content of the task)
// - task date
// - task time
// - task description
// - task related project or school (if any)
// - edit button on hover
// - delete button on hover
// - a link to open the related project or school (if any)
// when TaskCard is clicked ; open as pop-up the TaskDetails component
// - the type of task (school, project, personal,...)
// - the priority of the task (low, medium, high)
// - the status of the task (to do, in progress, done)
// - the related project or school (if any)(optional)
// - the related contact (if any)
// - the related event (if any)
// - the related notes (if any)
// - the related files (if any)
// - the related links (if any)
// - the related tags (if any)
// - the related subtasks (if any)
// - the related reminders (if any)
// - the related collaborators (if any)
// - the related comments (if any)