const multer = require("multer");
const path = require("path");
const MAX_SIZE = 1024 * 1024 * 8; // 8MB size of image

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(__dirname, "../../public/uploads");
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/avif" || file.mimetype === "image/webp") {
    if (file.size > MAX_SIZE) {
      cb(new Error("Image size too large, max 5MB allowed", "LIMIT_FILE_SIZE"), false);
    }
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Upload jpeg, png or avif", "INVALID_FILE_TYPE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
}).fields([
  { name: "projectPicture", maxCount: 1 },
  { name: "coverProjectPicture", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "coverProfilePicture", maxCount: 1 }
]);

module.exports = upload;
