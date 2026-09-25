const db = require("../config/db");

const test = async(req, res) =>{
  return res.status(200).json({message:"Success"})
}

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
            message: 'Project ID is required.' 
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verify that the project exists and is a Forest Project (type = 3)
        const [projects] = await connection.query(
            'SELECT id, type FROM projects WHERE id = ?',
            [projectId]
        );

        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found.' 
            });
        }

        const project = projects[0];

        if (project.type !== 3) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid operation: Target project is not a Forest Land project (type = 3).'
            });
        }

        // 2. Locate linked forest master records (if any exist)
        const [forestMasters] = await connection.query(
            'SELECT id FROM forest_project_master WHERE project_id = ?',
            [projectId]
        );

        const forestMasterIds = forestMasters.map((row) => row.id);

        // 3. Cascade delete child records linked via forest_project_master.id
        if (forestMasterIds.length > 0) {
            // Delete from forest_stage_0
            await connection.query(
                'DELETE FROM forest_stage_0 WHERE forest_project_id IN (?)',
                [forestMasterIds]
            );

            // Delete from forest_stage_1
            await connection.query(
                'DELETE FROM forest_stage_1 WHERE forest_project_id IN (?)',
                [forestMasterIds]
            );

            // Delete from forest_stage_2
            await connection.query(
                'DELETE FROM forest_stage_2 WHERE forest_project_id IN (?)',
                [forestMasterIds]
            );

            // Delete from forest_post_clearance
            await connection.query(
                'DELETE FROM forest_post_clearance WHERE forest_project_id IN (?)',
                [forestMasterIds]
            );

            // Delete from forest_land_schedule
            await connection.query(
                'DELETE FROM forest_land_schedule WHERE project_master_id IN (?)',
                [forestMasterIds]
            );

            // Delete from forest_eds_master
            await connection.query(
                'DELETE FROM forest_eds_master WHERE project_master_id IN (?)',
                [forestMasterIds]
            );

            // Delete records from forest_project_master
            await connection.query(
                'DELETE FROM forest_project_master WHERE id IN (?)',
                [forestMasterIds]
            );
        }

        // 4. Delete from forest_level_0_pre_proposal (linked directly via project_id)
        await connection.query(
            'DELETE FROM forest_level_0_pre_proposal WHERE project_id = ?',
            [projectId]
        );

        // 5. Delete main project record from projects
        await connection.query(
            'DELETE FROM projects WHERE id = ?',
            [projectId]
        );

        // Commit transaction
        await connection.commit();

        return res.status(200).json({
            success: true,
            message: `Forest Project ${projectId} and all associated data were successfully deleted.`
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting forest project:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete forest project and related records.',
            error: error.message
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


module.exports = {
  deletePrivateProjectData,
  deleteForestProject,
  throwError,
  test
};
