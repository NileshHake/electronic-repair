const { getCreatedBy } = require("../helper/CurrentUser");
const StorageLocation = require("./storage_location_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const storageLocation = await StorageLocation.create({
      ...req.body,
      storage_location_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "Storage Location created successfully",
      data: storageLocation,
    });
  } catch (error) {
    console.error("Error creating Storage Location:", error);
    res.status(500).json({
      message: "Error creating Storage Location",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const storageLocations = await StorageLocation.findAll({
      where: { storage_location_created_by: getCreatedBy(req.currentUser) },
    });

    res.status(200).json(storageLocations);
  } catch (error) {
    console.error("Error fetching Storage Locations:", error);
    res.status(500).json({
      message: "Error fetching Storage Locations",
      error: error.message,
    });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const storageLocation = await StorageLocation.findByPk(req.params.id);

    if (!storageLocation)
      return res.status(404).json({ message: "Storage Location not found" });

    res.status(200).json(storageLocation);
  } catch (error) {
    console.error("Error fetching Storage Location:", error);
    res.status(500).json({
      message: "Error fetching Storage Location",
      error: error.message,
    });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const storageLocation = await StorageLocation.findByPk(
      req.body.storage_location_id
    );

    if (!storageLocation)
      return res.status(404).json({ message: "Storage Location not found" });

    await storageLocation.update(req.body);

    res.status(200).json({
      message: "Storage Location updated successfully",
      data: storageLocation,
    });
  } catch (error) {
    console.error("Error updating Storage Location:", error);
    res.status(500).json({
      message: "Error updating Storage Location",
      error: error.message,
    });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await StorageLocation.destroy({
      where: { storage_location_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Storage Location not found" });

    res.status(200).json({ message: "Storage Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting Storage Location:", error);
    res.status(500).json({
      message: "Error deleting Storage Location",
      error: error.message,
    });
  }
};

module.exports = { store, index, Get, update, deleted };
