// components is a calendar 
// the calendar has a time stamp and a list of events(EventCard component)
// the calendar will display the current minutes, hours, days, month and year
// should display as a grid layout
// as we want to have a Google like calendar, if package exist use it, otherwise create our own calendar component

// interface:
// Props:
// events: Array of event objects to be displayed.
// currentDate: Date object to indicate the current date and time.
// onEventClick: Function to handle click events on individual event cards.
// Example usage:
// <Calendar events={events} currentDate={new Date()} onEventClick={handleEventClick} />
// each element of the calendar's grid should be 1 day