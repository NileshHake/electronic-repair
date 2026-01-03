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
    let user = await User.findOne({ where: { user_email: email } });

    // 2️⃣ If user NOT exist → CREATE user
    if (!user) {
      user = await User.create({
        user_email: email,
        user_name: name || `${given_name || ""} ${family_name || ""}`.trim(),
        user_profile: picture || null,
        user_type: 3, // 👈 default (Customer / Employee / User)
        user_google_id: sub,
        user_email_verified: email_verified ? 1 : 0,
        user_status: 1,
        user_created_by: null,
      });
    }

    // 3️⃣ Fetch Business Data (same logic you had)
    const BusinessData = await (
      [2, 3].includes(user.user_type)
        ? User.findByPk(user.user_id)
        : User.findOne({ where: { user_id: user.user_created_by } })
    );

    // 4️⃣ Create JWT Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Return success
    return res.status(200).json({
      success: true,
      message: "Login successful (Google)",
      token,
      BusinessData,
      user,
      isNewUser: !user._previousDataValues, // optional
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
      req.body.user_password === user.user_password
    ) { user_password = user.user_password; } else {
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
const CustomerUpdate = async (req, res) => {
  try {
    const { user_id } = req.body;
console.log(req.body);

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    await user.update(req.body);

    return res.status(200).json({
      message: " Updated successfully ",
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


const changePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(old_password, user.user_password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is wrong!" });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    await User.update(
      { user_password: hashedNewPassword },
      { where: { user_id } }
    );

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.log("Password update error", error);
    return res.status(500).json({ message: "Server Error", error });
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

    const BusinessData = await User.findOne({ where: { user_created_by: user.user_created_by } });
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
      BusinessData,
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
  Userindex,
  Deliveryindex,
  Customerindex,
  Businessindex,
  login,
  Get,
  changePassword,
  CustomerUpdate,
  update,
  deleted,
};
