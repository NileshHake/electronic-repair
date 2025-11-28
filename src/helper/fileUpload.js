const fs = require("fs");
const path = require("path");

/**
 * Ensure a folder exists; if not, create it (recursively).
 * @param {string} folderPath
 */
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Save uploaded image to public/images/<folderName>
 * @param {object} file - file from req.files
 * @param {string} folderName - e.g. 'category_img'
 * @returns {Promise<string>} - Returns saved image name
 */
const saveImage = async (file, folderName) => {
  const folderPath = path.join(process.cwd(), "public", "images", folderName);

  // create folder if not exists
  ensureFolderExists(folderPath);

  // ----- Generate dynamic unique name -----
  const ext = path.extname(file.name) || ".jpg"; // keep original extension
  const timestamp = Date.now(); // e.g. 1732456789123
  const randomStr = Math.random().toString(36).substring(2, 8); // e.g. "k3f9z1"

  const imageName = `${timestamp}_${randomStr}${ext}`; // e.g. 1732456789123_k3f9z1.jpg
  // ---------------------------------------

  const uploadPath = path.join(folderPath, imageName);

  await new Promise((resolve, reject) => {
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error(`Error moving file ${imageName}:`, err);
        return reject(err);
      }
      resolve();
    });
  });

  return imageName;
};

/**
 * Delete image from public/images/<folderName>
 */
const deleteImage = (folderName, fileName) => {
  if (!fileName) return;

  const imagePath = path.join(
    process.cwd(),
    "public",
    "images",
    folderName,
    fileName
  );

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  return imagePath;
};

/**
 * Save uploaded video to public/videos/<folderName>
 * @param {object} file - file from req.files
 * @param {string} folderName - e.g. 'repair_videos'
 * @returns {Promise<string>} - Returns saved video name
 */
const saveVideo = async (file, folderName) => {
  const folderPath = path.join(process.cwd(), "public", "videos", folderName);

  // create folder if not exists
  ensureFolderExists(folderPath);

  const videoName = file.name; // or generate unique name
  const uploadPath = path.join(folderPath, videoName);

  await new Promise((resolve, reject) => {
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error(`Error moving video ${videoName}:`, err);
        return reject(err);
      }
      resolve();
    });
  });

  return videoName;
};

/**
 * Delete video from public/videos/<folderName>
 */
const deleteVideo = (folderName, fileName) => {
  if (!fileName) return;

  const videoPath = path.join(
    process.cwd(),
    "public",
    "videos",
    folderName,
    fileName
  );

  if (fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
  }

  return videoPath;
};
const downloadImageFromUrl = async (imageUrl, folderName = "user_profile") => {
  if (!imageUrl) return null;

  try {
    // Folder: public/images/<folderName>
    const folderPath = path.join(process.cwd(), "public", "images", folderName);

    // ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // extension guess karlo (jpg default)
    const ext = path.extname(imageUrl.split("?")[0]) || ".jpg";

    // unique name
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}${ext}`;

    const filePath = path.join(folderPath, fileName);

    // download stream
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;

      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });

      writer.on("close", () => {
        if (!error) resolve(true);
      });
    });

    // yahan sirf fileName return kar raha hun
    // same pattern as saveImage (jo imageName return karta hai)
    return fileName;
  } catch (err) {
    console.error("❌ Error downloading Google profile image:", err.message);
    return null;
  }
};


module.exports = { saveImage, deleteImage, saveVideo, deleteVideo ,downloadImageFromUrl};
