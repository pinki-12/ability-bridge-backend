const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["applied", "under_review", "shortlisted", "interview_scheduled", "rejected", "hired"],
      default: "applied",
    },
    coverLetter: { type: String, maxlength: 2000 },
    resumeUrl: { type: String },
    employerNotes: { type: String },
    interviewDate: { type: Date },
    withdrawnAt: { type: Date },
    isWithdrawn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
