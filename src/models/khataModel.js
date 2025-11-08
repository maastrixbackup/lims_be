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

  async findAll({ project_id = null, village_id = null }) {
    let query = `
        SELECT k.*, p.project_name, v.village_name
        FROM khatas k
        LEFT JOIN projects p ON k.project_id = p.id
        LEFT JOIN villages v ON k.village_id = v.id
        WHERE 1=1
    `;
    const params = [];
    if (project_id) {
      query += " AND k.project_id = ?";
      params.push(project_id);
    }
    if (village_id) {
      query += " AND k.village_id = ?";
      params.push(village_id);
    }
    query += " ORDER BY k.id DESC";
    const [rows] = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM khatas WHERE id = ?", [id]);
    // return rows[0];
    return rows[0] || null;
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
};

module.exports = Khata;
