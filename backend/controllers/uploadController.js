const cloudinary = require("../config/cloudinary");

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "chat-app" },
      (error, uploadResult) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        res.status(200).json({ url: uploadResult.secure_url });
      }
    ).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { uploadProfilePic };