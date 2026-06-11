const express = require("express");
const router = express.Router();
const {
  createJob, getJobs, getJob, applyJob,
  getMyApplications, withdrawApplication,
  getEmployerJobs, getApplicants, updateApplicationStatus, deleteJob,
} = require("../controllers/jobController");
const { protect, requireRole } = require("../middleware/authMiddleware");

// Public
router.get("/", getJobs);
router.get("/:id", getJob);

// Candidate
router.post("/apply", protect, requireRole("candidate"), applyJob);
router.get("/candidate/my-applications", protect, requireRole("candidate"), getMyApplications);
router.delete("/applications/:id/withdraw", protect, requireRole("candidate"), withdrawApplication);

// Employer
router.post("/", protect, requireRole("employer"), createJob);
router.get("/employer/my-jobs", protect, requireRole("employer"), getEmployerJobs);
router.get("/:jobId/applicants", protect, requireRole("employer"), getApplicants);
router.patch("/applications/:id/status", protect, requireRole("employer"), updateApplicationStatus);
router.delete("/:id", protect, requireRole("employer", "admin"), deleteJob);

module.exports = router;
