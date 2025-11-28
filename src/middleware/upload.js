const multer = require("multer");
const path = require("path");

//Upload excel
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/excels");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
    // cb(null, Date.now() + path.extname(file.originalname));
  },
});

const excelFileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
};

const uploadPlotExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
});

//Upload profile pic
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pics");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
    // const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, uniqueName + path.extname(file.originalname));
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"), false);
};

const uploadProfilePic = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

//Upload khata
const KhataStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/khata");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
    // const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9);
    // cb(null, uniqueName + path.extname(file.originalname));
  },
});

const khataFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel or PDF files are allowed for Khata"), false);
  }
};

const uploadKhata = multer({
  storage: KhataStorage,
  fileFilter: khataFileFilter,
});

// Upload map document (KMZ files)
const mapStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/maps");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
  },
});

const mapFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.google-earth.kmz",
    "application/zip", // fallback MIME type for many KMZ uploads
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  // Additional check for extension (.kmz)
  if (allowedMimeTypes.includes(file.mimetype) || ext === ".kmz") {
    cb(null, true);
  } else {
    cb(new Error("Only KMZ map files are allowed"), false);
  }
};

const uploadMapDocument = multer({
  storage: mapStorage,
  fileFilter: mapFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = {
  uploadPlotExcel,
  uploadProfilePic,
  uploadKhata,
  uploadMapDocument,
};
