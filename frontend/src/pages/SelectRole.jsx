import React from "react";
import { ArrowLeft, UserPlus2, Stethoscope, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SelectRole = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    // Example: Navigate to signup page with role
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
       {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)} // or replace with navigate("/") to go to home
        className="fixed top-6 left-6 text-gray-700 hover:text-[#F26522] transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">
        Select Your Role to Get Started
      </h1>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Doctor */}
        <div
          onClick={() => handleSelect("doctorLogin")}
          className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl border hover:border-[#F26522] transition p-8 flex flex-col items-center text-center"
        >
          <Stethoscope className="w-12 h-12 text-[#F26522] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Doctor</h2>
          <p className="text-gray-600">Provide consultations, manage appointments, and monitor patients.</p>
        </div>

        {/* Patient */}
        <div
          onClick={() => handleSelect("patientLogin")}
          className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl border hover:border-[#F26522] transition p-8 flex flex-col items-center text-center"
        >
          <UserPlus2 className="w-12 h-12 text-[#F26522] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Patient</h2>
          <p className="text-gray-600">Book appointments, chat with doctors, and get treated from home.</p>
        </div>

        {/* Pharmacy */}
        <div
          onClick={() => handleSelect("pharmacyLogin")}
          className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl border hover:border-[#F26522] transition p-8 flex flex-col items-center text-center"
        >
          <Building2 className="w-12 h-12 text-[#F26522] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pharmacy</h2>
          <p className="text-gray-600">View prescriptions, manage orders, and assist patients with medication.</p>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
