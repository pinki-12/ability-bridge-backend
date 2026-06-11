const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      disabilityType, skills, accommodationsNeeded, openToRemote,
      companyName, companyWebsite, companyDescription,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const userData = { name, email, password, role: role || "candidate" };

    if (role === "candidate") {
      if (disabilityType) userData.disabilityType = disabilityType;
      if (skills) userData.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
      if (accommodationsNeeded) userData.accommodationsNeeded = accommodationsNeeded;
      if (openToRemote !== undefined) userData.openToRemote = openToRemote;
    }

    if (role === "employer") {
      if (!companyName) return res.status(400).json({ message: "Company name is required for employers." });
      userData.companyName = companyName;
      if (companyWebsite) userData.companyWebsite = companyWebsite;
      if (companyDescription) userData.companyDescription = companyDescription;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "Account created successfully!",
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact support." });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      message: "Login successful!",
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Don't allow role/password change via this route
    delete updates.password;
    delete updates.role;
    delete updates.email;

    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    if (req.file) {
      updates.resume = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


