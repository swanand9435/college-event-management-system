import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { culturalEvents } from "../data/culturalEvents";

function EventRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const event = culturalEvents.find(
    (item) => item.id === eventId
  );

  const [formData, setFormData] = useState({});

  if (!event) {
    return <h2>Event not found</h2>;
  }

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitForm = (e) => {
    e.preventDefault();

    const registration = {
      eventId: event.id,
      eventName: event.name,
      ...formData,
    };

    localStorage.setItem(
      "lastRegistration",
      JSON.stringify(registration)
    );

    navigate("/registration-success");
  };

  return (
    <main className="registration-page">
      <section className="registration-header">
        <span>UTOPIA REGISTRATION</span>

        <h1>{event.name}</h1>

        <p>
          {event.committee} • {event.category}
        </p>
      </section>

      <form
        className="registration-form"
        onSubmit={submitForm}
      >
        <h2>Basic Details</h2>

        <div className="form-grid">
          <FormField
            label="Full Name"
            name="name"
            type="text"
            required
            onChange={updateField}
          />

          <FormField
            label="Mobile Number"
            name="mobile"
            type="tel"
            required
            onChange={updateField}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            required
            onChange={updateField}
          />

          <FormField
            label="College / Institution"
            name="college"
            type="text"
            required
            onChange={updateField}
          />

          {event.commonFields.department && (
            <FormField
              label="Department"
              name="department"
              type="text"
              required
              onChange={updateField}
            />
          )}

          {event.commonFields.year && (
            <FormField
              label="Year"
              name="year"
              type="text"
              required
              onChange={updateField}
            />
          )}

          {event.commonFields.experience && (
            <FormField
              label="Previous Experience"
              name="experience"
              type="textarea"
              required
              onChange={updateField}
            />
          )}
        </div>

        <h2>Event Details</h2>

        <div className="form-grid">
          {event.customFields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              onChange={updateField}
            />
          ))}
        </div>

        <div className="registration-actions">
          <button type="submit">
            Continue to Preview →
          </button>
        </div>
      </form>
    </main>
  );
}

function FormField({
  label,
  name,
  type,
  required,
  options,
  onChange,
}) {
  return (
    <div className="form-field">
      <label>
        {label}
        {required && <span> *</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          required={required}
          onChange={(e) =>
            onChange(name, e.target.value)
          }
        />
      ) : type === "select" ? (
        <select
          required={required}
          onChange={(e) =>
            onChange(name, e.target.value)
          }
        >
          <option value="">Select</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          required={required}
          onChange={(e) =>
            onChange(name, e.target.value)
          }
        />
      )}
    </div>
  );
}

export default EventRegistration;