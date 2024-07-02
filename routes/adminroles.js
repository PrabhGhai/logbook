const authMiddleware = require("../middlewares/JWTVerification");
const User = require("../models/user");
const router = require("express").Router();

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

module.exports = router;
