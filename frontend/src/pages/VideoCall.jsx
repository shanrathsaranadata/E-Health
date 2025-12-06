import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  LocalVideoTrack,
  RemoteVideoTrack,
  AgoraRTCProvider,
} from "agora-rtc-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Activity,
  MessageCircle,
} from "lucide-react";
import axios from "axios";

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoCallData } = location.state || {};
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const client = useRef(null);
  const [sensorData, setSensorData] = useState(null);
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    // Redirect if no video call data
    if (!videoCallData) {
      navigate("/");
      return;
    }

    // Initialize Agora client
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // Join channel and setup video call
    const setupCall = async () => {
      try {
        // Join the channel
        await client.current.join(
          videoCallData.appID,
          videoCallData.channelName,
          videoCallData.agoraToken,
          null
        );

        // Create local audio and video tracks
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Publish tracks to the channel
        await client.current.publish([audioTrack, videoTrack]);

        // Handle remote user's media
        client.current.on("user-published", async (user, mediaType) => {
          await client.current.subscribe(user, mediaType);
          console.log("User published:", user.uid, mediaType);

          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              // Check if user already exists
              const existingUserIndex = prev.findIndex(
                (existingUser) => existingUser.uid === user.uid
              );

              if (existingUserIndex !== -1) {
                // Update existing user with new video track
                const updatedUsers = [...prev];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  videoTrack: user.videoTrack,
                };
                return updatedUsers;
              } else {
                // Add new user
                return [
                  ...prev,
                  {
                    uid: user.uid,
                    videoTrack: user.videoTrack,
                    audioTrack: null,
                  },
                ];
              }
            });
          }

          if (mediaType === "audio") {
            setRemoteUsers((prev) => {
              const existingUserIndex = prev.findIndex(
                (existingUser) => existingUser.uid === user.uid
              );

              if (existingUserIndex !== -1) {
                // Update existing user with new audio track
                const updatedUsers = [...prev];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  audioTrack: user.audioTrack,
                };
                return updatedUsers;
              } else {
                // Add new user
                return [
                  ...prev,
                  {
                    uid: user.uid,
                    videoTrack: null,
                    audioTrack: user.audioTrack,
                  },
                ];
              }
            });
            user.audioTrack?.play();
          }
        });

        // Handle when remote user unpublishes media
        client.current.on("user-unpublished", (user, mediaType) => {
          console.log("User unpublished:", user.uid, mediaType);

          setRemoteUsers((prev) => {
            const existingUserIndex = prev.findIndex(
              (existingUser) => existingUser.uid === user.uid
            );

            if (existingUserIndex !== -1) {
              const updatedUsers = [...prev];
              if (mediaType === "video") {
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  videoTrack: null,
                };
              } else if (mediaType === "audio") {
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  audioTrack: null,
                };
              }
              return updatedUsers;
            }
            return prev;
          });
        });

        // Remove user when they leave
        client.current.on("user-left", (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });
      } catch (error) {
        console.error("Video call error:", error);
      }
    };

    setupCall();

    // Cleanup when component unmounts
    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
      client.current?.leave();
    };
  }, [videoCallData, navigate]);

  // Toggle audio mute/unmute
  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle video mute/unmute
  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // End call and navigate back
  // End call and navigate back
  const endCall = async () => {
    localAudioTrack?.close();
    localVideoTrack?.close();
    client.current?.leave();
    // Call backend to end video call
    const token = JSON.parse(localStorage.getItem("token"));
    if (videoCallData.appointment?._id) {
      try {
        await axios.post(
          "https://d1esk4cwpza4ag.cloudfront.net/video-call/end",
          {
            appointmentId: videoCallData.appointment._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Error ending video call:", err);
      }
    }
    navigate(-1);
  };

  const handleChat = (appointment) => {
    navigate("/doctorChat", { state: { appointment } });
  };

  const handleSensorData = async (appointment) => {
    try {
      const response = await axios.get(
        `https://d1esk4cwpza4ag.cloudfront.net/sensor-data/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSensorData(response.data);
      setShowSensorModal(true);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Appointment Info */}
        {videoCallData?.appointment && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Appointment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Patient:</span>{" "}
                  {videoCallData.appointment.patientName || "N/A"}
                </p>
                {videoCallData.appointment.patientId && (
                  <p>
                    <span className="font-medium">Patient ID:</span>{" "}
                    {videoCallData.appointment.patientId}
                  </p>
                )}
              </div>
              <div>
                <p>
                  <span className="font-medium">Doctor:</span>{" "}
                  {videoCallData.appointment.doctor || "N/A"}
                </p>
                {videoCallData.appointment.doctorId && (
                  <p>
                    <span className="font-medium">Doctor ID:</span>{" "}
                    {videoCallData.appointment.doctorId}
                  </p>
                )}
              </div>
              {/* Sensor Button */}
              <button
                onClick={() => handleSensorData(videoCallData.appointment)}
                className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
              >
                <Activity size={18} />
                Sensor Data
              </button>

              <button
                onClick={() => handleChat(videoCallData.appointment)}
                className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
              >
                <MessageCircle size={18} />
                Chat
              </button>
            </div>
          </div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Local video */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {localVideoTrack && (
              <LocalVideoTrack
                track={localVideoTrack}
                play={true}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4">
              <p className="text-sm bg-black/50 px-2 py-1 rounded">
                ID: {client.current?.uid || "Unknown"}
              </p>
            </div>
            {/* Camera off indicator for local user */}
            {!isVideoMuted && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <VideoOff size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400">Camera Off</p>
                </div>
              </div>
            )}
            {/* Mic off indicator for local user */}
            {isAudioMuted && (
              <div className="absolute top-4 right-4">
                <div className="bg-black/50 p-2 rounded-full">
                  <MicOff size={20} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Remote video */}
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
            >
              <RemoteVideoTrack
                track={user.videoTrack}
                play={true}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm bg-black/50 px-2 py-1 rounded">
                  ID: {user.uid}
                </p>
              </div>
              {/* Camera off indicator for remote user */}
              {!user.videoTrack && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoOff
                      size={48}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-gray-400">Camera Off</p>
                  </div>
                </div>
              )}
              {/* Mic off indicator for remote user */}
              {user.audioTrack && !user.audioTrack.enabled && (
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 p-2 rounded-full">
                    <MicOff size={20} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${isAudioMuted ? "bg-gray-500" : "bg-red-500"
              }`}
          >
            {isAudioMuted ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoMuted ? "bg-red-500" : "bg-gray-700"
              }`}
          >
            {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={endCall} className="p-4 rounded-full bg-red-500">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
      {/* Sensor Data Modal */}
      {showSensorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6 text-[#F26522] text-center">
              Sensor Data for {videoCallData.appointment.patientId}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ECG */}
              <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
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
    </div>
  );
};

export default VideoCall;
