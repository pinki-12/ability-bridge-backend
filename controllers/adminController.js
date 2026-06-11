const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCandidates, totalEmployers, totalJobs, pendingJobs, totalApplications, approvedJobs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "candidate" }),
      User.countDocuments({ role: "employer" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "pending" }),
      Application.countDocuments(),
      Job.countDocuments({ status: "approved" }),
    ]);

    // Recent activity
    const recentJobs = await Job.find({ status: "pending" })
      .populate("employer", "name companyName")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt disabilityType companyName");

    res.json({
      stats: { totalUsers, totalCandidates, totalEmployers, totalJobs, pendingJobs, totalApplications, approvedJobs },
      recentJobs,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = status ? { status } : {};
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("employer", "name companyName email")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ jobs, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/jobs/:jobId/approve
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate("employer", "email name companyName");
    if (!job) return res.status(404).json({ message: "Job not found." });
    job.status = "approved";
    await job.save();
    res.json({ message: "Job approved and published!", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/jobs/:jobId/reject
exports.rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    job.status = "rejected";
    await job.save();
    res.json({ message: "Job rejected.", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/jobs/:jobId
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.jobId);
    await Application.deleteMany({ job: req.params.jobId });
    res.json({ message: "Job deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 15 } = req.query;
    const query = role ? { role } : { role: { $ne: "admin" } };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:userId/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot modify admin accounts." });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/employers/:userId/verify
exports.verifyEmployer = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: "employer" });
    if (!user) return res.status(404).json({ message: "Employer not found." });
    user.isVerifiedEmployer = true;
    await user.save({ validateBeforeSave: false });
    res.json({ message: "Employer verified!", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
