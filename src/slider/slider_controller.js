const { saveImage, deleteImage } = require("../helper/fileUpload");
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
exports.Prodcutindex = async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      where: { slider_status: 1, slider_for_product: 1 },
      order: [["slider_id", "ASC"]],

    });
    return res.status(200).json(sliders);
  } catch (error) {
    console.error("❌ Slider fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sliders",
    });
  }
};
exports.Webindex = async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      where: { slider_status: 1, slider_for_product: 0 },
      order: [["slider_id", "ASC"]],

    });
    const formattedSliders = sliders.map((item) => ({
      id: item.slider_id,

      pre_title: {
        text: item.pre_title_text,
        price: item.pre_title_price,
      },

      title: item.title,

      subtitle: {
        text_1: item.subtitle_text_1,
        percent: item.subtitle_percent,
        text_2: item.subtitle_text_2,
      },

      img: item.slider_image, // image name only
      green_bg: item.green_bg === 1,
      is_light: item.is_light === 1,
    }));


    return res.status(200).json(formattedSliders);
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

exports.InWebindex = async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      where: { slider_status: 1 },
      order: [["slider_id", "ASC"]],
    });

    // 🔥 Transform DB rows into frontend format
    const formattedSliders = sliders.map((item) => ({
      id: item.slider_id,

      pre_title: {
        text: item.pre_title_text,
        price: item.pre_title_price,
      },

      title: item.title,

      subtitle: {
        text_1: item.subtitle_text_1,
        percent: item.subtitle_percent,
        text_2: item.subtitle_text_2,
      },

      img: item.slider_image, // image name only
      green_bg: item.green_bg === 1,
      is_light: item.is_light === 1,
    }));

    return res.status(200).json({
      success: true,
      data: formattedSliders,
    });
  } catch (error) {
    console.error("❌ Slider fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sliders",
    });
  }
};