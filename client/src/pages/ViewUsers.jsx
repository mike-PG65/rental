import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Users</h1>

        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-white text-center">Loading users...</p>
        ) : errorMsg ? (
          <p className="text-red-500 text-center">{errorMsg}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-white text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-white">
              <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-800/70 transition-colors"
                  >
                    <td className="py-4 px-6">{idx + 1}</td>
                    <td className="py-4 px-6">{user.name}</td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">{user.role || "User"}</td>
                    <td className="py-4 px-6 text-center space-x-3">
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm transition-all">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewUsers;
