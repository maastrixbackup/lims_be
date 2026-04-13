const db = require("../config/db");

const govtVillage = {
  async upsertFromExcel(rows, project_id, type) {
    const normalizeText = (value) =>
      value === undefined || value === null ? "" : String(value).trim();
    const normalizeCompareKey = (key) =>
      key
        ?.toString()
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const getValue = (row, code, ...fallbacks) => {
      const codeKey = normalizeCompareKey(code);
      for (const key of Object.keys(row || {})) {
        const normalized = normalizeCompareKey(key);
        if (normalized === codeKey || normalized.startsWith(`${codeKey} `)) {
          const value = row[key];
          if (normalizeText(value)) return value;
        }
      }
      for (const fb of fallbacks) {
        const fbKey = normalizeCompareKey(fb);
        for (const key of Object.keys(row || {})) {
          if (normalizeCompareKey(key) === fbKey) {
            const value = row[key];
            if (normalizeText(value)) return value;
          }
        }
      }
      return null;
    };

    const getThanaNo = (row) => {
      const thana = getValue(
        row,
        "LD04",
        "thana no",
        "thana_no",
        "Thana No",
        "Thana no.",
        "Thana No.",
      );

      const normalized = normalizeText(thana);
      return normalized || null;
    };

    const villageMap = new Map();

    rows.forEach((r) => {
      const mouzaRaw = getValue(r, "LD02", "mouza", "village", "name of village");
      if (!mouzaRaw) return;

      const mouza = normalizeText(mouzaRaw);
      const tahasil = normalizeText(getValue(r, "LD03", "tahasil"));
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
