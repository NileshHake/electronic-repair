const User = require("./user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const {
  createDefaultWorkflow,
} = require("../CreateData/create_data_for_business");

const googleCustomerLogin = async (req, res) => {
  try {
    const {
      sub,
      name,
      given_name,
      family_name,
      email,
      picture,
      email_verified,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found in Google response",
      });
    }

    // 1️⃣ Find user by email
    const user = await User.findOne({ where: { user_email: email } });

    // 2️⃣ If user does NOT exist → tell frontend to redirect to sig  nup
    if (!user) {
      return res.status(200).json({
        success: false,
        userNotFound: true,
        message: "User not found. Please sign up first.",
        email,              // so frontend can prefill signup form
        name: name || `${given_name || ""} ${family_name || ""}`.trim(),
        picture,
      });
    }

    // 3️⃣ If user exists → create JWT token and login
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful (Google)",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Error in googleCustomerLogin:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in user with Google ❌",
      error: error.message,
    });
  }
};
const googleLoginOrSignup = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_phone_number,
      user_type = 6, // default Google customer type
      user_password = null,
      user_created_by = 1, // default business
      user_picture,
      name,          // optional Google fields
      given_name,
      family_name,
    } = req.body;

    const email = user_email || req.body.email; // support both

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    // 1️⃣ Check if user exists
    let user = await User.findOne({ where: { user_email: email } });

    if (!user) {
      // 2️⃣ If user does not exist → create new user
      const finalUserName = user_name || name || `${given_name || ""} ${family_name || ""}`.trim();
      let hashedPassword = null;
      if (user_password) {
        hashedPassword = await bcrypt.hash(user_password, 10);
      }
      user = await User.create({
        user_name: finalUserName,
        user_email: email,
        user_phone_number: user_phone_number || null,
        user_type,
        user_role_id: 3,
        user_password: hashedPassword,
        user_created_by,
        user_picture: user_picture || null,
      });
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: user ? "Login successful" : "Signup & login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Error in googleLoginOrSignup:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in or creating user",
      error: error.message,
    });
  }
};
const store = async (req, res) => {
  try {
    const file = req.files?.user_profile;
    let savedPath = null;

    if (file) {
      savedPath = await saveImage(file, "user_profile");
    }

    if (req.body.user_password) {
      req.body.user_password = await bcrypt.hash(req.body.user_password, 10);
    }
    if (Number(req.body.user_type) === 2) {
      req.body.user_role_id = 2;
    }
    const user = await User.create({
      ...req.body,
      user_profile: savedPath,
      user_created_by: getCreatedBy(req.currentUser),
    });
    if (user.user_type == 2) {
      createDefaultWorkflow(user.user_id);
    }
    res.status(201).json({
      message: "✅ User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error in store function:", error);
    res.status(500).json({
      message: "Error creating user ❌",
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const Techniciansindex = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: 4,
        user_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const Businessindex = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: 2,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const Customerindex = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: 6,
        user_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const Userindex = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: 3,
        user_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const Deliveryindex = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: 5,
        user_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const Get = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { user_id } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // ---------- PROFILE IMAGE ----------
    let user_profile = user.user_profile;

    const file = req.files?.user_profile;
    if (file) {
      // Purani image delete karo (agar hai to)
      if (user.user_profile) {
        deleteImage("user_profile", user.user_profile);
      }

      // New image save
      user_profile = await saveImage(file, "user_profile");
    }

    // ---------- PASSWORD HANDLE ----------
    let user_password = user.user_password; // default: old password

    // Agar frontend se user_password aaya hai aur empty nahi hai
    if (
      typeof req.body.user_password === "string" &&
      req.body.user_password.trim() !== ""
    ) {
      user_password = await bcrypt.hash(req.body.user_password, 10);
    }

    // ---------- UPDATE FIELDS ----------
    await user.update({
      ...req.body,
      user_password,
      user_profile,
    });

    return res.status(200).json({
      message: "User updated successfully ✅",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      message: "Error updating user ❌",
      error: error.message,
    });
  }
};


const deleted = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { user_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const user = await User.findOne({ where: { user_email } });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: " Email not found. Please check your email.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!isPasswordValid) {
      return res.status(200).json({
        success: false,
        message: " Incorrect password. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: " Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({
      success: false,
      message: "⚠️ Internal server error during login",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  Techniciansindex,
  googleCustomerLogin,
  googleLoginOrSignup,
  Userindex,
  Deliveryindex,
  Customerindex,
  Businessindex,
  login,
  Get,
  update,
  deleted,
};
