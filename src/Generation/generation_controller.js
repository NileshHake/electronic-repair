const { getCreatedBy } = require("../helper/CurrentUser");
const Generations = require("./generation_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const generation = await Generations.create({
      ...req.body,
      generations_created_by: getCreatedBy(req.currentUser),
    });

    res
      .status(201)
      .json({ message: "Generation created successfully", data: generation });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating generation", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const generations = await Generations.findAll({
      where: {
        generations_created_by: getCreatedBy(req.currentUser),
      },
      order: [["generations_id", "ASC"]],
    });

    res.status(200).json(generations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching generations", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const generation = await Generations.findByPk(req.params.id);

    if (!generation)
      return res.status(404).json({ message: "Generation not found" });

    // Optional: ownership check
    if (
      Number(generation.generations_created_by) !==
      Number(getCreatedBy(req.currentUser))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(generation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching generation", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const generation = await Generations.findByPk(req.body.generations_id);

    if (!generation)
      return res.status(404).json({ message: "Generation not found" });

    // Optional: ownership check
    if (
      Number(generation.generations_created_by) !==
      Number(getCreatedBy(req.currentUser))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await generation.update(req.body);

    res
      .status(200)
      .json({ message: "Generation updated successfully", data: generation });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating generation", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    // Optional: ownership check before delete
    const generation = await Generations.findByPk(req.params.id);
    if (!generation)
      return res.status(404).json({ message: "Generation not found" });

    if (
      Number(generation.generations_created_by) !==
      Number(getCreatedBy(req.currentUser))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Generations.destroy({
      where: { generations_id: req.params.id },
    });

    res.status(200).json({ message: "Generation deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting generation", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
