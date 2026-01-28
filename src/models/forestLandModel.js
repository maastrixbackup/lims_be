const db = require("../config/db");

const emptyToNull = (value) => {
  if (value === "" || value === undefined) return null;
  return value;
};
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
      emptyToNull(data.district),
      emptyToNull(data.ri_circle),
      emptyToNull(data.tahasil),
      emptyToNull(data.village),
      emptyToNull(data.forest_division),
      emptyToNull(data.forest_range),
      emptyToNull(data.khata_no),
      emptyToNull(data.plot_no),
      emptyToNull(data.kisam),
      emptyToNull(data.forest_category_id),
      emptyToNull(data.ownership),
      emptyToNull(data.fra_allotted),
      emptyToNull(data.total_area_ha),
      emptyToNull(data.proposed_acquired_area_ha),
      emptyToNull(data.digital_area_ha),
      emptyToNull(data.ca_area_ha),
      emptyToNull(data.patch_name),
      emptyToNull(data.remarks),
    ];

    const [result] = await db.query(sql, values);
    const [rows] = await db.query(
      `SELECT * FROM forest_land_schedule WHERE id = ?`,
      [result.insertId],
    );
    return rows[0];
  },

  // async findById(id) {
  //   const sql = `
  //     SELECT * FROM forest_land_schedule
  //     WHERE id = ? AND is_active = 1
  //   `;
  //   const [rows] = await db.query(sql, [id]);
  //   return rows[0];
  // },

  async list({ project_master_id, schedule_type, limit, offset }) {
    let whereClause = `WHERE project_master_id = ? AND is_deleted = 0`;
    const params = [project_master_id];

    if (schedule_type) {
      whereClause += ` AND schedule_type = ?`;
      params.push(schedule_type);
    }

    const listSql = `
      SELECT *
      FROM forest_land_schedule
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM forest_land_schedule
      ${whereClause}
    `;

    const [rows] = await db.query(listSql, [...params, limit, offset]);
    const [[count]] = await db.query(countSql, params);

    return {
      data: rows,
      total: count.total,
    };
  },

  async update(id, data) {
    const sql = `
    UPDATE forest_land_schedule
    SET
      project_master_id = ?,
      schedule_type = ?,
      district = ?,
      ri_circle = ?,
      tahasil = ?,
      village = ?,
      forest_division = ?,
      forest_range = ?,
      khata_no = ?,
      plot_no = ?,
      kisam = ?,
      forest_category_id = ?,
      ownership = ?,
      fra_allotted = ?,
      total_area_ha = ?,
      proposed_acquired_area_ha = ?,
      digital_area_ha = ?,
      ca_area_ha = ?,
      patch_name = ?,
      remarks = ?
    WHERE id = ? AND is_deleted = 0
  `;

    const values = [
      data.project_master_id,
      data.schedule_type,
      emptyToNull(data.district),
      emptyToNull(data.ri_circle),
      emptyToNull(data.tahasil),
      emptyToNull(data.village),
      emptyToNull(data.forest_division),
      emptyToNull(data.forest_range),
      emptyToNull(data.khata_no),
      emptyToNull(data.plot_no),
      emptyToNull(data.kisam),
      emptyToNull(data.forest_category_id),
      emptyToNull(data.ownership),
      emptyToNull(data.fra_allotted),
      emptyToNull(data.total_area_ha),
      emptyToNull(data.proposed_acquired_area_ha),
      emptyToNull(data.digital_area_ha),
      emptyToNull(data.ca_area_ha),
      emptyToNull(data.patch_name),
      emptyToNull(data.remarks),
      id,
    ];

    const [result] = await db.query(sql, values);

    // If no row updated
    if (result.affectedRows === 0) {
      return null;
    }

    // Fetch updated row
    const [rows] = await db.query(
      `SELECT * FROM forest_land_schedule WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  async softDelete(id) {
    const sql = `
      UPDATE forest_land_schedule
      SET is_deleted = 1
      WHERE id = ? AND is_deleted = 0
    `;

    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return null;
    }

    return { id };
  },

  async getAbstract(project_master_id = null) {
    let whereClause = `WHERE is_deleted = 0`;
    const params = [];

    if (project_master_id) {
      whereClause += ` AND project_master_id = ?`;
      params.push(project_master_id);
    }

    const sql = `
    SELECT
      schedule_type,
      COALESCE(SUM(total_area_ha), 0) AS total_area,
      COALESCE(SUM(proposed_acquired_area_ha), 0) AS proposed_area,
      COALESCE(SUM(digital_area_ha), 0) AS digital_area
    FROM forest_land_schedule
    ${whereClause}
    GROUP BY schedule_type
  `;

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async createForestProject(data) {
    const sql = `
      INSERT INTO forest_project_master (
        project_id,
        proposal_no,
        project_name,
        user_agency,
        sector,
        state,
        district,
        tahasil,
        mouza,
        range_division,
        forest_type,
        total_project_area_ha,
        forest_area_ha,
        non_forest_area_ha,
        project_status,
        current_stage,
        eds_flag,
        eds_document_path
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      data.project_id,
      emptyToNull(data.proposal_no),
      data.project_name,
      emptyToNull(data.user_agency),
      emptyToNull(data.sector),
      emptyToNull(data.state),
      emptyToNull(data.district),
      emptyToNull(data.tahasil),
      emptyToNull(data.mouza),
      emptyToNull(data.range_division),
      emptyToNull(data.forest_type),
      emptyToNull(data.total_project_area_ha),
      emptyToNull(data.forest_area_ha),
      emptyToNull(data.non_forest_area_ha),
      emptyToNull(data.project_status),
      emptyToNull(data.current_stage),
      emptyToNull(data.eds_flag),
      emptyToNull(data.eds_document_path),
    ];

    const [result] = await db.query(sql, values);

    const [rows] = await db.query(
      `SELECT * FROM forest_project_master WHERE id = ?`,
      [result.insertId]
    );

    return rows[0];
  },

  async listForestProjects({ limit, offset, project_id }) {
    // let whereClause = `WHERE 1=1`;
    let whereClause = `WHERE is_deleted = 0`;
    const params = [];

    if (project_id) {
      whereClause += ` AND project_id = ?`;
      params.push(project_id);
    }

    const listSql = `
    SELECT
      id,
      project_id,
      proposal_no,
      project_name,
      user_agency,
      sector,
      state,
      district,
      tahasil,
      mouza,
      range_division,
      forest_type,
      total_project_area_ha,
      forest_area_ha,
      non_forest_area_ha,
      project_status,
      current_stage,
      eds_flag,
      eds_document_path,
      is_deleted,
      created_date,
      updated_date
    FROM forest_project_master
    ${whereClause}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

    const countSql = `
    SELECT COUNT(*) AS total
    FROM forest_project_master
    ${whereClause}
  `;

    const [rows] = await db.query(listSql, [...params, limit, offset]);
    const [[count]] = await db.query(countSql, params);

    return {
      data: rows,
      total: count.total,
    };
  },

  async getForestProjectById(id) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM forest_project_master
      WHERE id = ? AND is_deleted = 0
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  },

  async updateForestProject(id, data) {
    const sql = `
    UPDATE forest_project_master
    SET
      proposal_no = ?,
      project_name = ?,
      user_agency = ?,
      sector = ?,
      state = ?,
      district = ?,
      tahasil = ?,
      mouza = ?,
      range_division = ?,
      forest_type = ?,
      total_project_area_ha = ?,
      forest_area_ha = ?,
      non_forest_area_ha = ?,
      project_status = ?,
      current_stage = ?,
      eds_flag = ?,
      eds_document_path = ?
    WHERE id = ? AND is_deleted = 0
  `;

    const values = [
      data.proposal_no,
      data.project_name,
      data.user_agency,
      data.sector,
      data.state,
      data.district,
      data.tahasil,
      data.mouza,
      data.range_division,
      data.forest_type,
      data.total_project_area_ha,
      data.forest_area_ha,
      data.non_forest_area_ha,
      data.project_status,
      data.current_stage,
      data.eds_flag,
      data.eds_document_path,
      id,
    ];

    await db.query(sql, values);

    const [rows] = await db.query(
      `SELECT * FROM forest_project_master WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  async deleteForestProject(projectId) {
    const sql = `
    UPDATE forest_project_master
    SET is_deleted = 1,
        updated_date = NOW()
    WHERE id = ?
  `;

    const [result] = await db.query(sql, [projectId]);
    return result;
  },

};

module.exports = ForestLand;
