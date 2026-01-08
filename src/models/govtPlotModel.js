const db = require("../config/db");

const GovtPlot = {
  async create(data) {
    const sql = `
      INSERT INTO govt_plots (
        project_id,
        type,
        mouza,
        tahasil,
        thana_no,
        ri_circle,
        khata_no,
        kissam,
        name_of_ror,
        plot_no,

        total_area_acres,
        proposed_area_acres,
        total_area_hectares,
        proposed_area_hectares,

        lease_case_no,
        present_status,
        ua_idco_to_tahasildar,

        case_details,
        action_to_be_taken,

        ri_report,
        ri_report_attachment,

        proclamation,
        objection_received,

        others,
        modification_revision,

        misc_dr_case_prep,
        misc_dr_case_prep_number,

        reason_for_misc_dr_case,

        tree_enumeration,
        tree_enumeration_attachment,

        order_sheet_prep,

        lease_to_idco,
        lease_to_idco_attachment,

        lease_to_ua,
        lease_to_ua_attachment,

        remarks,
        is_deleted
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,
              ?,?,?,?,
              ?,?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,?,
              ?,0)
    `;

    const values = [
      data.project_id,
      data.type,
      data.mouza,
      data.tahasil,
      data.thana_no ?? null,
      data.ri_circle || null,
      data.khata_no || null,
      data.kissam || null,
      data.name_of_ror || null,
      data.plot_no,

      data.total_area_acres ?? null,
      data.proposed_area_acres ?? null,
      data.total_area_hectares ?? null,
      data.proposed_area_hectares ?? null,

      data.lease_case_no || null,
      data.present_status || null,
      data.ua_idco_to_tahasildar ?? null,

      data.case_details || null,
      data.action_to_be_taken || null,

      data.ri_report || null,
      data.ri_report_attachment || null,

      data.proclamation ?? null,
      data.objection_received ?? null,

      data.others || null,
      data.modification_revision ?? null,

      data.misc_dr_case_prep ?? null,
      data.misc_dr_case_prep_number || null,

      data.reason_for_misc_dr_case || null,

      data.tree_enumeration || null,
      data.tree_enumeration_attachment || null,

      data.order_sheet_prep || null,

      data.lease_to_idco ?? null,
      data.lease_to_idco_attachment || null,

      data.lease_to_ua ?? null,
      data.lease_to_ua_attachment || null,

      data.remarks || null,
    ];

    const [result] = await db.execute(sql, values);

    return {
      id: result.insertId,
      ...data,
    };
  },

  async findAll({ limit = 10, offset = 0 }) {
    const sql = `SELECT * FROM govt_plots
      WHERE is_deleted = 0
      ORDER BY id DESC
      LIMIT ? OFFSET ?`;

    const [rows] = await db.query(sql, [limit, offset]);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM govt_plots
      WHERE is_deleted = 0
    `;

    const [countRows] = await db.query(countSql);

    return {
      data: rows,
      total: countRows[0].total,
    };
  },
};

module.exports = GovtPlot;
