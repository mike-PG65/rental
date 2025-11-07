const express = require("express");
const cors = require("cors");
const connDb = require("./config/db");
const dotenv = require("dotenv");
const houseRoutes = require("./controllers/house");
const userRoutes = require("./controllers/users");
const rentalRoutes = require("./controllers/rental");
const complaintRoutes = require("./controllers/complaints"); // ✅ must match the actual path!
const messageRoutes = require("./controllers/message");
const paymentRoutes = require("./controllers/payment")


dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin:  [
    "http://localhost:5173", // for local testing
    "https://tenant-chi.vercel.app",
    "http://localhost:5174" // your Vercel URL
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
app.use("/api/complaints", complaintRoutes); // ✅ consistent path
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);

const runServer = async () => {
  await connDb();
  app.listen(4050, () => console.log("✅ Server is running on port 4050"));
};

runServer();
