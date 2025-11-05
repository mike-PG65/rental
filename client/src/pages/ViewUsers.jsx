import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Trash2, Search, Users } from "lucide-react";

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const token = sessionStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4050/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Users size={36} className="text-blue-600" />
            Registered Users
          </h1>
          <p className="text-gray-600 text-lg">
            Manage all users and their access levels.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search
            size={20}
            className="absolute top-3 left-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-600 text-center">Loading users...</p>
        ) : errorMsg ? (
          <p className="text-red-500 text-center">{errorMsg}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-600 text-center">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredUsers.map((user, idx) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="text-blue-600" size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {user.name}
                      </h2>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Shield size={18} className="text-yellow-500" />
                    <span className="capitalize">{user.role || "user"}</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-all"
                      onClick={() => alert(`Delete ${user.name}`)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewUsers;
