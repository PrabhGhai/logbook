const router = require("express").Router();
const bcrypt = require("bcryptjs");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/JWTVerification");
//signup new employee
router.post("/sign-up", async (req, res) => {
  const { employeeName, email, phone, employeeCode, password, role } = req.body;

  if (
    !employeeName ||
    !email ||
    !phone ||
    !employeeCode ||
    !password ||
    !role
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (employeeName.length < 5) {
    return res
      .status(400)
      .json({ message: "Employee name must have 5 characters" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must have 6 characters" });
  }
  if (phone.length < 10) {
    return res
      .status(400)
      .json({ message: "Phone length must have 10 digits" });
  }
  if (role === "None") {
    return res.status(400).json({ message: "Please select the role" });
  }

  //check email exists
  const existingUser = await user.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: "Email aleady exists" });
  }

  //check phone is unique
  const existingPhone = await user.findOne({ phone: phone });
  if (existingPhone) {
    return res.status(400).json({ message: "Phone aleady exists" });
  }

  //check employee code is unique
  const existingemployeeCode = await user.findOne({
    employeeCode: employeeCode,
  });
  if (existingemployeeCode) {
    return res.status(400).json({ message: "Employee code aleady exists" });
  }

  // Hash the password with a salt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new user({
    employeeName,
    email,
    phone,
    employeeCode,
    password: hashedPassword,
    role,
  });
  await newUser.save();

  return res.status(200).json({ message: "Account created" });
});

//sign in
router.post("/sign-in", async (req, res) => {
  try {
    const { employeeCode, password } = req.body;

    if (!employeeCode || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if employee code exists
    const existingUser = await user.findOne({ employeeCode: employeeCode });
    if (!existingUser) {
      return res.status(400).json({ message: "Employee code does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const role = existingUser.role;
    const id = existingUser._id;
    const employeeName = existingUser.employeeName;
    const token = jwt.sign({ id: id, role: role }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });
    res.cookie("logbookUserToken", token, {
      httpOnly: true,
      maxAge: 360000,
      secure: process.env.NODE_ENV === "production", // Cookie is only sent over HTTPS in production
      sameSite: "None",
    });
    return res
      .status(200)
      .json({ token, role, id, employeeName, message: "Sign-in successful" });
  } catch (error) {
    return res.status(404).json({ message: "Internal server error" });
  }
});

// Route to fetch user details based on JWT token stored in cookie
router.get("/user-details", authMiddleware, async (req, res) => {
  try {
    // User details are available in req.user due to authMiddleware
    const { email } = req.user;
    const existUser = await user.findOne({ email: email });
    return res.status(200).json({
      employeeCode: existUser.employeeCode,
      email: existUser.email,
      employeeName: existUser.employeeName,
      role: existUser.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//logout
router.post("/logout", (req, res) => {
  res.clearCookie("logbookUserToken", {
    httpOnly: true,
  });
  res.json({ message: "Logged out successfully" });
});
module.exports = router;
