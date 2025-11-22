const { getCreatedBy } = require("../helper/CurrentUser");
const Source = require("./source_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const source = await Source.create({
      ...req.body,
      source_created_by: getCreatedBy(req.currentUser),
    });

    res
      .status(201)
      .json({ message: "Source created successfully", data: source });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating source", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const sources = await Source.findAll({
      where: {
        source_created_by: getCreatedBy(req.currentUser),
      },
      order: [["source_id", "DESC"]],
    });
    res.status(200).json(sources);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sources", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const source = await Source.findByPk(req.params.id);
    if (!source)
      return res.status(404).json({ message: "Source not found" });

    res.status(200).json(source);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching source", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const source = await Source.findByPk(req.body.source_id);

    if (!source)
      return res.status(404).json({ message: "Source not found" });

    await source.update(req.body);
    res
      .status(200)
      .json({ message: "Source updated successfully", data: source });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating source", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Source.destroy({
      where: { source_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Source not found" });

    res.status(200).json({ message: "Source deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting source", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
