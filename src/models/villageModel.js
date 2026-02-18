const db = require("../config/db");

const Village = {
  async create(
    village_name,
    tahasil,
    district,
    project_id,
    type,
    thana_name_no
  ) {
    const [result] = await db.query(
      "INSERT INTO villages (village_name, tahasil, district, project_id, type, thana_name_no) VALUES (?,?,?,?,?,?)",
      [village_name, tahasil, district, project_id, type, thana_name_no]
    );
    return {
      id: result.insertId,
      village_name,
      tahasil,
      district,
      project_id,
      type,
      thana_name_no
    };
  },

  async findAll({
    project_id = null,
    district = null,
    tahasil = null,
    type = null,
    limit,
    offset,
  }) {
    let query = `
        SELECT v.*,p.project_name
        FROM villages v
        LEFT JOIN projects p ON v.project_id = p.id
        WHERE 1=1
        `;

    const params = [];
    if (project_id) {
      query += " AND v.project_id = ?";
      params.push(project_id);
    }

    if (district) {
      query += " AND v.district LIKE ?";
      params.push(`%${district}%`);
    }

    if (tahasil) {
      query += " AND v.tahasil LIKE ?";
      params.push(`%${tahasil}%`);
    }

    if (type) {
      query += " AND v.type = ?";
      params.push(type);
    }
    query += " ORDER BY v.id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    // query += " ORDER BY v.id DESC";

    // const [rows] = await db.query(query, params);
    return rows;
  },

  async paginationCountAll({
    project_id = null,
    district = null,
    tahasil = null,
    type = null,
  }) {
    let query = `
      SELECT COUNT(*) AS total
      FROM villages v
      WHERE 1=1
    `;

    const params = [];

    if (project_id) {
      query += " AND v.project_id = ?";
      params.push(project_id);
    }

    if (district) {
      query += " AND v.district LIKE ?";
      params.push(`%${district}%`);
    }

    if (tahasil) {
      query += " AND v.tahasil LIKE ?";
      params.push(`%${tahasil}%`);
    }

    if (type) {
      query += " AND v.type = ?";
      params.push(type);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM villages WHERE id = ?", [id]);
    return rows[0];
  },

  async update(
    id,
    village_name,
    tahasil,
    district,
    project_id,
    type,
    multiplying_factor,
    thana_name_no
  ) {
    await db.query(
      "UPDATE villages SET village_name = ?, tahasil = ?, district = ?, project_id = ?, type = ?, multiplying_factor = ?, thana_name_no = ?, updated_at = NOW() WHERE id = ?",
      [
        village_name,
        tahasil,
        district,
        project_id,
        type,
        multiplying_factor,
        thana_name_no,
        id,
      ]
    );
    return {
      id,
      village_name,
      tahasil,
      district,
      project_id,
      type,
      multiplying_factor,
      thana_name_no
    };
  },

  async delete(id) {
    await db.query("DELETE FROM villages WHERE id = ?", [id]);
  },

  async findVillageName(project_id, type) {
    const [rows] = await db.query(
      "SELECT id,village_name FROM villages WHERE project_id = ? AND type = ?",
      [project_id, type]
    );
    return rows;
  },

  async checkVillageExists(project_id, type, village_name) {
    const [rows] = await db.query(
      `SELECT id 
     FROM villages 
     WHERE project_id = ? 
       AND type = ? 
       AND village_name = ?
     LIMIT 1`,
      [project_id, type, village_name.trim()]
    );
    return rows.length > 0;
  },

  // async countAll(projectId = null) {
  //   let query = "SELECT COUNT(*) AS total FROM villages";
  //   let params = [];

  //   if (projectId) {
  //     query += " WHERE project_id = ?";
  //     params.push(projectId);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  // async countAll(projectIds = null) {
  //   let query = "SELECT COUNT(*) AS total FROM villages";
  //   let params = [];

  //   if (Array.isArray(projectIds) && projectIds.length > 0) {
  //     const placeholders = projectIds.map(() => "?").join(",");
  //     query += ` WHERE project_id IN (${placeholders})`;
  //     params.push(...projectIds);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  async pvtCountAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM villages WHERE type = 1";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async govtCountAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM villages WHERE type = 2";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async forestCountAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM villages WHERE type = 3";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async insertVillagesFromExcel(data, project_id, type) {
    if (!data || data.length === 0) return 0;

    const [existingVillages] = await db.query(
      `SELECT village_name, tahasil 
       FROM villages 
       WHERE project_id = ? AND type = ?`,
      [project_id, type]
    );

    const existingSet = new Set(
      existingVillages.map(
        (v) =>
          `${v.village_name?.trim().toLowerCase()}`
      )
    );

    // To track duplicates within current Excel upload
    const uploadedSet = new Set();

    let insertedCount = 0;

    for (const row of data) {
      // const villageName = row["Name of Village"]?.trim();
      const villageName =
        row["Name of Village"]?.trim() ||
        row["name of village"]?.trim() ||
        null;
      // const villageCode = row["Village Code"]?.trim();
      // const tahasil = row["Name of the Tahasil"]?.trim();
      const tahasil =
        row["Name of the Tahasil"]?.trim() ||
        row["Tahasil/Thana"]?.trim() ||
        null;
      // const thanaNo =
      //   row["Thana No."]?.trim() || row["Thana no"]?.trim() || null;
      const thanaNoRaw = row["Thana No."] ?? row["Thana no"];
      const thanaNo =
        thanaNoRaw !== undefined && thanaNoRaw !== null
          ? thanaNoRaw.toString().trim()
          : null;
      const presentAddress = row["Present Address"] || null;

      // if (!villageName || !tahasil) continue;
      if (!villageName) continue;

      let district = null;
      if (presentAddress) {
        const distMatch = presentAddress.match(/Dist[-: ]+([A-Za-z\s]+)/i);
        if (distMatch && distMatch[1]) {
          district = distMatch[1].trim() || null;
        }
      } else {
        district = null;
      }

      // Key for matching existing data
      const baseKey = `${villageName.toLowerCase()}`;
      // const baseKey = `${villageCode.toLowerCase()}`;
      const uniqueKey = baseKey;
      // const uniqueKey = `${baseKey}|${thanaNo?.toLowerCase() || ""}`;

      // Skip if already exists in DB
      if (existingSet.has(baseKey)) {
        continue;
      }

      // Skip duplicates within the same Excel file
      if (uploadedSet.has(uniqueKey)) {
        continue;
      }

      // Mark as uploaded
      uploadedSet.add(uniqueKey);

      // Insert into DB
      await db.query(
        `INSERT INTO villages (
          village_name, tahasil, district, project_id, type
        ) VALUES (?, ?, ?, ?, ?)`,
        [villageName, tahasil, district, project_id, type]
      );

      insertedCount++;
    }

    return insertedCount;
  },

  async insertVillageForManualPlot(plot, project_id, type) {
    if (!plot || !plot.village_name || !plot.tahasil_name) {
      return null;
    }

    const normalize = (v) =>
      v === null || v === undefined ? null : v.toString().trim();

    const villageName = normalize(plot.village_name);
    const villageCode = normalize(plot.village_code);
    const tahasil = normalize(plot.tahasil_name);
    const thanaNo = normalize(plot.thana_no);
    const presentAddress = normalize(plot.present_address);

    if (!villageName || !tahasil) return null;

    // Extract district
    let district = null;
    if (presentAddress) {
      const match = presentAddress.match(/Dist[-: ]+([A-Za-z\s]+)/i);
      district = match?.[1]?.trim() || null;
    }

    // Check if village already exists
    const [existing] = await db.query(
      `SELECT id
     FROM villages
     WHERE village_name = ?
       AND tahasil = ?
       AND project_id = ?
       AND type = ?`,
      [plot.village_name, plot.tahasil_name, project_id, type]
    );

    // Village already exists
    if (existing.length > 0) {
      return existing[0].id;
    }

    // Insert new village
    const [result] = await db.query(
      `INSERT IGNORE INTO villages
     (village_name, village_code, tahasil, district, project_id, type)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [
        plot.village_name,
        plot.village_code || null,
        plot.tahasil_name,
        null,
        project_id,
        type,
      ]
    );

    return result.insertId;
  },

  async getTahasilList(district, type) {
    let query = `SELECT DISTINCT tahasil FROM villages WHERE tahasil IS NOT NULL AND type = ?
    `;
    const params = [type];
    if (district) {
      query += ` AND district = ?`;
      params.push(district);
    }

    query += ` ORDER BY tahasil ASC`;
    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = Village;
