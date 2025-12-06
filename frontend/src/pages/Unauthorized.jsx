import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Lock className="w-16 h-16 text-[#F26522] mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        You are not authorized to view this page. Please login with proper credentials.
      </p>
      <button
        onClick={() => navigate("/selectRole")}
        className="px-6 py-2 bg-[#F26522] text-white rounded-full hover:bg-orange-600 transition"
      >
        Select Role
      </button>
    </div>
  );
};

export default Unauthorized;
