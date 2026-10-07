const db = require("../config/db");

const test = async (req, res) => {
  return res.status(200).json({ message: "Success" });
};

const deletePrivateProjectData = async (req, res) => {
  const { id: projectId } = req.params;

  if (!projectId) {
    return res
      .status(400)
      .json({ success: false, message: "Project ID is required" });
  }

  // Acquire a client/connection for transaction support
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check if the project exists
    const [project] = await connection.query(
      "SELECT id FROM projects WHERE id = ?",
      [projectId],
    );
    if (project.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // 2. Delete khata_map_documents linked via khatas.project_id
    await connection.query(
      `DELETE kmd FROM khata_map_documents kmd
             INNER JOIN khatas k ON kmd.khata_id = k.id
             WHERE k.project_id = ?`,
      [projectId],
    );

    // 3. Delete from pvt_plot_documents
    await connection.query(
      "DELETE FROM pvt_plot_documents WHERE project_id = ?",
      [projectId],
    );

    // 4. Delete from plot_payments
    await connection.query("DELETE FROM plot_payments WHERE project_id = ?", [
      projectId,
    ]);

    // 5. Delete from plots
    await connection.query("DELETE FROM plots WHERE project_id = ?", [
      projectId,
    ]);

    // 6. Delete from khatas
    await connection.query("DELETE FROM khatas WHERE project_id = ?", [
      projectId,
    ]);

    // 7. Delete from villages
    await connection.query("DELETE FROM villages WHERE project_id = ?", [
      projectId,
    ]);

    // 8. Delete the project itself
    await connection.query("DELETE FROM projects WHERE id = ?", [projectId]);

    // Commit transaction
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Project ${projectId} and all associated data successfully deleted.`,
    });
  } catch (error) {
    // Rollback transaction on failure
    await connection.rollback();
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project and related records",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const deleteForestProject = async (req, res) => {
  const { id: projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required.",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // ---------------------------------------------------------
    // Helper: Delete only if table exists
    // ---------------------------------------------------------
    const deleteIfTableExists = async (tableName, sql, params) => {
      const [tables] = await connection.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        LIMIT 1
        `,
        [tableName],
      );

      if (!tables.length) {
        console.log(`Skipping delete: table "${tableName}" does not exist.`);
        return;
      }

      await connection.query(sql, params);

      console.log(`Deleted records from "${tableName}".`);
    };

    // ---------------------------------------------------------
    // 1. Verify project exists and is Forest Land
    // ---------------------------------------------------------
    const [projects] = await connection.query(
      `
      SELECT id, type
      FROM projects
      WHERE id = ?
      `,
      [projectId],
    );

    if (projects.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projects[0];

    if (project.type !== 3) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Invalid operation: Target project is not a Forest Land project (type = 3).",
      });
    }

    // ---------------------------------------------------------
    // 2. Find linked Forest Project Master records
    // ---------------------------------------------------------
    const [forestMasters] = await connection.query(
      `
      SELECT id
      FROM forest_project_master
      WHERE project_id = ?
      `,
      [projectId],
    );

    const forestMasterIds = forestMasters.map((row) => row.id);

    console.log("Forest Master IDs:", forestMasterIds);

    // ---------------------------------------------------------
    // 3. Delete child Forest records
    // ---------------------------------------------------------
    if (forestMasterIds.length > 0) {
      // forest_stage_0
      await deleteIfTableExists(
        "forest_stage_0",
        `
        DELETE FROM forest_stage_0
        WHERE forest_project_id IN (?)
        `,
        [forestMasterIds],
      );

      // forest_stage_1
      await deleteIfTableExists(
        "forest_stage_1",
        `
        DELETE FROM forest_stage_1
        WHERE forest_project_id IN (?)
        `,
        [forestMasterIds],
      );

      // forest_stage_2
      await deleteIfTableExists(
        "forest_stage_2",
        `
        DELETE FROM forest_stage_2
        WHERE forest_project_id IN (?)
        `,
        [forestMasterIds],
      );

      // forest_post_clearance
      await deleteIfTableExists(
        "forest_post_clearance",
        `
        DELETE FROM forest_post_clearance
        WHERE forest_project_id IN (?)
        `,
        [forestMasterIds],
      );

      // forest_land_schedule
      await deleteIfTableExists(
        "forest_land_schedule",
        `
        DELETE FROM forest_land_schedule
        WHERE project_master_id IN (?)
        `,
        [forestMasterIds],
      );

      // forest_eds_master
      await deleteIfTableExists(
        "forest_eds_master",
        `
        DELETE FROM forest_eds_master
        WHERE project_master_id IN (?)
        `,
        [forestMasterIds],
      );

      // -------------------------------------------------------
      // Delete Forest Project Master
      // -------------------------------------------------------
      await deleteIfTableExists(
        "forest_project_master",
        `
        DELETE FROM forest_project_master
        WHERE id IN (?)
        `,
        [forestMasterIds],
      );
    }

    // ---------------------------------------------------------
    // 4. Delete Forest Level 0 Pre Proposal
    // ---------------------------------------------------------
    await deleteIfTableExists(
      "forest_level_0_pre_proposal",
      `
      DELETE FROM forest_level_0_pre_proposal
      WHERE project_id = ?
      `,
      [projectId],
    );

    // ---------------------------------------------------------
    // 5. Delete main project
    // ---------------------------------------------------------
    await connection.query(
      `
      DELETE FROM projects
      WHERE id = ?
      `,
      [projectId],
    );

    // ---------------------------------------------------------
    // 6. Commit
    // ---------------------------------------------------------
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Forest Project ${projectId} and all associated data were successfully deleted.`,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error deleting forest project:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete forest project and related records.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const throwError = (req, res) => {
  const { type } = req.params;

  switch (type) {
    case "400":
      return res.status(400).json({
        success: false,
        message: "Validation failed. Required fields are missing.",
        error: "VALIDATION_ERROR",
      });

    case "401":
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
        error: "UNAUTHORIZED",
      });

    case "403":
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
        error: "FORBIDDEN",
      });

    case "404":
      return res.status(404).json({
        success: false,
        message: "Requested resource was not found.",
        error: "NOT_FOUND",
      });

    case "409":
      return res.status(409).json({
        success: false,
        message: "Duplicate record already exists.",
        error: "CONFLICT",
      });

    case "422":
      return res.status(422).json({
        success: false,
        message: "Invalid project data submitted.",
        error: "UNPROCESSABLE_ENTITY",
      });

    case "500":
      return res.status(500).json({
        success: false,
        message: "Something went wrong on the server.",
        error: "INTERNAL_SERVER_ERROR",
      });

    default:
      return res.status(200).json({
        success: true,
        message: "No error. API working correctly.",
        data: {
          project: "LIMS",
          version: "1.0.0",
        },
      });
  }
};

const deleteGovtProject = async (req, res) => {
  const { id: projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required.",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // ---------------------------------------------------------
    // Helper: Delete only if table exists
    // ---------------------------------------------------------
    const deleteIfTableExists = async (
      tableName,
      sql,
      params = [],
    ) => {
      const [tables] = await connection.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        LIMIT 1
        `,
        [tableName],
      );

      if (!tables.length) {
        console.log(
          `Skipping delete: table "${tableName}" does not exist.`,
        );

        return;
      }

      const [result] = await connection.query(
        sql,
        params,
      );

      console.log(
        `Deleted ${result.affectedRows || 0} record(s) from "${tableName}".`,
      );
    };

    // ---------------------------------------------------------
    // 1. Verify project exists
    // ---------------------------------------------------------
    const [projects] = await connection.query(
      `
      SELECT id, type
      FROM projects
      WHERE id = ?
      LIMIT 1
      `,
      [projectId],
    );

    if (!projects.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const project = projects[0];

    // ---------------------------------------------------------
    // 2. Make sure this is Government Land
    // type = 2 => Government Land
    // ---------------------------------------------------------
    if (Number(project.type) !== 2) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Invalid operation: Target project is not a Government Land project (type = 2).",
      });
    }

    // ---------------------------------------------------------
    // 3. Get Government Khata IDs
    //
    // We need these IDs before deleting govt_khata because
    // khata_documents and khata_map_documents use khata_id.
    // ---------------------------------------------------------
    let govtKhataIds = [];

    const [khataTable] = await connection.query(
      `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'govt_khata'
      LIMIT 1
      `,
    );

    if (khataTable.length) {
      const [khataRows] = await connection.query(
        `
        SELECT id
        FROM govt_khata
        WHERE project_id = ?
          AND type = ?
        `,
        [projectId, 2],
      );

      govtKhataIds = khataRows.map(
        (row) => row.id,
      );
    } else {
      console.log(
        'Skipping Khata ID lookup: table "govt_khata" does not exist.',
      );
    }

    console.log(
      "Government Khata IDs:",
      govtKhataIds,
    );

    // ---------------------------------------------------------
    // 4. Delete Khata Documents
    // ---------------------------------------------------------
    if (govtKhataIds.length > 0) {
      await deleteIfTableExists(
        "khata_documents",
        `
        DELETE FROM khata_documents
        WHERE khata_id IN (?)
        `,
        [govtKhataIds],
      );

      // -------------------------------------------------------
      // 5. Delete Khata Map Documents
      // -------------------------------------------------------
      await deleteIfTableExists(
        "khata_map_documents",
        `
        DELETE FROM khata_map_documents
        WHERE khata_id IN (?)
        `,
        [govtKhataIds],
      );
    }

    // ---------------------------------------------------------
    // 6. Delete Government Plots
    // ---------------------------------------------------------
    await deleteIfTableExists(
      "govt_plots",
      `
      DELETE FROM govt_plots
      WHERE project_id = ?
        AND type = ?
      `,
      [projectId, 2],
    );

    // ---------------------------------------------------------
    // 7. Delete Government Plot Excel Documents
    // ---------------------------------------------------------
    await deleteIfTableExists(
      "govt_plot_documents",
      `
      DELETE FROM govt_plot_documents
      WHERE project_id = ?
        AND type = ?
      `,
      [projectId, 2],
    );

    // ---------------------------------------------------------
    // 8. Delete Government Khatas
    // ---------------------------------------------------------
    await deleteIfTableExists(
      "govt_khata",
      `
      DELETE FROM govt_khata
      WHERE project_id = ?
        AND type = ?
      `,
      [projectId, 2],
    );

    // ---------------------------------------------------------
    // 9. Delete Government Villages
    //
    // Important:
    // We delete only this project's Government villages.
    // Private/Forest villages remain untouched.
    // ---------------------------------------------------------
    await deleteIfTableExists(
      "villages",
      `
      DELETE FROM villages
      WHERE project_id = ?
        AND type = ?
      `,
      [projectId, 2],
    );

    // ---------------------------------------------------------
    // 10. Delete main project
    // ---------------------------------------------------------
    const [projectDeleteResult] =
      await connection.query(
        `
        DELETE FROM projects
        WHERE id = ?
        `,
        [projectId],
      );

    if (projectDeleteResult.affectedRows === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Project could not be deleted.",
      });
    }

    // ---------------------------------------------------------
    // 11. Commit
    // ---------------------------------------------------------
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Government Land Project ${projectId} and all associated data were successfully deleted.`,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Error deleting Government Land project:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete Government Land project and related records.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  deletePrivateProjectData,
  deleteForestProject,
  throwError,
  test,
  deleteGovtProject,
};
