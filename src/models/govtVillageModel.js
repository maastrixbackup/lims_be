const db = require("../config/db");

const govtVillage = {
  async upsertFromExcel(rows, project_id, type) {
    const villageMap = new Map();

    rows.forEach((r) => {
      if (!r["mouza"]) return;

      const mouza = String(r["mouza"]).trim();
      const tahasil = String(r["tahasil"]).trim();

      if (!mouza || !tahasil) return;

      // const key = `${r["mouza"]}_${r["tahasil"]}`;
      const key = `${mouza}_${tahasil}`;
      villageMap.set(key, {
        village_name: mouza,
        tahasil: tahasil,
      });
    });

    if (!villageMap.size) return {};

    const values = [...villageMap.values()].map((v) => [
      v.village_name,
      v.village_name.replace(/\s+/g, "_").toUpperCase(), // auto village_code
      v.tahasil,
      project_id,
      type,
    ]);

    await db.query(
      `
    INSERT INTO villages
      (village_name, village_code, tahasil, project_id, type)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      tahasil = VALUES(tahasil),
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
