const ForestLand = require("../models/forestLandModel");
const logAction = require("../utils/logger");

// validation helpers
// const validateForestArea = (d) =>
//   d.forest_category_id && d.forest_division && d.forest_range;

// const validateNonForest = (d) => d.ownership && d.fra_allotted !== undefined;

// const validateCA = (d) => d.ca_area_ha && d.patch_name;

const addForestLand = async (req, res) => {
  const userId = req.user.id;

  try {
    const { schedule_type } = req.body;

    if (!schedule_type) {
      return res.status(400).json({
        success: false,
        message: "Schedule type is required",
      });
    }

    // type-wise validation
    // if (schedule_type === "FOREST_AREA" && !validateForestArea(req.body)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid Forest Area data",
    //   });
    // }

    // if (schedule_type === "NON_FOREST_AREA" && !validateNonForest(req.body)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid Non-Forest data",
    //   });
    // }

    // if (
    //   ["CA_LAND", "ACA_LAND"].includes(schedule_type) &&
    //   !validateCA(req.body)
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid CA / ACA data",
    //   });
    // }

    const insertedData = await ForestLand.create(req.body);

    await logAction(
      userId,
      "create forest land",
      "success",
      "Forest land created successfully",
      req.body,
      insertedData,
    );

    res.status(201).json({
      success: true,
      message: "Forest Land Schedule added successfully",
      insertedData,
    });
  } catch (err) {
    await logAction(
      userId,
      "create forest land",
      "failure",
      err.message,
      req.body,
      null,
    );
    console.error(err);
    res.status(500).json({
      success: true,
      message: "Server error",
    });
  }
};

module.exports = {
  addForestLand,
};
