const { getCreatedBy } = require("../helper/CurrentUser");
const Tax = require("./tax_model");

const store = async (req, res) => {
  try {
    const tax = await Tax.create({
      ...req.body,
      tax_created_by: getCreatedBy(req.currentUser),
    });

    res.status(201).json({ message: "Tax created successfully", data: tax });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating tax", error: error.message });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const taxes = await Tax.findAll({
      where: {
        tax_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(taxes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching taxes", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const tax = await Tax.findByPk(req.params.id);
    if (!tax) return res.status(404).json({ message: "Tax not found" });
    res.status(200).json(tax);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tax", error: error.message });
  }
};

// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const { TaxData } = req.body;

    const tax = await Tax.findByPk(req.body.tax_id);

    if (!tax) return res.status(404).json({ message: "Tax not found" });

    await tax.update(req.body);
    res.status(200).json({ message: "Tax updated successfully", data: tax });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error updating tax", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await Tax.destroy({ where: { tax_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Tax not found" });
    res.status(200).json({ message: "Tax deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting tax", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
