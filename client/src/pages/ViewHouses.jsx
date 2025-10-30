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

  // Fetch houses
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
      await axios.delete(`http://localhost:4050/api/houses/${id}`, {
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
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Houses Management
        </h1>

        <input
          type="text"
          placeholder="Search by house number..."
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-white text-center">Loading houses...</p>
        ) : errorMsg ? (
          <p className="text-red-500 text-center">{errorMsg}</p>
        ) : filteredHouses.length === 0 ? (
          <p className="text-white text-center">No houses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-white border border-gray-800 rounded-lg">
              <thead className="bg-gray-800 text-gray-300 uppercase text-sm">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">House No</th>
                  <th className="py-3 px-6">Price (KSh)</th>
                  <th className="py-3 px-6">Availability</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredHouses.map((house, idx) => (
                  <motion.tr
                    key={house._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-800/70 transition-colors"
                  >
                    <td className="py-4 px-6">{idx + 1}</td>
                    <td className="py-4 px-6">{house.houseNo}</td>
                    <td className="py-4 px-6">
                      {house.price.toLocaleString()}
                    </td>
                    <td
                      className={`py-4 px-6 font-medium ${
                        house.availability === "available"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {house.availability}
                    </td>
                    <td className="py-4 px-6 text-center space-x-3">
                      <button
                        onClick={() => handleEditClick(house)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(house._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-all"
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

      {/* ✨ Edit Modal */}
      <AnimatePresence>
        {modalOpen && editingHouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-800"
            >
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingHouse(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
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