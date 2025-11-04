import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Wrench,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Home,
  Calendar,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:4050/api/complaints/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  // 🌀 Loading Spinner
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <Loader2 size={40} className="animate-spin mb-3 text-blue-600" />
        <p className="text-lg font-medium">Loading complaints...</p>
      </div>
    );

  // ❌ Error or Empty State
  if (error || complaints.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-500">
        <MessageSquare size={60} className="mb-4 text-blue-600" />
        <h3 className="text-xl font-semibold mb-2">
          {error ? "Error Loading Complaints" : "No Complaints Found"}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {error || "There are currently no complaints recorded."}
        </p>
      </div>
    );

  // 🏷️ Status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Resolved
          </span>
        );
      case "in progress":
        return (
          <span className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold">
            <Wrench className="w-4 h-4 mr-1" /> In Progress
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          All Complaints
        </h1>
        <p className="text-gray-500 text-lg">
          Review all tenant complaints and track their progress.
        </p>
      </header>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {complaints.map((complaint, index) => (
          <Link
            to={`/complaints/${complaint._id}`}
            key={complaint._id}
            className="block"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-100 shadow-sm hover:shadow-lg rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Complaint Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-700 leading-snug">
                  {complaint.subject}
                </h3>
                {getStatusBadge(complaint.status)}
              </div>

              {/* Complaint Description */}
              <p className="text-gray-700 text-sm mb-5 leading-relaxed line-clamp-3">
                {complaint.description}
              </p>

              {/* Complaint Details */}
              <div className="space-y-2 text-gray-600 text-sm border-t pt-3">
                <p className="flex items-center gap-2">
                  <User size={14} /> <strong>Tenant:</strong>{" "}
                  {complaint.tenantId?.name || "Unknown"}
                </p>
                <p className="flex items-center gap-2">
                  <Home size={14} /> <strong>House No:</strong>{" "}
                  {complaint.houseId?.houseNo || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <Hash size={14} /> <strong>Rental ID:</strong>{" "}
                  {complaint.rentalId?._id || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={14} /> <strong>Date:</strong>{" "}
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllComplaints;
