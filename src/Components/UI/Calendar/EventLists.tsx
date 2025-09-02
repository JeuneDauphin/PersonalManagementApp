// components is a list of events in sorted by the time of the event
// it is located on the left of the calendar under the DateShortcut component
// interface:
// - events: array of event objects to display
// Props:
// events: array of event objects to display
// onEventClick: function to handle event click
// Example usage:
// <EventLists events={events} onEventClick={handleEventClick} />
// click on the event will direct you to the palce where the event is located in the calendar
// if the event is is the current day, it will be highlighted during a few seconds
// on hover display more information about the event will open EventCardPopup.tsx component