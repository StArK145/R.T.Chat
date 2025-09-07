const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/", auth, upload.single("file"), (req, res) => {
  const stream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ url: result.secure_url, publicId: result.public_id });
  });
  stream.end(req.file.buffer);
});

module.exports = router;
