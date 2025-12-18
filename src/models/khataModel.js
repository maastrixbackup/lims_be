const db = require("../config/db");

const Khata = {
  async create(project_id, village_id, khata_no, type, unique_id) {
    const [result] = await db.query(
      "INSERT INTO khatas(project_id, village_id, khata_no, type, unique_id) VALUES (?,?,?,?,?)",
      [project_id, village_id, khata_no, type, unique_id]
    );
    return {
      id: result.insertId,
      project_id,
      village_id,
      khata_no,
      type,
      unique_id,
    };
  },

  async existsByUniqueId(unique_id) {
    const [rows] = await db.query(
      "SELECT id FROM khatas WHERE unique_id = ? LIMIT 1",
      [unique_id]
    );
    return rows.length > 0;
  },

  // async findAll({
  //   project_id = null,
  //   village_id = null,
  //   type = null,
  //   limit = 10,
  //   offset = 0,
  // }) {
  //   let query = `
  //       SELECT k.*, p.project_name, v.village_name,
  //       (
  //         SELECT COUNT(*)
  //         FROM plots
  //         WHERE plots.khata_no = k.khata_no
  //         AND plots.project_id = k.project_id
  //       ) AS plot_count,
  //         pl.village_name,
  //         pl.village_code,
  //         pl.khata_no,
  //         pl.plot_no,
  //         pl.kissam_of_land,
  //         pl.land_category,
  //         pl.land_area_total_acres,
  //         pl.land_area_total_hectares,
  //         pl.land_area_acquired_acres,
  //         pl.land_area_acquired_hectares,
  //         pl.lo13_remarks,
  //         pl.tahasil_name,
  //         pl.ri_circle_name,
  //         pl.thana_no,
  //         pl.date_of_award,
  //         pl.name_of_recorded_tenant,
  //         pl.name_of_present_tenant,
  //         pl.present_address,
  //         pl.displaced_affected_person
  //       FROM khatas k
  //       LEFT JOIN projects p ON k.project_id = p.id
  //       LEFT JOIN villages v ON k.village_id = v.id
  //       LEFT JOIN plots pl
  //       ON pl.id = (
  //           SELECT MIN(id)
  //           FROM plots
  //           WHERE khata_no = k.khata_no
  //           AND project_id = k.project_id
  //           AND type = k.type
  //       )
  //       WHERE 1=1
  //   `;
  //   const params = [];
  //   if (project_id) {
  //     query += " AND k.project_id = ?";
  //     params.push(project_id);
  //   }
  //   // if (village_id) {
  //   //   query += " AND k.village_id = ?";
  //   //   params.push(village_id);
  //   // }
  //   if (village_id && Array.isArray(village_id)) {
  //     const placeholders = village_id.map(() => "?").join(",");
  //     query += ` AND k.village_id IN (${placeholders})`;
  //     params.push(...village_id);
  //   }
  //   if (type) {
  //     query += " AND k.type = ?";
  //     params.push(type);
  //   }
  //   query += " ORDER BY k.id DESC LIMIT ? OFFSET ?";
  //   params.push(limit, offset);
  //   const [rows] = await db.query(query, params);
  //   return rows;
  // },

  async findAll({
    project_id = null,
    village_id = null,
    type = null,
    limit = 10,
    offset = 0,
  }) {
    let query = `
    SELECT 
      MIN(k.id) AS id,
      MIN(k.unique_id) AS unique_id,
      MIN(k.project_id) AS project_id,
      MIN(k.village_id) AS village_id,
      MIN(k.khata_no) AS khata_no,
      MIN(k.type) AS type,
      MIN(k.created_at) AS created_at,
      MIN(k.updated_at) AS updated_at,

      MIN(p.project_name) AS project_name,
      MIN(v.village_name) AS village_name,
      MIN(v.village_code) AS village_code,

      COUNT(DISTINCT pl.id) AS plot_count,
      (SELECT COUNT(*)
        FROM khata_documents kd
        WHERE kd.khata_id = k.id
      ) AS khata_document_count,

      (SELECT COUNT(*)
        FROM khata_map_documents km
        WHERE km.khata_id = k.id
      ) AS khata_map_document_count,

      SUM(pl.land_area_total_acres) AS land_area_total_acres,
      SUM(pl.land_area_total_hectares) AS land_area_total_hectares,
      SUM(pl.land_area_acquired_acres) AS land_area_acquired_acres,
      SUM(pl.land_area_acquired_hectares) AS land_area_acquired_hectares,

      GROUP_CONCAT(pl.plot_no SEPARATOR ', ') AS plot_no,
      GROUP_CONCAT(pl.kissam_of_land SEPARATOR ', ') AS kissam_of_land,
      GROUP_CONCAT(pl.land_category SEPARATOR ', ') AS land_category,
      MIN(pl.lo13_remarks) AS lo13_remarks,
      MIN(pl.tahasil_name) AS tahasil_name,
      GROUP_CONCAT(pl.ri_circle_name SEPARATOR ', ') AS ri_circle_name,

      MIN(pl.thana_no) AS thana_no,
      MIN(pl.date_of_award) AS date_of_award,
      CASE 
          WHEN MIN(pl.name_of_recorded_tenant) = MAX(pl.name_of_recorded_tenant)
          THEN MIN(pl.name_of_recorded_tenant)
          ELSE GROUP_CONCAT(DISTINCT pl.name_of_recorded_tenant SEPARATOR ', ')
      END AS name_of_recorded_tenant,

      CASE 
          WHEN MIN(pl.name_of_present_tenant) = MAX(pl.name_of_present_tenant)
          THEN MIN(pl.name_of_present_tenant)
          ELSE GROUP_CONCAT(DISTINCT pl.name_of_present_tenant SEPARATOR ', ')
      END AS name_of_present_tenant,
      MIN(pl.present_address) AS present_address,
      MIN(pl.displaced_affected_person) AS displaced_affected_person
 
    FROM khatas k
    LEFT JOIN projects p ON k.project_id = p.id
    LEFT JOIN villages v ON k.village_id = v.id
 
    LEFT JOIN plots pl
      ON pl.khata_no = k.khata_no
      AND pl.project_id = k.project_id
      AND pl.type = k.type
 
    WHERE 1=1
  `;

    const params = [];

    if (project_id) {
      query += " AND k.project_id = ?";
      params.push(project_id);
    }

    if (village_id && Array.isArray(village_id)) {
      const placeholders = village_id.map(() => "?").join(",");
      query += ` AND k.village_id IN (${placeholders})`;
      params.push(...village_id);
    }

    if (type) {
      query += " AND k.type = ?";
      params.push(type);
    }

    query += `
    GROUP BY k.id
    ORDER BY k.id DESC
    LIMIT ? OFFSET ?
  `;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },
  async paginationCountAll({
    project_id = null,
    village_id = null,
    type = null,
  }) {
    let query = `
    SELECT COUNT(*) AS total
    FROM khatas
    WHERE 1=1
  `;

    const params = [];

    if (project_id) {
      query += " AND project_id = ?";
      params.push(project_id);
    }

    // if (village_id) {
    //   query += " AND village_id = ?";
    //   params.push(village_id);
    // }
    if (village_id && Array.isArray(village_id)) {
      const placeholders = village_id.map(() => "?").join(",");
      query += ` AND village_id IN (${placeholders})`;
      params.push(...village_id);
    }

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM khatas WHERE id = ?", [id]);
    // return rows[0];
    return rows[0] || null;
  },

  async getKhataByNumber(khata_no) {
    const [rows] = await db.query(
      `SELECT * FROM khatas WHERE khata_no = ? LIMIT 1`,
      [khata_no]
    );
    return rows[0];
  },

  async update(id, project_id, village_id, khata_no, type) {
    await db.query(
      "UPDATE khatas SET project_id = ?, village_id = ?, khata_no = ?, type = ?, updated_at = NOW() WHERE id = ?",
      [project_id, village_id, khata_no, type, id]
    );
    return { id, project_id, village_id, khata_no, type };
  },

  async delete(id) {
    await db.query("DELETE FROM khatas WHERE ID = ?", [id]);
  },

  async uploadKhataDocument(
    khata_id,
    unique_id,
    file_name,
    type,
    document_type
  ) {
    const [result] = await db.query(
      "INSERT INTO khata_documents(khata_id, unique_id, file_name, type, document_type) VALUES (?,?,?,?,?)",
      [khata_id, unique_id, file_name, type, document_type]
    );
    return result;
  },

  async getFilesByKhataId(khata_id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE khata_id = ? ORDER BY created_at DESC",
      [khata_id]
    );
    return rows;
  },

  async findFileById(id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async deleteFileById(file_id) {
    const [result] = await db.query(
      "DELETE FROM khata_documents WHERE id = ?",
      [file_id]
    );
    return result.affectedRows > 0;
  },

  async insertKhatasFromExcel(data, project_id, type) {
    const [project] = await db.query(
      "SELECT client_code FROM projects WHERE id = ?",
      [project_id]
    );
    if (!project.length) throw new Error("Invalid project_id");
    const clientCode = project[0].client_code;

    for (const row of data) {
      // const villageName = row["Name of Village"];
      // const khataNo = row["Khata No."];
      // if (!villageName || !khataNo) continue;
      const villageName =
        row["Name of Village"]?.trim() ||
        row["name of village"]?.trim() ||
        null;
      // const khataNo =
      //   row["Khata No."] !== undefined && row["Khata No."] !== null
      //     ? row["Khata No."].toString().trim()
      //     : null;
      const khataNo =
        (row["Khata No."] || row["Khata No"])?.toString().trim() || null;

      const tahasil =
        row["Name of the Tahasil"]?.trim() ||
        row["Tahasil/Thana"]?.trim() ||
        null;

      if (!villageName || !khataNo || !tahasil) continue;

      // const [village] = await db.query(
      //   "SELECT id, village_code FROM villages WHERE village_name = ?",
      //   [villageName]
      // );
      // if (!village.length) continue;
      const [village] = await db.query(
        "SELECT id, village_code FROM villages WHERE village_name = ? AND tahasil = ? AND project_id = ?",
        [villageName, tahasil, project_id]
      );
      if (!village.length) continue;

      const village_id = village[0].id;
      const village_code = village[0].village_code;
      const unique_id = `${clientCode}/${village_code}/${khataNo}`;

      await db.query(
        `INSERT INTO khatas (unique_id, project_id, village_id, khata_no, type)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         project_id = VALUES(project_id),
         village_id = VALUES(village_id),
         khata_no = VALUES(khata_no),
         type = VALUES(type)`,
        [unique_id, project_id, village_id, khataNo, type]
      );
    }
  },

  // async countAll(projectId = null) {
  //   let query = "SELECT COUNT(*) AS total FROM khatas";
  //   let params = [];

  //   if (projectId) {
  //     query += " WHERE project_id = ?";
  //     params.push(projectId);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  async countAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM khatas";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` WHERE project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async addMapDocument(khata_id, land_type, file_name) {
    return db.query(
      `INSERT INTO khata_map_documents (khata_id, land_type, file_name)
     VALUES (?, ?, ?)`,
      [khata_id, land_type, file_name]
    );
  },

  async getMapDocumentsByKhataId(khata_id) {
    const [rows] = await db.query(
      `SELECT id, khata_id, land_type, file_name, created_at
      FROM khata_map_documents
      WHERE khata_id = ?
      ORDER BY id DESC`,
      [khata_id]
    );
    return rows;
  },
};

module.exports = Khata;
