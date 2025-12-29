const { saveImage } = require("../helper/fileUpload");
const Slider = require("./slider_model");

// ✅ Store slider
exports.store = async (req, res) => {
    try {
        // image file (same style as category)
        const file = req.files?.slider_image;
        let savedPath = null;

        // save image if exists
        if (file) {
            savedPath = await saveImage(file, "slider_image");
        }

        // create slider
        const slider = await Slider.create({
            ...req.body,
            slider_image: savedPath,                 // match frontend key

        });

        return res.status(201).json({
            success: true,
            message: "Slider added successfully",
            data: slider,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating slider",
            error: error.message,
        });
    }
};

// ✅ List active sliders (Home page)
exports.index = async (req, res) => {
    try {
        const sliders = await Slider.findAll({
            where: { slider_status: 1 },
            order: [["slider_id", "ASC"]],
        });
  return res.status(200).json({
            success: true,
            data: sliders,
        });
    } catch (error) {
        console.error("❌ Slider fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching sliders",
        });
    }
};

// ✅ Get single slider
exports.get = async (req, res) => {
    try {
        const slider = await Slider.findByPk(req.params.id);
        return res.json({ success: true, data: slider });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ Update slider
exports.update = async (req, res) => {
  try {
    const file = req.files?.slider_image;
console.log(req.body);

    // Find existing slider
    const slider = await Slider.findByPk(req.body.slider_id);
    if (!slider) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    let slider_image = slider.slider_image; // keep old image by default

    // If new image uploaded
    if (file) {
      // Delete old image if exists
      if (slider.slider_image) {
        deleteImage("slider_image", slider.slider_image);
      }

      // Save new image
      slider_image = await saveImage(file, "slider_image");
    }

    // Update slider
    await slider.update({
      ...req.body,
      slider_image, // updated or old
    });

    return res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating slider",
      error: error.message,
    });
  }
};

// ✅ Delete slider
exports.delete = async (req, res) => {
    try {
       
        await Slider.destroy({
            where: { slider_id: req.params.id },
        });

        return res.json({ success: true, message: "Slider deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
