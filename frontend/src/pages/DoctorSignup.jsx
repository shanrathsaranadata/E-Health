import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const specialties = [
  "Neurologist",
  "Cardiologist",
  "Pulmonologist",
  "Nephrologist",
  "Gastroenterologist",
  "Endocrinologist",
  "Hematologist",
  "Oncologist",
  "Dermatologist",
  "Rheumatologist",
  "Psychiatrist",
  "Ophthalmologist",
  "Otolaryngologist (ENT)",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Geriatrician",
  "Obstetrician & Gynecologist",
  "Anesthesiologist",
  "Radiologist",
  "Pathologist",
  "Urologist",
  "Plastic Surgeon",
  "General Surgeon",
];

const DoctorSignup = () => {
  const navigate = useNavigate();

  const generateDoctorId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 6-digit number
    return `DOC-${randomNum}`;
  };

  const [formData, setFormData] = useState({
    doctorName: "",
    doctorId: generateDoctorId(),
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      doctorName,
      doctorId,
      email,
      password,
      confirmPassword,
      specialty,
    } = formData;

    if (
      !doctorName ||
      !doctorId ||
      !email ||
      !password ||
      !confirmPassword ||
      !specialty
    ) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/doctors/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorName,
            doctorId,
            email,
            password,
            specialty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("user", JSON.stringify(data.doctor));
      localStorage.setItem("token", JSON.stringify(data.token));

      // Success
      setError("");
      // Navigate to doctor dashboard after successful registration
      navigate("/doctorDashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)} // or replace with navigate("/") to go to home
        className="fixed top-6 left-6 text-gray-700 hover:text-[#F26522] transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="max-w-lg w-full bg-white p-8 mt-5 mb-5 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#F26522]">
          E-Health <span className="text-black">track.lk</span>
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Doctor Signup
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Doctor Name</label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Doctor ID</label>
            <input
              type="text"
              name="doctorId"
              value={formData.doctorId}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your Doctor ID is automatically generated
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Specialty</label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            >
              <option value="">Select a specialty</option>
              {specialties.map((field, index) => (
                <option key={index} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* Forgot Password */}
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
            Create Account
          </button>

          {/* Switch to Login Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/doctorLogin")}
              className="text-[#F26522] font-medium hover:underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default DoctorSignup;
