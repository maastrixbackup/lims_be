const { google } = require("googleapis");
const { getMapDocumentById, deleteMapDocumentById } = require("../models/khataModel");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

const streamKmzFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Google Drive File ID is required",
      });
    }

    // Fetch stream from Google Drive API
    const driveResponse = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "application/vnd.google-earth.kmz");
    res.setHeader("Cache-Control", "public, max-age=86400");

    driveResponse.data
      .on("error", (err) => {
        console.error("Google Stream Error:", err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: "Error streaming file" });
        }
      })
      .pipe(res);
  } catch (err) {
    console.error("KMZ PROXY ERROR:", err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to retrieve map document from Google Drive",
    });
  }
};

const extractDriveFileId = (input) => {
  if (!input || typeof input !== "string") return null;
  const rawIdPattern = /^[a-zA-Z0-9_-]{25,50}$/;
  if (rawIdPattern.test(input.trim())) return input.trim();
  const match = input.match(/(?:d\/|id=)([a-zA-Z0-9_-]{25,50})/);
  return match ? match[1] : null;
};

const deleteMapDocument = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    const doc = await getMapDocumentById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Map document not found",
      });
    }

    const fileId = extractDriveFileId(doc.file_url) || extractDriveFileId(doc.file_name);

    if (fileId) {
      try {
        await drive.files.delete({ fileId });
      } catch (driveErr) {
        console.error(`Google Drive file deletion failed for ID [${fileId}]:`, driveErr.message);
      }
    }

    await deleteMapDocumentById(id);

    return res.status(200).json({
      success: true,
      message: "Map document deleted successfully from Drive and database",
    });
  } catch (err) {
    console.error("Delete map document error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting map document",
    });
  }
};

module.exports = { streamKmzFile, deleteMapDocument };