import EventCard from "../components/EventCard";
import { culturalEvents } from "../data/culturalEvents";

function CulturalEvents() {
  return (
    <main className="cultural-events-page">
      <section className="page-heading">
        <span>UTOPIA</span>
        <h1>Cultural Events</h1>
        <p>Explore events, rules, schedules and registration.</p>
      </section>

      <section className="events-grid">
        {culturalEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
}

export default CulturalEvents;