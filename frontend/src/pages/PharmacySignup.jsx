import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const generatePharmacyId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `PHARM-${randomNum}`;
};

const PharmacySignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pharmacyName: "",
    pharmacyId: generatePharmacyId(),
    email: "",
    address: "",
    contact: "",
    password: "",
    confirmPassword: "",
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
      pharmacyName,
      pharmacyId,
      email,
      address,
      contact,
      password,
      confirmPassword,
    } = formData;

    if (
      !pharmacyName ||
      !pharmacyId ||
      !email ||
      !address ||
      !contact ||
      !password ||
      !confirmPassword
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
        "https://us-central1-e-health-7d458.cloudfunctions.net/api/pharmacies/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pharmacyName,
            pharmacyId,
            email,
            address,
            contact,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store pharmacy info in localStorage
      localStorage.setItem("user", JSON.stringify(data.pharmacy));
      localStorage.setItem("token", JSON.stringify(data.token));

      // Success
      setError("");
      // Navigate to pharmacy dashboard after successful registration
      navigate("/pharmacyDashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 text-gray-700 hover:text-[#F26522] transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-lg w-full bg-white p-8 mt-5 mb-5 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#F26522]">
          E-Health <span className="text-black">track.lk</span>
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Pharmacy Signup
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Pharmacy Name</label>
            <input
              type="text"
              name="pharmacyName"
              value={formData.pharmacyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Pharmacy ID</label>
            <input
              type="text"
              name="pharmacyId"
              value={formData.pharmacyId}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your Pharmacy ID is automatically generated
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
            <label className="block text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#F26522] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contact Number</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
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

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/pharmacyLogin")}
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

export default PharmacySignup;
