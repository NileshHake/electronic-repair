const BeadingRequest = require("./beading_model");
const { getCreatedBy } = require("../helper/CurrentUser"); 
const { saveImage } = require("../helper/fileUpload");
// ✅ STORE
const store = async (req, res) => {
  try {
    // ✅ multiple images upload
    let beading_images = [];

    // frontend should send field name: beading_images
    if (req.files && req.files.beading_images) {
      const files = Array.isArray(req.files.beading_images)
        ? req.files.beading_images
        : [req.files.beading_images];

      for (const file of files) {
        const savedPath = await saveImage(file, "beading_images");
        beading_images.push(savedPath);
      }
    }

    // ✅ convert to string
    const imagesString = beading_images.length > 0 ? beading_images.join(",") : null;

    const payload = {
      ...req.body,
      beading_customer_id: req.currentUser.user_id, // ✅ customer id from token
      beading_created_by: getCreatedBy(req.currentUser),
      beading_request_images: imagesString,
      beading_vender_accepted_id: null, // default null
    };

    const created = await BeadingRequest.create(payload);

    res.status(201).json({
      message: "Beading request created successfully",
      data: created,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating beading request",
      error: error.message,
    });
  }
};

// ✅ LIST
const index = async (req, res) => {
  try {
    const rows = await BeadingRequest.findAll({
        where: {
          beading_customer_id: req.currentUser.user_id, // ✅ customer id from token
        },
    } );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beading requests",
      error: error.message,
    });
  }
};

// ✅ SINGLE
const Get = async (req, res) => {
  try {
    const row = await BeadingRequest.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });
    res.status(200).json(row);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beading request",
      error: error.message,
    });
  }
};

// ✅ UPDATE
const update = async (req, res) => {
  try {
    const row = await BeadingRequest.findByPk(req.body.beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

    // if new images coming in update
    let beading_images = [];
    if (req.files && req.files.beading_images) {
      const files = Array.isArray(req.files.beading_images)
        ? req.files.beading_images
        : [req.files.beading_images];

      for (const file of files) {
        const savedPath = await saveImage(file, "beading_images");
        beading_images.push(savedPath);
      }
    }

    const imagesString =
      beading_images.length > 0 ? beading_images.join(",") : row.beading_request_images;

    await row.update({
      ...req.body,
      beading_request_images: imagesString,
    });

    res.status(200).json({ message: "Beading request updated successfully", data: row });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating beading request",
      error: error.message,
    });
  }
};

// ✅ DELETE
const deleted = async (req, res) => {
  try {
    const done = await BeadingRequest.destroy({
      where: { beading_request_id: req.params.id },
    });

    if (!done) return res.status(404).json({ message: "Beading request not found" });

    res.status(200).json({ message: "Beading request deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting beading request",
      error: error.message,
    });
  }
};

// ✅ Vendor accept API (set beading_vender_accepted_id)
const vendorAccept = async (req, res) => {
  try {
    const { beading_request_id } = req.body;

    const row = await BeadingRequest.findByPk(beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

    // ✅ vendor id from token
    await row.update({
      beading_vender_accepted_id: req.currentUser.user_id,
      beading_request_status: 1, // accepted
    });

    res.status(200).json({ message: "Beading request accepted", data: row });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting request",
      error: error.message,
    });
  }
};

module.exports = { store, index, Get, update, deleted, vendorAccept };
