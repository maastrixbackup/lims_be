const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

//Upload pvt khata
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

// const khataFileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     "application/pdf",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only Excel or PDF files are allowed for Khata"), false);
//   }
// };

const khataFileFilter = (req, file, cb) => {
  cb(null, true);
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

// Upload payment proof
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/land_cost_payments");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
  },
});

const paymentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF or image files (jpg, jpeg, png) are allowed"),
      false
    );
  }
};

const uploadLandCostPayment = multer({
  storage: paymentStorage,
  fileFilter: paymentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload govt payment proof
const govtPaymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/govt_land_cost_payments");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
  },
});

const govtPaymentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF or image files (jpg, jpeg, png) are allowed"),
      false
    );
  }
};

const uploadGovtLandCostPayment = multer({
  storage: govtPaymentStorage,
  fileFilter: govtPaymentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const govtPlotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/govt_plots");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    // cb(null, originalname);
    // OR if you want unique name:
    cb(null, Date.now() + "_" + originalname);
  },
});

const govtPlotFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files are allowed"), false);
  }
};

const uploadGovtPlotAttachments = multer({
  storage: govtPlotStorage,
  fileFilter: govtPlotFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const govtPlotExcelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/govt_plot_excels");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
    // OR if you want unique:
    // cb(null, Date.now() + "_" + originalname);
  },
});

const govtPlotExcelFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xls, .xlsx) are allowed"), false);
  }
};

const uploadGovtPlotExcel = multer({
  storage: govtPlotExcelStorage,
  fileFilter: govtPlotExcelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const forestLandExcelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/forest_land_excels";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
  },
});

const forestLandExcelFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xls, .xlsx) are allowed"), false);
  }
};

const uploadForestLandExcel = multer({
  storage: forestLandExcelStorage,
  fileFilter: forestLandExcelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

//Upload Govt khata
const GovtKhataStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/govt_khata");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
    // const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9);
    // cb(null, uniqueName + path.extname(file.originalname));
  },
});

const GovtkhataFileFilter = (req, file, cb) => {
  cb(null, true);
};

const uploadGovtKhata = multer({
  storage: GovtKhataStorage,
  fileFilter: GovtkhataFileFilter,
});

//upload govt map document (KMZ files)
const govtMapStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/govt_maps");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, originalname);
  },
});

const govtMapFileFilter = (req, file, cb) => {
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

const uploadGovtMapDocument = multer({
  storage: govtMapStorage,
  fileFilter: govtMapFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// const EDSStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/eds");
//   },
//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/\s+/g, "_");
//     const uniqueName = Date.now() + "_" + safeName;
//     cb(null, uniqueName);
//   },
// });

// const edsFileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Only PDF or Excel files are allowed for EDS document"),
//       false
//     );
//   }
// };

// const uploadEDS = multer({
//   storage: EDSStorage,
//   fileFilter: edsFileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 MB
//   },
// });

const edsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/eds");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + originalname);
  },
});

const edsFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/JPG/PNG files allowed"), false);
  }
};

const uploadEdsDocuments = multer({
  storage: edsStorage,
  fileFilter: edsFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
const stageZeroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/stage0");
  },
  filename: (req, file, cb) => {
    const name =
      Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, name);
  },
});

const uploadStage0 = multer({
  storage: stageZeroStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const stage1Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/stage1");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + originalname);
  },
});

const stage1FileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/zip",
    "image/png",
    "image/jpeg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const uploadStage1 = multer({
  storage: stage1Storage,
  fileFilter: stage1FileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const stage2Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/stage2");
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    const unique =
      Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, unique + "_" + cleanName);
  },
});

const stage2FileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/zip",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const uploadStage2 = multer({
  storage: stage2Storage,
  fileFilter: stage2FileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/post_clearance");
  },
  filename: (req, file, cb) => {
    const clean = file.originalname.replace(/\s+/g, "_");
    const unique =
      Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, unique + "_" + clean);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const uploadPostClearance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = {
  uploadPlotExcel,
  uploadProfilePic,
  uploadKhata,
  uploadMapDocument,
  uploadLandCostPayment,
  uploadGovtLandCostPayment,
  uploadGovtPlotAttachments,
  uploadGovtPlotExcel,
  uploadForestLandExcel,
  uploadGovtKhata,
  uploadGovtMapDocument,
  // uploadEDS,
  uploadEdsDocuments,
  uploadStage0,
  uploadStage1,
  uploadStage2,
  uploadPostClearance
};
