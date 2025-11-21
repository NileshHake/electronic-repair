const { getCreatedBy } = require("../helper/CurrentUser");
const ServicesType = require("./services_type_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const service = await ServicesType.create({
      ...req.body,
      service_type_created_by: getCreatedBy(req.currentUser),
    });
    res.status(201).json({ message: "Service created successfully", data: service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const services = await ServicesType.findAll({
      where: { service_type_created_by: getCreatedBy(req.currentUser) },
      
    });
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const service = await ServicesType.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching service", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const service = await ServicesType.findByPk(req.body.service_type_id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    await service.update(req.body);
    res.status(200).json({ message: "Service updated successfully", data: service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await ServicesType.destroy({ where: { service_type_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
