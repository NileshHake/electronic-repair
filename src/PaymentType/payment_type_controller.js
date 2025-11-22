const { getCreatedBy } = require("../helper/CurrentUser");
const PaymentType = require("./payment_type_model");

const store = async (req, res) => {
  try {
    const paymentType = await PaymentType.create({
      ...req.body,
      payment_type_created_by: getCreatedBy(req.currentUser),
    });
    res.status(201).json({
      message: "Payment Type created successfully",
      data: paymentType,
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error creating payment type", error: error.message });
  }
};

const index = async (req, res) => {
  try {
    const paymentTypes = await PaymentType.findAll({
      where: {
        payment_type_created_by: getCreatedBy(req.currentUser),
      },
    });
    res.status(200).json(paymentTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment types", error: error.message });
  }
};

const Get = async (req, res) => {
  try {
    const paymentType = await PaymentType.findByPk(req.params.id);
    if (!paymentType)
      return res.status(404).json({ message: "Payment Type not found" });
    res.status(200).json(paymentType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment type", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const paymentType = await PaymentType.findByPk(req.body.payment_type_id);

    if (!paymentType)
      return res.status(404).json({ message: "Payment Type not found" });
    await paymentType.update(req.body);
    -(
      //

      res.status(200).json({
        message: "Payment Type updated successfully",
        data: paymentType,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment type", error: error.message });
  }
};

const deleted = async (req, res) => {
  try {
    const deleted = await PaymentType.destroy({
      where: { payment_type_id: req.params.id },
    });
    if (!deleted)
      return res.status(404).json({ message: "Payment Type not found" });
    res.status(200).json({ message: "Payment Type deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting payment type", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
