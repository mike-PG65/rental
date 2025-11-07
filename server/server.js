const express = require("express");
const cors = require("cors");
const connDb = require("./config/db");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// ✅ Routes
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
      "http://localhost:5174"
    ],
    credentials: true,
  })
);

// ✅ Request logger
app.use((req, res, next) => {
  console.log("➡️ Incoming Request:", req.method, req.originalUrl);
  next();
});

// ✅ Register routes
app.use("/api/house", houseRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);

const runServer = async () => {
  await connDb();

  // ✅ Create HTTP server
  const server = http.createServer(app);

  // ✅ Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://tenant-chi.vercel.app",
        "http://localhost:5174"
      ],
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  // ✅ Handle client connections
  io.on("connection", (socket) => {
    console.log("⚡ New socket connected:", socket.id);

    // register tenant
    socket.on("registerTenant", (tenantId) => {
      socket.join(tenantId);
      console.log(`🏠 Tenant ${tenantId} joined their private room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  // ✅ Attach io to app (so controllers can emit)
  app.set("io", io);

  const PORT = process.env.PORT || 4050;
  server.listen(PORT, () =>
    console.log(`✅ Server is running on port ${PORT}`)
  );
};

runServer();
