import React, { useEffect } from "react";
import { UserPlus, CalendarCheck, Video } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getUserRole } = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const role = getUserRole();
      // Redirect to appropriate dashboard based on role
      switch (role) {
        case "doctor":
          navigate("/doctorDashboard");
          break;
        case "patient":
          navigate("/patientDashboard");
          break;
        case "pharmacy":
          navigate("/pharmacyDashboard");
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, getUserRole, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-[#F26522]">
          E-Health <span className="text-black">track.lk</span>
        </div>
        <Link to="/selectRole">
          <button className="bg-[#F26522] text-white px-5 py-2 rounded-full hover:bg-orange-600 transition">
            Get Started
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 py-6 lg:py-12 bg-gray-50 flex-1">
        {/* Text */}
        <div className="lg:w-1/2 text-center lg:text-left py-6 lg:py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
            Accessible Healthcare <br /> From Anywhere in Sri Lanka
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Book appointments, talk to doctors, get prescriptions and monitor
            your health – all from one secure platform.
          </p>
          <Link to="/selectRole">
            <button className="bg-[#F26522] text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-orange-600 transition">
              Request a Visit
            </button>
          </Link>
        </div>

        {/* Image */}
        <div className="lg:w-1/2 w-full h-full">
          <img
            src="/images/homeDoc.png"
            alt="Doctor Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Step 1 */}
          <Link to="/selectRole">
            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
              <UserPlus className="w-12 h-12 text-[#F26522] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Create Your Account
              </h3>
              <p className="text-gray-600">
                Sign up as a doctor, patient, or pharmacy in just a few steps.
              </p>
            </div>
          </Link>

          {/* Step 2 */}
          <Link to="/selectRole">
            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
              <CalendarCheck className="w-12 h-12 text-[#F26522] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Request Your Visit</h3>
              <p className="text-gray-600">
                Book an appointment with a specialist by choosing your concern.
              </p>
            </div>
          </Link>

          {/* Step 3 */}
          <Link to="/selectRole">
            <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
              <Video className="w-12 h-12 text-[#F26522] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Talk to Your Doctor
              </h3>
              <p className="text-gray-600">
                Chat, share documents, or join a secure video call with your
                doctor.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer (optional) */}
      <footer className="text-center text-sm text-gray-500 py-4 bg-gray-100">
        &copy; {new Date().getFullYear()} E-Health track.lk. All rights
        reserved.
      </footer>
    </div>
  );
};

export default Home;
