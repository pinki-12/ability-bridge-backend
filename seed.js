/**
 * AbilityBridge - Database Seed Script
 * Run: node seed.js
 * Creates: 1 admin + 2 employers + 3 candidates + 6 sample jobs
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Job = require("./models/Job");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/abilitybridge";

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing
  await User.deleteMany({});
  await Job.deleteMany({});
  console.log("🗑  Cleared existing data");

  // === USERS ===
  const admin = await User.create({
    name: "AbilityBridge Admin",
    email: "admin@abilitybridge.in",
    password: "admin123",
    role: "admin",
    isActive: true,
  });

  const employer1 = await User.create({
    name: "Priya Mehta",
    email: "priya@techsolutions.com",
    password: "employer123",
    role: "employer",
    companyName: "TechSolutions India",
    companyWebsite: "https://techsolutions.in",
    companyDescription: "A leading IT company committed to inclusive hiring. We have wheelchair-accessible offices and remote-first culture.",
    isVerifiedEmployer: true,
    isActive: true,
  });

  const employer2 = await User.create({
    name: "Rahul Sharma",
    email: "rahul@inclusivecorp.com",
    password: "employer123",
    role: "employer",
    companyName: "Inclusive Corp",
    companyWebsite: "https://inclusivecorp.in",
    companyDescription: "We believe diversity is our strength. Our offices are fully accessible and we provide all necessary accommodations.",
    isVerifiedEmployer: true,
    isActive: true,
  });

  const candidate1 = await User.create({
    name: "Anjali Singh",
    email: "anjali@example.com",
    password: "test123",
    role: "candidate",
    disabilityType: "Visual Impairment",
    skills: ["Data Entry", "MS Excel", "Customer Service", "Typing"],
    accommodationsNeeded: ["Screen reader software", "Large-print materials"],
    openToRemote: true,
    bio: "Experienced data entry specialist with 3 years of experience. I use JAWS screen reader and am highly productive with the right tools.",
    isActive: true,
  });

  const candidate2 = await User.create({
    name: "Rohan Kumar",
    email: "rohan@example.com",
    password: "test123",
    role: "candidate",
    disabilityType: "Hearing Impairment",
    skills: ["Graphic Design", "Photoshop", "Illustrator", "UI Design"],
    accommodationsNeeded: ["Sign language interpreter", "Written communication preferred"],
    openToRemote: true,
    bio: "Creative graphic designer with 5+ years experience. Deaf since birth, I communicate effectively through text and sign language.",
    isActive: true,
  });

  const candidate3 = await User.create({
    name: "Sunita Patel",
    email: "sunita@example.com",
    password: "test123",
    role: "candidate",
    disabilityType: "Physical / Mobility",
    skills: ["Content Writing", "SEO", "Social Media", "Marketing"],
    accommodationsNeeded: ["Wheelchair accessibility", "Flexible working hours", "Work from home"],
    openToRemote: true,
    bio: "Marketing professional with wheelchair-based mobility. I excel at remote work and have managed social media for 10+ brands.",
    isActive: true,
  });

  console.log("👥 Created 6 users (1 admin, 2 employers, 3 candidates)");

  // === JOBS ===
  const jobs = await Job.insertMany([
    {
      title: "Remote Data Entry Specialist",
      description: "We are looking for a meticulous data entry specialist to join our team. You will be responsible for entering financial data, verifying information, and maintaining our databases. Screen reader compatible tools are provided. Work is fully remote with flexible hours.",
      requiredSkills: ["Data Entry", "MS Excel", "Typing", "Attention to Detail"],
      location: "Remote (India)",
      salary: { min: 18000, max: 28000, currency: "INR", period: "monthly" },
      jobType: "full-time",
      experienceLevel: "entry",
      employer: employer1._id,
      status: "approved",
      remote: true,
      flexibleHours: true,
      screenReaderFriendly: true,
      assistiveTechnologyAllowed: true,
      mentalHealthSupport: true,
      accessibilityNotes: "All software is JAWS and NVDA compatible. We conduct all interviews via phone or accessible video call.",
      disabilitiesWelcome: ["Visual Impairment", "Physical / Mobility", "Chronic Illness"],
      accommodationsProvided: ["Screen reader software", "Flexible work hours", "Mental health support"],
      totalApplications: 12,
      views: 145,
      isFeatured: true,
    },
    {
      title: "Graphic Designer (WFH)",
      description: "Creative graphic designer needed for branding, social media content, and marketing materials. All collaboration is done via chat and email. We are a deaf-friendly company and have several team members who are hard of hearing.",
      requiredSkills: ["Photoshop", "Illustrator", "Graphic Design", "Canva"],
      location: "Remote",
      salary: { min: 25000, max: 40000, currency: "INR", period: "monthly" },
      jobType: "full-time",
      experienceLevel: "mid",
      employer: employer1._id,
      status: "approved",
      remote: true,
      flexibleHours: true,
      signLanguageSupport: true,
      assistiveTechnologyAllowed: true,
      accessibilityNotes: "Team uses Slack for all communication. Video calls have captions. We work with hearing and deaf professionals equally.",
      disabilitiesWelcome: ["Hearing Impairment", "Physical / Mobility"],
      accommodationsProvided: ["Sign language interpreter available", "Text-based communication"],
      totalApplications: 8,
      views: 203,
      isFeatured: true,
    },
    {
      title: "Content Writer — SEO & Blogs",
      description: "Join our content team to write engaging blog posts, SEO articles, and marketing copy. Fully remote position. We value quality over speed and accommodate all working styles.",
      requiredSkills: ["Content Writing", "SEO", "Research", "English Writing"],
      location: "Remote",
      salary: { min: 20000, max: 35000, currency: "INR", period: "monthly" },
      jobType: "part-time",
      experienceLevel: "entry",
      employer: employer2._id,
      status: "approved",
      remote: true,
      flexibleHours: true,
      mentalHealthSupport: true,
      assistiveTechnologyAllowed: true,
      accessibilityNotes: "Flexible deadlines available. Mental health days provided. Voice-to-text tools welcome.",
      disabilitiesWelcome: ["Mental Health", "Chronic Illness", "Cognitive / Intellectual", "Physical / Mobility"],
      accommodationsProvided: ["Flexible hours", "Mental health days", "Voice-to-text allowed"],
      totalApplications: 19,
      views: 312,
    },
    {
      title: "Customer Support Executive",
      description: "Provide excellent customer service via email and chat (not phone). No phone calls required — all support is text-based. Wheelchair-accessible office in Pune with adapted workstations available.",
      requiredSkills: ["Customer Service", "Communication", "Problem Solving", "Email"],
      location: "Pune, Maharashtra",
      salary: { min: 15000, max: 22000, currency: "INR", period: "monthly" },
      jobType: "full-time",
      experienceLevel: "no-experience",
      employer: employer2._id,
      status: "approved",
      remote: false,
      wheelchairAccessible: true,
      flexibleHours: true,
      signLanguageSupport: true,
      mentalHealthSupport: true,
      accessibilityNotes: "Office has ramp access, elevator, accessible restrooms. Adapted desks for wheelchair users. No experience required — we train you.",
      disabilitiesWelcome: ["Hearing Impairment", "Physical / Mobility", "Autism Spectrum", "Mental Health"],
      accommodationsProvided: ["Wheelchair access", "Adapted workstation", "Sign language interpreter"],
      totalApplications: 31,
      views: 420,
    },
    {
      title: "Junior Software Developer (React)",
      description: "Entry-level React developer position with mentorship support. We welcome candidates from non-traditional backgrounds. Fully remote, flexible hours, and a very supportive team. Assistive technology allowed.",
      requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
      location: "Remote",
      salary: { min: 30000, max: 50000, currency: "INR", period: "monthly" },
      jobType: "full-time",
      experienceLevel: "entry",
      employer: employer1._id,
      status: "approved",
      remote: true,
      flexibleHours: true,
      screenReaderFriendly: true,
      assistiveTechnologyAllowed: true,
      mentalHealthSupport: true,
      accessibilityNotes: "All code reviews are asynchronous. No time pressure. Pair programming available but not required.",
      disabilitiesWelcome: ["Visual Impairment", "Autism Spectrum", "Mental Health", "Cognitive / Intellectual"],
      totalApplications: 7,
      views: 89,
    },
    {
      title: "Social Media Manager (Internship)",
      description: "6-month paid internship managing our social media channels. Ideal for fresh graduates. Work from home, your own schedule. We provide all tools and mentorship.",
      requiredSkills: ["Social Media", "Content Creation", "Instagram", "Marketing Basics"],
      location: "Remote",
      salary: { min: 10000, max: 15000, currency: "INR", period: "monthly" },
      jobType: "internship",
      experienceLevel: "no-experience",
      employer: employer2._id,
      status: "pending",
      remote: true,
      flexibleHours: true,
      mentalHealthSupport: true,
      accessibilityNotes: "Internship with mentorship. Completely remote. No prior experience required.",
      disabilitiesWelcome: ["Mental Health", "Chronic Illness", "Physical / Mobility", "Visual Impairment"],
      accommodationsProvided: ["Full remote", "Flexible hours", "Paid mental health days"],
      totalApplications: 0,
      views: 22,
    },
  ]);

  console.log(`💼 Created ${jobs.length} sample jobs`);
  console.log("\n🎉 Seed complete! Login credentials:\n");
  console.log("  Admin:     admin@abilitybridge.in  /  admin123");
  console.log("  Employer1: priya@techsolutions.com  /  employer123");
  console.log("  Employer2: rahul@inclusivecorp.com  /  employer123");
  console.log("  Candidate: anjali@example.com       /  test123");
  console.log("  Candidate: rohan@example.com        /  test123");
  console.log("  Candidate: sunita@example.com       /  test123\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
