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

  async bulkInsertFromExcel(rows, project_master_id, schedule_type) {
    if (!rows || rows.length === 0) return 0;

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
      VALUES ?
    `;

    const values = rows.map((data) => [
      project_master_id,
      schedule_type,
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
    ]);

    const [result] = await db.query(sql, [values]);
    return result.affectedRows || 0;
  },

  async findById(id) {
    const sql = `
      SELECT *
      FROM forest_land_schedule
      WHERE id = ? AND is_deleted = 0
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

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
        project_category,
        project_sub_category,
        project_nature,
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
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      data.project_id,
      emptyToNull(data.proposal_no),
      data.project_name,
      emptyToNull(data.user_agency),
      emptyToNull(data.project_category),
      emptyToNull(data.project_sub_category),
      emptyToNull(data.project_nature),
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

  // async createEds(data) {
  //   const sql = `
  //   INSERT INTO forest_eds_master (
  //     project_master_id,
  //     eds_ref_no,
  //     issuing_authority,
  //     eds_issue_date,
  //     eds_due_date,
  //     total_issues,
  //     issues_closed,
  //     issues_pending,
  //     eds_reply_document,
  //     eds_status
  //   )
  //   VALUES (?,?,?,?,?,?,?,?,?,?)
  // `;

  //   await db.query(sql, [
  //     data.project_master_id,
  //     data.eds_ref_no,
  //     data.issuing_authority,
  //     data.eds_issue_date,
  //     data.eds_due_date,
  //     data.total_issues,
  //     data.issues_closed,
  //     data.issues_pending,
  //     data.eds_reply_document,
  //     data.eds_status,
  //   ]);
  // },


  async createEds(data) {
    const sql = `
    INSERT INTO forest_eds_master (
      project_master_id,
      eds_ref_no,
      issuing_authority,
      eds_issue_date,
      eds_due_date,
      total_issues,
      issues_closed,
      issues_pending,
      eds_reply_document,
      eds_status
    )
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

    const values = [
      // 1,
      data.project_master_id,
      data.eds_ref_no,
      data.issuing_authority,
      data.eds_issue_date,
      data.eds_due_date,
      data.total_issues,
      data.issues_closed,
      data.issues_pending,
      data.eds_reply_document,
      data.eds_status,
    ];

    console.log("EDS INSERT VALUES:", values); // 🔥 debug

    await db.query(sql, values);
  },

  async getProjectByProjectId(projectId) {
    const [rows] = await db.query(
      `SELECT * FROM forest_project_master WHERE project_id = ?`,
      [projectId]
    );
    return rows[0] || null;
  },


  async updateForestProject(id, data) {
    const sql = `
    UPDATE forest_project_master
    SET
      proposal_no = ?,
      project_name = ?,
      user_agency = ?,
      project_category = ?,
      project_sub_category = ?,
      project_nature = ?,
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
      eds_flag = ?
    WHERE id = ?
  `;

    await db.query(sql, [
      data.proposal_no,
      data.project_name,
      data.user_agency,
      data.project_category,
      data.project_sub_category,
      data.project_nature,
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
      id,
    ]);
  },


  async deleteEdsByMasterId(masterId) {
    await db.query(
      `DELETE FROM forest_eds_master WHERE project_master_id = ?`,
      [masterId]
    );
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
      project_category,
      project_sub_category,
      project_nature,   
      user_agency,
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
      project_category = ?,
      project_sub_category = ?,
      project_nature = ?,
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
      data.project_category,
      data.project_sub_category,
      data.project_nature,
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

  async getProjectWithEds(projectId) {
    const [masterRows] = await db.query(
      `SELECT * FROM forest_project_master WHERE project_id = ? AND is_deleted = 0`,
      [projectId]
    );

    if (!masterRows.length) return null;

    const master = masterRows[0];

    const [edsRows] = await db.query(
      `SELECT * FROM forest_eds_master 
     WHERE project_master_id = ? AND is_deleted = 0
     ORDER BY id ASC`,
      [master.id]
    );

    return {
      master,
      eds_list: edsRows,
    };
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

  async createStage0(payload) {
    const [result] = await db.query(
      "INSERT INTO forest_stage_0 SET ?",
      [payload]
    );

    const [rows] = await db.query(
      "SELECT * FROM forest_stage_0 WHERE id = ?",
      [result.insertId]
    );
    return rows[0];
  },

  async updateStage0(forestProjectId, data) {
    const updateSql = `UPDATE forest_stage_0 SET ? WHERE forest_project_id = ? AND is_deleted = 0`;
    const [result] = await db.query(updateSql, [data, forestProjectId]);

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await db.query(
      `SELECT * FROM forest_stage_0 WHERE forest_project_id = ? AND is_deleted = 0`,
      [forestProjectId]
    );

    return rows[0] || null;
  },

  async insertUpdateStage1(data) {
    const [existing] = await db.query(
      `SELECT id FROM forest_stage_1 
       WHERE forest_project_id = ? AND is_deleted = 0`,
      [data.forest_project_id]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE forest_stage_1 SET ? WHERE forest_project_id = ?`,
        [data, data.forest_project_id]
      );
    } else {
      await db.query(`INSERT INTO forest_stage_1 SET ?`, [data]);
    }

    const [rows] = await db.query(
      `SELECT * FROM forest_stage_1 WHERE forest_project_id = ?`,
      [data.forest_project_id]
    );

    return rows[0];
  },

  async createStage2(data) {
    const sql = `
    INSERT INTO forest_stage_2 (
      forest_project_id,
      environmental_clearance,
      environmental_document,
      nbwl_clearance,
      nbwl_document,
      final_ca_execution,
      final_ca_document,
      final_maps_approved,
      final_maps_document,
      final_technical_approval,
      final_technical_document,
      stage2_approval_letter,
      stage2_approval_document,
      stage2_approval_date,
      approved_forest_area_ha,
      approved_non_forest_area_ha,
      stage2_status,
      eligible_post_clearance
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

    const values = [
      data.forest_project_id,
      data.environmental_clearance,
      data.environmental_document,
      data.nbwl_clearance,
      data.nbwl_document,
      data.final_ca_execution,
      data.final_ca_document,
      data.final_maps_approved,
      data.final_maps_document,
      data.final_technical_approval,
      data.final_technical_document,
      data.stage2_approval_letter,
      data.stage2_approval_document,
      data.stage2_approval_date,
      data.approved_forest_area_ha,
      data.approved_non_forest_area_ha,
      data.stage2_status,
      data.eligible_post_clearance,
    ];

    const [result] = await db.query(sql, values);

    const [rows] = await db.query(
      `SELECT * FROM forest_stage_2 WHERE id = ?`,
      [result.insertId]
    );

    return rows[0];
  },

  async updateStage2(forestProjectId, data) {
    const updateSql = `UPDATE forest_stage_2 SET ? WHERE forest_project_id = ? AND is_deleted = 0`;
    const [result] = await db.query(updateSql, [data, forestProjectId]);

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await db.query(
      `SELECT * FROM forest_stage_2 WHERE forest_project_id = ? AND is_deleted = 0`,
      [forestProjectId]
    );

    return rows[0] || null;
  },

  async createPostClearance(data) {
    const sql = `
    INSERT INTO forest_post_clearance (
      forest_project_id,
      ca_plantation_started,
      ca_plantation_started_document,
      ca_plantation_completed,
      ca_plantation_completed_document,
      survival_report_submitted,
      survival_report_document,
      wildlife_mitigation,
      wildlife_mitigation_document,
      safety_zone_maintained,
      safety_zone_document,
      periodic_compliance_submitted,
      periodic_compliance_type,
      inspection_observations,
      inspection_remarks,
      post_clearance_status
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

    const values = [
      data.forest_project_id,
      data.ca_plantation_started,
      data.ca_plantation_started_document,
      data.ca_plantation_completed,
      data.ca_plantation_completed_document,
      data.survival_report_submitted,
      data.survival_report_document,
      data.wildlife_mitigation,
      data.wildlife_mitigation_document,
      data.safety_zone_maintained,
      data.safety_zone_document,
      data.periodic_compliance_submitted,
      data.periodic_compliance_type,
      data.inspection_observations,
      data.inspection_remarks,
      data.post_clearance_status,
    ];

    const [result] = await db.query(sql, values);

    const [rows] = await db.query(
      `SELECT * FROM forest_post_clearance WHERE id = ?`,
      [result.insertId]
    );

    return rows[0];
  },

  async updatePostClearance(forestProjectId, data) {
    const updateSql = `UPDATE forest_post_clearance SET ? WHERE forest_project_id = ? AND is_deleted = 0`;
    const [result] = await db.query(updateSql, [data, forestProjectId]);

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await db.query(
      `SELECT * FROM forest_post_clearance WHERE forest_project_id = ? AND is_deleted = 0`,
      [forestProjectId]
    );

    return rows[0] || null;
  },

  async getStage0ByProjectId(forestProjectId) {
    const [rows] = await db.query(
      `SELECT * FROM forest_stage_0 WHERE forest_project_id = ? AND is_deleted = 0 LIMIT 1`,
      [forestProjectId]
    );
    return rows[0] || null;
  },

  async getStage1ByProjectId(forestProjectId) {
    const [rows] = await db.query(
      `SELECT * FROM forest_stage_1 WHERE forest_project_id = ? AND is_deleted = 0 LIMIT 1`,
      [forestProjectId]
    );
    return rows[0] || null;
  },

  async getStage2ByProjectId(forestProjectId) {
    const [rows] = await db.query(
      `SELECT * FROM forest_stage_2 WHERE forest_project_id = ? AND is_deleted = 0 LIMIT 1`,
      [forestProjectId]
    );
    return rows[0] || null;
  },

  async getPostClearanceByProjectId(forestProjectId) {
    const [rows] = await db.query(
      `SELECT * FROM forest_post_clearance WHERE forest_project_id = ? AND is_deleted = 0 LIMIT 1`,
      [forestProjectId]
    );
    return rows[0] || null;
  },

  async getStageStatus(projectId, stage) {
    let sql = "";
    let statusColumn = "";

    //table based on stage
    if (stage === "Stage 0") {
      sql = `
      SELECT stage_0_status AS status
      FROM forest_stage_0
      WHERE forest_project_id = ? AND is_deleted = 0
      LIMIT 1
    `;
    } else if (stage === "Stage 1") {
      sql = `
      SELECT stage1_status AS status
      FROM forest_stage_1
      WHERE forest_project_id = ? AND is_deleted = 0
      LIMIT 1
    `;
    } else if (stage === "Stage 2") {
      sql = `
      SELECT stage2_status AS status
      FROM forest_stage_2
      WHERE forest_project_id = ? AND is_deleted = 0
      LIMIT 1
    `;
    } else {
      return null;
    }

    const [rows] = await db.query(sql, [projectId]);

    return rows.length ? rows[0].status : null;
  },

  async getDashboardSummary() {

    // TOTAL PROJECTS
    const [[totalProjects]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_project_master
    WHERE is_deleted = 0
  `);

    // ACTIVE PROJECTS
    const [[activeProjects]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_project_master
    WHERE project_status = 'Active'
    AND is_deleted = 0
  `);

    // COMPLETED PROJECTS
    const [[completedProjects]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_project_master
    WHERE project_status = 'Completed'
    AND is_deleted = 0
  `);

    //Post-Clearance Ongoing
    const [[postClearanceOngoing]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_post_clearance
    WHERE post_clearance_status = 'Ongoing'
    AND is_deleted = 0
  `);

    // STAGE 0 READY
    const [[stage0Ready]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_0
    WHERE stage_0_status = 'Ongoing'
    AND is_deleted = 0
  `);

    const [[stage0NotReady]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_0
    WHERE stage_0_status = 'NOT READY'
    AND is_deleted = 0
  `);

    // STAGE 1 STATUS
    const [[stage1Completed]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_1
    WHERE stage1_status = 'Completed'
    AND is_deleted = 0
  `);

    const [[stage1InProgress]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_1
    WHERE stage1_status = 'In Progress'
    AND is_deleted = 0
  `);

    const [[stage1Delayed]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_1
    WHERE stage1_status = 'Delayed'
    AND is_deleted = 0
  `);

    // STAGE 2 STATUS
    const [[stage2Granted]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_2
    WHERE stage2_status = 'Granted'
    AND is_deleted = 0
  `);

    const [[stage2InProcess]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_stage_2
    WHERE stage2_status = 'Not Granted'
    AND is_deleted = 0
  `);

    // EDS RAISED
    const [[edsRaised]] = await db.query(`
    SELECT COUNT(DISTINCT project_master_id) AS total
    FROM forest_eds_master
    WHERE is_deleted = 0
  `);

    // EDS PENDING
    const [[edsPending]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM forest_eds_master
    WHERE eds_status = 'Open'
    AND is_deleted = 0
  `);

    return {
      total_projects: totalProjects.total,
      active_projects: activeProjects.total,
      completed_projects: completedProjects.total,
      post_clearance_ongoing: postClearanceOngoing.total,

      stage0_ready: stage0Ready.total,
      stage0_not_ready: stage0NotReady.total,

      stage1_completed: stage1Completed.total,
      stage1_in_progress: stage1InProgress.total,
      stage1_delayed: stage1Delayed.total,

      stage2_granted: stage2Granted.total,
      stage2_in_process: stage2InProcess.total,

      mining_projects: 0,
      linear_projects: 0,
      utility_projects: 0,
      hydel_irrigation_projects: 0,
      defence_strategic_projects: 0,
      projects_90_ready: 0,
      projects_60_89: 0,
      projects_60: 0,

      eds_raised: edsRaised.total,
      eds_pending: edsPending.total,

      npv_payment_pending: 0,
      ca_land_issue_pending: 0,
      fra_compliance_pending: 0,
      ec_nbwl_pending: 0
    };
  },

};

module.exports = ForestLand;
