const db = require("../config/db");

const ForestLand = {
  async create(data) {
    const sql = `
      INSERT INTO forest_land_schedule
      (
        project_master_id,
        schedule_type,
        district,
        ri_circle,
        tahasil,
        village,
        forest_division,
        forest_range,
        khata_no,
        plot_no,
        kisam,
        forest_category_id,
        ownership,
        fra_allotted,
        total_area_ha,
        proposed_acquired_area_ha,
        digital_area_ha,
        ca_area_ha,
        patch_name,
        remarks
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      data.project_master_id,
      data.schedule_type,
      data.district,
      data.ri_circle,
      data.tahasil,
      data.village,
      data.forest_division,
      data.forest_range,
      data.khata_no,
      data.plot_no,
      data.kisam,
      data.forest_category_id,
      data.ownership,
      data.fra_allotted,
      data.total_area_ha,
      data.proposed_acquired_area_ha,
      data.digital_area_ha,
      data.ca_area_ha,
      data.patch_name,
      data.remarks,
    ];

    const [result] = await db.query(sql, values);
    const [rows] = await db.query(
      `SELECT * FROM forest_land_schedule WHERE id = ?`,
      [result.insertId],
    );
    return rows[0];
  },

  async findById(id) {
    const sql = `
      SELECT * FROM forest_land_schedule
      WHERE id = ? AND is_active = 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  async update(id, data) {
    const sql = `
    UPDATE forest_land_schedule
    SET ?
    WHERE id = ?
    `;
    const [result] = await db.query(sql, [data, id]);
    return result.affectedRows;
  },

  async softDelete(id) {
    const sql = `
    UPDATE forest_land_schedule
    SET is_active = 0
    WHERE id = ?
    `;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  },
};

module.exports = ForestLand;
