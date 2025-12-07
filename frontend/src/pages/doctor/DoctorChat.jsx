import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, SendHorizontal, Activity } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DoctorSidebar from "../../component/DoctorSidebar";
import axios from "axios";
import ECGGraphModal from "../../component/ECGGraphModal";

const DoctorChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const token = JSON.parse(localStorage.getItem("token"));
  const appointment = location.state?.appointment;
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [showECGModal, setShowECGModal] = useState(false);

  useEffect(() => {
    if (!appointment) {
      navigate("/doctorDashboard");
      return;
    }

    fetchMessages();

    // Set up interval to fetch messages every 3 seconds
    const intervalId = setInterval(fetchMessages, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [appointment]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/messages/${appointment._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
      const response2 = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/sensor-data/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSensorData(response2.data);
      setLoading(false);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const response = await axios.post(
        "https://api-budixrq36q-uc.a.run.app/messages",
        {
          appointmentId: appointment._id,
          text: input,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages([...messages, response.data]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSensorData = async (appointment) => {
    try {
      setShowSensorModal(true);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26522]"></div>
        </div>
      </DoctorSidebar>
    );
  }

  return (
    <DoctorSidebar>
      <div className="flex flex-col h-[83vh] lg:h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-white border-b shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-[#F26522]"
            >
              <ArrowLeft />
            </button>
            <img
              src={`https://ui-avatars.com/api/?name=${appointment.patientId}&background=F26522&color=fff`}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-[#F26522]">
                {appointment.patientId}
              </h2>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
          {/* Sensor Button */}
          <button
            onClick={() => handleSensorData(appointment)}
            className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
          >
            <Activity size={18} />
            Sensor Data
          </button>
        </div>

        {/* Chat box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] w-fit px-4 py-2 rounded-lg text-sm ${msg.sender === "doctor"
                ? "ml-auto bg-[#F26522] text-white"
                : "mr-auto bg-gray-200 text-gray-800"
                }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div
          className="p-3 border-t bg-white flex gap-2"
          style={{ width: "calc(100% - 55px)" }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F26522]"
          />
          <button
            onClick={handleSend}
            className="bg-[#F26522] text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
      {/* Sensor Data Modal */}
      {showSensorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6 text-[#F26522] text-center">
              Sensor Data for {appointment.patientId}
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
      )}

      <ECGGraphModal
        isOpen={showECGModal}
        onClose={() => setShowECGModal(false)}
        patientName={appointment.patientId}
        sensorData={sensorData}
      />
    </DoctorSidebar>
  );
};

export default DoctorChat;
