const express = require("express");
const cors = require("cors");
const connDb = require("./config/db");
const dotenv = require("dotenv");
const houseRoutes = require("./controllers/house");
const userRoutes = require("./controllers/users");
const rentalRoutes = require("./controllers/rental");
const complaintRoutes = require("./controllers/complaints");
const messageRoutes = require("./controllers/message");
const paymentRoutes = require("./controllers/payment");

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tenant-chi.vercel.app",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("➡️ Incoming Request:", req.method, req.originalUrl);
  next();
});

app.use("/api/house", houseRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ SOCKET.IO SETUP
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://tenant-chi.vercel.app",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Keep track of connected tenants
const connectedTenants = new Map();

io.on("connection", (socket) => {
  console.log("⚡ New socket connected:", socket.id);

  // When tenant registers their ID
  socket.on("registerTenant", (tenantId) => {
    connectedTenants.set(tenantId, socket.id);
    console.log(`🏠 Tenant registered: ${tenantId} (socket: ${socket.id})`);
  });

  // On disconnect
  socket.on("disconnect", () => {
    for (const [tenantId, id] of connectedTenants.entries()) {
      if (id === socket.id) connectedTenants.delete(tenantId);
    }
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4050;
server.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

// ✅ Export for use in other files
module.exports = { io, connectedTenants };
