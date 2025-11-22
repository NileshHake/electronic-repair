const { getCreatedBy } = require("../helper/CurrentUser");
const Services = require("./services_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const service = await Services.create({
      ...req.body,
      service_created_by: getCreatedBy(req.currentUser),
    });

    res
      .status(201)
      .json({ message: "Service created successfully", data: service });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const services = await Services.findAll({
      where: {
        service_created_by: getCreatedBy(req.currentUser),
      },
      order: [["service_id", "DESC"]],
    });
    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const service = await Services.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Service not found" });

    res.status(200).json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching service", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const service = await Services.findByPk(req.body.service_id);

    if (!service)
      return res.status(404).json({ message: "Service not found" });

    await service.update(req.body);
    res
      .status(200)
      .json({ message: "Service updated successfully", data: service });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating service", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Services.destroy({
      where: { service_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting service", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
