const db = require("../config/db");

let govtPlotIndexInitializationPromise = null;

const ensureGovtPlotProjectScopedUniqueKey = async () => {
  if (!govtPlotIndexInitializationPromise) {
    govtPlotIndexInitializationPromise = (async () => {
      const [indexRows] = await db.query(
        `
          SELECT
            INDEX_NAME,
            NON_UNIQUE,
            SEQ_IN_INDEX,
            COLUMN_NAME
          FROM information_schema.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'govt_plots'
          ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `,
      );

      const groupedIndexes = new Map();
      for (const row of indexRows) {
        if (!groupedIndexes.has(row.INDEX_NAME)) {
          groupedIndexes.set(row.INDEX_NAME, {
            nonUnique: row.NON_UNIQUE,
            columns: [],
          });
        }

        groupedIndexes.get(row.INDEX_NAME).columns.push(row.COLUMN_NAME);
      }

      const strayPlotNoIndexes = [...groupedIndexes.entries()]
        .filter(([indexName, definition]) => {
          if (indexName === "PRIMARY" || definition.nonUnique !== 0) {
            return false;
          }

          return (
            definition.columns.length === 1 && definition.columns[0] === "plot_no"
          );
        })
        .map(([indexName]) => indexName);

      for (const indexName of strayPlotNoIndexes) {
        await db.query(`ALTER TABLE govt_plots DROP INDEX \`${indexName}\``);
      }

      const hasProjectScopedUniqueKey = [...groupedIndexes.values()].some(
        (definition) =>
          definition.nonUnique === 0 &&
          definition.columns.length === 3 &&
          definition.columns[0] === "project_id" &&
          definition.columns[1] === "khata_no" &&
          definition.columns[2] === "plot_no",
      );

      if (!hasProjectScopedUniqueKey) {
        await db.query(`
          ALTER TABLE govt_plots
          ADD UNIQUE INDEX uq_govt_plots_project_khata_plot
          (project_id, khata_no, plot_no)
        `);
      }
    })().catch((error) => {
      govtPlotIndexInitializationPromise = null;
      throw error;
    });
  }

  return govtPlotIndexInitializationPromise;
};

const GOVT_PLOT_COLUMNS = [
  "project_id",
  "type",
  "district",
  "mouza",
  "tahasil",
  "thana_no",
  "ri_circle",
  "khata_no",
  "kissam",
  "name_of_ror",
  "plot_no",
  "total_area_acres",
  "proposed_area_acres",
  "total_area_hectares",
  "proposed_area_hectares",
  "lease_case_no",
  "present_status",
  "ua_idco_to_tahasildar",
  "case_details",
  "action_to_be_taken",
  "ri_report",
  "ri_report_attachment",
  "proclamation",
  "objection_received",
  "others",
  "modification_revision",
  "misc_dr_case_prep",
  "misc_dr_case_prep_number",
  "reason_for_misc_dr_case",
  "tree_enumeration",
  "tree_enumeration_attachment",
  "order_sheet_prep",
  "lease_to_idco",
  "lease_to_idco_attachment",
  "lease_to_ua",
  "lease_to_ua_attachment",
  "remarks",
];

const GovtPlot = {
async create(data) {
  await ensureGovtPlotProjectScopedUniqueKey();

  const sql = `
    INSERT INTO govt_plots (
      project_id,
      type,
      district,
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
    VALUES (
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?
    )
  `;

  const values = [
    data.project_id,
    data.type,
    data.district || null,
    data.mouza || null,
    data.tahasil || null,
    data.thana_no ?? null,
    data.ri_circle || null,
    data.khata_no || null,
    data.kissam || null,
    data.name_of_ror || null,
    data.plot_no || null,

    data.total_area_acres ?? null,
    data.proposed_area_acres ?? null,
    data.total_area_hectares ?? null,
    data.proposed_area_hectares ?? null,

    data.lease_case_no || null,
    data.present_status ?? null,
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
    0
  ];

  const [result] = await db.execute(sql, values);

  return {
    id: result.insertId,
    ...data
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

  async deleteDocumentByFilename(filename) {
    await db.query(`DELETE FROM govt_plot_documents WHERE filename = ?`, [
      filename,
    ]);
    return true;
  },

  async bulkInsertFromExcel(rows, project_id, type) {
    await ensureGovtPlotProjectScopedUniqueKey();

    const normalizeKey = (key) =>
      key
        ?.toString()
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const normalizeCompareKey = (key) =>
      normalizeKey(key)?.replace(/[^a-z0-9]+/g, " ").trim();
    const isHeaderLikeValue = (value, ...expectedLabels) => {
      const normalizedValue = normalizeCompareKey(value);
      if (!normalizedValue) return false;
      return expectedLabels.some(
        (label) => normalizedValue === normalizeCompareKey(label),
      );
    };

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
      if (val === null || val === undefined || val === "") return null;
      if (typeof val === "number" && val >= 1 && val <= 4) return val;

      const rawValue = String(val).trim().toLowerCase();
      if (/^[1-4]$/.test(rawValue)) return Number(rawValue);

      const normalizedValue = rawValue.replace(/[^a-z0-9]+/g, " ").trim();

      if (normalizedValue.includes("sub collector")) return 1;
      if (normalizedValue.includes("adm")) return 2;
      if (normalizedValue.includes("demand")) return 3;
      if (normalizedValue.includes("sanction")) return 4;
      return null;
    };

    const getValueByNormalizedKey = (row, possibleKeys) => {
      if (!row) return null;
      const normalizedKeys = possibleKeys.map((k) => normalizeCompareKey(k));
      for (const key of Object.keys(row)) {
        if (normalizedKeys.includes(normalizeCompareKey(key))) {
          return row[key];
        }
      }
      return null;
    };

    const getCaseDetailsValue = (row) => {
      return getValueByNormalizedKey(row, [
        "case details/ deservation req.",
        "case details/de-reservation req.",
        "case details/ de-reservation req.",
        "Case details/De - reservation Req.",
      ]);
    };
    const getMissingCaseNumber = (row) => {
      return getValueByNormalizedKey(row, [
        "mising case prep./ dr case. prep. number",
        "Missing Case Prep./DR Case Number",
        "missing case prep / dr case number",
        "misc_dr_case_prep_number",
      ]);
    };

    const getCodeValue = (row, code) => {
      const target = normalizeCompareKey(code);
      for (const key of Object.keys(row || {})) {
        const normalized = normalizeCompareKey(key);
        if (normalized === target || normalized.startsWith(`${target} `)) {
          const value = row[key];
          if (value !== undefined && value !== null && `${value}`.trim() !== "") {
            return value;
          }
        }
      }
      return null;
    };

    const get = (row, code, ...fallbacks) => {
      const byCode = getCodeValue(row, code);
      if (byCode !== null) return byCode;
      return getValueByNormalizedKey(row, fallbacks);
    };

    // const getFullPartValue = (row) => {
    //   return getValueByNormalizedKey(row, [
    //     "Full/Part",
    //     "Full Part",
    //     "full/part"
    //   ]);
    // };

    const validRows = rows.filter((r) => {
      const khata = get(r, "LD06", "khata no", "khata_no");
      const plot = get(
        r,
        "LD09",
        "plot no",
        "plot_no",
        "plot",
        "plot number",
        "plot no.",
      );
      const district = get(r, "LD01", "district");
      const mouza = get(r, "LD02", "mouza", "village", "name of village");
      const tahasil = get(r, "LD03", "tahasil");
      return (
        khata !== undefined &&
        khata !== null &&
        String(khata).trim() !== "" &&
        plot !== undefined &&
        plot !== null &&
        String(plot).trim() !== "" &&
        !isHeaderLikeValue(khata, "khata no", "khata_no") &&
        !isHeaderLikeValue(plot, "plot no", "plot_no", "plot", "plot number", "plot no.") &&
        !isHeaderLikeValue(mouza, "mouza", "village", "name of village") &&
        !isHeaderLikeValue(tahasil, "tahasil") &&
        !isHeaderLikeValue(district, "district")
      );
    });

    if (!validRows.length) return 0;
const values = validRows.map((r) => {
  const district = get(r, "LD01", "district");
  const mouza = get(r, "LD02", "mouza", "village", "name of village");
  const tahasil = get(r, "LD03", "tahasil");
  const thanaNo = get(r, "LD04", "thana no", "thana_no", "thana no.");
  const riCircle = get(r, "LD05", "ri circle", "ri");
  const khataNo = get(r, "LD06", "khata no", "khata_no");
  const kissam = get(r, "LD07", "kissam", "kissam of land");
  const nameOfRor = get(r, "LD08", "name of ror", "name of khata");
  const plotNo = get(
    r,
    "LD09",
    "plot no",
    "plot_no",
    "plot",
    "plot number",
    "plot no."
  );

  let totalAcres =
    parseFloat(get(r, "LA01", "total area (in acres)", "total area (acre)")) ||
    null;

  let proposedAcres =
    parseFloat(
      get(r, "LA02", "proposed area (in acres)", "proposed area (acre)")
    ) || null;

  let totalHectares =
    parseFloat(get(r, "LA03", "total area (in hectares)")) || null;

  let proposedHectares =
    parseFloat(get(r, "LA04", "proposed area (in hectares)")) || null;

  if (totalAcres && !totalHectares)
    totalHectares = parseFloat((totalAcres / 2.47105).toFixed(4));

  if (totalHectares && !totalAcres)
    totalAcres = parseFloat((totalHectares * 2.47105).toFixed(4));

  if (proposedAcres && !proposedHectares)
    proposedHectares = parseFloat((proposedAcres / 2.47105).toFixed(4));

  if (proposedHectares && !proposedAcres)
    proposedAcres = parseFloat((proposedHectares * 2.47105).toFixed(4));

  const leaseCaseNo = get(r, "CD01", "lease case no");
  const presentStatus = presentStatusMap(get(r, "CD02", "present status"));

  const uaToTahasildar = yesNoToBool(
    get(r, "CD03", "ua /idco to tahasildar")
  );

  const caseDetails = get(
    r,
    "CD04",
    "case details/ deservation req.",
    "case details/de-reservation req.",
    "case details/ de-reservation req."
  );

  const actionToBeTaken = get(r, "CD05", "action to be taken");

  const riReport = enumStatus(
    get(r, "CD06", "ri report (1)", "ri report")
  );

  const proclamation = yesNoToBool(get(r, "CD07", "proclamation"));

  const objectionReceived = yesNoToBool(
    get(r, "CD08", "objection received")
  );

  const others = get(r, "CD09", "others");

  const modificationRevision = yesNoToBool(
    get(r, "CD10", "modification/revision")
  );

  const miscDrCasePrep = yesNoToBool(
    get(r, "CD11", "mising case prep./ dr case. prep.")
  );

  const miscDrCasePrepNumber = get(
    r,
    "CD12",
    "mising case prep./ dr case. prep. number",
    "Missing Case Prep./DR Case Number"
  );

  const reasonForMiscDrCase = get(
    r,
    "CD13",
    "reason for misc/dr case"
  );

  const treeEnumeration = enumStatus(
    get(r, "CR01", "tree enumeration")
  );

  const orderSheetPrep = enumStatus(
    get(r, "CR02", "order sheet prep.")
  );

  const leaseToIdco = yesNoToBool(
    get(r, "CR03", "lease to idco")
  );

  const leaseToUa = yesNoToBool(
    get(r, "CR04", "lease to ua")
  );

  const remarks = get(r, "CR05", "remarks");

  return [
    project_id,
    type,
    district || null,
    mouza || null,
    tahasil || null,
    thanaNo || null,
    riCircle || null,
    khataNo || null,
    kissam || null,
    nameOfRor || null,
    plotNo || null,
    totalAcres || null,
    proposedAcres || null,
    totalHectares || null,
    proposedHectares || null,
    leaseCaseNo || null,
    presentStatus,
    uaToTahasildar,
    caseDetails || null,
    actionToBeTaken || null,
    riReport || null,
    null,
    proclamation,
    objectionReceived,
    others || null,
    modificationRevision,
    miscDrCasePrep,
    miscDrCasePrepNumber || null,
    reasonForMiscDrCase || null,
    treeEnumeration || null,
    null,
    orderSheetPrep || null,
    leaseToIdco,
    null,
    leaseToUa,
    null,
    remarks || null,
    0 // is_deleted
  ];
});

await db.query(
  `
  INSERT INTO govt_plots (
    project_id, type, district, mouza, tahasil, thana_no, ri_circle,
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
    remarks,
    is_deleted
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
    is_deleted = 0,
    updated_at = NOW()
  `,
  [values]
);

return values.length;
},

async govtPlotDelete(id) {
  const [result] = await db.query(
    `UPDATE govt_plots
     SET is_deleted = 1,
         updated_at = NOW()
     WHERE id = ? AND is_deleted = 0`,
    [id]
  );

  return result.affectedRows;
},

  async findByPk(id) {
    const [rows] = await db.query(
      `SELECT * FROM govt_plots WHERE id = ? AND is_deleted = 0`,
      [id],
    );

    return rows.length ? rows[0] : null;
  },

  async updateById(id, data) {
    await ensureGovtPlotProjectScopedUniqueKey();

    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && GOVT_PLOT_COLUMNS.includes(key)) {
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

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM govt_plots WHERE id = ? AND is_deleted = 0`,
      [id],
    );
    return rows[0];
  },

  async hasProcessingPayments(plot_id) {
    const [rows] = await db.query(
      `
    SELECT 1
    FROM plot_payments
    WHERE plot_id = ?
      AND status = 'processing'
      AND type = 2
    LIMIT 1
    `,
      [plot_id],
    );

    return rows.length > 0;
  },

  async updatePaymentStatus(plot_id, status) {
    await db.query(
      `UPDATE govt_plots SET payment_status = ?
      WHERE id = ? AND is_deleted = 0`,
      [status, plot_id],
    );
    return true;
  },

  async addPaymentRecord(data) {
    const sql = `
      INSERT INTO plot_payments 
      (unique_id, plot_id, plot_no, lease_case_no, khata_no, project_id, present_tenant_names, payment_area, total_compensation, 
       bank_ac, bank_name, ifsc, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
    `;

    const params = [
      data.unique_id,
      data.plot_id,
      data.plot_no,
      data.lease_case_no,
      data.khata_no,
      data.project_id,
      data.present_tenant_names,
      data.payment_area,
      data.total_compensation,
      data.bank_ac,
      data.bank_name,
      data.ifsc,
      data.type,
      data.status,
    ];

    const [result] = await db.query(sql, params);

    // fetch inserted record
    const [rows] = await db.query(`SELECT * FROM plot_payments WHERE id = ?`, [
      result.insertId,
    ]);

    return rows[0];
  },

  async getAll(project_id = null, type = null, plot_id = null) {
    let query = `SELECT * FROM plot_payments
    WHERE status <> 'complete' AND type = 2
    `;
    const params = [];

    if (project_id) {
      query += ` AND project_id = ?`;
      params.push(project_id);
    }

    if (type !== undefined && type !== null) {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (plot_id) {
      query += " AND plot_id = ?";
      params.push(plot_id);
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  async fetchLandCostById(land_cost_id) {
    const [rows] = await db.query(
      `SELECT * FROM plot_payments WHERE id = ? AND type = 2`,
      [land_cost_id],
    );
    return rows[0];
  },

  async addPaymentProof(land_cost_id, paymentProof, demandNoteAttachment) {
    const [result] = await db.query(
      `UPDATE plot_payments
      SET
        payment_proof = COALESCE(?, payment_proof),
        demand_note_attachment = COALESCE(?, demand_note_attachment)
        WHERE id = ? AND type = 2`,
      [paymentProof, demandNoteAttachment, land_cost_id],
    );
    return result;
  },

  async updatePaymentDetails(data) {
    const {
      land_cost_id,
      payment_area,
      total_compensation,
      compensation_payment,
      apportionment_percent,
      bank_ac,
      bank_name,
      ifsc,
      transaction_no,
    } = data;
    await db.query(
      `UPDATE plot_payments SET 
        payment_area = ?,
        total_compensation = ?,
        compensation_payment = ?,
        apportionment_percent = ?,
        bank_ac = ?,
        bank_name = ?,
        ifsc = ?,
        transaction_no = ?,
        updated_at = NOW()
        WHERE id = ? AND type = 2`,
      [
        payment_area,
        total_compensation,
        compensation_payment,
        apportionment_percent,
        bank_ac,
        bank_name,
        ifsc,
        transaction_no,
        land_cost_id,
      ],
    );
    return true;
  },

  async getByUniqueId(unique_id, project_id, type) {
    const [rows] = await db.query(
      `
    SELECT id, plot_id, status, payment_proof, transaction_no
    FROM plot_payments
    WHERE unique_id = ?
      AND project_id = ?
      AND type = ?
    `,
      [unique_id, project_id, type],
    );
    return rows;
  },

  async markPaymentComplete(unique_id, project_id, type) {
    // get plot_id first
    const [rows] = await db.query(
      `
    SELECT DISTINCT plot_id
    FROM plot_payments
    WHERE unique_id = ?
      AND project_id = ?
      AND type = ?
    `,
      [unique_id, project_id, type],
    );

    if (!rows.length) return false;

    const plotId = rows[0].plot_id;

    // update govt_plots table
    await db.query(
      `
    UPDATE govt_plots
    SET payment_status = 'complete',
        updated_at = NOW()
    WHERE id = ? AND type = 2
    `,
      [plotId],
    );

    // update plot_payments table
    await db.query(
      `
    UPDATE plot_payments
    SET status = 'complete',
        updated_at = NOW()
    WHERE unique_id = ?
      AND project_id = ?
      AND type = ?
    `,
      [unique_id, project_id, type],
    );

    return true;
  },

  async findByKhataNo(khata_no, type, project_id) {
    const [rows] = await db.query(
      "SELECT * FROM govt_plots WHERE khata_no = ? AND type = ? AND project_id = ?",
      [khata_no, type, project_id],
    );
    return rows;
  },

  async govtPlotCount(projectIds = null) {
    let query = `
    SELECT COUNT(*) AS total 
    FROM govt_plots 
    WHERE is_deleted = 0 AND type = 2
  `;
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async landDistribution(projectIds = null) {
    let query = `
    SELECT
      SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS private,
      SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS govt,
      SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) AS forest
    FROM govt_plots
    WHERE is_deleted = 0
  `;

    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
  },

  async countCompletedPayments(projectIds = null) {
    let query = `
    SELECT COUNT(*) AS total
    FROM plot_payments
    WHERE status = 'complete' AND type = 2
  `;
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },
};

module.exports = GovtPlot;
