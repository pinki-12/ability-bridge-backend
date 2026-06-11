const Job = require("../models/Job");
const Application = require("../models/Application");
const sendEmail = require("../utils/sendEmail");

// POST /api/jobs - Employer creates job
exports.createJob = async (req, res) => {
  try {
    const {
      title, description, requiredSkills, location, salary, jobType,
      experienceLevel, remote, wheelchairAccessible, flexibleHours,
      screenReaderFriendly, signLanguageSupport, assistiveTechnologyAllowed,
      mentalHealthSupport, accessibilityNotes, disabilitiesWelcome,
      accommodationsProvided, applicationDeadline,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const job = await Job.create({
      title, description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || "").split(",").map(s => s.trim()).filter(Boolean),
      location, salary, jobType, experienceLevel,
      remote: Boolean(remote),
      wheelchairAccessible: Boolean(wheelchairAccessible),
      flexibleHours: Boolean(flexibleHours),
      screenReaderFriendly: Boolean(screenReaderFriendly),
      signLanguageSupport: Boolean(signLanguageSupport),
      assistiveTechnologyAllowed: Boolean(assistiveTechnologyAllowed),
      mentalHealthSupport: Boolean(mentalHealthSupport),
      accessibilityNotes,
      disabilitiesWelcome: Array.isArray(disabilitiesWelcome) ? disabilitiesWelcome : [],
      accommodationsProvided: Array.isArray(accommodationsProvided) ? accommodationsProvided : [],
      applicationDeadline,
      employer: req.user._id,
      status: "pending",
    });

    await job.populate("employer", "name companyName email");
    res.status(201).json({ message: "Job posted successfully! Awaiting admin approval.", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs - Public: get approved jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1, limit = 9, keyword, location,
      remote, wheelchairAccessible, flexibleHours,
      screenReaderFriendly, signLanguageSupport, mentalHealthSupport,
      jobType, experienceLevel
    } = req.query;

    const query = { status: "approved" };

    if (keyword) query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { requiredSkills: { $in: [new RegExp(keyword, "i")] } }
    ];
    if (location) query.location = { $regex: location, $options: "i" };
    if (remote === "true") query.remote = true;
    if (wheelchairAccessible === "true") query.wheelchairAccessible = true;
    if (flexibleHours === "true") query.flexibleHours = true;
    if (screenReaderFriendly === "true") query.screenReaderFriendly = true;
    if (signLanguageSupport === "true") query.signLanguageSupport = true;
    if (mentalHealthSupport === "true") query.mentalHealthSupport = true;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("employer", "name companyName email companyLogo isVerifiedEmployer")
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ jobs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/:id - Get single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name companyName email companyDescription companyWebsite companyLogo isVerifiedEmployer");
    if (!job) return res.status(404).json({ message: "Job not found." });
    job.views += 1;
    await job.save({ validateBeforeSave: false });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/jobs/apply - Candidate applies for job
exports.applyJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId).populate("employer", "email name");
    if (!job || job.status !== "approved") {
      return res.status(404).json({ message: "Job not found or no longer accepting applications." });
    }

    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ message: "Application deadline has passed." });
    }

    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already applied for this job." });

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resumeUrl: req.user.resume,
      status: "applied",
    });

    // Update job application count
    job.totalApplications += 1;
    await job.save({ validateBeforeSave: false });

    // Send confirmation email (non-blocking)
    sendEmail(
      req.user.email,
      `Application Submitted: ${job.title}`,
      `Hi ${req.user.name}, your application for "${job.title}" at ${job.employer?.name || "the employer"} has been received. We'll notify you of any updates. — AbilityBridge Team`
    ).catch(err => console.log("Email skipped:", err.message));

    res.status(201).json({ message: "Application submitted successfully! 🎉", application });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "You have already applied for this job." });
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/my-applications - Candidate's applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id, isWithdrawn: false })
      .populate("job", "title location description jobType remote wheelchairAccessible flexibleHours employer status")
      .populate({ path: "job", populate: { path: "employer", select: "name companyName companyLogo" } })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/applications/:id/withdraw - Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, candidate: req.user._id });
    if (!app) return res.status(404).json({ message: "Application not found." });
    app.isWithdrawn = true;
    app.withdrawnAt = new Date();
    await app.save();
    res.json({ message: "Application withdrawn." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/employer/my-jobs - Employer gets their jobs
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/:jobId/applicants - Employer views applicants
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user._id });
    if (!job) return res.status(403).json({ message: "Access denied or job not found." });

    const applicants = await Application.find({ job: req.params.jobId, isWithdrawn: false })
      .populate("candidate", "name email skills disabilityType accommodationsNeeded bio resume openToRemote")
      .sort({ createdAt: -1 });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/jobs/applications/:id/status - Employer updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNotes, interviewDate } = req.body;
    const validStatuses = ["applied", "under_review", "shortlisted", "interview_scheduled", "rejected", "hired"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const application = await Application.findById(req.params.id)
      .populate("candidate", "email name")
      .populate("job", "title employer");

    if (!application) return res.status(404).json({ message: "Application not found." });
    if (String(application.job.employer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    application.status = status;
    if (employerNotes) application.employerNotes = employerNotes;
    if (interviewDate) application.interviewDate = interviewDate;
    await application.save();

    // Notify candidate
    const statusMessages = {
      shortlisted: "Great news! You've been shortlisted",
      interview_scheduled: "Your interview has been scheduled",
      hired: "Congratulations! You've been hired",
      rejected: "Your application status has been updated",
    };

    if (statusMessages[status]) {
      sendEmail(
        application.candidate.email,
        `Application Update: ${application.job.title}`,
        `Hi ${application.candidate.name}, ${statusMessages[status]} for "${application.job.title}". ${employerNotes ? `Note from employer: ${employerNotes}` : ""} — AbilityBridge Team`
      ).catch(err => console.log("Email skipped:", err.message));
    }

    res.json({ message: "Status updated successfully!", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/:id - Employer deletes own job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or access denied." });
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: "Job deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
