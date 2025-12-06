import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectRole from "./pages/SelectRole.jsx";
import NotFound from "./pages/NotFound.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import DoctorLogin from "./pages/DoctorLogin.jsx";
import PatientLogin from "./pages/PatientLogin.jsx";
import PharmacyLogin from "./pages/PharmacyLogin.jsx";
import DoctorSignup from "./pages/DoctorSignup.jsx";
import PatientSignup from "./pages/PatientSignup.jsx";
import PharmacySignup from "./pages/PharmacySignup.jsx";

// Doctor
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorChat from "./pages/doctor/DoctorChat.jsx";

// Patient
import PatientProfile from "./pages/patient/PatientProfile.jsx";
import PatientAppointments from "./pages/patient/PatientAppointments.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import PatientChat from "./pages/patient/PatientChat.jsx";

// Pharmacy
import PharmacyProfile from "./pages/pharmacy/PharmacyProfile.jsx";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard.jsx";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./component/ProtectedRoute";
import ErrorBoundary from "./component/ErrorBoundary";
import VideoCall from "./pages/VideoCall.jsx";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/selectRole" element={<SelectRole />} />
            <Route path="/notFound" element={<NotFound />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/doctorLogin" element={<DoctorLogin />} />
            <Route path="/patientLogin" element={<PatientLogin />} />
            <Route path="/pharmacyLogin" element={<PharmacyLogin />} />
            <Route path="/doctorSignup" element={<DoctorSignup />} />
            <Route path="/patientSignup" element={<PatientSignup />} />
            <Route path="/pharmacySignup" element={<PharmacySignup />} />

            {/* Doctor */}
            <Route
              path="/doctorProfile"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctorAppointments"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctorDashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctorChat"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-call"
              element={
                <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                  <VideoCall />
                </ProtectedRoute>
              }
            />

            {/* Patient */}
            <Route
              path="/patientProfile"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patientAppointments"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patientDashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patientChat"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientChat />
                </ProtectedRoute>
              }
            />

            {/* Pharmacy */}
            <Route
              path="/pharmacyProfile"
              element={
                <ProtectedRoute allowedRoles={["pharmacy"]}>
                  <PharmacyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacyDashboard"
              element={
                <ProtectedRoute allowedRoles={["pharmacy"]}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
