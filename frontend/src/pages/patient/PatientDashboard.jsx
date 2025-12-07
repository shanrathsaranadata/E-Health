import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../../component/PatientSidebar";
import { MessageCircle, FileText, Send, Video } from "lucide-react";
import Select from "react-select";
import axios from "axios";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [pharmacyOptions, setPharmacyOptions] = useState({});

  const [viewPrescription, setViewPrescription] = useState(null);
  const [sendPrescription, setSendPrescription] = useState(null);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deliveryData, setDeliveryData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [videocallstart, setvideocallstart] = useState(false);

  // Get patient ID from localStorage or context
  const patientId = JSON.parse(localStorage.getItem("user")).patientId;
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetchAppointments();
    fetchCities();
    // Set up interval to fetch messages every 3 seconds
    const intervalId = setInterval(fetchAppointments, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Check for incoming call
    const call = appointments.find(
      (a) =>
        (a.status === "confirmed" || a.status === "rescheduled") &&
        a.callStatus === "started"
    );
    const call2 = appointments.find(
      (a) =>
        (a.status === "confirmed" || a.status === "rescheduled") &&
        a.callStatus === "none"
    );
    if (call && !videocallstart) setIncomingCall(call);
    else setIncomingCall(false);
  }, [appointments]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        "https://api-budixrq36q-uc.a.run.app/pharmacy-address"
      );
      const cities = response.data.map((address) => ({
        value: address,
        label: address,
      }));
      setCityOptions(cities);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const fetchPharmacies = async (address) => {
    try {
      const response = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/pharmacies/${address}`
      );
      const pharmacies = response.data.map((pharmacy) => ({
        value: pharmacy.pharmacyId,
        label: pharmacy.pharmacyName,
      }));
      setPharmacyOptions((prev) => ({
        ...prev,
        [address]: pharmacies,
      }));
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `https://api-budixrq36q-uc.a.run.app/patient/appointments/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch appointments");
      setLoading(false);
    }
  };

  const handleSendPrescription = async (id) => {
    try {
      const prescriptionId = appointments.find(
        (a) => a._id === id
      )?.prescriptionId;
      console.log(prescriptionId);

      if (!prescriptionId) return;

      await axios.post(
        `https://api-budixrq36q-uc.a.run.app/prescription/delivery/${prescriptionId}`,
        {
          ...deliveryData,
          city: selectedCity?.value,
          pharmacy: selectedPharmacy?.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, deliveryStatus: "sent" } : a))
      );
      setSendPrescription(null);
      setDeliveryData({ name: "", phone: "", address: "" });
    } catch (err) {
      setError("Failed to send prescription");
    }
  };

  const handleVideoCall = async (appointment) => {
    try {
      const response = await axios.post(
        "https://api-budixrq36q-uc.a.run.app/video-call/token",
        {
          appointmentId: appointment._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

      setvideocallstart(true);

      setSelectedAppointment(appointment);
      setShowVideoConfirm(true);
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

  const joinIncomingCall = async () => {
    if (!incomingCall) return;
    try {
      const response = await axios.post(
        "https://api-budixrq36q-uc.a.run.app/video-call/token",
        {
          appointmentId: incomingCall._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Update the city selection handler
  const handleCityChange = (selected) => {
    setSelectedCity(selected);
    setSelectedPharmacy(null);
    if (selected && !pharmacyOptions[selected.value]) {
      fetchPharmacies(selected.value);
    }
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

  if (loading) {
    return (
      <PatientSidebar>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26522]"></div>
        </div>
      </PatientSidebar>
    );
  }

  if (error) {
    return (
      <PatientSidebar>
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </PatientSidebar>
    );
  }

  const confirmedAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "rescheduled"
  );

  const handleChat = (appointment) => {
    navigate("/patientChat", { state: { appointment } });
  };
  return (
    <PatientSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F26522]">Dashboard</h1>
      </div>

      <div className="space-y-4">
        {confirmedAppointments.map((a) => (
          <div
            key={a.id}
            className="bg-white border rounded-md shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
          >
            <div className="space-y-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-semibold text-gray-800">{a.doctor}</p>
                <p className="text-sm text-gray-600">{a.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">📞 {a.phone}</p>
                <p className="text-sm text-gray-600">
                  📅 {a.date} at {a.time}
                </p>
              </div>

              <p className="text-sm text-gray-600">📝 {a.reason}</p>
              {a.deliveryStatus === "sent" && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  📦 Prescription sent for delivery
                </p>
              )}
              {a.deliveryStatus === "rejected" && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  ❌ Prescription delivery was rejected
                </p>
              )}
              {a.deliveryStatus === "delivered" && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✅ Prescription delivered
                </p>
              )}
              {a.deliveryStatus === "pending" && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✅ Prescription accepted
                </p>
              )}
            </div>
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
                onClick={() => setViewPrescription({
                  description: a.prescription,
                  fileUrl: a.fileUrl
                })}
                className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
              >
                <FileText size={18} />
                View
              </button>

              <button
                onClick={() => setSendPrescription(a)}
                className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Prescription Modal */}
      {viewPrescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md m-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Prescription
            </h2>
            <p className="text-gray-700 mb-4">{viewPrescription.description}</p>

            {viewPrescription.fileUrl && (
              <div>
                {/* Image Preview */}
                <div className="mb-2">
                  <img
                    src={getFullUrl(viewPrescription.fileUrl)}
                    alt="Prescription Preview"
                    className="w-full h-48 object-contain border rounded bg-gray-50"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>

                {/* URL Text */}
                <div className="mb-2 bg-gray-100 p-2 rounded text-xs break-all text-gray-500 font-mono">
                  {viewPrescription.fileUrl}
                </div>

                <div className="mb-4 flex gap-3">
                  <a
                    href={getFullUrl(viewPrescription.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F26522] text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
                  >
                    <FileText size={18} />
                    View File
                  </a>
                  <button
                    onClick={() =>
                      handleDownload(
                        viewPrescription.fileUrl,
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

            <div className="flex justify-end">
              <button
                onClick={() => setViewPrescription(null)}
                className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Prescription Modal */}
      {sendPrescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md m-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Delivery Info
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={deliveryData.name}
                onChange={(e) =>
                  setDeliveryData({ ...deliveryData, name: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-md"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={deliveryData.phone}
                onChange={(e) =>
                  setDeliveryData({ ...deliveryData, phone: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-md"
              />

              {/* Select City */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Select City
                </label>
                <Select
                  options={cityOptions}
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="Search city..."
                  className="text-sm"
                />
              </div>

              {/* Select Pharmacy */}
              {selectedCity && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">
                    Select Pharmacy
                  </label>
                  <Select
                    options={pharmacyOptions[selectedCity.value] || []}
                    value={selectedPharmacy}
                    onChange={(selected) => setSelectedPharmacy(selected)}
                    placeholder="Search pharmacy..."
                    className="text-sm"
                  />
                </div>
              )}

              <textarea
                placeholder="Delivery Address"
                value={deliveryData.address}
                onChange={(e) =>
                  setDeliveryData({ ...deliveryData, address: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-md"
              />
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setSendPrescription(null)}
                className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendPrescription(sendPrescription._id)}
                className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Confirmation Modal */}
      {showVideoConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 m-4 rounded-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Start Video Call
            </h2>

            <p>
              Are you sure you want to start a video call with{" "}
              <strong>{selectedAppointment?.doctor}</strong>?
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
      )}

      {/* Incoming Video Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 m-4 rounded-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Incoming Video Call
            </h2>
            <p>
              Dr. <strong>{incomingCall.doctor}</strong> is calling you for your
              appointment.
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
      )}
    </PatientSidebar>
  );
};

export default PatientDashboard;
