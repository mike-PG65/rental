import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const FormContainer = ({
  title,
  fields = [],
  apiUrl,
  onSuccess,
  fetchHouses,
  fetchUsers,
  method = "POST",
}) => {
  const [formData, setFormData] = useState(
    Object.fromEntries((fields || []).map((f) => [f.name]))
  );
  const [houses, setHouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (fetchHouses) {
      axios
        .get(fetchHouses, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setHouses(res.data))
        .catch(() => setErrorMsg("Failed to load houses"));
    }
  }, [fetchHouses, token]);

  useEffect(() => {
    if (fetchUsers) {
      axios
        .get(fetchUsers, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUsers(res.data))
        .catch(() => setErrorMsg("Failed to load users"));
    }
  }, [fetchUsers, token]);

  useEffect(() => {
    if (formData.houseId) {
      const selectedHouse = houses.find((h) => h._id === formData.houseId);
      setFormData((prev) => ({
        ...prev,
        rentPrice: selectedHouse ? selectedHouse.price : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, rentPrice: "" }));
    }
  }, [formData.houseId, houses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await axios({
        method: method.toLowerCase(),
        url: apiUrl,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setSuccessMsg("✅ Submitted successfully!");
      if (method === "POST") {
        setFormData(Object.fromEntries(fields.map((f) => [f.name, ""])));
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg(error.response?.data?.error || "❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600">
        <p>No form fields provided.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-200 shadow-lg rounded-2xl p-10 w-full max-w-3xl"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {title}
        </h2>

        {successMsg && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-2 rounded-md mb-6 text-center font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-400 text-red-600 px-4 py-2 rounded-md mb-6 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {fields.map((field, idx) => {
            // 🏠 House dropdown
            if (field.type === "select" && field.name === "houseId") {
              return (
                <div key={idx}>
                  <label className="font-semibold text-gray-700 mb-2 block">
                    {field.label}
                  </label>
                  <select
                    name={field.name}
                    value={formData.houseId || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select House --</option>
                    {houses.map((h) => (
                      <option key={h._id} value={h._id}>
                        House No: {h.houseNo}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // 👤 User dropdown
            if (field.type === "select" && field.name === "tenantId") {
              return (
                <div key={idx}>
                  <label className="font-semibold text-gray-700 mb-2 block">
                    {field.label}
                  </label>
                  <select
                    name={field.name}
                    value={formData.tenantId || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select User --</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // 💰 Rent Price (read-only)
            if (field.name === "rentPrice") {
              return (
                <div key={idx}>
                  <label className="font-semibold text-gray-700 mb-2 block">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name="rentPrice"
                    value={
                      formData.rentPrice
                        ? `KSh ${formData.rentPrice.toLocaleString()}`
                        : ""
                    }
                    readOnly
                    className="w-full bg-gray-100 text-gray-700 border border-gray-300 px-4 py-3 rounded-lg cursor-not-allowed"
                    placeholder="Rent price"
                  />
                </div>
              );
            }

            // ✍️ Default input
            return (
              <div key={idx}>
                <label className="font-semibold text-gray-700 mb-2 block">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  className="w-full bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required={field.type !== "password" || method === "POST"}
                />
              </div>
            );
          })}

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FormContainer;
