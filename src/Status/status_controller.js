const { getCreatedBy } = require("../helper/CurrentUser");
const Status = require("./status_model");

// ================= STORE =================
const store = async (req, res) => {
  try {
    const status = await Status.create({
      ...req.body,
      status_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Status created successfully",
      data: status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating status",
      error: error.message,
    });
  }
};

// ================= INDEX (LIST ALL) =================
const index = async (req, res) => {
  try {
    const statuses = await Status.findAll({
      where: {
        status_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching statuses",
      error: error.message,
    });
  }
};

// ================= GET SINGLE =================
const Get = async (req, res) => {
  try {
    const status = await Status.findByPk(req.params.id);
    if (!status)
      return res.status(404).json({ message: "Status not found" });

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching status",
      error: error.message,
    });
  }
};

// ================= UPDATE =================
const update = async (req, res) => {
  try {
 
    const status = await Status.findByPk(req.body.status_id);
    if (!status)
      return res.status(404).json({ message: "Status not found" });

    await status.update(req.body);

    res.status(200).json({
      message: "Status updated successfully",
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
};

// ================= DELETE =================
const deleted = async (req, res) => {
  try {
    const deleted = await Status.destroy({
      where: { status_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Status not found" });

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting status",
      error: error.message,
    });
  }
};

// ================= EXPORT =================
module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
