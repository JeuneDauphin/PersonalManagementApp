// this component is a notification popup that appears at the bottom of the screen
// it is used to inform the user of important information or actions that need to be taken
// it is a controlled component that receives the notification message and a function to close the notification as props
// it can appear when the app is closed and will disappear after a few seconds 
// can redirect to a specific page when clicked
// they can be about any of the other components (contacts, calendar, tasks, schools, projects) but specially to remind to finish or complete tasks
// interface:
// - the type of notification which will change the color of the notification (contacts, calendar, tasks, schools, projets)
// - message: the notification message to display
// - onClose: a function to close the notification
// - isOpen: a boolean to control the visibility of the notification
// - duration: time in milliseconds before the notification disappears (optional, default is 5000ms)
// - link: a string to redirect to a specific page when clicked (optional)
// Example usage:
// <Notification
//   message="You have a new contact request"
//   onClose={handleClose}
//   isOpen={isNotificationOpen}
//   duration={3000}
//   link="/contacts"
// />
// it can be used in any component where a notification is needed
