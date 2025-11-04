import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Home,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`http://localhost:4050/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaint(res.data.complaint);
      } catch (err) {
        console.error("Error fetching complaint:", err);
        setError("Failed to load complaint details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Resolved
          </span>
        );
      case "in progress":
        return (
          <span className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
            <Wrench className="w-4 h-4 mr-1" /> In Progress
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
            Unknown
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <Loader2 size={40} className="animate-spin mb-3 text-blue-500" />
        <p className="text-lg font-medium">Loading complaint details...</p>
      </div>
    );

  if (error || !complaint)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-500">
        <AlertTriangle size={60} className="mb-4 text-red-500" />
        <h3 className="text-xl font-semibold mb-2">Unable to load complaint</h3>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Complaints
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {complaint.subject}
          </h1>
          {getStatusBadge(complaint.status)}
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <FileText className="text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Description</h3>
              <p className="leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="text-blue-500" />
            <p>
              <strong>Tenant:</strong>{" "}
              {complaint.tenantId?.name || "Unknown Tenant"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Home className="text-blue-500" />
            <p>
              <strong>House:</strong>{" "}
              {complaint.houseId?.houseNo || "N/A"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-500" />
            <p>
              <strong>Date Submitted:</strong>{" "}
              {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-500">
              Complaint ID: {complaint._id}
            </p>
            <p className="text-sm text-gray-500">
              Rental ID: {complaint.rentalId?._id || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintDetails;
