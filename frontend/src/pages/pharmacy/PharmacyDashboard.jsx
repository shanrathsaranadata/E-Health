import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import PharmacySidebar from "../../component/PharmacySidebar";
import axios from "axios";

const PharmacyDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetchPrescriptions();
    const intervalId = setInterval(fetchPrescriptions, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/pharmacy/prescriptions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch prescriptions");
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/pharmacy/prescriptions/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, deliveryStatus: newStatus } : r
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDownload = async (fileUrl, fileName = "prescription") => {
    try {
      const response = await axios.get(`http://localhost:5000${fileUrl}`, {
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
      window.open(`http://localhost:5000${fileUrl}`, "_blank");
    }
  };

  if (loading) {
    return (
      <PharmacySidebar>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26522]"></div>
        </div>
      </PharmacySidebar>
    );
  }

  if (error) {
    return (
      <PharmacySidebar>
        <div className="text-red-600 text-center p-4">{error}</div>
      </PharmacySidebar>
    );
  }

  return (
    <PharmacySidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F26522]">Medicine Orders</h1>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <div
            key={r._id}
            className="bg-white border rounded-md shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="space-y-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-semibold text-gray-800">
                  {r.deliveryDetails.name}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {r.deliveryDetails.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  🏠 {r.deliveryDetails.address}
                </p>
              </div>
              <div>
                {r.deliveryStatus === "delivered" && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✅ Delivered
                  </p>
                )}
                {r.deliveryStatus === "rejected" && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    ❌ Rejected
                  </p>
                )}
                {r.deliveryStatus === "pending" && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    ⏳ Pending
                  </p>
                )}
                {r.deliveryStatus === "sent" && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    📦 Sent
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewPrescription({
                  description: r.description,
                  fileUrl: r.fileUrl
                })}
                className="flex items-center gap-1 border border-[#F26522] text-[#F26522] px-3 py-1 rounded-md hover:bg-[#f265221a]"
              >
                <FileText size={18} />
                View
              </button>

              {r.deliveryStatus === "sent" && (
                <>
                  <button
                    onClick={() => updateStatus(r._id, "pending")}
                    className="flex items-center gap-1 border border-green-600 text-green-600 px-3 py-1 rounded-md hover:bg-green-100"
                  >
                    <CheckCircle size={18} />
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(r._id, "rejected")}
                    className="flex items-center gap-1 border border-red-600 text-red-600 px-3 py-1 rounded-md hover:bg-red-100"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </>
              )}
              {r.deliveryStatus === "pending" && (
                <button
                  onClick={() => updateStatus(r._id, "delivered")}
                  className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
                >
                  <CheckCircle size={18} />
                  Mark as Delivered
                </button>
              )}
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
              <div className="mb-4 flex gap-3">
                <a
                  href={`http://localhost:5000${viewPrescription.fileUrl}`}
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
    </PharmacySidebar>
  );
};

export default PharmacyDashboard;
