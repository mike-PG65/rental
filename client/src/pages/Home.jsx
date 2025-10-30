import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { HomeIcon, Users, FileText, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Home = () => {
  const [stats, setStats] = useState({
    totalHouses: 0,
    availableHouses: 0,
    tenants: 0,
    rentals: 0,
    income: 0,
  });
  const [recentRentals, setRecentRentals] = useState([]);
  const [incomeData, setIncomeData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [housesRes, rentalsRes] = await Promise.all([
          axios.get("http://localhost:4050/api/house/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4050/api/rental/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const houses = housesRes.data;
        const rentals = rentalsRes.data;

        const totalHouses = houses.length;
        const availableHouses = houses.filter(
          (h) => h.availability === "available"
        ).length;
        const tenants = new Set(rentals.map((r) => r.tenantId?._id)).size;
        const activeRentals = rentals.filter(
          (r) => r.rentalStatus === "active"
        ).length;
        const totalIncome = rentals.reduce(
          (sum, r) => sum + (r.amount || 0),
          0
        );

        // Mock income data by month (for now)
        const incomeData = [
          { month: "May", income: 10000 },
          { month: "Jun", income: 12000 },
          { month: "Jul", income: 18000 },
          { month: "Aug", income: 22000 },
          { month: "Sep", income: 20000 },
          { month: "Oct", income: totalIncome },
        ];

        setStats({
          totalHouses,
          availableHouses,
          tenants,
          rentals: activeRentals,
          income: totalIncome,
        });
        setRecentRentals(rentals.slice(-5).reverse());
        setIncomeData(incomeData);
      } catch (err) {
        console.error("Error loading dashboard data:", err.message);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Houses",
      value: stats.totalHouses,
      icon: <HomeIcon className="w-6 h-6 text-white" />,
      gradient: "from-indigo-500 to-indigo-700",
    },
    {
      title: "Available Houses",
      value: stats.availableHouses,
      icon: <HomeIcon className="w-6 h-6 text-white" />,
      gradient: "from-green-500 to-green-700",
    },
    {
      title: "Active Rentals",
      value: stats.rentals,
      icon: <FileText className="w-6 h-6 text-white" />,
      gradient: "from-yellow-400 to-orange-600",
    },
    {
      title: "Total Tenants",
      value: stats.tenants,
      icon: <Users className="w-6 h-6 text-white" />,
      gradient: "from-blue-500 to-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Overview 🏡
        </h1>
        <p className="text-gray-500 mt-1">
          Quick summary of your property management system.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`p-5 rounded-2xl shadow-md text-white bg-gradient-to-r ${stat.gradient} transition`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium opacity-90">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Income Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-10 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Income Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Rentals */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Rentals
        </h2>

        {recentRentals.length === 0 ? (
          <p className="text-gray-500">No recent rentals found.</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-600">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3">Tenant</th>
                <th className="py-3">House No</th>
                <th className="py-3">Start Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRentals.map((rental) => (
                <tr
                  key={rental._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 font-medium">
                    {rental.tenantId?.name || "Unknown"}
                  </td>
                  <td>{rental.houseId?.houseNo}</td>
                  <td>
                    {new Date(rental.startDate).toLocaleDateString("en-GB")}
                  </td>
                  <td>${rental.amount?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rental.rentalStatus === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {rental.rentalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
