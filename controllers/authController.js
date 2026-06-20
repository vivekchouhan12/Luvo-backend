const {check , validationResult}  = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.signUp = [
  // Username
  check("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long.")
    .matches(/^[A-Za-z0-9\s]+$/)
    .withMessage("Username must contain only letters, numbers, and spaces."),

  // Email
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  // Password
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number."),

  // Confirm Password
  check("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  // Terms (BOOLEAN, not "on")
  check("terms")
    .custom((value) => {
      // Accept boolean true, or common form values 'on' / 'true'
      if (!(value === true || value === "on" || value === "true")) {
        throw new Error("You must accept the terms and conditions.");
      }
      return true;
    }),

  // Controller
  async (req, res) => {
    console.log("Signup request body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

     const { username, email, password } = req.body;
     const normalizedEmail = (email || "").toLowerCase().trim();

     // hash password
     bcrypt.hash(password, 12).then(async (hashedPassword) => {
       const user = new User({ username, email: normalizedEmail, password: hashedPassword });
      await  user.save().catch((err) => {
      console.error("Error saving user:", err);
      return res.status(500).json({ message: "Internal server error" });
    });
     return res.status(201).json({
      message: "User validated successfully",
    });
    });

    // NEVER log passwords
    console.log("Signup attempt:", { username, email });
  },
];

exports.login = async (req, res) => {
  const { email: rawEmail, password } = req.body;
  const email = (rawEmail || "").toLowerCase().trim();
  console.log("Login attempt:", { email });
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  } 
  req.session.isLoggedIn = true;
  req.session.user = user;
  // express-session save uses a callback; wrap it so we can await it safely
  await new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
  res.status(200).json({ message: "Logged in successfully" });
};

exports.status = async (req, res) => {
  const isLoggedIn = req.session.isLoggedIn || false;
  res.status(200).json({ isLoggedIn });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    // clear session cookie
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.status(200).json({ message: 'Logged out' });
  });
};
