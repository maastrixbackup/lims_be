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

        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        market_value_per_acre,
        bench_market_value,
        premium,
        ground_rent,
        cess,
        admin_charges,
        total_cost,

        legal_heir_case_no,
        land_case_no,
        land_case_date,
        land_case_type,
        land_case_status,
        land_case_details,
        
        remarks,
        is_deleted
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,
              ?,?,?,?,?,?,?,?,?,?,?,
              ?,?,?,?,?,?,
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

      data.land_area_total_acres ?? null,
      data.land_area_total_hectares ?? null,
      data.land_area_acquired_acres ?? null,
      data.land_area_acquired_hectares ?? null,
      data.market_value_per_acre ?? null,
      data.bench_market_value ?? null,
      data.premium ?? null,
      data.ground_rent ?? null,
      data.cess ?? null,
      data.admin_charges ?? null,
      data.total_cost ?? null,

      data.legal_heir_case_no ?? null,
      data.land_case_no ?? null,
      data.land_case_date ?? null,
      data.land_case_type ?? null,
      data.land_case_status ?? null,
      data.land_case_details ?? null,

      data.remarks || null,
    ];

    const [result] = await db.execute(sql, values);

    return {
      id: result.insertId,
      ...data,
    };
  },

  async insertDocument(data) {
    const sql = `
      INSERT IGNORE INTO govt_plot_documents
      (project_id, type, filename, original_filename, file_path, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.project_id,
      data.type,
      data.filename,
      data.original_filename,
      data.file_path,
      data.uploaded_by,
    ];

    const [result] = await db.query(sql, params);
    return result.insertId;
  },

  // async findAll({ project_id, type, limit = 10, offset = 0 }) {
  //   const sql = `SELECT * FROM govt_plots
  //     WHERE is_deleted = 0
  //     AND project_id = ${project_id}
  //     AND type = ?
  //     ORDER BY id DESC
  //     LIMIT ? OFFSET ?`;

  //   const [rows] = await db.query(sql, [project_id, type, limit, offset]);

  //   const countSql = `
  //     SELECT COUNT(*) AS total
  //     FROM govt_plots
  //     WHERE is_deleted = 0
  //     AND project_id = ${project_id}
  //     AND type = ?
  //   `;

  //   const [countRows] = await db.query(countSql, [project_id, type]);

  //   return {
  //     data: rows,
  //     total: countRows[0].total,
  //   };
  // },

  // async bulkInsertFromExcel(rows, project_id, type) {
  //   const values = rows.map((r) => [
  //     project_id,
  //     type,
  //     r["Mouza"] || null,
  //     r["Tahasil"] || null,
  //     r["Thana No"] || null,
  //     r["RI Circle"] || null,
  //     r["Khata No"] || null,
  //     r["Kissam"] || null,
  //     r["Name of ROR"] || null,
  //     r["Plot No"] || null,

  //     r["Total Area (Acre)"] || null,
  //     r["Proposed Area (Acre)"] || null,
  //     r["Total Area (Hectare)"] || null,
  //     r["Proposed Area (Hectare)"] || null,

  //     r["Lease Case No"] || null,
  //     r["Present Status"] || 0,

  //     yesNoToBit(r["UA /IDCO to Tahasildar"]),
  //     r["Action to be taken"] || null,

  //     r["RI Report"] || null,

  //     yesNoToBit(r["Proclamation"]),
  //     yesNoToBit(r["Objection Received"]),

  //     r["Others"] || null,
  //     r["Modification/Revision"] || null,

  //     yesNoToBit(r["Mising Case Prep./ DR Case. Prep."]),
  //     r["Mising Case Prep./ DR Case. Prep. Number"] || null,
  //     r["Reason for Misc/DR case"] || null,

  //     r["Tree Enumeration"] || null,

  //     yesNoToBit(r["Order Sheet Prep."]),
  //     yesNoToBit(r["Lease to IDCO"]),
  //     yesNoToBit(r["Lease to  UA"]),

  //     r["Remarks"] || null,
  //   ]);

  //   const sql = `
  //   INSERT INTO govt_plots (
  //     project_id, type, mouza, tahasil, thana_no, ri_circle,
  //     khata_no, kissam, name_of_ror, plot_no,

  //     total_area_acres, proposed_area_acres,
  //     total_area_hectares, proposed_area_hectares,

  //     lease_case_no, present_status,

  //     ua_idco_to_tahasildar,
  //     action_to_be_taken,

  //     ri_report,

  //     proclamation,
  //     objection_received,

  //     others,
  //     modification_revision,

  //     misc_dr_case_prep,
  //     misc_dr_case_prep_number,
  //     reason_for_misc_dr_case,

  //     tree_enumeration,

  //     order_sheet_prep,
  //     lease_to_idco,
  //     lease_to_ua,

  //     remarks
  //   ) VALUES ?
  // `;

  //   await db.query(sql, [values]);
  // },

  // async bulkInsertFromExcel(rows, project_id, type) {
  //   const yesNoToBool = (val) => {
  //     if (!val) return 0;
  //     return String(val).toLowerCase() === "yes" ? 1 : 0;
  //   };

  //   const getPresentStatus = (row) => {
  //     if (yesNoToBool(row["lease case to sub-collector"])) return 1;
  //     if (yesNoToBool(row["lease case to adm (rev.sec)"])) return 2;
  //     if (yesNoToBool(row["demand raised"])) return 3;
  //     if (yesNoToBool(row["lease sanctioned by collector"])) return 4;
  //     return 0;
  //   };
  //   const values = rows.map((r) => [
  //     project_id,
  //     type,
  //     r["mouza"],
  //     r["tahasil"],
  //     r["thana no"],
  //     r["ri"],
  //     r["khata no"],
  //     r["name of khata"],
  //     r["plot no"],

  //     r["total area (in acres)"],
  //     r["proposed area (in acres)"],

  //     r["lease case no"],
  //     getPresentStatus(r),

  //     r["case details/ deservation req."],
  //     r["action to be taken"],

  //     yesNoToBool(r["ua /idco to tahasildar"]),
  //     r["ri report"],
  //     yesNoToBool(r["proclamation"]),
  //     yesNoToBool(r["objection received"]),
  //     r["others"],
  //     r["modification/ revision"],

  //     yesNoToBool(r["mising case prep."]) || yesNoToBool(r["dr case. prep."]),

  //     r["tree enumeration"],
  //     yesNoToBool(r["order sheet prep."]),
  //     yesNoToBool(r["lease to idco"]),
  //     yesNoToBool(r["lease to ua"]),
  //   ]);

  //   await db.query(
  //     `
  //   INSERT INTO govt_plots (
  //     project_id, type, mouza, tahasil, thana_no, ri_circle,
  //     khata_no, name_of_ror, plot_no,
  //     total_area_acres, proposed_area_acres,
  //     lease_case_no, present_status,
  //     case_details, action_to_be_taken,
  //     ua_idco_to_tahasildar,
  //     ri_report, proclamation, objection_received,
  //     others, modification_revision,
  //     misc_dr_case_prep,
  //     tree_enumeration,
  //     order_sheet_prep,
  //     lease_to_idco, lease_to_ua
  //   ) VALUES ?
  //   `,
  //     [values]
  //   );
  // },

  // async bulkInsertFromExcel(rows, project_id, type) {
  //   const yesNoToBool = (val) => {
  //     if (!val) return 0;
  //     return String(val).trim().toLowerCase() === "yes" ? 1 : 0;
  //   };

  //   const getPresentStatus = (row) => {
  //     if (yesNoToBool(row["lease case to sub-collector"])) return 1;
  //     if (yesNoToBool(row["lease case to adm (rev.sec)"])) return 2;
  //     if (yesNoToBool(row["demand raised"])) return 3;
  //     if (yesNoToBool(row["lease sanctioned by collector"])) return 4;
  //     return 0;
  //   };

  //   const validRows = rows.filter((r) => {
  //     const khata = r["khata no"];
  //     return (
  //       khata !== undefined && khata !== null && String(khata).trim() !== ""
  //     );
  //   });

  //   if (!validRows.length) return 0;
  //   const values = validRows.map((r) => [
  //     project_id,
  //     type,
  //     r["mouza"] || null,
  //     r["tahasil"] || null,
  //     r["thana no"] || null,
  //     r["ri"] || null,
  //     r["khata no"] || null,
  //     r["name of khata"] || null,
  //     r["plot no"] || null,

  //     r["total area (in acres)"] || null,
  //     r["proposed area (in acres)"] || null,

  //     r["lease case no"] || null,
  //     getPresentStatus(r),

  //     r["case details/ deservation req."] || null,
  //     r["action to be taken"] || null,

  //     yesNoToBool(r["ua /idco to tahasildar"]),
  //     r["ri report"] || null,
  //     yesNoToBool(r["proclamation"]),
  //     yesNoToBool(r["objection received"]),
  //     r["others"] || null,
  //     r["modification/ revision"] || null,

  //     yesNoToBool(r["mising case prep."]) || yesNoToBool(r["dr case. prep."]),

  //     r["tree enumeration"] || null,
  //     yesNoToBool(r["order sheet prep."]),
  //     yesNoToBool(r["lease to idco"]),
  //     yesNoToBool(r["lease to ua"]),
  //   ]);

  //   if (!values.length) return;

  //   await db.query(
  //     `
  //   INSERT INTO govt_plots (
  //     project_id, type, mouza, tahasil, thana_no, ri_circle,
  //     khata_no, name_of_ror, plot_no,
  //     total_area_acres, proposed_area_acres,
  //     lease_case_no, present_status,
  //     case_details, action_to_be_taken,
  //     ua_idco_to_tahasildar,
  //     ri_report, proclamation, objection_received,
  //     others, modification_revision,
  //     misc_dr_case_prep,
  //     tree_enumeration,
  //     order_sheet_prep,
  //     lease_to_idco, lease_to_ua
  //   )
  //   VALUES ?
  //   ON DUPLICATE KEY UPDATE
  //     total_area_acres = VALUES(total_area_acres),
  //     proposed_area_acres = VALUES(proposed_area_acres),
  //     lease_case_no = VALUES(lease_case_no),
  //     present_status = VALUES(present_status),
  //     case_details = VALUES(case_details),
  //     action_to_be_taken = VALUES(action_to_be_taken),
  //     ua_idco_to_tahasildar = VALUES(ua_idco_to_tahasildar),
  //     ri_report = VALUES(ri_report),
  //     proclamation = VALUES(proclamation),
  //     objection_received = VALUES(objection_received),
  //     others = VALUES(others),
  //     modification_revision = VALUES(modification_revision),
  //     misc_dr_case_prep = VALUES(misc_dr_case_prep),
  //     tree_enumeration = VALUES(tree_enumeration),
  //     order_sheet_prep = VALUES(order_sheet_prep),
  //     lease_to_idco = VALUES(lease_to_idco),
  //     lease_to_ua = VALUES(lease_to_ua),
  //     updated_at = NOW()
  //   `,
  //     [values]
  //   );
  // },

  async findAll({ project_id, type, limit = 10, offset = 0 }) {
    const sql = `
    SELECT *
    FROM govt_plots
    WHERE is_deleted = 0
      AND project_id = ?
      AND type = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

    const [rows] = await db.query(sql, [project_id, type, limit, offset]);

    const countSql = `
    SELECT COUNT(*) AS total
    FROM govt_plots
    WHERE is_deleted = 0
      AND project_id = ?
      AND type = ?
  `;

    const [countRows] = await db.query(countSql, [project_id, type]);

    return {
      data: rows,
      total: countRows[0].total,
    };
  },

  async findAllDocuments({ project_id, type }) {
    let sql = `
      SELECT
        id,
        project_id,
        type,
        original_filename,
        filename,
        created_at
      FROM govt_plot_documents
      WHERE 1 = 1
    `;

    const params = [];

    if (project_id) {
      sql += ` AND project_id = ?`;
      params.push(project_id);
    }

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findDocumentByFilename(filename) {
    const sql = `
    SELECT
      filename,
      original_filename,
      file_path
    FROM govt_plot_documents
    WHERE filename = ?
    LIMIT 1
  `;

    const [rows] = await db.query(sql, [filename]);
    return rows[0];
  },

  async bulkInsertFromExcel(rows, project_id, type) {
    const yesNoToBool = (val) => {
      if (!val) return 0;
      return String(val).trim().toLowerCase() === "yes" ? 1 : 0;
    };

    const enumStatus = (val) => {
      if (!val) return null;
      const v = String(val).trim().toLowerCase();
      if (v === "not started") return "Not Started";
      if (v === "in progress") return "In Progress";
      if (v === "complete") return "Complete";
      return null;
    };

    const presentStatusMap = (val) => {
      if (!val) return null;
      const v = String(val).trim().toLowerCase();
      if (v.includes("sub-collector")) return 1;
      if (v.includes("adm")) return 2;
      if (v.includes("demand")) return 3;
      if (v.includes("sanction")) return 4;
      return null;
    };

    const validRows = rows.filter((r) => {
      const khata = r["khata no"];
      const plot = r["plot no"];
      return (
        khata !== undefined &&
        khata !== null &&
        String(khata).trim() !== "" &&
        plot !== undefined &&
        plot !== null &&
        String(plot).trim() !== ""
      );
    });

    if (!validRows.length) return 0;

    const values = validRows.map((r) => [
      project_id,
      type,
      r["mouza"] || null,
      r["tahasil"] || null,
      r["thana no"] || null,
      r["ri circle"] || null,
      r["khata no"] || null,
      r["kissam"] || null,
      r["name of ror"] || null,
      r["plot no"] || null,

      r["total area (in acres)"] || null,
      r["proposed area (in acres)"] || null,
      r["total area (in hectares)"] || null,
      r["proposed area (in hectares)"] || null,

      r["lease case no"] || null,
      presentStatusMap(r["present status"]),

      yesNoToBool(r["ua /idco to tahasildar"]),
      r["case details/ deservation req."] || null,
      r["action to be taken"] || null,

      enumStatus(r["ri report (1)"]),
      null, // ri_report_attachment

      yesNoToBool(r["proclamation"]),
      yesNoToBool(r["objection received"]),
      r["others"] || null,
      yesNoToBool(r["modification/revision"]),

      yesNoToBool(r["mising case prep./ dr case. prep."]),
      r["mising case prep./ dr case. prep. number"] || null,
      r["reason for misc/dr case"] || null,

      enumStatus(r["tree enumeration"]),
      null, // tree_enumeration_attachment

      enumStatus(r["order sheet prep."]),

      yesNoToBool(r["lease to idco"]),
      null, // lease_to_idco_attachment

      yesNoToBool(r["lease to ua"]),
      null, // lease_to_ua_attachment

      r["remarks"] || null,
    ]);

    await db.query(
      `
    INSERT INTO govt_plots (
      project_id, type, mouza, tahasil, thana_no, ri_circle,
      khata_no, kissam, name_of_ror, plot_no,
      total_area_acres, proposed_area_acres,
      total_area_hectares, proposed_area_hectares,
      lease_case_no, present_status,
      ua_idco_to_tahasildar,
      case_details, action_to_be_taken,
      ri_report, ri_report_attachment,
      proclamation, objection_received, others,
      modification_revision,
      misc_dr_case_prep, misc_dr_case_prep_number,
      reason_for_misc_dr_case,
      tree_enumeration, tree_enumeration_attachment,
      order_sheet_prep,
      lease_to_idco, lease_to_idco_attachment,
      lease_to_ua, lease_to_ua_attachment,
      remarks
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      total_area_acres = VALUES(total_area_acres),
      proposed_area_acres = VALUES(proposed_area_acres),
      total_area_hectares = VALUES(total_area_hectares),
      proposed_area_hectares = VALUES(proposed_area_hectares),
      lease_case_no = VALUES(lease_case_no),
      present_status = VALUES(present_status),
      ua_idco_to_tahasildar = VALUES(ua_idco_to_tahasildar),
      case_details = VALUES(case_details),
      action_to_be_taken = VALUES(action_to_be_taken),
      ri_report = VALUES(ri_report),
      proclamation = VALUES(proclamation),
      objection_received = VALUES(objection_received),
      others = VALUES(others),
      modification_revision = VALUES(modification_revision),
      misc_dr_case_prep = VALUES(misc_dr_case_prep),
      misc_dr_case_prep_number = VALUES(misc_dr_case_prep_number),
      reason_for_misc_dr_case = VALUES(reason_for_misc_dr_case),
      tree_enumeration = VALUES(tree_enumeration),
      order_sheet_prep = VALUES(order_sheet_prep),
      lease_to_idco = VALUES(lease_to_idco),
      lease_to_ua = VALUES(lease_to_ua),
      remarks = VALUES(remarks),
      updated_at = NOW()
    `,
      [values]
    );

    return values.length;
  },

  async govtPlotDelete(id) {
    const [result] = await db.query(
      `UPDATE govt_plots SET is_deleted = 1 WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return result.affectedRows;
  },

  async findByPk(id) {
    const [rows] = await db.query(
      `SELECT * FROM govt_plots WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    return rows.length ? rows[0] : null;
  },

  async updateById(id, data) {
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (!fields.length) {
      throw new Error("No data provided for update");
    }

    const sql = `
      UPDATE govt_plots
      SET ${fields.join(", ")},
          updated_at = NOW()
      WHERE id = ? AND is_deleted = 0
    `;

    await db.query(sql, [...values, id]);

    return this.findByPk(id);
  },
};

module.exports = GovtPlot;
