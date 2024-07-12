const authMiddleware = require("../middlewares/JWTVerification");
const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcryptjs");

//get all user details
router.get("/getAllUserDetails", authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "admin") {
      return res
        .status(500)
        .json({ message: "You are not having access to admin routes" });
    }
    const users = await User.find({})
      .sort({ timestamps: -1 }) // Sorting by timestamps in descending order
      .select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Deactivate Account
router.put("/deactivateAccount", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    if (user.role !== "admin") {
      return res
        .status(500)
        .json({ message: "You are not having access to admin routes" });
    }
    await User.findByIdAndUpdate(id, { active: false });
    return res.status(200).json({ message: "Account deactivated" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//change password
router.put("/changePassword", authMiddleware, async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, id } = req.body;
    const { user } = req;
    if (user.role !== "admin") {
      return res
        .status(500)
        .json({ message: "You are not having access to admin routes" });
    }
    if (!newPassword || !confirmNewPassword) {
      return res.status(500).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(500).json({ message: "Passwords not matched" });
    }
    // Hash the password with a salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//change role
router.put("/changeRole", authMiddleware, async (req, res) => {
  try {
    const { role, id } = req.body;
    const { user } = req;
    if (user.role !== "admin") {
      return res
        .status(500)
        .json({ message: "You are not having access to admin routes" });
    }
    if (!role) {
      return res.status(500).json({ message: "Please select the role" });
    }

    const existUser = await User.findById(id);
    if (existUser.role === role) {
      return res
        .status(500)
        .json({ message: "The user is already of selected role." });
    }
    await User.findByIdAndUpdate(id, { role });
    return res.status(200).json({ message: "Role updated!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
