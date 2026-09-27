import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div className="event-card">
      <span className="event-category">{event.category}</span>

      <h3>{event.name}</h3>

      <p>{event.description}</p>

      <small>Committee: {event.committee}</small>

      <Link to={`/cultural/events/${event.id}`}>
        View Event →
      </Link>
    </div>
  );
}

export default EventCard;