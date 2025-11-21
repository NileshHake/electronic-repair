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

  const imageName = file.name; // or generate unique name
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

module.exports = { saveImage, deleteImage, saveVideo, deleteVideo };
