const db = require("../config/db");

const Village = {
  async create(
    village_name,
    tahasil,
    district,
    project_id,
    village_code,
    type
  ) {
    const [result] = await db.query(
      "INSERT INTO villages (village_name, tahasil, district, project_id, village_code, type) VALUES (?,?,?,?,?,?)",
      [village_name, tahasil, district, project_id, village_code, type]
    );
    return {
      id: result.insertId,
      village_name,
      tahasil,
      district,
      project_id,
      village_code,
      type,
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
        JOIN projects p ON v.project_id = p.id
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
    village_code,
    type,
    multiplying_factor
  ) {
    await db.query(
      "UPDATE villages SET village_name = ?, tahasil = ?, district = ?, project_id = ?, village_code = ?, type = ?, multiplying_factor = ?, updated_at = NOW() WHERE id = ?",
      [
        village_name,
        tahasil,
        district,
        project_id,
        village_code,
        type,
        multiplying_factor,
        id,
      ]
    );
    return {
      id,
      village_name,
      tahasil,
      district,
      project_id,
      village_code,
      type,
      multiplying_factor,
    };
  },

  async delete(id) {
    await db.query("DELETE FROM villages WHERE id = ?", [id]);
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

  async countAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM villages";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` WHERE project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async insertVillagesFromExcel(data, project_id, type) {
    if (!data || data.length === 0) return 0;

    const [existingVillages] = await db.query(
      `SELECT village_name, tahasil, village_code 
       FROM villages 
       WHERE project_id = ? AND type = ?`,
      [project_id, type]
    );

    const existingSet = new Set(
      existingVillages.map(
        (v) =>
          `${v.village_name?.trim().toLowerCase()}|${v.tahasil
            ?.trim()
            .toLowerCase()}`
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
      const villageCode = row["Village Code"]?.trim();
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

      if (!villageName || !villageCode || !tahasil) continue;

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
      const baseKey = `${villageName.toLowerCase()}|${tahasil.toLowerCase()}`;
      // const baseKey = `${villageCode.toLowerCase()}`;
      const uniqueKey = `${baseKey}|${thanaNo?.toLowerCase() || ""}`;

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
          village_name, village_code, tahasil, district, project_id, type
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [villageName, villageCode, tahasil, district, project_id, type]
      );

      insertedCount++;
    }

    return insertedCount;
  },
};

module.exports = Village;
