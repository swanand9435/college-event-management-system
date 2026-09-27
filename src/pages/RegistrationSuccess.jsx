import { Link } from "react-router-dom";

function RegistrationSuccess() {
  const registration = JSON.parse(
    localStorage.getItem("lastRegistration")
  );

  const registrationId =
    "UTO-" +
    Math.floor(100000 + Math.random() * 900000);

  return (
    <main className="registration-success">
      <div className="success-card">
        <span>UTOPIA</span>

        <h1>Registration Successful</h1>

        <p>
          Your registration for{" "}
          <strong>{registration?.eventName}</strong>{" "}
          has been received.
        </p>

        <div className="registration-id">
          Registration ID
          <strong>{registrationId}</strong>
        </div>

        <p>
          Confirmation will be sent to your registered
          email and mobile number.
        </p>

        <Link to="/cultural">
          Back to UTOPIA
        </Link>
      </div>
    </main>
  );
}

export default RegistrationSuccess;