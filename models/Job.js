const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
      period: { type: String, enum: ["hourly", "monthly", "yearly"], default: "monthly" },
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "no-experience"],
      default: "entry",
    },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "closed"], default: "pending" },
    
    // Accessibility features
    remote: { type: Boolean, default: false },
    wheelchairAccessible: { type: Boolean, default: false },
    flexibleHours: { type: Boolean, default: false },
    screenReaderFriendly: { type: Boolean, default: false },
    signLanguageSupport: { type: Boolean, default: false },
    assistiveTechnologyAllowed: { type: Boolean, default: false },
    mentalHealthSupport: { type: Boolean, default: false },
    accessibilityNotes: { type: String, maxlength: 500 },
    
    // Disability-inclusive hiring
    disabilitiesWelcome: [{ type: String }], // which disability types this job is especially suited for
    accommodationsProvided: [{ type: String }],

    // Meta
    applicationDeadline: { type: Date },
    totalApplications: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Job", jobSchema);
