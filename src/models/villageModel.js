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

  async findAll({ project_id = null, district = null, tahasil = null }) {
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
    query += " ORDER BY v.id DESC";

    const [rows] = await db.query(query, params);
    return rows;
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
    type
  ) {
    await db.query(
      "UPDATE villages SET village_name = ?, tahasil = ?, district = ?, project_id = ?, village_code = ?, type = ?, updated_at = NOW() WHERE id = ?",
      [village_name, tahasil, district, project_id, village_code, type, id]
    );
    return {
      id,
      village_name,
      tahasil,
      district,
      project_id,
      village_code,
      type,
    };
  },

  async delete(id) {
    await db.query("DELETE FROM villages WHERE id = ?", [id]);
  },

  async countAll() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM villages");
    return rows[0].total;
  },

  async insertVillagesFromExcel(data, project_id, type) {
    if (!data || data.length === 0) return 0;

    const [existingVillages] = await db.query(
      `SELECT village_name, tahasil, village_code 
       FROM villages 
       WHERE project_id = ?`,
      [project_id]
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
      const villageName = row["Name of Village"]?.trim();
      const villageCode = row["Village Code"]?.trim();
      const tahasil = row["Name of the Tahasil"]?.trim();
      const thanaNo = row["Thana No."]?.trim(); // only used for comparison

      if (!villageName || !villageCode || !tahasil) continue;

      // Key for matching existing data
      const baseKey = `${villageName.toLowerCase()}|${tahasil.toLowerCase()}`;
      const uniqueKey = `${baseKey}|${thanaNo?.toLowerCase() || ""}`;

      // ✅ Check duplicates in DB
      if (existingSet.has(baseKey)) {
        // Village + Tahasil already exists in DB → maybe same thana or not
        // We can’t distinguish since thana is not stored — so skip inserting again
        continue;
      }

      // ✅ Check duplicates within the same Excel upload
      if (uploadedSet.has(uniqueKey)) {
        continue;
      }

      // ✅ Mark as uploaded
      uploadedSet.add(uniqueKey);

      // ✅ Insert into DB
      await db.query(
        `INSERT INTO villages (
          village_name, village_code, tahasil, project_id, type
        ) VALUES (?, ?, ?, ?, ?)`,
        [villageName, villageCode, tahasil, project_id, type]
      );

      insertedCount++;
    }

    return insertedCount;
  },
};

module.exports = Village;
