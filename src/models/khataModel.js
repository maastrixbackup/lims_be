const db = require("../config/db");

const Khata = {
  async create(project_id, village_id, khata_no) {
    const [result] = await db.query(
      "INSERT INTO khatas(project_id, village_id, khata_no) VALUES (?,?,?)",
      [project_id, village_id, khata_no]
    );
    return { id: result.insertId, project_id, village_id, khata_no };
  },
};

module.exports = Khata;
