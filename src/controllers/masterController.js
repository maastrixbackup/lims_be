const db = require("../config/db");

/**
 * Delete a project and all its associated data across tables
 */
const deleteProjectData = async (req, res) => {
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

module.exports = {
  deleteProjectData,
};
