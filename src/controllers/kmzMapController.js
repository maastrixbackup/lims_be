const { google } = require("googleapis");

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

module.exports = { streamKmzFile };