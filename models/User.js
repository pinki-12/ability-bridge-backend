const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["candidate", "employer", "admin"], default: "candidate" },

    // Candidate fields
    skills: [{ type: String, trim: true }],
    disabilityType: {
      type: String,
      enum: [
        "Visual Impairment",
        "Hearing Impairment",
        "Physical / Mobility",
        "Cognitive / Intellectual",
        "Autism Spectrum",
        "Speech / Language",
        "Chronic Illness",
        "Mental Health",
        "Multiple Disabilities",
        "Prefer not to say",
        ""
      ],
      default: ""
    },
    bio: { type: String, maxlength: 500 },
    resume: { type: String }, // file path or URL
    profilePicture: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
    accommodationsNeeded: [{ type: String }], // e.g. "screen reader", "sign language interpreter"
    openToRemote: { type: Boolean, default: true },
    
    // Employer fields
    companyName: { type: String, trim: true },
    companyWebsite: { type: String },
    companyDescription: { type: String, maxlength: 1000 },
    companyLogo: { type: String },
    isVerifiedEmployer: { type: Boolean, default: false },

    // Common
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
