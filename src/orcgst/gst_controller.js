const sequelize = require("../../config/db");
const User = require("../auth/user_model");
const { getCreatedBy } = require("../helper/CurrentUser");

const Gst = require("./gst_model"); 
const store = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.currentUser?.user_id; // as you said
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ find existing GST for this user
    const existing = await Gst.findOne({
      where: { gst_created_by: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    let gst;

    if (existing) {
      // ✅ UPDATE existing
      gst = await existing.update(
        {
          ...req.body,
          gst_created_by: userId, // keep same user
        },
        { transaction: t }
      );
    } else {
      // ✅ CREATE new
      gst = await Gst.create(
        {
          ...req.body,
          gst_created_by: userId,
        },
        { transaction: t }
      );
    }

    // ✅ Update User.user_gst_id
    await User.update(
      { user_gst_id: gst.gst_id },
      { where: { user_id: userId }, transaction: t }
    );

    await t.commit();

    return res.status(existing ? 200 : 201).json({
      message: existing ? "GST updated successfully" : "GST created successfully",
      data: gst,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).json({
      message: "Error saving GST",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const list = await Gst.findAll({ order: [["gst_id", "DESC"]] });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching GST", error: error.message });
  }
};

// 🔵 READ SINGLE (by gst_id)
const Get = async (req, res) => {
  try {
    const gst = await Gst.findByPk(req.params.id);
    if (!gst) return res.status(404).json({ message: "GST not found" });
    res.status(200).json(gst);
  } catch (error) {
    res.status(500).json({ message: "Error fetching GST", error: error.message });
  }
};

// 🔵 READ MY GST (by logged-in user)
const myGst = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const gst = await Gst.findOne({ where: { gst_created_by: userId } });
    if (!gst) return res.status(404).json({ message: "GST not found for this user" });

    res.status(200).json(gst);
  } catch (error) {
    res.status(500).json({ message: "Error fetching GST", error: error.message });
  }
};

// 🟠 UPDATE (by gst_id) + if updating, also update User.user_gst_id (safe)
const update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const gst = await Gst.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!gst) {
      await t.rollback();
      return res.status(404).json({ message: "GST not found" });
    }

    const updated = await gst.update(req.body, { transaction: t });

    // ✅ keep user's user_gst_id synced (if gst_created_by exists)
    if (updated?.gst_created_by) {
      await User.update(
        { user_gst_id: updated.gst_id },
        { where: { user_id: updated.gst_created_by }, transaction: t }
      );
    }

    await t.commit();
    res.status(200).json({ message: "GST updated successfully", data: updated });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Error updating GST", error: error.message });
  }
};

// 🔴 DELETE (by gst_id) + clear User.user_gst_id if it matches
const deleted = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const gst = await Gst.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!gst) {
      await t.rollback();
      return res.status(404).json({ message: "GST not found" });
    }

    // ✅ clear user's gst id if it points to this gst record
    await User.update(
      { user_gst_id: null },
      {
        where: {
          user_id: gst.gst_created_by,
          user_gst_id: gst.gst_id,
        },
        transaction: t,
      }
    );

    await gst.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "GST deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Error deleting GST", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  myGst,
  update,
  deleted,
};