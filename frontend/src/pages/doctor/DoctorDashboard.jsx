import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../component/DoctorSidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageCircle, Video, Upload, Activity, XCircle } from "lucide-react"; // Ensure lucide-react is installed
import ECGGraphModal from "../../component/ECGGraphModal";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionNote, setPrescriptionNote] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [videocallstart, setvideocallstart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem("token"));
  const [incomingCall, setIncomingCall] = useState(null);
  const [showECGModal, setShowECGModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    const intervalId = setInterval(fetchAppointments, 1000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Check for incoming call (not started by this doctor)
    const user = JSON.parse(localStorage.getItem("user"));
    const call = appointments.find(
      (a) =>
        (a.status === "confirmed" || a.status === "rescheduled") &&
        a.callStatus === "started" &&
        (a.doctorId === user.doctorId) === false
    );
    const call2 = appointments.find(
      (a) =>
        (a.status === "confirmed" || a.status === "rescheduled") &&
        a.callStatus === "none" &&
        (a.doctorId === user.doctorId) === false
    );
    if (call && !videocallstart) setIncomingCall(call);
    else setIncomingCall(null);
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "https://api-budixrq36q-uc.a.run.app/doctors/appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(response.data);
      setLoading(false);
      const response2 = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/sensor-data/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSensorData(response2.data);
    } catch (err) {
      setError("Failed to fetch appointments");
      setLoading(false);
      console.error("Error fetching appointments:", err);
    }
  };

  const handleChat = (appointment) => {
    navigate("/doctorChat", { state: { appointment } });
  };

  const handleVideoCall = async (appointment) => {
    try {
      const response = await axios.post(
        "https://api-budixrq36q-uc.a.run.app/video-call/token",
        {
          appointmentId: appointment._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Store the video call data
      localStorage.setItem(
        "videoCallData",
        JSON.stringify({
          token: response.data.token,
          agoraToken: response.data.agoraToken,
          channelName: response.data.channelName,
          appID: response.data.appID,
          appointment,
        })
      );

      setSelectedAppointment(appointment);
      setShowVideoConfirm(true);
      setvideocallstart(true);
      // Optionally update local state for callStatus
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointment._id ? { ...a, callStatus: "started" } : a
        )
      );
    } catch (err) {
      setError("Failed to initiate video call");
      console.error("Error initiating video call:", err);
    }
  };

  const confirmVideoCall = () => {
    // Navigate to video call page with the token
    navigate("/video-call", {
      state: {
        videoCallData: JSON.parse(localStorage.getItem("videoCallData")),
      },
    });
    setShowVideoConfirm(false);
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `https://api-budixrq36q-uc.a.run.app${url}`;
  };

  const handleDownload = async (fileUrl, fileName = "prescription") => {
    try {
      const fullUrl = getFullUrl(fileUrl);
      const response = await axios.get(fullUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Extract file extension or use default
      const extension = fileUrl.split(".").pop();
      link.setAttribute("download", `${fileName}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback to basic link
      window.open(getFullUrl(fileUrl), "_blank");
    }
  };

  const handleUpload = async (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionNote("");
    setPrescriptionFile(null);
    setExistingFileUrl(null);
    setShowUploadModal(true);

    try {
      const response = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/prescriptions/${appointment._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setPrescriptionNote(response.data.description);
        setExistingFileUrl(response.data.fileUrl);
      }
    } catch (err) {
      // If no prescription exists, that's fine - we'll create a new one
      console.log("No existing prescription found");
    }
  };

  const handleSensorData = async (appointment) => {
    try {
      setSelectedAppointment(appointment);
      setShowSensorModal(true);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("Failed to fetch sensor data");
    }
  };

  const handlePrescriptionUpload = async () => {
    try {
      let response;
      const formData = new FormData();
      formData.append("description", prescriptionNote);
      if (prescriptionFile) {
        formData.append("file", prescriptionFile);
      }

      // First try to get existing prescription
      const existingPrescription = await axios
        .get(
          `https://api-budixrq36q-uc.a.run.app/prescriptions/${selectedAppointment._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .catch(() => null);

      if (existingPrescription?.data) {
        // Update existing prescription
        // For PUT, we need to handle FormData correctly.
        // If file is new, it will replace.
        // Note: Backend endpoint should treat this as update.
        response = await axios.put(
          `https://api-budixrq36q-uc.a.run.app/prescriptions/${selectedAppointment._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
          }
        );
      } else {
        // Create new prescription
        formData.append("appointmentId", selectedAppointment._id);
        response = await axios.post(
          "https://api-budixrq36q-uc.a.run.app/prescriptions",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
          }
        );
      }

      if (response.data) {
        setShowUploadModal(false);
        // Show success message
        alert("Prescription saved successfully!");
      }
    } catch (err) {
      console.error("Error uploading prescription:", err);
      if (err.response && err.response.data) {
        console.error("Server Error Details:", err.response.data);
        alert(`Failed to upload prescription: ${err.response.data.message || err.message}`);
      } else {
        alert("Failed to upload prescription. Check console for details.");
      }
      setError("Failed to upload prescription");
    }
  };

  const joinIncomingCall = async () => {
    if (!incomingCall) return;
    try {
      const response = await axios.post(
        "https://api-budixrq36q-uc.a.run.app/video-call/token",
        {
          appointmentId: incomingCall._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem(
        "videoCallData",
        JSON.stringify({
          token: response.data.token,
          agoraToken: response.data.agoraToken,
          channelName: response.data.channelName,
          appID: response.data.appID,
          appointment: incomingCall,
        })
      );
      setSelectedAppointment(incomingCall);
      setShowVideoConfirm(false);
      setIncomingCall(null); // Optionally reset
      navigate("/video-call", {
        state: {
          videoCallData: JSON.parse(localStorage.getItem("videoCallData")),
        },
      });
    } catch (err) {
      setError("Failed to join video call");
      console.error("Error joining video call:", err);
    }
  };

  const endCall = async () => {
    if (selectedAppointment?._id) {
      try {
        await axios.post(
          "https://api-budixrq36q-uc.a.run.app/video-call/end",
          {
            appointmentId: selectedAppointment._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Error ending video call:", err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DoctorSidebar>
      <h1 className="text-2xl font-bold mb-6 text-[#F26522]">Dashboard</h1>

      <div className="space-y-4">
        {appointments &&
          appointments
            ?.filter(
              (ap) => ap.status === "confirmed" || ap.status === "rescheduled"
            )
            ?.map((a) => (
              <div
                key={a.id}
                className="bg-white shadow-sm border rounded-md p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
              >
                {/* Left side: Appointment details */}
                <div className="flex flex-wrap lg:flex-nowrap gap-5 items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {a.patientName}
                    </h2>
                    <p className="text-sm text-gray-600">📞 {a.contact}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      Status: {a.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📝 {a.reason}</p>
                    {a.note && (
                      <p className="text-sm text-blue-600 mt-1">
                        💬 Note: {a.note}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      📅 <strong>{a.date}</strong> at <strong>{a.time}</strong>
                    </p>
                  </div>
                  <div></div>
                </div>
                {/* Right side: Action icons */}
                <div className="flex flex-wrap lg:flex-nowrap gap-2">
                  <button
                    onClick={() => handleVideoCall(a)}
                    className="flex items-center gap-1 border bg-[#F26522] text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
                  >
                    <Video size={18} />
                    Video Call
                  </button>

                  <button
                    onClick={() => handleChat(a)}
                    className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>

                  <button
                    onClick={() => handleUpload(a)}
                    className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
                  >
                    <Upload size={18} />
                    Upload
                  </button>

                  <button
                    onClick={() => handleSensorData(a)}
                    className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
                  >
                    <Activity size={18} />
                    Sensor Data
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Upload Prescription Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md m-4">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Upload Prescription
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={prescriptionNote}
                  onChange={(e) => setPrescriptionNote(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>

              {existingFileUrl && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Current File
                  </label>

                  {/* Image Preview */}
                  {/* Basic check for image extension or assume image if no extension for simplicity, 
                      since we mostly upload images? Better to check extension. */}
                  <div className="mb-2">
                    <img
                      src={getFullUrl(existingFileUrl)}
                      alt="Prescription Preview"
                      className="w-full h-48 object-contain border rounded bg-gray-50"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>

                  {/* URL Text */}
                  <div className="mb-2 bg-gray-100 p-2 rounded text-xs break-all text-gray-500 font-mono">
                    {existingFileUrl}
                  </div>

                  <div className="flex gap-3 mb-2">
                    <a
                      href={getFullUrl(existingFileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      View Current
                    </a>
                    <button
                      onClick={() =>
                        handleDownload(
                          existingFileUrl,
                          `prescription`
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Upload File (Image/PDF)
                </label>
                <input
                  type="file"
                  onChange={(e) => setPrescriptionFile(e.target.files[0])}
                  className="w-full border px-4 py-2 rounded-md"
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement upload logic here
                    handlePrescriptionUpload();
                  }}
                  className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600 transition"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Data Modal */}
      {showSensorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6 text-[#F26522] text-center">
              Sensor Data for {selectedAppointment?._id}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ECG */}

              <div
                className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow hover:scale-105 transform duration-200"
                onClick={() => setShowECGModal(true)}
              >
                <svg
                  className="w-6 h-6 text-[#F26522] mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 12h4l2 4 4-8 3 6h5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">ECG Wave</p>
                <p className="text-sm text-gray-500">
                  {sensorData?.ecg || "N/A"}
                  <span className="block text-xs text-[#F26522] mt-1">(Click to view Graph)</span>
                </p>
              </div>

              {/* Heart Rate */}
              <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
                <svg
                  className="w-6 h-6 text-[#F26522] mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2a3 3 0 0 0-5.356-1.857M7 20v-2a3 3 0 0 0-5.356-1.857M7 20H2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Heart Rate</p>
                <p className="text-sm text-gray-500">
                  {sensorData?.bloodPressure + " bpm" || "N/A"}
                </p>
              </div>

              {/* Oxygen Saturation */}
              <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
                <svg
                  className="w-6 h-6 text-[#F26522] mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 20h.01M8 4h.01M12 4h.01M16 4h.01M4 8h.01M20 8h.01M4 16h.01M20 16h.01M8 20h.01M16 20h.01"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Oxygen Saturation</p>
                <p className="text-sm text-gray-500">
                  {sensorData?.oxygenSaturation || "N/A"}%
                </p>
              </div>

              {/* Respiration Rate */}
              <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
                <svg
                  className="w-6 h-6 text-[#F26522] mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 4v16m8-8H4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Respiration Rate</p>
                <p className="text-sm text-gray-500">
                  {sensorData?.respirationRate || "N/A"} breaths/min
                </p>
              </div>

              {/* Temperature */}
              <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
                <svg
                  className="w-6 h-6 text-[#F26522] mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14 14.76V5a2 2 0 0 0-4 0v9.76A5 5 0 1 0 14 14.76z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-semibold">Body Temp</p>
                <p className="text-sm text-gray-500">
                  {sensorData?.temperature || "N/A"}°C
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSensorModal(false)}
                className="px-6 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Video Call Confirmation Modal */}
      {
        showVideoConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 m-4 rounded-md w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
                Start Video Call
              </h2>

              <p>
                Are you sure you want to start a video call with{" "}
                <strong>{selectedAppointment?.patientName}</strong>?
              </p>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => {
                    endCall();
                    setShowVideoConfirm(false);
                    setvideocallstart(false);
                  }}
                  className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVideoCall}
                  className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600 transition"
                >
                  Start Call
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Incoming Video Call Modal */}
      {
        incomingCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 m-4 rounded-md w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
                Incoming Video Call
              </h2>
              <p>
                Patient <strong>{incomingCall.patientName}</strong> is calling you
                for their appointment.
                <br />
                Would you like to join the call?
              </p>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => {
                    setIncomingCall(false);
                    setvideocallstart(true);
                  }}
                  className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Dismiss
                </button>
                <button
                  onClick={joinIncomingCall}
                  className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600 transition"
                >
                  Join Call
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* ECG Graph Modal */}
      <ECGGraphModal
        isOpen={showECGModal}
        onClose={() => setShowECGModal(false)}
        patientName={selectedAppointment?._id}
        sensorData={sensorData}
      />
    </DoctorSidebar >
  );
};

export default DoctorDashboard;
