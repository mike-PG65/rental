import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [updating, setUpdating] = useState(null); // track which payment is being updated

  const BASE_URL = "http://localhost:4050/api";
  const token = sessionStorage.getItem("token");

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/payment/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPayments(data.payments || []);
      } catch (err) {
        console.error("❌ Error fetching payments:", err);
        setStatus({
          message: err.response?.data?.message || "Failed to load payments.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // ✅ Handle status update
  const handleUpdateStatus = async (id) => {
    if (!confirm("Mark this payment as successful?")) return;

    try {
      setUpdating(id);

      const { data } = await axios.put(
        `${BASE_URL}/payment/approve/${id}`,
        { status: "successful" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update state without refetching
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? data.payment : p))
      );

      setStatus({ message: "Payment marked as successful ✅", type: "success" });
    } catch (err) {
      console.error("Error updating payment:", err);
      setStatus({
        message: err.response?.data?.message || "Failed to update payment.",
        type: "error",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading payments...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Payment History
      </h2>

      {status.message && (
        <div
          className={`p-3 mb-4 rounded-lg text-center ${status.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
            }`}
        >
          {status.message}
        </div>
      )}

      {payments.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-5 text-left">Tenant</th>
                <th className="py-3 px-5 text-left">House</th>
                <th className="py-3 px-5 text-left">Method</th>
                <th className="py-3 px-5 text-left">Amount</th>
                <th className="py-3 px-5 text-left">Month</th>s
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-left">Date</th>
                <th className="py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {/* Tenant */}
                  <td className="py-3 px-5">
                    {p.tenantId?.name || "N/A"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {p.tenantId?.email || ""}
                    </span>
                  </td>

                  {/* House */}
                  <td className="py-3 px-5">{p.rentalId?.houseId?.houseNo || "N/A"}</td>

                  {/* Method */}
                  <td className="py-3 px-5 capitalize">{p.method}</td>

                  {/* Amount */}
                  <td className="py-3 px-5 font-semibold text-gray-900">
                    Ksh {p.amount?.toLocaleString()}
                  </td>

                  {/* Month */}
                  <td className="py-3 px-5 text-gray-600">{p.month || "-"}</td>

                  {/* Status */}
                  <td className="py-3 px-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${p.status === "successful"
                          ? "bg-green-100 text-green-700"
                          : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-5 text-gray-600">
                    {new Date(p.paymentDate).toLocaleDateString()}{" "}
                    <span className="text-xs text-gray-400">
                      {new Date(p.paymentDate).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-5">
                    {p.method === "cash" && p.status === "pending" ? (
                      <button
                        onClick={() => handleUpdateStatus(p._id)}
                        disabled={updating === p._id}
                        className={`px-4 py-1 rounded-lg text-sm font-semibold text-white transition ${updating === p._id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        {updating === p._id
                          ? "Updating..."
                          : "Mark as Successful"}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
