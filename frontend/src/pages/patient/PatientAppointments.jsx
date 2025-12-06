import React, { useState, useEffect } from "react";
import PatientSidebar from "../../component/PatientSidebar";
import { PlusCircle, Trash2 } from "lucide-react";
import axios from "axios";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [doctorList, setDoctorList] = useState({});
  const [newAppointment, setNewAppointment] = useState({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
    phone: "",
  });

  // Get patient ID from localStorage or context
  const patientId = JSON.parse(localStorage.getItem("user")).patientId;
  const token = JSON.parse(localStorage.getItem("token"));

  console.log("patientId", patientId);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    const intervalId = setInterval(fetchAppointments, 1000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/doctors"
      );
      setDoctorList(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/appointments/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleAdd = async () => {
    const { specialty, doctor, date, time, reason, phone } = newAppointment;
    if (!specialty || !doctor || !date || !time || !reason || !phone) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/appointments",
        {
          patientId,
          specialty,
          doctor,
          date,
          time,
          reason,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments((prev) => [...prev, response.data.appointment]);
      setShowModal(false);
      setNewAppointment({
        specialty: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rescheduled":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <PatientSidebar>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#F26522]">Appointments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#F26522] text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          <PlusCircle size={18} />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((a) => (
          <div
            key={a._id}
            className="bg-white shadow-sm border rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
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
              <div>
                <p className="text-sm text-gray-600">📝 {a.reason}</p>
              </div>
              <div>
                <span
                  className={`text-xs px-3 py-1 pb-2 rounded-full font-medium ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(a._id)}
              className="text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md m-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#F26522]">
              New Appointment
            </h2>
            <div className="space-y-4">
              {/* Specialty */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Specialty
                </label>
                <select
                  value={newAppointment.specialty}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      specialty: e.target.value,
                      doctor: "",
                    })
                  }
                  className="w-full border px-4 py-2 rounded-md"
                >
                  <option value="">Select Specialty</option>
                  {Object.keys(doctorList).map((specialty, i) => (
                    <option key={i} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Doctor
                </label>
                <select
                  value={newAppointment.doctor}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      doctor: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded-md"
                  disabled={!newAppointment.specialty}
                >
                  <option value="">Select Doctor</option>
                  {doctorList[newAppointment.specialty]?.map((doc, i) => (
                    <option key={i} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newAppointment.phone}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded-md"
                  placeholder="07XXXXXXXX"
                />
              </div>

              {/* Date & Time */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        date: e.target.value,
                      })
                    }
                    className="w-full border px-4 py-2 rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        time: e.target.value,
                      })
                    }
                    className="w-full border px-4 py-2 rounded-md"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Reason
                </label>
                <textarea
                  value={newAppointment.reason}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      reason: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-1 bg-[#F26522] text-white rounded-md hover:bg-orange-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PatientSidebar>
  );
};

export default PatientAppointments;
