import React from 'react';

// components for diplaying an event in the calendar
// interface:
// title string
// startTime: Date object
// endTime: Date object
// category: string (optional)
// onClick: function to handle click events
// onClick should open EventCardPopup component
// Example usage:
// <EventCard title="Meeting" startTime={new Date()} endTime={new Date()} onClick={handleClick} />
// should display the title, start time and end time
// this component is in the calendar and should be created as a child component of the calendar

interface EventCardProps {
  title: string;
  startTime?: Date | string;
  endTime?: Date | string;
  category?: string;
  color?: string;
  allDay?: boolean;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  startTime,
  endTime,
  category,
  color = '#3b82f6',
  allDay = false,
  onClick,
}) => {
  const formatTime = (d?: Date | string) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const time = allDay ? 'All day' : `${formatTime(startTime)}${endTime ? ` – ${formatTime(endTime)}` : ''}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left truncate px-2 py-1 rounded text-xs text-white shadow"
      style={{ backgroundColor: color }}
      title={title}
    >
      <div className="font-medium truncate">{title}</div>
      <div className="opacity-80 truncate">{time}</div>
      {category && <div className="opacity-70 text-[10px] truncate">{category}</div>}
    </button>
  );
};

export default EventCard;
