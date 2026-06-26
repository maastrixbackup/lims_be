const Report = require("../models/reportModel");

const DOCUMENT_TYPES = [
  "Order Sheet",
  "Notice by GMDC",
  "Attendance Sheet",
  "Consent Form",
  "Genealogy Sheet",
  "Legal Heir Certificate",
  "Yadast Register Copy",
  "Self-Attested RoR",
  "Certified Copy of RoR",
  "Patta Original",
  "Encumbrance Certificate",
  "Rent Receipt",
  "Trace Map",
  "Application to Claim for Land Compensation",
  "Calculation of Compensation",
  "Form 9A + Sample Photo (if any)",
  "Form 9B + Sample Photo (if any)",
  "Form 9C + Sample Photo (if any)",
  "Land Acquisition Award",
  "Indemnity Bond",
  "Physical Possession Certificate (Bond Paper)",
  "Apportionment Affidavit (if applicable)",
  "Affidavit for Legal Issues (if any)",
  "Aadhaar / Voter Card Copy",
  "PAN Proof",
  "Bank Passbook / Cancelled Cheque Copy",
  "Electronic Fund Transfer Form",
  "Receipt of Compensation",
  "Payment Voucher",
  "Photo of Physical Possession",
];

async function khataSummary(req, res) {
  try {
    const data = await Report.khataSummary();

    return res.status(200).json({
      success: true,
      message: "Khata summary fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Khata Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function getAllKhataDocuments(req, res) {
  try {
    const docs = await Report.getAllKhataDocuments();

    if (docs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No khata documents found",
        data: [],
      });
    }
    // Base URL logic (add /api only on server)
    const prefix = req.get("host").includes("localhost") ? "" : "/api";
    const baseUrl = `${req.protocol}://${req.get("host")}${prefix}`;

    const grouped = {};
    docs.forEach((doc) => {
      if (!grouped[doc.khata_id]) {
        grouped[doc.khata_id] = {
          khata_id: doc.khata_id,
          khata_no: doc.khata_no,
          uploaded_documents: [],
          missing_documents: [],
        };
      }

      grouped[doc.khata_id].uploaded_documents.push({
        document_type: doc.document_type,
        file_name: doc.file_name,
        url: `${req.protocol}://${req.get("host")}${
          req.get("host").includes("localhost") ? "" : "/api"
        }/uploads/khata/${doc.file_name}`,
        uploaded_at: doc.created_at,
      });
    });

    // Add missing documents for each khata
    Object.values(grouped).forEach((item) => {
      const uploaded = item.uploaded_documents.map((d) => d.document_type);

      item.missing_documents = DOCUMENT_TYPES.filter(
        (d) => !uploaded.includes(d)
      );
      item.missing_documents_indicator = item.missing_documents.length > 0;
    });
    return res.status(200).json({
      success: true,
      message: "Khata documents fetched successfully",
      total_khatas: Object.keys(grouped).length,
      data: Object.values(grouped),
    });
  } catch (err) {
    console.error("Fetch All Khata Docs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function getVillageReport(req, res) {
  try {
    const villages = await Report.getAllVillages();
    const finalReport = [];
    for (const v of villages) {
      const village_name = v.village_name;
      const villagePlots = await Report.getVillagePlots(village_name);
      if (villagePlots.length === 0) {
        continue;
      }

      const khata_numbers = await Report.getKhataNumbers(village_name);
      const plot_numbers = await Report.getPlotNumbers(village_name);
      const total_land_area = await Report.getTotalLandArea(village_name);
      const land_breakup = await Report.getLandTypeBreakup(village_name);

      finalReport.push({
        village_name,
        khata_numbers,
        plot_numbers,
        total_land_area_acres: total_land_area,
        private_govt_land: land_breakup,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Village report fetched successfully",
      total_villages: finalReport.length,
      data: finalReport,
    });
  } catch (err) {
    console.error("Village Report Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = {
  khataSummary,
  getAllKhataDocuments,
  getVillageReport,
};
