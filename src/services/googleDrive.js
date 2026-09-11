const { google } = require("googleapis");
const fs = require("fs");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

// Helper: Check if a folder exists inside a parent folder
const findFolder = async (folderName, parentId) => {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(
    /'/g,
    "\\'"
  )}' and '${parentId}' in parents and trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    spaces: "drive",
  });

  return res.data.files.length > 0 ? res.data.files[0].id : null;
};

// Helper: Get folder ID if it exists, otherwise create it
const getOrCreateFolder = async (folderName, parentId) => {
  let folderId = await findFolder(folderName, parentId);

  if (!folderId) {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: "id",
    });

    folderId = folder.data.id;
  }

  return folderId;
};

// Helper: Navigate or build the folder path dynamically
const getDestinationFolderId = async (folderPathArray) => {
  let currentParentId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!currentParentId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing in .env file.");
  }

  for (const folderName of folderPathArray) {
    if (folderName) {
      currentParentId = await getOrCreateFolder(folderName, currentParentId);
    }
  }

  return currentParentId;
};

const uploadToDrive = async (filePath, fileName, mimeType, folderPathArray = []) => {
  try {
    // Resolve dynamic folder ID based on folderPathArray
    const destinationFolderId = await getDestinationFolderId(folderPathArray);

    console.log(`Uploading ${fileName} to folder ID: ${destinationFolderId}`);

    const fileMetadata = {
      name: fileName,
      parents: [destinationFolderId],
    };

    const media = {
      mimeType: mimeType || "application/octet-stream",
      body: fs.createReadStream(filePath),
    };

    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    const fileId = uploadResponse.data.id;

    // Grant public download permission for Google Earth Web
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      fileId: fileId,
      fileName: fileName,
      downloadLink: downloadLink,
      webViewLink: uploadResponse.data.webViewLink,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Google Drive Upload Error:", error);
    throw error;
  }
};

module.exports = { uploadToDrive };