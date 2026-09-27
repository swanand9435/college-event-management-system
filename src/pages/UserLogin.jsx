import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserLogin() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!studentName.trim() || !studentId.trim()) {
      setError("Please enter your name and student ID.");
      return;
    }

    // Store basic login information for this demo.
    localStorage.setItem(
      "famtUser",
      JSON.stringify({
        name: studentName.trim(),
        studentId: studentId.trim(),
      })
    );

    // Go to the existing Sports page.
    navigate("/sports");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b14",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#111827",
          border: "1px solid #263044",
          padding: "35px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "3px",
            color: "#facc15",
            fontWeight: "800",
            marginBottom: "10px",
          }}
        >
          FAMT ARENA
        </div>

        <h1
          style={{
            margin: "0 0 8px",
          }}
        >
          Student Login
        </h1>

        <p
          style={{
            color: "#9ca3af",
            marginBottom: "28px",
          }}
        >
          Login to access FAMT Arena events and sports.
        </p>

        {/* NAME */}
        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontWeight: "700",
          }}
        >
          Student Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={inputStyle}
        />

        {/* STUDENT ID */}
        <label
          style={{
            display: "block",
            marginTop: "18px",
            marginBottom: "7px",
            fontWeight: "700",
          }}
        >
          Student ID
        </label>

        <input
          type="text"
          placeholder="Enter your student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={inputStyle}
        />

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "#351519",
              border: "1px solid #7f1d1d",
              color: "#fca5a5",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* LOGIN */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "22px",
            border: "none",
            background: "#e63946",
            color: "#fff",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          LOGIN TO FAMT ARENA
        </button>

        {/* ADMIN LINK */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            background: "transparent",
            color: "#9ca3af",
            border: "1px solid #374151",
            cursor: "pointer",
          }}
        >
          ADMIN LOGIN
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  background: "#080b14",
  color: "#fff",
  border: "1px solid #374151",
  outline: "none",
};