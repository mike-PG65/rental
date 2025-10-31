// middleware/admin.js
const adminMiddleware = (req, res, next) => {
  try {
    // ✅ Check if user was set by authMiddleware
    if (!req.user) {
      console.log("❌ No user in request — make sure authMiddleware runs first");
      return res.status(401).json({ error: "Unauthorized!" });
    }

    // ✅ Check if role exists
    if (!req.user.role) {
      console.log("❌ Missing role on req.user:", req.user);
      return res.status(403).json({ error: "Access denied — user role not found" });
    }

    // ✅ Allow only admins
    if (req.user.role !== "admin") {
      console.log("❌ User is not admin:", req.user.role);
      return res.status(403).json({ error: "Access denied — admins only!" });
    }

    // ✅ Everything okay
    next();

  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ error: "Server error in admin middleware" });
  }
};

module.exports = adminMiddleware;
