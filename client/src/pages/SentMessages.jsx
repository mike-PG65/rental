import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Loader2, Inbox } from "lucide-react";
import { motion } from "framer-motion";

const SentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:4050/api/messages/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [token]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <Loader2 size={42} className="animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-medium">Loading your sent messages...</p>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-red-500">
        <p className="text-lg font-semibold">Error</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <Mail className="text-blue-600" size={32} />
          Sent Messages
        </h2>
      </motion.div>

      {/* No Messages */}
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-12 text-center mx-auto max-w-lg"
        >
          <Inbox size={72} className="text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No Messages Sent
          </h3>
          <p className="text-gray-500 max-w-md leading-relaxed">
            You haven’t sent any messages yet. Once you send a message to a
            tenant, it will appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
              <tr>
                <th className="py-4 px-6 font-semibold">Recipient</th>
                <th className="py-4 px-6 font-semibold">Subject</th>
                <th className="py-4 px-6 font-semibold">Message</th>
                <th className="py-4 px-6 font-semibold">Date Sent</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <motion.tr
                  key={msg._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`transition duration-150 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="py-4 px-6 border-b text-gray-800 font-medium">
                    {msg.recipientId?.name || "Unknown"}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-700">
                    {msg.subject || "No Subject"}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-600">
                    {msg.content?.slice(0, 80) || ""}
                    {msg.content?.length > 80 && "..."}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-500 text-sm whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default SentMessages;
