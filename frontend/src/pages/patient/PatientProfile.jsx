import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../component/PatientSidebar";
import axios from "axios";

const PatientProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    patientId: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token"));
        const response = await axios.get(
          "https://d1esk4cwpza4ag.cloudfront.net/patients/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("dfdfd", response);

        const patientData = response.data;
        setFormData((prev) => ({
          ...prev,
          name: patientData.patientName,
          email: patientData.email,
          patientId: patientData.patientId,
          contact: patientData.contact || "",
        }));
      } catch (error) {
        setMessage("Error loading profile data");
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchPatientProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const response = await axios.put(
        "https://d1esk4cwpza4ag.cloudfront.net/patients/profileupdate",
        {
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          password: formData.password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Profile updated successfully!");
      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DoctorSidebar>
      <div className="mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-[#F26522]">Edit Profile</h1>

        {isLoadingProfile ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-md p-6 space-y-6"
          >
            {message && (
              <p
                className={`text-sm text-center font-medium ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#F26522] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#F26522] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Identification */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Identification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={formData.patientId}
                    disabled
                    className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md border cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-gray-50 px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#F26522] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password Update */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Change Password{" "}
                <span className="text-sm text-gray-400">(optional)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-gray-50 px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#F26522] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-50 px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#F26522] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-[#F26522] w-full text-white py-2 rounded-md hover:bg-orange-600 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DoctorSidebar>
  );
};

export default PatientProfile;
