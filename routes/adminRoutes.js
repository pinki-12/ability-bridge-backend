const express = require("express");
const router = express.Router();
const {
  getDashboardStats, getAllJobs, approveJob, rejectJob, deleteJob,
  getAllUsers, toggleUserStatus, verifyEmployer,
} = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const adminOnly = [protect, requireRole("admin")];

router.get("/stats", ...adminOnly, getDashboardStats);
router.get("/jobs", ...adminOnly, getAllJobs);
router.patch("/jobs/:jobId/approve", ...adminOnly, approveJob);
router.patch("/jobs/:jobId/reject", ...adminOnly, rejectJob);
router.delete("/jobs/:jobId", ...adminOnly, deleteJob);
router.get("/users", ...adminOnly, getAllUsers);
router.patch("/users/:userId/toggle", ...adminOnly, toggleUserStatus);
router.patch("/employers/:userId/verify", ...adminOnly, verifyEmployer);

module.exports = router;
