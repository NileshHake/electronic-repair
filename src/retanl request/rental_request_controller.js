const RentalRequest = require("./rental_request_model"); 

// helper: calc duration days (inclusive)
const calcDays = (from_date, to_date) => {
  const from = new Date(from_date);
  const to = new Date(to_date);
  const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
};

// ✅ CREATE
const store = async (req, res) => {
  try {
    const payload = { ...req.body };

    // If you want customer from token (recommended)
    // payload.customer_id = getCreatedBy(req.currentUser);

    // ✅ validate device exists + active
    const device = await RentalDevice.findByPk(payload.req_rental_device_id);
    if (!device) return res.status(404).json({ message: "Rental device not found" });

    if (String(device.status) !== "active") {
      return res.status(400).json({ message: "This device is not active" });
    }

    // ✅ dates validation
    const days = calcDays(payload.from_date, payload.to_date);
    if (!days || days <= 0) {
      return res.status(400).json({ message: "Invalid from_date / to_date" });
    }

    // ✅ min rental days
    const minDays = Number(device.min_rental_days || 1);
    if (days < minDays) {
      return res.status(400).json({ message: `Minimum rental days is ${minDays}` });
    }

    // ✅ stock check (simple)
    if (Number(device.available_qty || 0) <= 0) {
      return res.status(400).json({ message: "Device is not available right now" });
    }

    payload.duration_days = days;
    payload.request_status = payload.request_status ?? 0;

    const request = await RentalRequest.create(payload);

    res.status(201).json({ message: "Rental request created successfully", data: request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating rental request", error: error.message });
  }
};

// ✅ READ ALL
const index = async (req, res) => {
  try {
    const list = await RentalRequest.findAll({
      order: [["rental_request_id", "DESC"]],
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rental requests", error: error.message });
  }
};

// ✅ READ SINGLE
const Get = async (req, res) => {
  try {
    const request = await RentalRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: "Rental request not found" });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rental request", error: error.message });
  }
};

// ✅ UPDATE
const update = async (req, res) => {
  try {
    const request = await RentalRequest.findByPk(req.body.rental_request_id);
    if (!request) return res.status(404).json({ message: "Rental request not found" });

    // if dates updated -> recalc duration_days
    let duration_days = request.duration_days;
    const from_date = req.body.from_date ?? request.from_date;
    const to_date = req.body.to_date ?? request.to_date;

    if (req.body.from_date || req.body.to_date) {
      const days = calcDays(from_date, to_date);
      if (!days || days <= 0) {
        return res.status(400).json({ message: "Invalid from_date / to_date" });
      }
      duration_days = days;
    }

    await request.update({
      ...req.body,
      duration_days,
    });

    res.status(200).json({ message: "Rental request updated successfully", data: request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating rental request", error: error.message });
  }
};

// ✅ DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await RentalRequest.destroy({
      where: { rental_request_id: req.params.id },
    });
    if (!deleted) return res.status(404).json({ message: "Rental request not found" });
    res.status(200).json({ message: "Rental request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rental request", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};