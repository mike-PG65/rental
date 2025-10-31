import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Send, Users, User } from "lucide-react";

const SendMessage = () => {
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: "",
    subject: "",
    body: "",
    isBroadcast: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch all tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4050/api/rental/tenants",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTenants(data || []);
      } catch (err) {
        console.error("Fetch tenants error:", err);
        setError("Failed to load tenants.");
      }
    };

    fetchTenants();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:4050/api/messages/send",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(data.message || "Message sent successfully!");
      setFormData({
        recipientId: "",
        subject: "",
        body: "",
        isBroadcast: false,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Send className="text-blue-600" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Send Message</h2>
        </div>

        {/* Success & Error */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4 border border-green-100">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Broadcast toggle */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isBroadcast"
              name="isBroadcast"
              checked={formData.isBroadcast}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
            <label
              htmlFor="isBroadcast"
              className="flex items-center gap-2 text-gray-700 font-medium"
            >
              {formData.isBroadcast ? (
                <Users className="text-blue-500" size={20} />
              ) : (
                <User className="text-gray-400" size={20} />
              )}
              Send to all tenants
            </label>
          </div>

          {/* Tenant dropdown */}
          {!formData.isBroadcast && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Select Tenant
              </label>
              <select
                name="recipientId"
                value={formData.recipientId}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 transition"
                required
              >
                <option value="">-- Choose Tenant --</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} — House {tenant.houseNo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 transition"
              required
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Message
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows="6"
              placeholder="Type your message here..."
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 transition resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Sending..." : "Send Message"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SendMessage;
