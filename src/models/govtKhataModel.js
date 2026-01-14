const db = require("../config/db");

const GovtKhata = {
  async upsertFromExcel(rows, villageMap) {
    const khataMap = new Map();

    // const yesNoToBool = (val) => {
    //   if (!val) return 0;
    //   return String(val).trim().toLowerCase() === "yes" ? 1 : 0;
    // };

    // const getPresentStatus = (row) => {
    //   if (yesNoToBool(row["lease case to sub-collector"])) return 1;
    //   if (yesNoToBool(row["lease case to adm (rev.sec)"])) return 2;
    //   if (yesNoToBool(row["demand raised"])) return 3;
    //   if (yesNoToBool(row["lease sanctioned by collector"])) return 4;
    //   return 0;
    // };

    const presentStatusMap = (val) => {
      if (!val) return null;
      const v = String(val).trim().toLowerCase();
      if (v.includes("sub-collector")) return 1;
      if (v.includes("adm")) return 2;
      if (v.includes("demand")) return 3;
      if (v.includes("sanction")) return 4;
      return null;
    };

    rows.forEach((r) => {
      if (!r["khata no"] || !r["mouza"]) return;

      const khataNo = String(r["khata no"]).trim();
      if (!khataNo) return;

      const villageKey = `${String(r["mouza"]).trim()}_${r["tahasil"] || null}`;
      const villageId = villageMap[villageKey];
      if (!villageId) return;

      const key = `${villageId}_${khataNo}`;

      khataMap.set(key, {
        khata_no: khataNo,
        village_id: villageId,
        kissam_of_land: r["kissam of land"] || null,
        plot_no: r["plot no"] || null,
        lease_case_no: r["lease case no"] || null,
        present_status: presentStatusMap(r["present status"]),
        case_details: r["case details/ deservation req."] || null,
      });
    });

    if (!khataMap.size) return {};

    const values = [...khataMap.values()].map((k) => [
      k.khata_no,
      k.village_id,
      k.kissam_of_land,
      k.plot_no,
      k.lease_case_no,
      k.present_status,
      k.case_details,
    ]);

    await db.query(
      `
      INSERT INTO govt_khata
        (khata_no, village_id, kissam_of_land, plot_no,
         lease_case_no, present_status, case_details)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        kissam_of_land = VALUES(kissam_of_land),
        plot_no = VALUES(plot_no),
        lease_case_no = VALUES(lease_case_no),
        present_status = VALUES(present_status),
        case_details = VALUES(case_details),
        updated_at = NOW()
      `,
      [values]
    );

    const [rowsInserted] = await db.query(
      `
      SELECT id, khata_no, village_id
      FROM govt_khata
      WHERE (khata_no, village_id) IN (?)
      `,
      [values.map((v) => [v[0], v[1]])]
    );

    const resultMap = {};
    rowsInserted.forEach((r) => {
      resultMap[`${r.village_id}_${r.khata_no}`] = r.id;
    });

    return resultMap;
  },

  async create(data) {
    const {
      project_id,
      type,
      khata_no,
      village_id,

      kissam_of_land,
      plot_no,
      lease_case_no,
      present_status,
      case_details,
    } = data;
    const [result] = await db.query(
      `INSERT INTO govt_khata(
        project_id,
        type,
        khata_no,
        village_id,
        kissam_of_land,
        plot_no,
        lease_case_no,
        present_status,
        case_details
      ) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        project_id,
        type,
        khata_no,
        village_id,
        kissam_of_land,
        plot_no,
        lease_case_no,
        present_status,
        case_details,
      ]
    );
    return {
      id: result.insertId,
      ...data,
    };
  },
};

module.exports = GovtKhata;
