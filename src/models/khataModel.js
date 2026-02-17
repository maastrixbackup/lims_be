const db = require("../config/db");

const Khata = {
  async create(data) {
    const {
      project_id,
      village_id,
      khata_no,
      type,
      unique_id,

      plot_no,
      kissam_of_land,
      land_category,
      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,
      lo13_remarks,
      tahasil_name,
      ri_circle_name,
      thana_no,
      date_of_award,
      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_person,

      rr_employment,
      rr_cash_in_lieu,
      rr_training_skill_upgradation,
      rr_self_employment,
      rr_special_allowance_st_ntfp,
      rr_homestead_allotment,
      rr_house_building_assistance,
      rr_constructed_by,
      rr_transit_shed,
      rr_transport_allowance,
      rr_maintenance_allowance,
      rr_multiple_displacement_allowance,
      rr_exgratia,
      rr_other_benefits,

      full_part,
    } = data;
    const [result] = await db.query(
      `INSERT INTO khatas(
        project_id,
        village_id,
        khata_no,
        type,
        unique_id,
        plot_no,
        kissam_of_land,
        land_category,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        lo13_remarks,
        tahasil_name,
        ri_circle_name,
        thana_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_person,

        rr_employment,
        rr_cash_in_lieu,
        rr_training_skill_upgradation,
        rr_self_employment,
        rr_special_allowance_st_ntfp,
        rr_homestead_allotment,
        rr_house_building_assistance,
        rr_constructed_by,
        rr_transit_shed,
        rr_transport_allowance,
        rr_maintenance_allowance,
        rr_multiple_displacement_allowance,
        rr_exgratia,
        rr_other_benefits,

        full_part
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        project_id,
        village_id,
        khata_no,
        type,
        unique_id,
        plot_no,
        kissam_of_land,
        land_category,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        lo13_remarks,
        tahasil_name,
        ri_circle_name,
        thana_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_person,

        rr_employment,
        rr_cash_in_lieu,
        rr_training_skill_upgradation,
        rr_self_employment,
        rr_special_allowance_st_ntfp,
        rr_homestead_allotment,
        rr_house_building_assistance,
        rr_constructed_by,
        rr_transit_shed,
        rr_transport_allowance,
        rr_maintenance_allowance,
        rr_multiple_displacement_allowance,
        rr_exgratia,
        rr_other_benefits,

        full_part,
      ]
    );
    return {
      id: result.insertId,
      ...data,
    };
  },

  async existsByUniqueId(unique_id) {
    const [rows] = await db.query(
      "SELECT id FROM khatas WHERE unique_id = ? LIMIT 1",
      [unique_id]
    );
    return rows.length > 0;
  },

  // async findAll({
  //   project_id = null,
  //   village_id = null,
  //   type = null,
  //   limit = 10,
  //   offset = 0,
  // }) {
  //   let query = `
  //       SELECT k.*, p.project_name, v.village_name,
  //       (
  //         SELECT COUNT(*)
  //         FROM plots
  //         WHERE plots.khata_no = k.khata_no
  //         AND plots.project_id = k.project_id
  //       ) AS plot_count,
  //         pl.village_name,
  //         pl.village_code,
  //         pl.khata_no,
  //         pl.plot_no,
  //         pl.kissam_of_land,
  //         pl.land_category,
  //         pl.land_area_total_acres,
  //         pl.land_area_total_hectares,
  //         pl.land_area_acquired_acres,
  //         pl.land_area_acquired_hectares,
  //         pl.lo13_remarks,
  //         pl.tahasil_name,
  //         pl.ri_circle_name,
  //         pl.thana_no,
  //         pl.date_of_award,
  //         pl.name_of_recorded_tenant,
  //         pl.name_of_present_tenant,
  //         pl.present_address,
  //         pl.displaced_affected_person
  //       FROM khatas k
  //       LEFT JOIN projects p ON k.project_id = p.id
  //       LEFT JOIN villages v ON k.village_id = v.id
  //       LEFT JOIN plots pl
  //       ON pl.id = (
  //           SELECT MIN(id)
  //           FROM plots
  //           WHERE khata_no = k.khata_no
  //           AND project_id = k.project_id
  //           AND type = k.type
  //       )
  //       WHERE 1=1
  //   `;
  //   const params = [];
  //   if (project_id) {
  //     query += " AND k.project_id = ?";
  //     params.push(project_id);
  //   }
  //   // if (village_id) {
  //   //   query += " AND k.village_id = ?";
  //   //   params.push(village_id);
  //   // }
  //   if (village_id && Array.isArray(village_id)) {
  //     const placeholders = village_id.map(() => "?").join(",");
  //     query += ` AND k.village_id IN (${placeholders})`;
  //     params.push(...village_id);
  //   }
  //   if (type) {
  //     query += " AND k.type = ?";
  //     params.push(type);
  //   }
  //   query += " ORDER BY k.id DESC LIMIT ? OFFSET ?";
  //   params.push(limit, offset);
  //   const [rows] = await db.query(query, params);
  //   return rows;
  // },

  // async findAll({
  //   project_id = null,
  //   village_id = null,
  //   type = null,
  //   limit = 10,
  //   offset = 0,
  // }) {
  //   let query = `
  //   SELECT
  //     MIN(k.id) AS id,
  //     MIN(k.unique_id) AS unique_id,
  //     MIN(k.project_id) AS project_id,
  //     MIN(k.village_id) AS village_id,
  //     MIN(k.khata_no) AS khata_no,
  //     MIN(k.type) AS type,
  //     MIN(k.created_at) AS created_at,
  //     MIN(k.updated_at) AS updated_at,

  //     MIN(p.project_name) AS project_name,
  //     MIN(v.village_name) AS village_name,
  //     MIN(v.village_code) AS village_code,

  //     COUNT(DISTINCT pl.id) AS plot_count,
  //     (SELECT COUNT(*)
  //       FROM khata_documents kd
  //       WHERE kd.khata_id = k.id
  //     ) AS khata_document_count,

  //     (SELECT COUNT(*)
  //       FROM khata_map_documents km
  //       WHERE km.khata_id = k.id
  //     ) AS khata_map_document_count,

  //     SUM(pl.land_area_total_acres) AS land_area_total_acres,
  //     SUM(pl.land_area_total_hectares) AS land_area_total_hectares,
  //     SUM(pl.land_area_acquired_acres) AS land_area_acquired_acres,
  //     SUM(pl.land_area_acquired_hectares) AS land_area_acquired_hectares,

  //     GROUP_CONCAT(pl.plot_no SEPARATOR ', ') AS plot_no,
  //     GROUP_CONCAT(pl.kissam_of_land SEPARATOR ', ') AS kissam_of_land,
  //     GROUP_CONCAT(pl.land_category SEPARATOR ', ') AS land_category,
  //     MIN(pl.lo13_remarks) AS lo13_remarks,
  //     MIN(pl.tahasil_name) AS tahasil_name,
  //     GROUP_CONCAT(pl.ri_circle_name SEPARATOR ', ') AS ri_circle_name,

  //     MIN(pl.thana_no) AS thana_no,
  //     MIN(pl.date_of_award) AS date_of_award,
  //     CASE
  //         WHEN MIN(pl.name_of_recorded_tenant) = MAX(pl.name_of_recorded_tenant)
  //         THEN MIN(pl.name_of_recorded_tenant)
  //         ELSE GROUP_CONCAT(DISTINCT pl.name_of_recorded_tenant SEPARATOR ', ')
  //     END AS name_of_recorded_tenant,

  //     CASE
  //         WHEN MIN(pl.name_of_present_tenant) = MAX(pl.name_of_present_tenant)
  //         THEN MIN(pl.name_of_present_tenant)
  //         ELSE GROUP_CONCAT(DISTINCT pl.name_of_present_tenant SEPARATOR ', ')
  //     END AS name_of_present_tenant,
  //     MIN(pl.present_address) AS present_address,
  //     MIN(pl.displaced_affected_person) AS displaced_affected_person

  //   FROM khatas k
  //   LEFT JOIN projects p ON k.project_id = p.id
  //   LEFT JOIN villages v ON k.village_id = v.id

  //   LEFT JOIN plots pl
  //     ON pl.khata_no = k.khata_no
  //     AND pl.project_id = k.project_id
  //     AND pl.type = k.type

  //   WHERE 1=1
  // `;

  //   const params = [];

  //   if (project_id) {
  //     query += " AND k.project_id = ?";
  //     params.push(project_id);
  //   }

  //   // if (village_id && Array.isArray(village_id)) {
  //   //   const placeholders = village_id.map(() => "?").join(",");
  //   //   query += ` AND k.village_id IN (${placeholders})`;
  //   //   params.push(...village_id);
  //   // }

  //   if (village_id && Array.isArray(village_id) && village_id.length > 0) {
  //     const placeholders = village_id.map(() => "?").join(",");
  //     query += ` AND k.village_id IN (${placeholders})`;
  //     params.push(...village_id);
  //   }

  //   if (type) {
  //     query += " AND k.type = ?";
  //     params.push(type);
  //   }

  //   query += `
  //   GROUP BY k.id
  //   ORDER BY k.id DESC
  //   LIMIT ? OFFSET ?
  // `;
  //   params.push(limit, offset);

  //   const [rows] = await db.query(query, params);
  //   return rows;
  // },

  // async findAll({
  //   project_id = null,
  //   village_id = null,
  //   type = null,
  //   limit = 10,
  //   offset = 0,
  // }) {
  //   let query = `
  //   SELECT
  //     k.id,
  //     k.unique_id,
  //     k.project_id,
  //     k.village_id,
  //     k.khata_no,
  //     k.type,
  //     k.created_at,
  //     k.updated_at,

  //     k.plot_no,
  //     k.kissam_of_land,
  //     k.land_category,
  //     k.land_area_total_acres,
  //     k.land_area_total_hectares,
  //     k.land_area_acquired_acres,
  //     k.land_area_acquired_hectares,
  //     k.lo13_remarks,
  //     k.tahasil_name,
  //     k.ri_circle_name,
  //     k.thana_no,
  //     k.date_of_award,
  //     k.name_of_recorded_tenant,
  //     k.name_of_present_tenant,
  //     k.present_address,
  //     k.displaced_affected_person,

  //     p.project_name,
  //     v.village_name,
  //     v.village_code,

  //     IFNULL(pc.plot_count, 0) AS plot_count,
  //     IFNULL(kd.doc_count, 0) AS khata_document_count,
  //     IFNULL(km.map_count, 0) AS khata_map_document_count

  //   FROM khatas k

  //   LEFT JOIN projects p ON p.id = k.project_id
  //   LEFT JOIN villages v ON v.id = k.village_id

  //   LEFT JOIN (
  //     SELECT
  //       project_id,
  //       type,
  //       khata_no,
  //       COUNT(*) AS plot_count
  //     FROM plots
  //     GROUP BY project_id, type, khata_no
  //   ) pc
  //     ON pc.project_id = k.project_id
  //    AND pc.type = k.type
  //    AND pc.khata_no = k.khata_no

  //   LEFT JOIN (
  //     SELECT khata_id, COUNT(*) AS doc_count
  //     FROM khata_documents
  //     GROUP BY khata_id
  //   ) kd ON kd.khata_id = k.id

  //   LEFT JOIN (
  //     SELECT khata_id, COUNT(*) AS map_count
  //     FROM khata_map_documents
  //     GROUP BY khata_id
  //   ) km ON km.khata_id = k.id

  //   WHERE 1=1
  // `;

  //   const params = [];

  //   if (project_id) {
  //     query += " AND k.project_id = ?";
  //     params.push(project_id);
  //   }

  //   if (Array.isArray(village_id) && village_id.length > 0) {
  //     query += ` AND k.village_id IN (${village_id.map(() => "?").join(",")})`;
  //     params.push(...village_id);
  //   }

  //   if (type) {
  //     query += " AND k.type = ?";
  //     params.push(type);
  //   }

  //   query += `
  //   ORDER BY k.id DESC
  //   LIMIT ? OFFSET ?
  // `;

  //   params.push(limit, offset);

  //   const [rows] = await db.query(query, params);
  //   return rows;
  // },

  async findAll({
    project_id = null,
    village_id = null,
    type = null,
    limit = 10,
    offset = 0,
  }) {
    let query = `
    SELECT 
      k.id,
      k.unique_id,
      k.project_id,
      k.village_id,
      k.khata_no,
      k.type,
      k.created_at,
      k.updated_at,

      k.kissam_of_land,
      k.land_category,
      k.land_area_total_acres,
      k.land_area_total_hectares,
      k.land_area_acquired_acres,
      k.land_area_acquired_hectares,
      k.lo13_remarks,
      k.tahasil_name,
      k.ri_circle_name,
      k.thana_no,
      k.date_of_award,
      k.name_of_recorded_tenant,
      k.name_of_present_tenant,
      k.present_address,
      k.displaced_affected_person,
      k.full_part,

      kp.plot_nos AS plot_no,

      p.project_name,
      v.village_name,
      v.village_code,
      
      IFNULL(pc.plot_count, 0) AS plot_count,
      IFNULL(kd.doc_count, 0) AS khata_document_count,
      IFNULL(km.map_count, 0) AS khata_map_document_count,

      k.rr_employment,
      k.rr_cash_in_lieu,
      k.rr_training_skill_upgradation,
      k.rr_self_employment,
      k.rr_special_allowance_st_ntfp,
      k.rr_homestead_allotment,
      k.rr_house_building_assistance,
      k.rr_constructed_by,
      k.rr_transit_shed,
      k.rr_transport_allowance,
      k.rr_maintenance_allowance,
      k.rr_multiple_displacement_allowance,
      k.rr_exgratia,
      k.rr_other_benefits

    FROM khatas k

    LEFT JOIN projects p ON p.id = k.project_id
    LEFT JOIN villages v ON v.id = k.village_id

    LEFT JOIN (
      SELECT
        project_id,
        type,
        khata_no,
        GROUP_CONCAT(plot_no ORDER BY plot_no SEPARATOR ', ') AS plot_nos
      FROM khatas
      GROUP BY project_id, type, khata_no
    ) kp
      ON kp.project_id = k.project_id
    AND kp.type = k.type
    AND kp.khata_no = k.khata_no

    LEFT JOIN (
      SELECT
        project_id,
        type,
        khata_no,
        COUNT(*) AS plot_count
      FROM plots
      GROUP BY project_id, type, khata_no
    ) pc
      ON pc.project_id = k.project_id
     AND pc.type = k.type
     AND pc.khata_no = k.khata_no



    LEFT JOIN (
      SELECT khata_id, COUNT(*) AS doc_count
      FROM khata_documents
      GROUP BY khata_id
    ) kd ON kd.khata_id = k.id

    LEFT JOIN (
      SELECT khata_id, COUNT(*) AS map_count
      FROM khata_map_documents
      GROUP BY khata_id
    ) km ON km.khata_id = k.id

    WHERE 1=1
  `;

    const params = [];

    if (project_id) {
      query += " AND k.project_id = ?";
      params.push(project_id);
    }

    if (Array.isArray(village_id) && village_id.length > 0) {
      query += ` AND k.village_id IN (${village_id.map(() => "?").join(",")})`;
      params.push(...village_id);
    }

    if (type) {
      query += " AND k.type = ?";
      params.push(type);
    }

    query += `
    ORDER BY k.id DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  async paginationCountAll({
    project_id = null,
    village_id = null,
    type = null,
  }) {
    let query = `
    SELECT COUNT(*) AS total
    FROM khatas
    WHERE 1=1
  `;

    const params = [];

    if (project_id) {
      query += " AND project_id = ?";
      params.push(project_id);
    }

    // if (village_id) {
    //   query += " AND village_id = ?";
    //   params.push(village_id);
    // }
    // if (village_id && Array.isArray(village_id)) {
    //   const placeholders = village_id.map(() => "?").join(",");
    //   query += ` AND village_id IN (${placeholders})`;
    //   params.push(...village_id);
    // }
    if (village_id && Array.isArray(village_id) && village_id.length > 0) {
      const placeholders = village_id.map(() => "?").join(",");
      query += ` AND village_id IN (${placeholders})`;
      params.push(...village_id);
    }

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM khatas WHERE id = ?", [id]);
    // return rows[0];
    return rows[0] || null;
  },

  async findKhataNo(project_id, type) {
    const [rows] = await db.query(
      "SELECT id,khata_no FROM khatas WHERE project_id = ? AND type = ?",
      [project_id, type]
    );
    return rows;
  },

  async getKhataByNumber(khata_no) {
    const [rows] = await db.query(
      `SELECT * FROM khatas WHERE khata_no = ? LIMIT 1`,
      [khata_no]
    );
    return rows[0];
  },

  async update(data) {
    const {
      khataId,
      project_id,
      village_id,
      khata_no,
      type,

      plot_no,
      kissam_of_land,
      land_category,
      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,
      lo13_remarks,
      tahasil_name,
      ri_circle_name,
      thana_no,
      date_of_award,
      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_person,

      rr_employment,
      rr_cash_in_lieu,
      rr_training_skill_upgradation,
      rr_self_employment,
      rr_special_allowance_st_ntfp,
      rr_homestead_allotment,
      rr_house_building_assistance,
      rr_constructed_by,
      rr_transit_shed,
      rr_transport_allowance,
      rr_maintenance_allowance,
      rr_multiple_displacement_allowance,
      rr_exgratia,
      rr_other_benefits,

      full_part,
    } = data;
    await db.query(
      `UPDATE khatas SET
        project_id = ?,
        village_id = ?,
        khata_no = ?,
        type = ?,
        plot_no = ?,
        kissam_of_land = ?,
        land_category = ?,
        land_area_total_acres = ?,
        land_area_total_hectares = ?,
        land_area_acquired_acres = ?,
        land_area_acquired_hectares = ?,
        lo13_remarks = ?,
        tahasil_name = ?,
        ri_circle_name = ?,
        thana_no = ?,
        date_of_award = ?,
        name_of_recorded_tenant = ?,
        name_of_present_tenant = ?,
        present_address = ?,
        displaced_affected_person = ?,

        rr_employment = ?,
        rr_cash_in_lieu = ?,
        rr_training_skill_upgradation = ?,
        rr_self_employment = ?,
        rr_special_allowance_st_ntfp = ?,
        rr_homestead_allotment = ?,
        rr_house_building_assistance = ?,
        rr_constructed_by = ?,
        rr_transit_shed = ?,
        rr_transport_allowance = ?,
        rr_maintenance_allowance = ?,
        rr_multiple_displacement_allowance = ?,
        rr_exgratia = ?,
        rr_other_benefits = ?,

        full_part = ?,
        updated_at = NOW()
        WHERE id = ?`,
      [
        project_id,
        village_id,
        khata_no,
        type,

        plot_no,
        kissam_of_land,
        land_category,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        lo13_remarks,
        tahasil_name,
        ri_circle_name,
        thana_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_person,

        rr_employment,
        rr_cash_in_lieu,
        rr_training_skill_upgradation,
        rr_self_employment,
        rr_special_allowance_st_ntfp,
        rr_homestead_allotment,
        rr_house_building_assistance,
        rr_constructed_by,
        rr_transit_shed,
        rr_transport_allowance,
        rr_maintenance_allowance,
        rr_multiple_displacement_allowance,
        rr_exgratia,
        rr_other_benefits,

        full_part,

        khataId,
      ]
    );
    return { khataId, ...data };
  },

  async existsByUniqueIdExcept(unique_id, excludeId) {
    const [rows] = await db.query(
      `
    SELECT id
    FROM khatas
    WHERE unique_id = ?
      AND id <> ?
    LIMIT 1
    `,
      [unique_id, excludeId]
    );

    return rows.length > 0;
  },

  async delete(id) {
    await db.query("DELETE FROM khatas WHERE ID = ?", [id]);
  },

  async uploadKhataDocument(
    khata_id,
    unique_id,
    file_name,
    file_path,
    type,
    document_type
  ) {
    const [result] = await db.query(
      "INSERT INTO khata_documents(khata_id, unique_id, file_name, file_path, type, document_type) VALUES (?,?,?,?,?,?)",
      [khata_id, unique_id, file_name, file_path, type, document_type]
    );
    return result;
  },

  async getFilesByKhataId(khata_id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE khata_id = ? AND type = 1 ORDER BY created_at DESC",
      [khata_id]
    );
    return rows;
  },

  async findFileById(id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE id = ? AND type = 1",
      [id]
    );
    return rows[0];
  },

  async deleteFileById(file_id) {
    const [result] = await db.query(
      "DELETE FROM khata_documents WHERE id = ? AND type = 1",
      [file_id]
    );
    return result.affectedRows > 0;
  },

  // async insertKhatasFromExcel(data, project_id, type) {
  //   await db.query(
  //     `
  //   INSERT INTO khatas (
  //     unique_id,
  //     project_id,
  //     village_id,
  //     khata_no,
  //     type,

  //     plot_no,
  //     kissam_of_land,
  //     land_category,

  //     land_area_total_acres,
  //     land_area_total_hectares,
  //     land_area_acquired_acres,
  //     land_area_acquired_hectares,

  //     lo13_remarks,
  //     tahasil_name,
  //     ri_circle_name,
  //     thana_no,
  //     date_of_award,

  //     name_of_recorded_tenant,
  //     name_of_present_tenant,
  //     present_address,
  //     displaced_affected_person
  //   )
  //   SELECT
  //     CONCAT(
  //       MIN(p.client_code), '/',
  //       MIN(v.village_code), '/',
  //       pl.khata_no
  //     ) AS unique_id,
  //     pl.project_id,
  //     v.id AS village_id,
  //     pl.khata_no,
  //     pl.type,

  //     GROUP_CONCAT(DISTINCT pl.plot_no SEPARATOR ', ') AS plot_no,
  //     GROUP_CONCAT(DISTINCT pl.kissam_of_land SEPARATOR ', ') AS kissam_of_land,
  //     GROUP_CONCAT(DISTINCT pl.land_category SEPARATOR ', ') AS land_category,

  //     SUM(pl.land_area_total_acres),
  //     SUM(pl.land_area_total_hectares),
  //     SUM(pl.land_area_acquired_acres),
  //     SUM(pl.land_area_acquired_hectares),

  //     GROUP_CONCAT(DISTINCT pl.lo13_remarks SEPARATOR ', '),
  //     MIN(pl.tahasil_name),
  //     GROUP_CONCAT(DISTINCT pl.ri_circle_name SEPARATOR ', '),
  //     MIN(pl.thana_no),
  //     MIN(pl.date_of_award),

  //     GROUP_CONCAT(DISTINCT pl.name_of_recorded_tenant SEPARATOR ', '),
  //     GROUP_CONCAT(DISTINCT pl.name_of_present_tenant SEPARATOR ', '),
  //     GROUP_CONCAT(DISTINCT pl.present_address SEPARATOR ', '),
  //     GROUP_CONCAT(DISTINCT pl.displaced_affected_person SEPARATOR ', ')
  //   FROM plots pl
  //   JOIN villages v
  //     ON v.village_name = pl.village_name
  //     AND v.project_id = pl.project_id
  //   JOIN projects p ON p.id = pl.project_id
  //   WHERE pl.project_id = ?
  //     AND pl.type = ?
  //     AND pl.khata_no IS NOT NULL
  //     AND pl.khata_no <> ''
  //   GROUP BY pl.project_id, v.id, pl.khata_no, pl.type
  //   ON DUPLICATE KEY UPDATE
  //     plot_no = VALUES(plot_no),
  //     kissam_of_land = VALUES(kissam_of_land),
  //     land_category = VALUES(land_category),
  //     land_area_total_acres = VALUES(land_area_total_acres),
  //     land_area_total_hectares = VALUES(land_area_total_hectares),
  //     land_area_acquired_acres = VALUES(land_area_acquired_acres),
  //     land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
  //     lo13_remarks = VALUES(lo13_remarks),
  //     tahasil_name = VALUES(tahasil_name),
  //     ri_circle_name = VALUES(ri_circle_name),
  //     thana_no = VALUES(thana_no),
  //     date_of_award = VALUES(date_of_award),
  //     name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
  //     name_of_present_tenant = VALUES(name_of_present_tenant),
  //     present_address = VALUES(present_address),
  //     displaced_affected_person = VALUES(displaced_affected_person),
  //     updated_at = NOW()
  //   `,
  //     [project_id, type]
  //   );
  // },

  async insertKhatasFromExcel(data, project_id, type) {
    await db.query(
      `
    INSERT INTO khatas (
      unique_id,
      project_id,
      village_id,
      khata_no,
      type,

      plot_no,
      kissam_of_land,
      land_category,

      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,

      lo13_remarks,
      tahasil_name,
      ri_circle_name,
      thana_no,
      date_of_award,

      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_person
    )
    SELECT
      CONCAT(
        MIN(p.client_code), '/',
        MIN(v.village_name), '/',
        pl.khata_no
      ) AS unique_id,
      pl.project_id,
      v.id AS village_id,
      pl.khata_no,
      pl.type,

      GROUP_CONCAT(DISTINCT pl.plot_no SEPARATOR ', ') AS plot_no,
      GROUP_CONCAT(DISTINCT pl.kissam_of_land SEPARATOR ', ') AS kissam_of_land,
      GROUP_CONCAT(DISTINCT pl.land_category SEPARATOR ', ') AS land_category,

      SUM(pl.land_area_total_acres),
      SUM(pl.land_area_total_hectares),
      SUM(pl.land_area_acquired_acres),
      SUM(pl.land_area_acquired_hectares),

      GROUP_CONCAT(DISTINCT pl.lo13_remarks SEPARATOR ', '),
      MIN(pl.tahasil_name),
      GROUP_CONCAT(DISTINCT pl.ri_circle_name SEPARATOR ', '),
      MIN(pl.thana_no),
      MIN(pl.date_of_award),

      GROUP_CONCAT(DISTINCT pl.name_of_recorded_tenant SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.name_of_present_tenant SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.present_address SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.displaced_affected_person SEPARATOR ', ')
    FROM plots pl
    JOIN villages v
      ON v.village_name = pl.village_name
      AND v.project_id = pl.project_id
    JOIN projects p ON p.id = pl.project_id
    WHERE pl.project_id = ?
      AND pl.type = ?
      AND pl.khata_no IS NOT NULL
      AND pl.khata_no <> ''
    GROUP BY pl.project_id, v.id, pl.khata_no, pl.type
    ON DUPLICATE KEY UPDATE
      plot_no = VALUES(plot_no),
      kissam_of_land = VALUES(kissam_of_land),
      land_category = VALUES(land_category),
      land_area_total_acres = VALUES(land_area_total_acres),
      land_area_total_hectares = VALUES(land_area_total_hectares),
      land_area_acquired_acres = VALUES(land_area_acquired_acres),
      land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
      lo13_remarks = VALUES(lo13_remarks),
      tahasil_name = VALUES(tahasil_name),
      ri_circle_name = VALUES(ri_circle_name),
      thana_no = VALUES(thana_no),
      date_of_award = VALUES(date_of_award),
      name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
      name_of_present_tenant = VALUES(name_of_present_tenant),
      present_address = VALUES(present_address),
      displaced_affected_person = VALUES(displaced_affected_person),
      updated_at = NOW()
    `,
      [project_id, type]
    );

    const addIfValid = (set, value) => {
      if (value !== undefined && value !== null && value !== "") {
        set.add(value);
      }
    };

    const setToNull = (set) => {
      if (!set || set.size === 0) return null;
      return [...set].join(", ");
    };

    const normalize = (s) => s?.replace(/\s+/g, " ").trim();
    const rrByKhata = {};
    // console.log(Object.keys(data[0]));
    for (const row of data) {
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[normalize(key)] = row[key];
      }

      const khataNo = row["Khata No."] || row["Khata No"] || null;
      if (!khataNo) continue;

      if (!rrByKhata[khataNo]) {
        rrByKhata[khataNo] = {
          rr_employment: new Set(),
          rr_cash_in_lieu: new Set(),
          rr_training_skill_upgradation: new Set(),
          rr_self_employment: new Set(),
          rr_special_allowance_st_ntfp: new Set(),
          rr_homestead_allotment: new Set(),
          rr_house_building_assistance: new Set(),
          rr_constructed_by: new Set(),
          rr_transit_shed: new Set(),
          rr_transport_allowance: new Set(),
          rr_maintenance_allowance: new Set(),
          rr_multiple_displacement_allowance: new Set(),
          rr_exgratia: new Set(),
          rr_other_benefits: new Set(),
        };
      }

      const r = rrByKhata[khataNo];
      addIfValid(
        r.rr_employment,
        normalizedRow["RR Assistance (Rehab) - Employment in the Project"]
      );

      addIfValid(
        r.rr_cash_in_lieu,
        row["RR Assistance (Rehab) - Cash in lieu of Employment"]
      );

      addIfValid(
        r.rr_training_skill_upgradation,
        row["RR Assistance (Rehab) - Training for Skill Upgradation"]
      );

      addIfValid(
        r.rr_self_employment,
        row["RR Assistance (Rehab) - Assistance for Self Employment"]
      );

      addIfValid(
        r.rr_special_allowance_st_ntfp,
        row["RR Assistance (Rehab) - Special Allowance to STs for loss of NTFP"]
      );

      addIfValid(
        r.rr_homestead_allotment,
        row["RR Assistance (Resettle) - Homested Land Alloted/Self Relocation"]
      );

      addIfValid(
        r.rr_house_building_assistance,
        row["RR Assistance (Resettle) - House Building Assistance"]
      );

      addIfValid(
        r.rr_constructed_by,
        row["RR Assistance (Resettle) - Constructed by Project Authority/Self"]
      );

      addIfValid(
        r.rr_transit_shed,
        row["RR Assistance (Resettle) - Assistance for Transit Shed"]
      );

      addIfValid(
        r.rr_transport_allowance,
        row["RR Assistance (Resettle) - Transportation Allowance"]
      );

      addIfValid(
        r.rr_maintenance_allowance,
        row["RR Assistance (Resettle) - Maintenance Allowance"]
      );

      addIfValid(
        r.rr_multiple_displacement_allowance,
        row[
        "RR Assistance (Other) - Special Allowance for Multiple Displacement"
        ]
      );

      addIfValid(
        r.rr_exgratia,
        row["RR Assistance (Other) - Ex-Gratia (if any)"]
      );

      addIfValid(
        r.rr_other_benefits,
        row["RR Assistance (Other) - Other Benefits (if any)"]
      );
    }

    for (const [khataNo, rr] of Object.entries(rrByKhata)) {
      await db.query(
        `
      UPDATE khatas
      SET
        rr_employment = ?,
        rr_cash_in_lieu = ?,
        rr_training_skill_upgradation = ?,
        rr_self_employment = ?,
        rr_special_allowance_st_ntfp = ?,
        rr_homestead_allotment = ?,
        rr_house_building_assistance = ?,
        rr_constructed_by = ?,
        rr_transit_shed = ?,
        rr_transport_allowance = ?,
        rr_maintenance_allowance = ?,
        rr_multiple_displacement_allowance = ?,
        rr_exgratia = ?,
        rr_other_benefits = ?
      WHERE project_id = ?
        AND type = ?
        AND khata_no = ?
      `,
        [
          setToNull(rr.rr_employment),
          setToNull(rr.rr_cash_in_lieu),
          setToNull(rr.rr_training_skill_upgradation),
          setToNull(rr.rr_self_employment),
          setToNull(rr.rr_special_allowance_st_ntfp),
          setToNull(rr.rr_homestead_allotment),
          setToNull(rr.rr_house_building_assistance),
          setToNull(rr.rr_constructed_by),
          setToNull(rr.rr_transit_shed),
          setToNull(rr.rr_transport_allowance),
          setToNull(rr.rr_maintenance_allowance),
          setToNull(rr.rr_multiple_displacement_allowance),
          setToNull(rr.rr_exgratia),
          setToNull(rr.rr_other_benefits),
          project_id,
          type,
          khataNo,
        ]
      );
    }
  },
  async insertKhataFromManualPlot({ project_id, type, khata_no }) {
    if (!project_id || !type || !khata_no) return;

    await db.query(
      `
    INSERT INTO khatas (
      unique_id,
      project_id,
      village_id,
      khata_no,
      type,

      plot_no,
      kissam_of_land,
      land_category,

      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,

      lo13_remarks,
      tahasil_name,
      ri_circle_name,
      thana_no,
      date_of_award,

      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_person,
      full_part
    )
    SELECT
      CONCAT(
        MIN(p.client_code), '/',
        MIN(v.village_name), '/',
        pl.khata_no
      ) AS unique_id,
      pl.project_id,
      v.id,
      pl.khata_no,
      pl.type,

      GROUP_CONCAT(DISTINCT pl.plot_no ORDER BY pl.plot_no SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.kissam_of_land SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.land_category SEPARATOR ', '),

      SUM(pl.land_area_total_acres),
      SUM(pl.land_area_total_hectares),
      SUM(pl.land_area_acquired_acres),
      SUM(pl.land_area_acquired_hectares),

      GROUP_CONCAT(DISTINCT pl.lo13_remarks SEPARATOR ', '),
      MIN(pl.tahasil_name),
      GROUP_CONCAT(DISTINCT pl.ri_circle_name SEPARATOR ', '),
      MIN(pl.thana_no),
      MIN(pl.date_of_award),

      GROUP_CONCAT(DISTINCT pl.name_of_recorded_tenant SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.name_of_present_tenant SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.present_address SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT pl.displaced_affected_person SEPARATOR ', '),
      CASE
      WHEN COUNT(DISTINCT pl.full_part) = 1
          AND MIN(pl.full_part) = 'FULL'
      THEN 'FULL'
      ELSE 'PART'
    END
    FROM plots pl
    JOIN villages v
      ON v.village_name = pl.village_name
    AND v.project_id = pl.project_id
    JOIN projects p
      ON p.id = pl.project_id
    WHERE pl.project_id = ?
      AND pl.type = ?
      AND pl.khata_no = ?
    GROUP BY pl.project_id, v.id, pl.khata_no, pl.type
    ON DUPLICATE KEY UPDATE
      plot_no = VALUES(plot_no),
      kissam_of_land = VALUES(kissam_of_land),
      land_category = VALUES(land_category),
      land_area_total_acres = VALUES(land_area_total_acres),
      land_area_total_hectares = VALUES(land_area_total_hectares),
      land_area_acquired_acres = VALUES(land_area_acquired_acres),
      land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
      lo13_remarks = VALUES(lo13_remarks),
      tahasil_name = VALUES(tahasil_name),
      ri_circle_name = VALUES(ri_circle_name),
      thana_no = VALUES(thana_no),
      date_of_award = VALUES(date_of_award),
      name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
      name_of_present_tenant = VALUES(name_of_present_tenant),
      present_address = VALUES(present_address),
      displaced_affected_person = VALUES(displaced_affected_person),
      full_part = VALUES(full_part),
      updated_at = NOW()
    `,
      [project_id, type, khata_no]
    );
  },

  // async countAll(projectId = null) {
  //   let query = "SELECT COUNT(*) AS total FROM khatas";
  //   let params = [];

  //   if (projectId) {
  //     query += " WHERE project_id = ?";
  //     params.push(projectId);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  async countAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM khatas";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` WHERE project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  async addMapDocument(khata_id, land_type, file_name) {
    return db.query(
      `INSERT INTO khata_map_documents (khata_id, land_type, file_name)
     VALUES (?, ?, ?)`,
      [khata_id, land_type, file_name]
    );
  },

  async getMapDocumentsByKhataId(khata_id) {
    const [rows] = await db.query(
      `SELECT id, khata_id, land_type, file_name, created_at
      FROM khata_map_documents
      WHERE khata_id = ? AND land_type = 1
      ORDER BY id DESC`,
      [khata_id]
    );
    return rows;
  },
};

module.exports = Khata;
