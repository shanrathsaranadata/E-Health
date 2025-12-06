import React, { useState, useEffect } from "react";
import DoctorSidebar from "../../component/DoctorSidebar";
import { CheckCircle, CalendarClock, XCircle } from "lucide-react";
import axios from "axios";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetchAppointments();
    const intervalId = setInterval(fetchAppointments, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "https://d1esk4cwpza4ag.cloudfront.net/doctors/appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch appointments");
      setLoading(false);
    }
  };

  const acceptAppointment = async (id) => {
    try {
      await axios.put(
        `https://d1esk4cwpza4ag.cloudfront.net/doctors/appointments/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAppointments();
    } catch (err) {
      setError("Failed to accept appointment");
    }
  };

  const openReschedule = (appointment) => {
    console.log(appointment);

    setSelected(appointment);
    setNewDate(new Date(appointment.date).toISOString().split("T")[0]);
    setNewTime(appointment.time);
    setNote("");
  };

  const confirmReschedule = async () => {
    try {
      await axios.put(
        `https://d1esk4cwpza4ag.cloudfront.net/doctors/appointments/${selected._id}/reschedule`,
        {
          date: newDate,
          time: newTime,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelected(null);
      fetchAppointments();
    } catch (err) {
      setError("Failed to reschedule appointment");
    }
  };

  const rejectAppointment = async (id) => {
    try {
      await axios.put(
        `https://d1esk4cwpza4ag.cloudfront.net/doctors/appointments/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAppointments();
    } catch (err) {
      setError("Failed to reject appointment");
    }
  };

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26522]"></div>
        </div>
      </DoctorSidebar>
    );
  }

  if (error) {
    return (
      <DoctorSidebar>
        <div className="text-red-500 text-center mt-4">{error}</div>
      </DoctorSidebar>
    );
  }

  return (
    <DoctorSidebar>
      <h1 className="text-2xl font-bold mb-6 text-[#F26522]">
        Manage Appointments
      </h1>

      <div className="space-y-4">
        {appointments &&
          appointments?.map((a) => (
            <div
              key={a._id}
              className="bg-white shadow-sm border rounded-md p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
            >
              {/* Left side: Appointment details */}
              <div className="flex flex-wrap lg:flex-nowrap gap-5 items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {a.patientName}
                  </h2>
                  <p className="text-sm text-gray-600">📞 {a.phone}</p>
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
                    📅 <strong>{new Date(a.date).toLocaleDateString()}</strong>{" "}
                    at <strong>{a.time}</strong>
                  </p>
                </div>
              </div>

              {/* Right side: Action buttons */}
              <div className="flex flex-wrap lg:flex-nowrap gap-2">
                {a.status === "pending" && (
                  <>
                    <button
                      onClick={() => acceptAppointment(a._id)}
                      className="flex items-center gap-1 bg-[#F26522] text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
                    >
                      <CheckCircle size={18} />
                      Accept
                    </button>

                    <button
                      onClick={() => openReschedule(a)}
                      className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-4 py-2 rounded-md hover:bg-[#f265221a] transition"
                    >
                      <CalendarClock size={18} />
                      Reschedule
                    </button>

                    <button
                      onClick={() => rejectAppointment(a._id)}
                      className="flex items-center gap-1 border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </>
                )}

                {a.status !== "pending" && (
                  <span
                    className={`text-sm font-medium ${
                      a.status === "confirmed"
                        ? "text-green-600"
                        : a.status === "rescheduled"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    ✔ {a.status}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Reschedule Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              Reschedule Appointment
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Optional Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReschedule}
                  className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DoctorSidebar>
  );
};

export default DoctorAppointments;
