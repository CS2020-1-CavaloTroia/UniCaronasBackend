const multer = require("multer");

const googleCloudUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

module.exports = googleCloudUpload;
