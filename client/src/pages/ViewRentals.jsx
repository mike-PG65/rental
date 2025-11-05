import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Trash2, Home } from "lucide-react";
import FormContainer from "../components/FormContainer";

const ViewRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [editingRental, setEditingRental] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = sessionStorage.getItem("token");

  const fetchRentals = async () => {
    try {
      const res = await axios.get("http://localhost:4050/api/rental/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const filteredRentals = rentals.filter(
    (r) =>
      r.tenantId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.houseId?.houseNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rental?")) return;

    try {
      await axios.delete(`http://localhost:4050/api/rental/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete rental");
    }
  };

  const handleEditClick = (rental) => {
    setEditingRental(rental);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditingRental(null);
    fetchRentals();
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <div className="flex-1 p-6 sm:p-10 pt-24 max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-blue-600 mb-10 text-center flex items-center justify-center gap-3"
        >
          <Home size={30} className="text-blue-500" /> Rentals Management
        </motion.h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search by tenant name or house number..."
            className="w-full sm:w-1/2 p-3 rounded-xl bg-gray-100 text-gray-800 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Main Content */}
        {loading ? (
          <p className="text-center text-gray-500">Loading rentals...</p>
        ) : errorMsg ? (
          <p className="text-center text-red-500">{errorMsg}</p>
        ) : filteredRentals.length === 0 ? (
          <p className="text-center text-gray-500">No rentals found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map((rental, idx) => (
              <motion.div
                key={rental._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-blue-600">
                    {rental.houseId?.houseNo || "N/A"}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      rental.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : rental.paymentStatus === "late"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {rental.paymentStatus}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-gray-500">Tenant:</span>{" "}
                    {rental.tenantId?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Amount:</span>{" "}
                    KSh {rental.amount?.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Start Date:</span>{" "}
                    {new Date(rental.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Next Payment:</span>{" "}
                    {new Date(rental.nextPaymentDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Status:</span>{" "}
                    <span
                      className={`${
                        rental.rentalStatus === "active"
                          ? "text-green-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {rental.rentalStatus}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => handleEditClick(rental)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all shadow-sm"
                    title="Edit Rental"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(rental._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all shadow-sm"
                    title="Delete Rental"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {modalOpen && editingRental && (
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
                  setEditingRental(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>

              <FormContainer
                title={`Edit Rental for ${editingRental.tenantId?.name}`}
                apiUrl={`http://localhost:4050/api/rentals/${editingRental._id}`}
                method="PUT"
                fields={[
                  { label: "Amount", name: "amount", type: "number" },
                  {
                    label: "Next Payment Date",
                    name: "nextPaymentDate",
                    type: "date",
                  },
                  {
                    label: "Payment Status",
                    name: "paymentStatus",
                    type: "select",
                    options: [
                      { label: "Pending", value: "pending" },
                      { label: "Paid", value: "paid" },
                      { label: "Late", value: "late" },
                    ],
                  },
                  {
                    label: "Rental Status",
                    name: "rentalStatus",
                    type: "select",
                    options: [
                      { label: "Active", value: "active" },
                      { label: "Ended", value: "ended" },
                    ],
                  },
                ]}
                initialData={editingRental}
                onSuccess={handleSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewRentals;
