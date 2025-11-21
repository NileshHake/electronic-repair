const { getCreatedBy } = require("../helper/CurrentUser");
const CustomerAddress = require("./customer_address_model");

const store = async (req, res) => {
  try {
    const newAddress = await CustomerAddress.create({
      ...req.body,
      customer_address_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({
      message: "✅ Customer address created successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("❌ Error creating customer address:", error);
    res.status(500).json({
      message: "Error creating customer address",
      error: error.message,
    });
  }
};
const index = async (req, res) => {
  try {
    const addresses = await CustomerAddress.findAll({
      where: {
        customer_address_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("❌ Error fetching addresses:", error);
    res.status(500).json({
      message: "Error fetching customer addresses",
      error: error.message,
    });
  }
};

const Get = async (req, res) => {
  try {
    const address = await CustomerAddress.findByPk(req.params.id);
    if (!address)
      return res.status(404).json({ message: "Customer address not found" });

    res.status(200).json(address);
  } catch (error) {
    console.error("❌ Error fetching customer address:", error);
    res.status(500).json({
      message: "Error fetching customer address",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { customer_address__id } = req.body;

    const address = await CustomerAddress.findByPk(customer_address__id);
    if (!address)
      return res.status(404).json({ message: "Customer address not found" });

    await address.update(req.body);

    res.status(200).json({
      message: "✅ Customer address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("❌ Error updating customer address:", error);
    res.status(500).json({
      message: "Error updating customer address",
      error: error.message,
    });
  }
};

const deleted = async (req, res) => {
  try {
    const address = await CustomerAddress.findByPk(req.params.id);
    if (!address)
      return res.status(404).json({ message: "Customer address not found" });

    await address.destroy();

    res
      .status(200)
      .json({ message: "🗑️ Customer address deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting customer address:", error);
    res.status(500).json({
      message: "Error deleting customer address",
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
