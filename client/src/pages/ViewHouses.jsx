import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Trash2 } from "lucide-react";
import FormContainer from "../components/FormContainer";

const ViewHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [editingHouse, setEditingHouse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = sessionStorage.getItem("token");

  // ✅ Fetch houses
  const fetchHouses = async () => {
    try {
      const res = await axios.get("http://localhost:4050/api/house", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load houses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const filteredHouses = houses.filter((h) =>
    h.houseNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;

    try {
      await axios.delete(`http://localhost:4050/api/house/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete house");
    }
  };

  const handleEditClick = (house) => {
    setEditingHouse(house);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditingHouse(null);
    fetchHouses();
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      {/* ✅ Main Content Area */}
      <div className="flex-1 p-6 sm:p-10 pt-24 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
            🏠 Houses Management
          </h1>

          {/* 🔍 Search Bar */}
          <div className="flex justify-center mb-8">
            <input
              type="text"
              placeholder="Search by house number..."
              className="w-full sm:w-1/2 p-3 rounded-xl bg-gray-100 text-gray-800 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 📋 Table */}
          {loading ? (
            <p className="text-center text-gray-500">Loading houses...</p>
          ) : errorMsg ? (
            <p className="text-center text-red-500">{errorMsg}</p>
          ) : filteredHouses.length === 0 ? (
            <p className="text-center text-gray-500">No houses found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 shadow-inner">
              <table className="min-w-full text-left text-gray-700">
                <thead className="bg-blue-100 text-blue-700 uppercase text-sm tracking-wide">
                  <tr>
                    <th className="py-3 px-6">#</th>
                    <th className="py-3 px-6">House No</th>
                    <th className="py-3 px-6">Price (KSh)</th>
                    <th className="py-3 px-6">Availability</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHouses.map((house, idx) => (
                    <motion.tr
                      key={house._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-gray-500">{idx + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {house.houseNo}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {house.price.toLocaleString()}
                      </td>
                      <td
                        className={`py-4 px-6 font-semibold ${
                          house.availability === "available"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {house.availability}
                      </td>
                      <td className="py-4 px-6 text-center space-x-3">
                        <button
                          onClick={() => handleEditClick(house)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(house._id)}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded-md text-red-600 transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* ✨ Edit Modal */}
      <AnimatePresence>
        {modalOpen && editingHouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg border border-gray-200"
            >
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingHouse(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>

              <FormContainer
                title={`Edit House ${editingHouse.houseNo}`}
                apiUrl={`http://localhost:4050/api/houses/${editingHouse._id}`}
                method="PUT"
                fields={[
                  { label: "House No", name: "houseNo", type: "text" },
                  { label: "Price (KSh)", name: "price", type: "number" },
                  {
                    label: "Availability",
                    name: "availability",
                    type: "select",
                    options: [
                      { label: "Available", value: "available" },
                      { label: "Rented", value: "rented" },
                    ],
                  },
                ]}
                initialData={editingHouse}
                onSuccess={handleSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewHouses;
