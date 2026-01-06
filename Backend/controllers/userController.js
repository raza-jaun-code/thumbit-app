import User from "../models/User.js";

// ---------------------------
// REGISTER USER
// ---------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email || !name)
      return res.status(400).json({ error: "Name and email required" });

    // Allow returning existing user (for your demo)
    let user = await User.findOne({ email });
    if (user) return res.json(user);

    user = new User({ name, email, phone, rewardPoints: 1200 }); // default demo points
    await user.save();

    return res.json(user);
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------------
// GET ALL USERS
// ---------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------
// GET USER BY EMAIL
// ---------------------------
export const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email }).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------
// UPDATE USER INFO
// ---------------------------
export const updateUser = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (!email)
      return res.status(400).json({ message: "email is required to update user" });

    // Find user by old email and update new data
    const user = await User.findOneAndUpdate(
      { email },
      {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ---------------------------
// REDEEM REWARD POINTS
// ---------------------------
export const redeemRewardPoints = async (req, res) => {
  try {
    const { email, points } = req.body;
    if (!email || !points)
      return res.status(400).json({ message: "Email and points required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.rewardPoints < points)
      return res.status(400).json({ message: "Insufficient reward points" });

    user.rewardPoints -= points;
    await user.save();

    res.status(200).json({
      message: "Reward redeemed successfully",
      user,
    });
  } catch (err) {
    console.error("redeemRewardPoints error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
