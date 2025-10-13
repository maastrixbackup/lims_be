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

// const db = require("../config/db");

// const Khata = {
//   create: async (project_id, village_id, khata_no) => {
//     const [result] = await db.query(
//       "INSERT INTO khatas (project_id, village_id, khata_no) VALUES (?, ?, ?)",
//       [project_id, village_id, khata_no]
//     );
//     return { id: result.insertId, project_id, village_id, khata_no };
//   },

//   findAll: async () => {
//     const [rows] = await db.query(
//       `SELECT k.*, p.project_name, v.village_name
//        FROM khatas k
//        LEFT JOIN projects p ON k.project_id = p.id
//        LEFT JOIN villages v ON k.village_id = v.id
//        ORDER BY k.id DESC`
//     );
//     return rows;
//   },

//   findById: async (id) => {
//     const [rows] = await db.query("SELECT * FROM khatas WHERE id = ?", [id]);
//     return rows[0];
//   },

//   update: async (id, project_id, village_id, khata_no) => {
//     await db.query(
//       "UPDATE khatas SET project_id = ?, village_id = ?, khata_no = ? WHERE id = ?",
//       [project_id, village_id, khata_no, id]
//     );
//     return { id, project_id, village_id, khata_no };
//   },

//   delete: async (id) => {
//     await db.query("DELETE FROM khatas WHERE id = ?", [id]);
//   },
// };
