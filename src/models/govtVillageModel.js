const db = require("../config/db");

const govtVillage = {
  async upsertFromExcel(rows, project_id, type) {
    const normalizeText = (value) =>
      value === undefined || value === null ? "" : String(value).trim();

    const getThanaNo = (row) => {
      const thana =
        row["thana no"] ??
        row["thana_no"] ??
        row["Thana No"] ??
        row["Thana no."] ??
        row["Thana No."] ??
        null;

      const normalized = normalizeText(thana);
      return normalized || null;
    };

    const villageMap = new Map();

    rows.forEach((r) => {
      if (!r["mouza"]) return;

      const mouza = normalizeText(r["mouza"]);
      const tahasil = normalizeText(r["tahasil"]);
      const thana_no = getThanaNo(r);

      if (!mouza || !tahasil) return;

      const key = `${mouza}_${tahasil}`;
      const existing = villageMap.get(key);

      villageMap.set(key, {
        village_name: mouza,
        tahasil,
        // Keep a non-empty thana number if present in any matching row.
        thana_no: thana_no || existing?.thana_no || null,
      });
    });

    if (!villageMap.size) return {};

    const values = [...villageMap.values()].map((v) => [
      v.village_name,
      v.village_name.replace(/\s+/g, "_").toUpperCase(), // auto village_code
      v.tahasil,
      project_id,
      type,
      v.thana_no,
    ]);

    await db.query(
      `
    INSERT INTO villages
      (village_name, village_code, tahasil, project_id, type, thana_no)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      tahasil = VALUES(tahasil),
      thana_no = COALESCE(NULLIF(VALUES(thana_no), ''), thana_no),
      updated_at = NOW()
    `,
      [values]
    );

    const [villages] = await db.query(
      `
    SELECT id, village_name, tahasil
    FROM villages
    WHERE project_id = ? AND type = ?
    `,
      [project_id, type]
    );

    // return map => { "mouza_tahasil" : village_id }
    const resultMap = {};
    villages.forEach((v) => {
      const key = `${v.village_name}_${v.tahasil}`;
      resultMap[key] = v.id;
    });

    return resultMap;
  },
};

module.exports = govtVillage;
