import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [patientId2, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const patientId = patientId2.toUpperCase();

      const response = await fetch(
        "http://localhost:5000/patients/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store patient info in localStorage
      localStorage.setItem("user", JSON.stringify(data.patient));
      localStorage.setItem("token", JSON.stringify(data.token));

      // Navigate to patient dashboard after successful login
      navigate("/patientDashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 text-gray-700 hover:text-[#F26522] transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#F26522]">
          E-Health <span className="text-black">track.lk</span>
        </h1>

        <h2 className="text-2xl font-semibold text-center mb-4">
          Patient Login
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Patient ID</label>
            <input
              type="text"
              value={patientId2}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F26522]"
              placeholder="Enter your Patient ID"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F26522]"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-sm text-[#F26522] hover:underline"
            >
              {/* Forgot password? */}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F26522] text-white py-2 rounded-md hover:bg-orange-600 transition"
          >
            Login
          </button>
          {/* Switch to Login Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/patientSignup")}
              className="text-[#F26522] font-medium hover:underline cursor-pointer"
            >
              Create one
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PatientLogin;
