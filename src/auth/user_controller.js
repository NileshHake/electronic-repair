const User = require("./user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const {
  createDefaultWorkflow,
} = require("../CreateData/create_data_for_business");
const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
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
    const createdBy = getCreatedBy(req.currentUser);

    const users = await sequelize.query(
      `
      SELECT *
      FROM tbl_users
      LEFT JOIN tbl_roles  
        ON tbl_users.user_role_id = tbl_roles.role_id
      WHERE user_type IN (3, 4, 5)
        AND user_created_by = :createdBy
      `,
      {
        replacements: { createdBy },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
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

    let user_profile = user.user_profile;

    const file = req.files?.user_profile;
    if (file) {
      if (user.user_profile) {
        deleteImage("user_profile", user.user_profile);
      }

      user_profile = await saveImage(file, "user_profile");
    }

    let user_password = user.user_password;

    if (req.body.user_password === user.user_password) {
      user_password = user.user_password;
    } else {
      user_password = await bcrypt.hash(req.body.user_password, 10);
    }
    await user.update({
      ...req.body,
      user_password,
      user_profile,
    });

    return res.status(200).json({
      message: "User updated successfully",
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
const updatePassword = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id; // from middleware
    const { old_password, new_password } = req.body;
 
    // basic validation
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required.",
      });
    }

    // find logged-in user
    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // compare old password
    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      user.user_password
    );

    if (!isOldPasswordValid) {
      return res.status(200).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    // update in DB
    await User.update(
      { user_password: hashedNewPassword },
      { where: { user_id: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("❌ Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating password.",
      error: error.message,
    });
  }
};
module.exports = {
  store,
  index,
  Techniciansindex,
  Userindex,
  Deliveryindex,
  Businessindex,
  login,
  Get,
  update,
  deleted,
  updatePassword,
};
