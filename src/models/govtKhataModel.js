const db = require("../config/db");

const GovtKhata = {
  async upsertFromExcel(rows, villageMap, project_id, type) {
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
        project_id,
        type,
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
      k.project_id,
      k.type,
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
        (project_id, type, khata_no, village_id, kissam_of_land, plot_no,
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
      WHERE (project_id, type, khata_no, village_id) IN (?)
      `,
      [values.map((v) => [v[0], v[1], v[2], v[3]])]
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

  async findAll({
    project_id,
    type,
    village_id,
    khata_no,
    limit = 10,
    offset = 0,
  }) {
    const where = [];
    const params = [];

    where.push("k.project_id = ?");
    params.push(project_id);

    where.push("k.type = ?");
    params.push(type);

    if (village_id) {
      where.push("k.village_id = ?");
      params.push(village_id);
    }

    const whereSql = where.length ? `WHERE ${where.join(" And ")}` : "";

    const dataSql = `
      SELECT
        k.*,
        v.village_name
        FROM govt_khata k
        LEFT JOIN villages v ON v.id = k.village_id
        ${whereSql}
        ORDER BY k.id DESC
        LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) AS total
      FROM govt_khata k
      LEFT JOIN villages v ON v.id = k.village_id
      ${whereSql}
    `;

    const [rows] = await db.query(dataSql, [...params, limit, offset]);
    const [countRows] = await db.query(countSql, params);

    return {
      data: rows,
      total: countRows[0].total,
    };
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM govt_khata WHERE id = ?`, [
      id,
    ]);
    return rows.length ? rows[0] : null;
  },

  async existsKhata({ project_id, type, village_id, khata_no, excludeId }) {
    const params = [project_id, type, village_id, khata_no];
    let sql = `
    SELECT id FROM govt_khata
    WHERE project_id = ?
      AND type = ?
      AND village_id = ?
      AND khata_no = ?
  `;

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await db.query(sql, params);
    return rows.length > 0;
  },

  async updateKhataById(id, data) {
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (!fields.length) {
      throw new Error("No data provided for update");
    }

    const sql = `
    UPDATE govt_khata
    SET ${fields.join(", ")},
        updated_at = NOW()
    WHERE id = ?
  `;

    await db.query(sql, [...values, id]);
    return this.findById(id);
  },

  async deleteKhataById(id) {
    await db.query(`DELETE FROM govt_khata WHERE id = ?`, [id]);
  },
};

module.exports = GovtKhata;
