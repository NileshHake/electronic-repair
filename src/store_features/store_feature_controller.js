const StoreFeature = require("./store_feature_model");
const { getCreatedBy } = require("../helper/CurrentUser");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const feature = await StoreFeature.create({
      ...req.body,
      feature_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Store feature created successfully",
      data: feature,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating feature",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const features = await StoreFeature.findAll({
      where: { feature_status: 1 },
      order: [["feature_id", "ASC"]],
    });
    res.status(200).json(features);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching features",
      error: error.message,
    });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const feature = await StoreFeature.findByPk(req.params.id);
    if (!feature)
      return res.status(404).json({ message: "Feature not found" });

    res.status(200).json(feature);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feature",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const feature = await StoreFeature.findByPk(req.body.feature_id);
    if (!feature)
      return res.status(404).json({ message: "Feature not found" });

    await feature.update(req.body);
    res.status(200).json({
      message: "Store feature updated successfully",
      data: feature,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating feature",
      error: error.message,
    });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await StoreFeature.destroy({
      where: { feature_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Feature not found" });

    res.status(200).json({ message: "Feature deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting feature",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
