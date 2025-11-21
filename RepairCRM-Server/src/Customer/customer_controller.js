const { getCreatedBy } = require("../helper/CurrentUser");
const Customer = require("./customer_model");

const store = async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      customer_created_by: getCreatedBy(req.currentUser),
    });
    res
      .status(201)
      .json({ message: "Customer created successfully", data: customer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating customer", error: error.message });
  }
};

const index = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        customer_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

const Get = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customer", error: error.message });
  }
};

const update = async (req, res) => {
  try { 
    const customer = await Customer.findByPk(req.body.customer_id);

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    await customer.update(req.body);
    res
      .status(200)
      .json({ message: "Customer updated successfully", data: customer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating customer", error: error.message });
  }
};

const deleted = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { customer_id: req.params.id },
    });
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
