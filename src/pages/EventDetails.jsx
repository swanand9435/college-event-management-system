import { Link, useParams } from "react-router-dom";
import { culturalEvents } from "../data/culturalEvents";

function EventDetails() {
  const { eventId } = useParams();

  const event = culturalEvents.find(
    (item) => item.id === eventId
  );

  if (!event) {
    return <h2>Event not found</h2>;
  }

  return (
    <main className="event-details-page">
      <section className="event-details">
        <span>{event.category}</span>

        <h1>{event.name}</h1>

        <p>{event.description}</p>

        <div className="event-info">
          <p>
            <strong>Committee:</strong> {event.committee}
          </p>

          <p>
            <strong>Registration:</strong>{" "}
            {event.registrationOpen ? "Open" : "Closed"}
          </p>
        </div>

        {event.registrationOpen && (
          <Link
            className="register-button"
            to={`/cultural/events/${event.id}/register`}
          >
            Register Now →
          </Link>
        )}
      </section>
    </main>
  );
}

export default EventDetails;