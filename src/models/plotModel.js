const db = require("../config/db");

const Plot = {
  // async bulkInsert(plots, project_id) {
  //   if (!plots || plots.length === 0) return;
  //   //For new excel
  //   // const hasTahasilThana = plots[0]?.hasOwnProperty("Tahasil/Thana");
  //   // const hasNameOfTahasil = plots[0]?.hasOwnProperty("Name of the Tahasil");

  //   const values = plots.map((plot) => {
  //     let dateValue = plot["Date of Award"];
  //     let formattedDate = null;

  //     if (dateValue) {
  //       if (typeof dateValue === "number") {
  //         const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  //         formattedDate = new Date(
  //           excelEpoch.getTime() + (dateValue - 2) * 86400000
  //         )
  //           .toISOString()
  //           .split("T")[0];
  //       } else if (typeof dateValue === "string") {
  //         const parts = dateValue.includes("-")
  //           ? dateValue.split("-")
  //           : dateValue.split("/");
  //         if (parts.length === 3) {
  //           const [day, month, year] = parts.map((p) => p.trim());
  //           if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
  //             formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
  //               2,
  //               "0"
  //             )}`;
  //           }
  //         }
  //       }
  //     }
  //     //For new excel
  //     // let tahasilName = null;
  //     // let thanaName = null;
  //     // if (hasTahasilThana) {
  //     //   tahasilName = plot["Tahasil/Thana"] || null;
  //     //   thanaName = plot["Tahasil/Thana"] || null;
  //     // } else if (hasNameOfTahasil) {
  //     //   tahasilName = plot["Name of the Tahasil"] || null;
  //     //   thanaName = null;
  //     // } else {
  //     //   tahasilName = null;
  //     //   thanaName = null;
  //     // }

  //     let totalAcres = null;
  //     let totalHectares = null;
  //     let acquiredAcres = null;
  //     let acquiredHectares = null;

  //     // Case 1: Full LA columns present
  //     if (
  //       plot["LA1-Land Area (Total Area in Acres)"] ||
  //       plot["LA2-Land Area (Total Area in Ha.)"]
  //     ) {
  //       totalAcres =
  //         parseFloat(plot["LA1-Land Area (Total Area in Acres)"]) || null;
  //       totalHectares =
  //         parseFloat(plot["LA2-Land Area (Total Area in Ha.)"]) || null;
  //       acquiredAcres =
  //         parseFloat(plot["Land Area (Total Acquired Area in Acres)"]) || null;
  //       acquiredHectares =
  //         parseFloat(plot["Land Area (Total Acquired Area in Ha.)"]) || null;
  //     }

  //     // Case 2: Alternate ROR headers
  //     else if (plot["ROR Area In Ha."] || plot["Area occupied in Ha."]) {
  //       totalHectares = parseFloat(plot["ROR Area In Ha."]) || null;
  //       acquiredHectares = parseFloat(plot["Area occupied in Ha."]) || null;
  //     }

  //     // --- Conversion Logic ---
  //     // Convert missing hectare/acres based on available values (4-decimal precision)
  //     if (totalAcres && !totalHectares)
  //       totalHectares = parseFloat((totalAcres / 2.471).toFixed(4));
  //     if (totalHectares && !totalAcres)
  //       totalAcres = parseFloat((totalHectares * 2.471).toFixed(4));

  //     if (acquiredAcres && !acquiredHectares)
  //       acquiredHectares = parseFloat((acquiredAcres / 2.471).toFixed(4));
  //     if (acquiredHectares && !acquiredAcres)
  //       acquiredAcres = parseFloat((acquiredHectares * 2.471).toFixed(4));

  //     return [
  //       project_id,
  //       plot["SES Survey No."] || null,
  //       plot["LA Case File No."] || null,
  //       formattedDate || null, //for Date of Award
  //       // plot["Date of Award"] || null,
  //       plot["LO1-Name of Recorded Tenant (RT)"] ||
  //         plot["Name of Tenant"] ||
  //         null,
  //       plot["LO2-Name of Present Tenant(s)"] || plot["Name of Tenant"] || null,
  //       plot["Present Address"] || null,
  //       plot["Displaced/Affected Person"] || null,
  //       plot["Name of Village"] || plot["name of village"] || null,
  //       plot["Village Code"] || null,
  //       plot["Name of the Tahasil"] || plot["Tahasil/Thana"] || null, //for tahasil name
  //       plot["Name of the R.I. Circle"] || null,
  //       plot["Tahasil/Thana"] || null, //for thana name
  //       plot["Thana No."] || plot["Thana no"] || null,
  //       plot["Khata No."] || plot["Khata No"] || null,
  //       plot["Plot No."] || null,
  //       plot["Kissam of the Land"] || plot["Kissam"] || null,
  //       plot["LO12-Category of Land"] || null,
  //       plot["LO13-Remarks"] || null,
  //       totalAcres || null,
  //       totalHectares || null,
  //       acquiredAcres || null,
  //       acquiredHectares || null,
  //       // plot["LA1-Land Area (Total Area in Acres)"] || null,
  //       // plot["LA2-Land Area (Total Area in Ha.)"] || null,
  //       // plot["Land Area (Total Acquired Area in Acres)"] || null,
  //       // plot["Land Area (Total Acquired Area in Ha.)"] || null,
  //       plot["Market Value fixed U/S.26 of RFCTLARR Act 2013 (Per Acre)"] ||
  //         null,
  //       plot["Basic Land value"] || null,
  //       plot["Land value  with multiplication factor (Values from 1 to 2)"] ||
  //         null,
  //       plot["No. of Trees"] || null,
  //       plot["Total Value of Trees "] || null,
  //       plot["No. of House"] || null,
  //       plot["Value of Structure (house)"] || null,
  //       plot["Detail of Structures other than House"] || null,
  //       plot["Value of structures other than house"] || null,
  //       plot["Total Value  (Land-22 + Tree-24 + House-26 + Structures-28)"] ||
  //         null,
  //       plot["Solatium @ of (100%)"] || null,
  //       plot["12% additional compensation on market value of land area"] ||
  //         null,
  //       plot["Total Compensation Amount"] || null,
  //       plot[
  //         "LA18-Apportionment Amount of the Award for the Individual Family Member"
  //       ] || null,
  //       plot["LA19-Priority/Urgency"] || null,
  //       plot["LA20-Land Use Plan"] || null,
  //       plot["LA21-Remarks"] || null,
  //       plot["BK01-Bank Account No."] || null,
  //       plot["BK02-Name of the Bank"] || null,
  //       plot["BK03-Name of the Branch with IFSC Code"] || null,
  //       plot["PD01-Aadhaar No."] || null,
  //       plot["PAN No."] || null,
  //       plot["Age"] || null,
  //       plot["Caste"] || null,
  //       plot["Marital Status"] || null,
  //       plot["Education"] || null,
  //       plot["Occupation"] || null,
  //       plot["Annual Income"] || null,
  //       plot["PD09- Skill Acquired"] || null,
  //       plot["PD10-Affidavit with subject details (if any)"] || null,
  //       plot["FD01-No. of Family Members (Major Male)"] || null,
  //       plot["No. of Family Members (Major Female)"] || null,
  //       plot["No. of Family Members (Minor Male)"] || null,
  //       plot["No. of Family Members (Minor Female)"] || null,
  //       plot["No. of Family Members (Major Transgender)"] || null,
  //       plot["No. of Family Members (Minor Transgender)"] || null,
  //       plot["No. of Persons with Disability"] || null,
  //       plot["Family with Orphan Members (Y/N)"] || null,
  //       plot["FD09-Legal Heir Certificate No. (if any)"] || null,
  //       plot["LG01-Land Case - No. (Number)"] || null,
  //       plot["Land Case - Date (Date)"] || null,
  //       plot["Land Case Type"] || null,
  //       plot["Land case - Status"] || null,
  //       plot["LG05-Land Case - Action"] || null,
  //       plot["RR Assistance (Rehab) - Employment in the Project"] || null,
  //       plot["RR Assistance (Rehab) - Cash in lieu of Employment"] || null,
  //       plot["RR Assistance (Rehab) - Training for Skill Upgradation"] || null,
  //       plot["RR Assistance (Rehab) - Assistance for Self Employment"] || null,
  //       plot[
  //         "RR Assistance (Rehab) - Special Allowance to STs for loss of NTFP"
  //       ] || null,
  //       plot[
  //         "RR Assistance (Resettle) - Homested Land Alloted/Self Relocation"
  //       ] || null,
  //       plot["RR Assistance (Resettle) - House Building Assistance"] || null,
  //       plot[
  //         "RR Assistance (Resettle) - Constructed by Project Authority/Self"
  //       ] || null,
  //       plot["RR Assistance (Resettle) - Assistance for Transit Shed"] || null,
  //       plot["RR Assistance (Resettle) - Transportation Allowance"] || null,
  //       plot["RR Assistance (Resettle) - Maintenance Allowance"] || null,
  //       plot[
  //         "RR Assistance (Other) - Special Allowance for Multiple Displacement"
  //       ] || null,
  //       plot["RR Assistance (Other) - Ex-Gratia (if any)"] || null,
  //       plot["RR Assistance (Other) - Other Benefits (if any)"] || null,
  //       plot["GR01-Grievance No. "] || null,
  //       plot["Grievance  Date"] || null,
  //       plot["Grievance - Subject Matter"] || null,
  //       plot["Grievance - Present Status"] || null,
  //       plot["GR05-Grievance - Action taken"] || null,
  //       plot["TR01-Tribunal (Y/N)"] || null,
  //       plot["Tribunal - Date of Deposit"] || null,
  //       plot["TR03-Tribunal - Amount Deposited"] || null,
  //       plot["GV01-Premium"] || null,
  //       plot["GV02-Ground Rent"] || null,
  //       plot["GV03-Cess"] || null,
  //       plot["GV04-Incidental Charges"] || null,
  //       plot["GV05-Total"] || null,
  //       plot["Abatement"] || null,
  //     ];
  //   });

  //   // const [result] = await db.query(
  //   //   `INSERT IGNORE INTO plots (ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant, name_of_present_tenant, present_address, displaced_affected_project, village_name, village_code, tahasil_name, ri_circle_name, thana_no, khata_no, plot_no, kissam_of_land, land_category, lo13_remarks, land_area_total_acres, land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares, market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees, total_value_of_trees, no_of_house, value_of_house, details_of_other_structures, value_of_other_structures, total_value, solatium_100, additional_12_percent, total_compensation, apportionment_amount, priority_urgency, land_use_plan, la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no, age, caste, marital_status, education, occupation, annual_income, skill_acquired, affidavit_details, family_major_male, family_major_female, family_minor_male, family_minor_female, family_major_transgender, family_minor_transgender, persons_with_disability, family_with_orphan_members, legal_heir_certificate_no, land_case_no, land_case_date, land_case_type, land_case_status, land_case_action, rr_employment, rr_cash_in_lieu, rr_training_skill_upgradation, rr_self_employment, rr_special_allowance_st_ntfp, rr_homestead_allotment, rr_house_building_assistance, rr_constructed_by, rr_transit_shed, rr_transport_allowance, rr_maintenance_allowance, rr_multiple_displacement_allowance, rr_exgratia, rr_other_benefits, grievance_no, grievance_date, grievance_subject, grievance_status, grievance_action, tribunal, tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess, incidental_charges, total, abatement ) VALUES ?`,
  //   //   [values]
  //   // );

  //   const [result] = await db.query(
  //     `INSERT INTO plots (
  //       project_id, ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant,
  //       name_of_present_tenant, present_address, displaced_affected_project,
  //       village_name, village_code, tahasil_name, ri_circle_name, thana_name, thana_no, khata_no, plot_no,
  //       kissam_of_land, land_category, lo13_remarks, land_area_total_acres,
  //       land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares,
  //       market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees,
  //       total_value_of_trees, no_of_house, value_of_house, details_of_other_structures,
  //       value_of_other_structures, total_value, solatium_100, additional_12_percent,
  //       total_compensation, apportionment_amount, priority_urgency, land_use_plan,
  //       la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no,
  //       age, caste, marital_status, education, occupation, annual_income, skill_acquired,
  //       affidavit_details, family_major_male, family_major_female, family_minor_male,
  //       family_minor_female, family_major_transgender, family_minor_transgender,
  //       persons_with_disability, family_with_orphan_members, legal_heir_certificate_no,
  //       land_case_no, land_case_date, land_case_type, land_case_status, land_case_action,
  //       rr_employment, rr_cash_in_lieu, rr_training_skill_upgradation, rr_self_employment,
  //       rr_special_allowance_st_ntfp, rr_homestead_allotment, rr_house_building_assistance,
  //       rr_constructed_by, rr_transit_shed, rr_transport_allowance, rr_maintenance_allowance,
  //       rr_multiple_displacement_allowance, rr_exgratia, rr_other_benefits, grievance_no,
  //       grievance_date, grievance_subject, grievance_status, grievance_action, tribunal,
  //       tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess,
  //       incidental_charges, total, abatement
  //     )
  //     VALUES ?
  //     ON DUPLICATE KEY UPDATE
  //       project_id = VALUES(project_id),
  //       ses_survey_no = VALUES(ses_survey_no),
  //       la_case_file_no = VALUES(la_case_file_no),
  //       date_of_award = VALUES(date_of_award),
  //       name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
  //       name_of_present_tenant = VALUES(name_of_present_tenant),
  //       present_address = VALUES(present_address),
  //       displaced_affected_project = VALUES(displaced_affected_project),
  //       village_name = VALUES(village_name),
  //       village_code = VALUES(village_code),
  //       tahasil_name = VALUES(tahasil_name),
  //       ri_circle_name = VALUES(ri_circle_name),
  //       thana_name = VALUES(thana_name),
  //       thana_no = VALUES(thana_no),
  //       khata_no = VALUES(khata_no),
  //       plot_no = VALUES(plot_no),
  //       kissam_of_land = VALUES(kissam_of_land),
  //       land_category = VALUES(land_category),
  //       lo13_remarks = VALUES(lo13_remarks),
  //       land_area_total_acres = VALUES(land_area_total_acres),
  //       land_area_total_hectares = VALUES(land_area_total_hectares),
  //       land_area_acquired_acres = VALUES(land_area_acquired_acres),
  //       land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
  //       market_value_per_acre = VALUES(market_value_per_acre),
  //       basic_land_value = VALUES(basic_land_value),
  //       land_value_with_mf = VALUES(land_value_with_mf),
  //       no_of_trees = VALUES(no_of_trees),
  //       total_value_of_trees = VALUES(total_value_of_trees),
  //       no_of_house = VALUES(no_of_house),
  //       value_of_house = VALUES(value_of_house),
  //       details_of_other_structures = VALUES(details_of_other_structures),
  //       value_of_other_structures = VALUES(value_of_other_structures),
  //       total_value = VALUES(total_value),
  //       solatium_100 = VALUES(solatium_100),
  //       additional_12_percent = VALUES(additional_12_percent),
  //       total_compensation = VALUES(total_compensation),
  //       apportionment_amount = VALUES(apportionment_amount),
  //       priority_urgency = VALUES(priority_urgency),
  //       land_use_plan = VALUES(land_use_plan),
  //       la21_remarks = VALUES(la21_remarks),
  //       bank_account_no = VALUES(bank_account_no),
  //       bank_name = VALUES(bank_name),
  //       branch_ifsc = VALUES(branch_ifsc),
  //       aadhaar_no = VALUES(aadhaar_no),
  //       pan_no = VALUES(pan_no),
  //       age = VALUES(age),
  //       caste = VALUES(caste),
  //       marital_status = VALUES(marital_status),
  //       education = VALUES(education),
  //       occupation = VALUES(occupation),
  //       annual_income = VALUES(annual_income),
  //       skill_acquired = VALUES(skill_acquired),
  //       affidavit_details = VALUES(affidavit_details),
  //       family_major_male = VALUES(family_major_male),
  //       family_major_female = VALUES(family_major_female),
  //       family_minor_male = VALUES(family_minor_male),
  //       family_minor_female = VALUES(family_minor_female),
  //       family_major_transgender = VALUES(family_major_transgender),
  //       family_minor_transgender = VALUES(family_minor_transgender),
  //       persons_with_disability = VALUES(persons_with_disability),
  //       family_with_orphan_members = VALUES(family_with_orphan_members),
  //       legal_heir_certificate_no = VALUES(legal_heir_certificate_no),
  //       land_case_no = VALUES(land_case_no),
  //       land_case_date = VALUES(land_case_date),
  //       land_case_type = VALUES(land_case_type),
  //       land_case_status = VALUES(land_case_status),
  //       land_case_action = VALUES(land_case_action),
  //       rr_employment = VALUES(rr_employment),
  //       rr_cash_in_lieu = VALUES(rr_cash_in_lieu),
  //       rr_training_skill_upgradation = VALUES(rr_training_skill_upgradation),
  //       rr_self_employment = VALUES(rr_self_employment),
  //       rr_special_allowance_st_ntfp = VALUES(rr_special_allowance_st_ntfp),
  //       rr_homestead_allotment = VALUES(rr_homestead_allotment),
  //       rr_house_building_assistance = VALUES(rr_house_building_assistance),
  //       rr_constructed_by = VALUES(rr_constructed_by),
  //       rr_transit_shed = VALUES(rr_transit_shed),
  //       rr_transport_allowance = VALUES(rr_transport_allowance),
  //       rr_maintenance_allowance = VALUES(rr_maintenance_allowance),
  //       rr_multiple_displacement_allowance = VALUES(rr_multiple_displacement_allowance),
  //       rr_exgratia = VALUES(rr_exgratia),
  //       rr_other_benefits = VALUES(rr_other_benefits),
  //       grievance_no = VALUES(grievance_no),
  //       grievance_date = VALUES(grievance_date),
  //       grievance_subject = VALUES(grievance_subject),
  //       grievance_status = VALUES(grievance_status),
  //       grievance_action = VALUES(grievance_action),
  //       tribunal = VALUES(tribunal),
  //       tribunal_deposit_date = VALUES(tribunal_deposit_date),
  //       tribunal_amount = VALUES(tribunal_amount),
  //       premium = VALUES(premium),
  //       ground_rent = VALUES(ground_rent),
  //       cess = VALUES(cess),
  //       incidental_charges = VALUES(incidental_charges),
  //       total = VALUES(total),
  //       abatement = VALUES(abatement),
  //       updated_at = CURRENT_TIMESTAMP`,
  //     [values]
  //   );

  //   // Fetch inserted rows (only the ones that actually went in)
  //   // const insertedPlotNumbers = plots
  //   //   .map((p) => p["SES Survey No."])
  //   //   .filter(Boolean);

  //   // const [rows] = await db.query(
  //   //   `SELECT * FROM plots WHERE ses_survey_no IN (?) LIMIT ?`,
  //   //   [insertedPlotNumbers, result.affectedRows]
  //   // );
  //   // return rows;

  //   // Return number of actually inserted rows
  //   return result.affectedRows || 0;
  // },

  // async bulkInsert(plots, project_id) {
  //   if (!plots || plots.length === 0) return;

  //   let insertedCount = 0;
  //   let updatedCount = 0;

  //   for (const plot of plots) {
  //     const la_case_file_no = plot["LA Case File No."] || null;

  //     if (!la_case_file_no) continue; // Skip if no case file number

  //     // Check if record already exists for same project_id + la_case_file_no
  //     const [existing] = await db.query(
  //       `SELECT id FROM plots WHERE project_id = ? AND la_case_file_no = ? LIMIT 1`,
  //       [project_id, la_case_file_no]
  //     ); //la_case_file_no unique index removed from table

  //     let dateValue = plot["Date of Award"];
  //     let formattedDate = null;

  //     if (dateValue) {
  //       if (typeof dateValue === "number") {
  //         const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  //         formattedDate = new Date(
  //           excelEpoch.getTime() + (dateValue - 2) * 86400000
  //         )
  //           .toISOString()
  //           .split("T")[0];
  //       } else if (typeof dateValue === "string") {
  //         const parts = dateValue.includes("-")
  //           ? dateValue.split("-")
  //           : dateValue.split("/");
  //         if (parts.length === 3) {
  //           const [day, month, year] = parts.map((p) => p.trim());
  //           if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
  //             formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
  //               2,
  //               "0"
  //             )}`;
  //           }
  //         }
  //       }
  //     }

  //     let totalAcres = null;
  //     let totalHectares = null;
  //     let acquiredAcres = null;
  //     let acquiredHectares = null;

  //     // Case 1: Full LA columns present
  //     if (
  //       plot["LA1-Land Area (Total Area in Acres)"] ||
  //       plot["LA2-Land Area (Total Area in Ha.)"]
  //     ) {
  //       totalAcres =
  //         parseFloat(plot["LA1-Land Area (Total Area in Acres)"]) || null;
  //       totalHectares =
  //         parseFloat(plot["LA2-Land Area (Total Area in Ha.)"]) || null;
  //       acquiredAcres =
  //         parseFloat(plot["Land Area (Total Acquired Area in Acres)"]) || null;
  //       acquiredHectares =
  //         parseFloat(plot["Land Area (Total Acquired Area in Ha.)"]) || null;
  //     }

  //     // Case 2: Alternate ROR headers
  //     else if (plot["ROR Area In Ha."] || plot["Area occupied in Ha."]) {
  //       totalHectares = parseFloat(plot["ROR Area In Ha."]) || null;
  //       acquiredHectares = parseFloat(plot["Area occupied in Ha."]) || null;
  //     }

  //     // --- Conversion Logic ---
  //     // Convert missing hectare/acres based on available values (4-decimal precision)
  //     if (totalAcres && !totalHectares)
  //       totalHectares = parseFloat((totalAcres * 2.471).toFixed(4));
  //     if (totalHectares && !totalAcres)
  //       totalAcres = parseFloat((totalHectares / 2.471).toFixed(4));

  //     if (acquiredAcres && !acquiredHectares)
  //       acquiredHectares = parseFloat((acquiredAcres * 2.471).toFixed(4));
  //     if (acquiredHectares && !acquiredAcres)
  //       acquiredAcres = parseFloat((acquiredHectares / 2.471).toFixed(4));

  //     // If exists → UPDATE
  //     if (existing && existing.length > 0) {
  //       await db.query(
  //         `UPDATE plots
  //        SET project_id = ?,
  //       ses_survey_no = ?,
  //       la_case_file_no = ?,
  //       date_of_award = ?,
  //       name_of_recorded_tenant = ?,
  //       name_of_present_tenant = ?,
  //       present_address = ?,
  //       displaced_affected_project = ?,
  //       village_name = ?,
  //       village_code = ?,
  //       tahasil_name = ?,
  //       ri_circle_name = ?,
  //       thana_name = ?,
  //       thana_no = ?,
  //       khata_no = ?,
  //       plot_no = ?,
  //       kissam_of_land = ?,
  //       land_category = ?,
  //       lo13_remarks = ?,
  //       land_area_total_acres = ?,
  //       land_area_total_hectares = ?,
  //       land_area_acquired_acres = ?,
  //       land_area_acquired_hectares = ?,
  //       market_value_per_acre = ?,
  //       basic_land_value = ?,
  //       land_value_with_mf = ?,
  //       no_of_trees = ?,
  //       total_value_of_trees = ?,
  //       no_of_house = ?,
  //       value_of_house = ?,
  //       details_of_other_structures = ?,
  //       value_of_other_structures = ?,
  //       total_value = ?,
  //       solatium_100 = ?,
  //       additional_12_percent = ?,
  //       total_compensation = ?,
  //       apportionment_amount = ?,
  //       priority_urgency = ?,
  //       land_use_plan = ?,
  //       la21_remarks = ?,
  //       bank_account_no = ?,
  //       bank_name = ?,
  //       branch_ifsc = ?,
  //       aadhaar_no = ?,
  //       pan_no = ?,
  //       age = ?,
  //       caste = ?,
  //       marital_status = ?,
  //       education = ?,
  //       occupation = ?,
  //       annual_income = ?,
  //       skill_acquired = ?,
  //       affidavit_details = ?,
  //       family_major_male = ?,
  //       family_major_female = ?,
  //       family_minor_male = ?,
  //       family_minor_female = ?,
  //       family_major_transgender = ?,
  //       family_minor_transgender = ?,
  //       persons_with_disability = ?,
  //       family_with_orphan_members = ?,
  //       legal_heir_certificate_no = ?,
  //       land_case_no = ?,
  //       land_case_date = ?,
  //       land_case_type = ?,
  //       land_case_status = ?,
  //       land_case_action = ?,
  //       rr_employment = ?,
  //       rr_cash_in_lieu = ?,
  //       rr_training_skill_upgradation = ?,
  //       rr_self_employment = ?,
  //       rr_special_allowance_st_ntfp = ?,
  //       rr_homestead_allotment = ?,
  //       rr_house_building_assistance = ?,
  //       rr_constructed_by = ?,
  //       rr_transit_shed = ?,
  //       rr_transport_allowance = ?,
  //       rr_maintenance_allowance = ?,
  //       rr_multiple_displacement_allowance = ?,
  //       rr_exgratia = ?,
  //       rr_other_benefits = ?,
  //       grievance_no = ?,
  //       grievance_date = ?,
  //       grievance_subject = ?,
  //       grievance_status = ?,
  //       grievance_action = ?,
  //       tribunal = ?,
  //       tribunal_deposit_date = ?,
  //       tribunal_amount = ?,
  //       premium = ?,
  //       ground_rent = ?,
  //       cess = ?,
  //       incidental_charges = ?,
  //       total = ?,
  //       abatement = ?,
  //       updated_at = NOW()
  //        WHERE project_id = ? AND la_case_file_no = ?`,
  //         [
  //           project_id,
  //           plot["SES Survey No."] || null,
  //           plot["LA Case File No."] || null,
  //           formattedDate || null, //for Date of Award
  //           // plot["Date of Award"] || null,
  //           plot["LO1-Name of Recorded Tenant (RT)"] ||
  //             plot["Name of Tenant"] ||
  //             null,
  //           plot["LO2-Name of Present Tenant(s)"] ||
  //             plot["Name of Tenant"] ||
  //             null,
  //           plot["Present Address"] || null,
  //           plot["Displaced/Affected Person"] || null,
  //           plot["Name of Village"] || plot["name of village"] || null,
  //           plot["Village Code"] || null,
  //           plot["Name of the Tahasil"] || plot["Tahasil/Thana"] || null, //for tahasil name
  //           plot["Name of the R.I. Circle"] || null,
  //           plot["Tahasil/Thana"] || null, //for thana name
  //           plot["Thana No."] || plot["Thana no"] || null,
  //           plot["Khata No."] || plot["Khata No"] || null,
  //           plot["Plot No."] || null,
  //           plot["Kissam of the Land"] || plot["Kissam"] || null,
  //           plot["LO12-Category of Land"] || null,
  //           plot["LO13-Remarks"] || null,
  //           totalAcres || null,
  //           totalHectares || null,
  //           acquiredAcres || null,
  //           acquiredHectares || null,
  //           // plot["LA1-Land Area (Total Area in Acres)"] || null,
  //           // plot["LA2-Land Area (Total Area in Ha.)"] || null,
  //           // plot["Land Area (Total Acquired Area in Acres)"] || null,
  //           // plot["Land Area (Total Acquired Area in Ha.)"] || null,
  //           plot["Market Value fixed U/S.26 of RFCTLARR Act 2013 (Per Acre)"] ||
  //             null,
  //           plot["Basic Land value"] || null,
  //           plot[
  //             "Land value  with multiplication factor (Values from 1 to 2)"
  //           ] || null,
  //           plot["No. of Trees"] || null,
  //           plot["Total Value of Trees "] || null,
  //           plot["No. of House"] || null,
  //           plot["Value of Structure (house)"] || null,
  //           plot["Detail of Structures other than House"] || null,
  //           plot["Value of structures other than house"] || null,
  //           plot[
  //             "Total Value  (Land-22 + Tree-24 + House-26 + Structures-28)"
  //           ] || null,
  //           plot["Solatium @ of (100%)"] || null,
  //           plot["12% additional compensation on market value of land area"] ||
  //             null,
  //           plot["Total Compensation Amount"] || null,
  //           plot[
  //             "LA18-Apportionment Amount of the Award for the Individual Family Member"
  //           ] || null,
  //           plot["LA19-Priority/Urgency"] || null,
  //           plot["LA20-Land Use Plan"] || null,
  //           plot["LA21-Remarks"] || null,
  //           plot["BK01-Bank Account No."] || null,
  //           plot["BK02-Name of the Bank"] || null,
  //           plot["BK03-Name of the Branch with IFSC Code"] || null,
  //           plot["PD01-Aadhaar No."] || null,
  //           plot["PAN No."] || null,
  //           plot["Age"] || null,
  //           plot["Caste"] || null,
  //           plot["Marital Status"] || null,
  //           plot["Education"] || null,
  //           plot["Occupation"] || null,
  //           plot["Annual Income"] || null,
  //           plot["PD09- Skill Acquired"] || null,
  //           plot["PD10-Affidavit with subject details (if any)"] || null,
  //           plot["FD01-No. of Family Members (Major Male)"] || null,
  //           plot["No. of Family Members (Major Female)"] || null,
  //           plot["No. of Family Members (Minor Male)"] || null,
  //           plot["No. of Family Members (Minor Female)"] || null,
  //           plot["No. of Family Members (Major Transgender)"] || null,
  //           plot["No. of Family Members (Minor Transgender)"] || null,
  //           plot["No. of Persons with Disability"] || null,
  //           plot["Family with Orphan Members (Y/N)"] || null,
  //           plot["FD09-Legal Heir Certificate No. (if any)"] || null,
  //           plot["LG01-Land Case - No. (Number)"] || null,
  //           plot["Land Case - Date (Date)"] || null,
  //           plot["Land Case Type"] || null,
  //           plot["Land case - Status"] || null,
  //           plot["LG05-Land Case - Action"] || null,
  //           plot["RR Assistance (Rehab) - Employment in the Project"] || null,
  //           plot["RR Assistance (Rehab) - Cash in lieu of Employment"] || null,
  //           plot["RR Assistance (Rehab) - Training for Skill Upgradation"] ||
  //             null,
  //           plot["RR Assistance (Rehab) - Assistance for Self Employment"] ||
  //             null,
  //           plot[
  //             "RR Assistance (Rehab) - Special Allowance to STs for loss of NTFP"
  //           ] || null,
  //           plot[
  //             "RR Assistance (Resettle) - Homested Land Alloted/Self Relocation"
  //           ] || null,
  //           plot["RR Assistance (Resettle) - House Building Assistance"] ||
  //             null,
  //           plot[
  //             "RR Assistance (Resettle) - Constructed by Project Authority/Self"
  //           ] || null,
  //           plot["RR Assistance (Resettle) - Assistance for Transit Shed"] ||
  //             null,
  //           plot["RR Assistance (Resettle) - Transportation Allowance"] || null,
  //           plot["RR Assistance (Resettle) - Maintenance Allowance"] || null,
  //           plot[
  //             "RR Assistance (Other) - Special Allowance for Multiple Displacement"
  //           ] || null,
  //           plot["RR Assistance (Other) - Ex-Gratia (if any)"] || null,
  //           plot["RR Assistance (Other) - Other Benefits (if any)"] || null,
  //           plot["GR01-Grievance No. "] || null,
  //           plot["Grievance  Date"] || null,
  //           plot["Grievance - Subject Matter"] || null,
  //           plot["Grievance - Present Status"] || null,
  //           plot["GR05-Grievance - Action taken"] || null,
  //           plot["TR01-Tribunal (Y/N)"] || null,
  //           plot["Tribunal - Date of Deposit"] || null,
  //           plot["TR03-Tribunal - Amount Deposited"] || null,
  //           plot["GV01-Premium"] || null,
  //           plot["GV02-Ground Rent"] || null,
  //           plot["GV03-Cess"] || null,
  //           plot["GV04-Incidental Charges"] || null,
  //           plot["GV05-Total"] || null,
  //           plot["Abatement"] || null,
  //           project_id,
  //           plot["LA Case File No."] || null,
  //         ]
  //       );
  //       updatedCount++;
  //     }
  //     // Else → INSERT
  //     else {
  //       await db.query(
  //         `INSERT INTO plots
  //        (project_id, ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant,
  //       name_of_present_tenant, present_address, displaced_affected_project,
  //       village_name, village_code, tahasil_name, ri_circle_name, thana_name, thana_no, khata_no, plot_no,
  //       kissam_of_land, land_category, lo13_remarks, land_area_total_acres,
  //       land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares,
  //       market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees,
  //       total_value_of_trees, no_of_house, value_of_house, details_of_other_structures,
  //       value_of_other_structures, total_value, solatium_100, additional_12_percent,
  //       total_compensation, apportionment_amount, priority_urgency, land_use_plan,
  //       la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no,
  //       age, caste, marital_status, education, occupation, annual_income, skill_acquired,
  //       affidavit_details, family_major_male, family_major_female, family_minor_male,
  //       family_minor_female, family_major_transgender, family_minor_transgender,
  //       persons_with_disability, family_with_orphan_members, legal_heir_certificate_no,
  //       land_case_no, land_case_date, land_case_type, land_case_status, land_case_action,
  //       rr_employment, rr_cash_in_lieu, rr_training_skill_upgradation, rr_self_employment,
  //       rr_special_allowance_st_ntfp, rr_homestead_allotment, rr_house_building_assistance,
  //       rr_constructed_by, rr_transit_shed, rr_transport_allowance, rr_maintenance_allowance,
  //       rr_multiple_displacement_allowance, rr_exgratia, rr_other_benefits, grievance_no,
  //       grievance_date, grievance_subject, grievance_status, grievance_action, tribunal,
  //       tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess,
  //       incidental_charges, total, abatement)
  //        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  //         [
  //           project_id,
  //           plot["SES Survey No."] || null,
  //           plot["LA Case File No."] || null,
  //           formattedDate || null, //for Date of Award
  //           // plot["Date of Award"] || null,
  //           plot["LO1-Name of Recorded Tenant (RT)"] ||
  //             plot["Name of Tenant"] ||
  //             null,
  //           plot["LO2-Name of Present Tenant(s)"] ||
  //             plot["Name of Tenant"] ||
  //             null,
  //           plot["Present Address"] || null,
  //           plot["Displaced/Affected Person"] || null,
  //           plot["Name of Village"] || plot["name of village"] || null,
  //           plot["Village Code"] || null,
  //           plot["Name of the Tahasil"] || plot["Tahasil/Thana"] || null, //for tahasil name
  //           plot["Name of the R.I. Circle"] || null,
  //           plot["Tahasil/Thana"] || null, //for thana name
  //           plot["Thana No."] || plot["Thana no"] || null,
  //           plot["Khata No."] || plot["Khata No"] || null,
  //           plot["Plot No."] || null,
  //           plot["Kissam of the Land"] || plot["Kissam"] || null,
  //           plot["LO12-Category of Land"] || null,
  //           plot["LO13-Remarks"] || null,
  //           totalAcres || null,
  //           totalHectares || null,
  //           acquiredAcres || null,
  //           acquiredHectares || null,
  //           // plot["LA1-Land Area (Total Area in Acres)"] || null,
  //           // plot["LA2-Land Area (Total Area in Ha.)"] || null,
  //           // plot["Land Area (Total Acquired Area in Acres)"] || null,
  //           // plot["Land Area (Total Acquired Area in Ha.)"] || null,
  //           plot["Market Value fixed U/S.26 of RFCTLARR Act 2013 (Per Acre)"] ||
  //             null,
  //           plot["Basic Land value"] || null,
  //           plot[
  //             "Land value  with multiplication factor (Values from 1 to 2)"
  //           ] || null,
  //           plot["No. of Trees"] || null,
  //           plot["Total Value of Trees "] || null,
  //           plot["No. of House"] || null,
  //           plot["Value of Structure (house)"] || null,
  //           plot["Detail of Structures other than House"] || null,
  //           plot["Value of structures other than house"] || null,
  //           plot[
  //             "Total Value  (Land-22 + Tree-24 + House-26 + Structures-28)"
  //           ] || null,
  //           plot["Solatium @ of (100%)"] || null,
  //           plot["12% additional compensation on market value of land area"] ||
  //             null,
  //           plot["Total Compensation Amount"] || null,
  //           plot[
  //             "LA18-Apportionment Amount of the Award for the Individual Family Member"
  //           ] || null,
  //           plot["LA19-Priority/Urgency"] || null,
  //           plot["LA20-Land Use Plan"] || null,
  //           plot["LA21-Remarks"] || null,
  //           plot["BK01-Bank Account No."] || null,
  //           plot["BK02-Name of the Bank"] || null,
  //           plot["BK03-Name of the Branch with IFSC Code"] || null,
  //           plot["PD01-Aadhaar No."] || null,
  //           plot["PAN No."] || null,
  //           plot["Age"] || null,
  //           plot["Caste"] || null,
  //           plot["Marital Status"] || null,
  //           plot["Education"] || null,
  //           plot["Occupation"] || null,
  //           plot["Annual Income"] || null,
  //           plot["PD09- Skill Acquired"] || null,
  //           plot["PD10-Affidavit with subject details (if any)"] || null,
  //           plot["FD01-No. of Family Members (Major Male)"] || null,
  //           plot["No. of Family Members (Major Female)"] || null,
  //           plot["No. of Family Members (Minor Male)"] || null,
  //           plot["No. of Family Members (Minor Female)"] || null,
  //           plot["No. of Family Members (Major Transgender)"] || null,
  //           plot["No. of Family Members (Minor Transgender)"] || null,
  //           plot["No. of Persons with Disability"] || null,
  //           plot["Family with Orphan Members (Y/N)"] || null,
  //           plot["FD09-Legal Heir Certificate No. (if any)"] || null,
  //           plot["LG01-Land Case - No. (Number)"] || null,
  //           plot["Land Case - Date (Date)"] || null,
  //           plot["Land Case Type"] || null,
  //           plot["Land case - Status"] || null,
  //           plot["LG05-Land Case - Action"] || null,
  //           plot["RR Assistance (Rehab) - Employment in the Project"] || null,
  //           plot["RR Assistance (Rehab) - Cash in lieu of Employment"] || null,
  //           plot["RR Assistance (Rehab) - Training for Skill Upgradation"] ||
  //             null,
  //           plot["RR Assistance (Rehab) - Assistance for Self Employment"] ||
  //             null,
  //           plot[
  //             "RR Assistance (Rehab) - Special Allowance to STs for loss of NTFP"
  //           ] || null,
  //           plot[
  //             "RR Assistance (Resettle) - Homested Land Alloted/Self Relocation"
  //           ] || null,
  //           plot["RR Assistance (Resettle) - House Building Assistance"] ||
  //             null,
  //           plot[
  //             "RR Assistance (Resettle) - Constructed by Project Authority/Self"
  //           ] || null,
  //           plot["RR Assistance (Resettle) - Assistance for Transit Shed"] ||
  //             null,
  //           plot["RR Assistance (Resettle) - Transportation Allowance"] || null,
  //           plot["RR Assistance (Resettle) - Maintenance Allowance"] || null,
  //           plot[
  //             "RR Assistance (Other) - Special Allowance for Multiple Displacement"
  //           ] || null,
  //           plot["RR Assistance (Other) - Ex-Gratia (if any)"] || null,
  //           plot["RR Assistance (Other) - Other Benefits (if any)"] || null,
  //           plot["GR01-Grievance No. "] || null,
  //           plot["Grievance  Date"] || null,
  //           plot["Grievance - Subject Matter"] || null,
  //           plot["Grievance - Present Status"] || null,
  //           plot["GR05-Grievance - Action taken"] || null,
  //           plot["TR01-Tribunal (Y/N)"] || null,
  //           plot["Tribunal - Date of Deposit"] || null,
  //           plot["TR03-Tribunal - Amount Deposited"] || null,
  //           plot["GV01-Premium"] || null,
  //           plot["GV02-Ground Rent"] || null,
  //           plot["GV03-Cess"] || null,
  //           plot["GV04-Incidental Charges"] || null,
  //           plot["GV05-Total"] || null,
  //           plot["Abatement"] || null,
  //         ]
  //       );
  //       insertedCount++;
  //     }
  //   }

  //   return { insertedCount, updatedCount };
  // },

  // async bulkInsert(plots, project_id, type) {
  //   if (!plots || plots.length === 0) return;

  //   // fetch project name
  //   const [projectRows] = await db.query(
  //     "SELECT project_name FROM projects WHERE id = ?",
  //     [project_id]
  //   );

  //   const projectName = projectRows[0].project_name;

  //   const values = plots.map((plot) => {
  //     //Handle date formatting
  //     let dateValue = plot["Date of Award"];
  //     let formattedDate = null;

  //     if (dateValue) {
  //       if (typeof dateValue === "number") {
  //         const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  //         formattedDate = new Date(
  //           excelEpoch.getTime() + (dateValue - 2) * 86400000
  //         )
  //           .toISOString()
  //           .split("T")[0];
  //       } else if (typeof dateValue === "string") {
  //         const parts = dateValue.includes("-")
  //           ? dateValue.split("-")
  //           : dateValue.split("/");
  //         if (parts.length === 3) {
  //           const [day, month, year] = parts.map((p) => p.trim());
  //           if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
  //             formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
  //               2,
  //               "0"
  //             )}`;
  //           }
  //         }
  //       }
  //     }

  //     //Land area conversion logic
  //     let totalAcres = null;
  //     let totalHectares = null;
  //     let acquiredAcres = null;
  //     let acquiredHectares = null;

  //     if (
  //       plot["LA1-Land Area (Total Area in Acres)"] ||
  //       plot["LA2-Land Area (Total Area in Ha.)"]
  //     ) {
  //       totalAcres =
  //         parseFloat(plot["LA1-Land Area (Total Area in Acres)"]) || null;
  //       totalHectares =
  //         parseFloat(plot["LA2-Land Area (Total Area in Ha.)"]) || null;
  //       acquiredAcres =
  //         parseFloat(plot["Land Area (Total Acquired Area in Acres)"]) || null;
  //       acquiredHectares =
  //         parseFloat(plot["Land Area (Total Acquired Area in Ha.)"]) || null;
  //     } else if (plot["ROR Area In Ha."] || plot["Area occupied in Ha."]) {
  //       totalHectares = parseFloat(plot["ROR Area In Ha."]) || null;
  //       acquiredHectares = parseFloat(plot["Area occupied in Ha."]) || null;
  //     }

  //     if (totalAcres && !totalHectares)
  //       totalHectares = parseFloat((totalAcres * 2.471).toFixed(4));
  //     if (totalHectares && !totalAcres)
  //       totalAcres = parseFloat((totalHectares / 2.471).toFixed(4));

  //     if (acquiredAcres && !acquiredHectares)
  //       acquiredHectares = parseFloat((acquiredAcres * 2.471).toFixed(4));
  //     if (acquiredHectares && !acquiredAcres)
  //       acquiredAcres = parseFloat((acquiredHectares / 2.471).toFixed(4));

  //     const villageCode = plot["Village Code"] || plot["village code"] || "NA";

  //     const khataNo = plot["Khata No."] || plot["Khata No"] || "NA";
  //     const laCaseFileNo = `${projectName}/${villageCode}/${khataNo}`;
  //     //Return final row array
  //     return [
  //       project_id,
  //       plot["SES Survey No."] || null,
  //       // plot["LA Case File No."] || null,
  //       laCaseFileNo,
  //       formattedDate || null,
  //       plot["LO1-Name of Recorded Tenant (RT)"] ||
  //         plot["Name of Tenant"] ||
  //         null,
  //       plot["LO2-Name of Present Tenant(s)"] || plot["Name of Tenant"] || null,
  //       plot["Present Address"] || null,
  //       plot["Displaced/Affected Person"] || null,
  //       plot["Name of Village"] || plot["name of village"] || null,
  //       plot["Village Code"] || null,
  //       plot["Name of the Tahasil"] || plot["Tahasil/Thana"] || null,
  //       plot["Name of the R.I. Circle"] || null,
  //       plot["Tahasil/Thana"] || null,
  //       plot["Thana No."] || plot["Thana no"] || null,
  //       plot["Khata No."] || plot["Khata No"] || null,
  //       plot["Plot No."] || null,
  //       plot["Kissam of the Land"] || plot["Kissam"] || null,
  //       plot["LO12-Category of Land"] || null,
  //       plot["LO13-Remarks"] || null,
  //       totalAcres || null,
  //       totalHectares || null,
  //       acquiredAcres || null,
  //       acquiredHectares || null,
  //       plot["Market Value fixed U/S.26 of RFCTLARR Act 2013 (Per Acre)"] ||
  //         null,
  //       plot["Basic Land value"] || null,
  //       plot["Land value  with multiplication factor (Values from 1 to 2)"] ||
  //         null,
  //       plot["No. of Trees"] || null,
  //       plot["Total Value of Trees "] || null,
  //       plot["No. of House"] || null,
  //       plot["Value of Structure (house)"] || null,
  //       plot["Detail of Structures other than House"] || null,
  //       plot["Value of structures other than house"] || null,
  //       plot["Total Value  (Land-22 + Tree-24 + House-26 + Structures-28)"] ||
  //         null,
  //       plot["Solatium @ of (100%)"] || null,
  //       plot["12% additional compensation on market value of land area"] ||
  //         null,
  //       plot["Total Compensation Amount"] || null,
  //       plot[
  //         "LA18-Apportionment Amount of the Award for the Individual Family Member"
  //       ] || null,
  //       plot["LA19-Priority/Urgency"] || null,
  //       plot["LA20-Land Use Plan"] || null,
  //       plot["LA21-Remarks"] || null,
  //       plot["BK01-Bank Account No."] || null,
  //       plot["BK02-Name of the Bank"] || null,
  //       plot["BK03-Name of the Branch with IFSC Code"] || null,
  //       plot["PD01-Aadhaar No."] || null,
  //       plot["PAN No."] || null,
  //       plot["Age"] || null,
  //       plot["Caste"] || null,
  //       plot["Marital Status"] || null,
  //       plot["Education"] || null,
  //       plot["Occupation"] || null,
  //       plot["Annual Income"] || null,
  //       plot["PD09- Skill Acquired"] || null,
  //       plot["PD10-Affidavit with subject details (if any)"] || null,
  //       plot["FD01-No. of Family Members (Major Male)"] || null,
  //       plot["No. of Family Members (Major Female)"] || null,
  //       plot["No. of Family Members (Minor Male)"] || null,
  //       plot["No. of Family Members (Minor Female)"] || null,
  //       plot["No. of Family Members (Major Transgender)"] || null,
  //       plot["No. of Family Members (Minor Transgender)"] || null,
  //       plot["No. of Persons with Disability"] || null,
  //       plot["Family with Orphan Members (Y/N)"] || null,
  //       plot["FD09-Legal Heir Certificate No. (if any)"] || null,
  //       plot["LG01-Land Case - No. (Number)"] || null,
  //       plot["Land Case - Date (Date)"] || null,
  //       plot["Land Case Type"] || null,
  //       plot["Land case - Status"] || null,
  //       plot["LG05-Land Case - Action"] || null,
  //       plot["RR Assistance (Rehab) - Employment in the Project"] || null,
  //       plot["RR Assistance (Rehab) - Cash in lieu of Employment"] || null,
  //       plot["RR Assistance (Rehab) - Training for Skill Upgradation"] || null,
  //       plot["RR Assistance (Rehab) - Assistance for Self Employment"] || null,
  //       plot[
  //         "RR Assistance (Rehab) - Special Allowance to STs for loss of NTFP"
  //       ] || null,
  //       plot[
  //         "RR Assistance (Resettle) - Homested Land Alloted/Self Relocation"
  //       ] || null,
  //       plot["RR Assistance (Resettle) - House Building Assistance"] || null,
  //       plot[
  //         "RR Assistance (Resettle) - Constructed by Project Authority/Self"
  //       ] || null,
  //       plot["RR Assistance (Resettle) - Assistance for Transit Shed"] || null,
  //       plot["RR Assistance (Resettle) - Transportation Allowance"] || null,
  //       plot["RR Assistance (Resettle) - Maintenance Allowance"] || null,
  //       plot[
  //         "RR Assistance (Other) - Special Allowance for Multiple Displacement"
  //       ] || null,
  //       plot["RR Assistance (Other) - Ex-Gratia (if any)"] || null,
  //       plot["RR Assistance (Other) - Other Benefits (if any)"] || null,
  //       plot["GR01-Grievance No. "] || null,
  //       plot["Grievance  Date"] || null,
  //       plot["Grievance - Subject Matter"] || null,
  //       plot["Grievance - Present Status"] || null,
  //       plot["GR05-Grievance - Action taken"] || null,
  //       plot["TR01-Tribunal (Y/N)"] || null,
  //       plot["Tribunal - Date of Deposit"] || null,
  //       plot["TR03-Tribunal - Amount Deposited"] || null,
  //       plot["GV01-Premium"] || null,
  //       plot["GV02-Ground Rent"] || null,
  //       plot["GV03-Cess"] || null,
  //       plot["GV04-Incidental Charges"] || null,
  //       plot["GV05-Total"] || null,
  //       plot["Abatement"] || null,
  //       type,
  //     ];
  //   });

  //   const [result] = await db.query(
  //     `
  //   INSERT INTO plots (
  //     project_id, ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant,
  //     name_of_present_tenant, present_address, displaced_affected_project,
  //     village_name, village_code, tahasil_name, ri_circle_name, thana_name, thana_no, khata_no, plot_no,
  //     kissam_of_land, land_category, lo13_remarks, land_area_total_acres,
  //     land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares,
  //     market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees,
  //     total_value_of_trees, no_of_house, value_of_house, details_of_other_structures,
  //     value_of_other_structures, total_value, solatium_100, additional_12_percent,
  //     total_compensation, apportionment_amount, priority_urgency, land_use_plan,
  //     la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no,
  //     age, caste, marital_status, education, occupation, annual_income, skill_acquired,
  //     affidavit_details, family_major_male, family_major_female, family_minor_male,
  //     family_minor_female, family_major_transgender, family_minor_transgender,
  //     persons_with_disability, family_with_orphan_members, legal_heir_certificate_no,
  //     land_case_no, land_case_date, land_case_type, land_case_status, land_case_action,
  //     rr_employment, rr_cash_in_lieu, rr_training_skill_upgradation, rr_self_employment,
  //     rr_special_allowance_st_ntfp, rr_homestead_allotment, rr_house_building_assistance,
  //     rr_constructed_by, rr_transit_shed, rr_transport_allowance, rr_maintenance_allowance,
  //     rr_multiple_displacement_allowance, rr_exgratia, rr_other_benefits, grievance_no,
  //     grievance_date, grievance_subject, grievance_status, grievance_action, tribunal,
  //     tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess,
  //     incidental_charges, total, abatement, type
  //   )
  //   VALUES ?
  //   ON DUPLICATE KEY UPDATE
  //     project_id = VALUES(project_id),
  //     ses_survey_no = VALUES(ses_survey_no),
  //     la_case_file_no = VALUES(la_case_file_no),
  //     date_of_award = VALUES(date_of_award),
  //     name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
  //     name_of_present_tenant = VALUES(name_of_present_tenant),
  //     present_address = VALUES(present_address),
  //     displaced_affected_project = VALUES(displaced_affected_project),
  //     village_name = VALUES(village_name),
  //     village_code = VALUES(village_code),
  //     tahasil_name = VALUES(tahasil_name),
  //     ri_circle_name = VALUES(ri_circle_name),
  //     thana_name = VALUES(thana_name),
  //     thana_no = VALUES(thana_no),
  //     khata_no = VALUES(khata_no),
  //     plot_no = VALUES(plot_no),
  //     kissam_of_land = VALUES(kissam_of_land),
  //     land_category = VALUES(land_category),
  //     lo13_remarks = VALUES(lo13_remarks),
  //     land_area_total_acres = VALUES(land_area_total_acres),
  //     land_area_total_hectares = VALUES(land_area_total_hectares),
  //     land_area_acquired_acres = VALUES(land_area_acquired_acres),
  //     land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
  //     market_value_per_acre = VALUES(market_value_per_acre),
  //     basic_land_value = VALUES(basic_land_value),
  //     land_value_with_mf = VALUES(land_value_with_mf),
  //     no_of_trees = VALUES(no_of_trees),
  //     total_value_of_trees = VALUES(total_value_of_trees),
  //     no_of_house = VALUES(no_of_house),
  //     value_of_house = VALUES(value_of_house),
  //     details_of_other_structures = VALUES(details_of_other_structures),
  //     value_of_other_structures = VALUES(value_of_other_structures),
  //     total_value = VALUES(total_value),
  //     solatium_100 = VALUES(solatium_100),
  //     additional_12_percent = VALUES(additional_12_percent),
  //     total_compensation = VALUES(total_compensation),
  //     apportionment_amount = VALUES(apportionment_amount),
  //     priority_urgency = VALUES(priority_urgency),
  //     land_use_plan = VALUES(land_use_plan),
  //     la21_remarks = VALUES(la21_remarks),
  //     bank_account_no = VALUES(bank_account_no),
  //     bank_name = VALUES(bank_name),
  //     branch_ifsc = VALUES(branch_ifsc),
  //     aadhaar_no = VALUES(aadhaar_no),
  //     pan_no = VALUES(pan_no),
  //     age = VALUES(age),
  //     caste = VALUES(caste),
  //     marital_status = VALUES(marital_status),
  //     education = VALUES(education),
  //     occupation = VALUES(occupation),
  //     annual_income = VALUES(annual_income),
  //     skill_acquired = VALUES(skill_acquired),
  //     affidavit_details = VALUES(affidavit_details),
  //     family_major_male = VALUES(family_major_male),
  //     family_major_female = VALUES(family_major_female),
  //     family_minor_male = VALUES(family_minor_male),
  //     family_minor_female = VALUES(family_minor_female),
  //     family_major_transgender = VALUES(family_major_transgender),
  //     family_minor_transgender = VALUES(family_minor_transgender),
  //     persons_with_disability = VALUES(persons_with_disability),
  //     family_with_orphan_members = VALUES(family_with_orphan_members),
  //     legal_heir_certificate_no = VALUES(legal_heir_certificate_no),
  //     land_case_no = VALUES(land_case_no),
  //     land_case_date = VALUES(land_case_date),
  //     land_case_type = VALUES(land_case_type),
  //     land_case_status = VALUES(land_case_status),
  //     land_case_action = VALUES(land_case_action),
  //     rr_employment = VALUES(rr_employment),
  //     rr_cash_in_lieu = VALUES(rr_cash_in_lieu),
  //     rr_training_skill_upgradation = VALUES(rr_training_skill_upgradation),
  //     rr_self_employment = VALUES(rr_self_employment),
  //     rr_special_allowance_st_ntfp = VALUES(rr_special_allowance_st_ntfp),
  //     rr_homestead_allotment = VALUES(rr_homestead_allotment),
  //     rr_house_building_assistance = VALUES(rr_house_building_assistance),
  //     rr_constructed_by = VALUES(rr_constructed_by),
  //     rr_transit_shed = VALUES(rr_transit_shed),
  //     rr_transport_allowance = VALUES(rr_transport_allowance),
  //     rr_maintenance_allowance = VALUES(rr_maintenance_allowance),
  //     rr_multiple_displacement_allowance = VALUES(rr_multiple_displacement_allowance),
  //     rr_exgratia = VALUES(rr_exgratia),
  //     rr_other_benefits = VALUES(rr_other_benefits),
  //     grievance_no = VALUES(grievance_no),
  //     grievance_date = VALUES(grievance_date),
  //     grievance_subject = VALUES(grievance_subject),
  //     grievance_status = VALUES(grievance_status),
  //     grievance_action = VALUES(grievance_action),
  //     tribunal = VALUES(tribunal),
  //     tribunal_deposit_date = VALUES(tribunal_deposit_date),
  //     tribunal_amount = VALUES(tribunal_amount),
  //     premium = VALUES(premium),
  //     ground_rent = VALUES(ground_rent),
  //     cess = VALUES(cess),
  //     incidental_charges = VALUES(incidental_charges),
  //     total = VALUES(total),
  //     abatement = VALUES(abatement),
  //     type = VALUES(type),
  //     updated_at = CURRENT_TIMESTAMP
  //   `,
  //     [values]
  //   );

  //   return result.affectedRows || 0;
  // },

  async bulkInsert(plots, project_id, type) {
    if (!plots || plots.length === 0) return;

    // fetch project name
    const [projectRows] = await db.query(
      "SELECT client_code FROM projects WHERE id = ?",
      [project_id],
    );

    const clientCode = projectRows[0].client_code;

    const pad2 = (n) => String(n).padStart(2, "0");
    const toMysqlDate = (rawValue) => {
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return null;
      }

      const buildDate = (year, month, day) => {
        const y = Number(year);
        const m = Number(month);
        const d = Number(day);
        if (!y || !m || !d) return null;

        const dt = new Date(Date.UTC(y, m - 1, d));
        const isValid =
          dt.getUTCFullYear() === y &&
          dt.getUTCMonth() === m - 1 &&
          dt.getUTCDate() === d;

        if (!isValid) return null;
        return `${y}-${pad2(m)}-${pad2(d)}`;
      };

      // Excel serial number (or numeric string)
      if (
        typeof rawValue === "number" ||
        (typeof rawValue === "string" && /^\d+(\.\d+)?$/.test(rawValue.trim()))
      ) {
        const serial = Math.floor(Number(rawValue));
        if (!Number.isFinite(serial) || serial <= 0) return null;
        // Excel epoch (Windows): 1899-12-30
        const excelBase = new Date(Date.UTC(1899, 11, 30));
        excelBase.setUTCDate(excelBase.getUTCDate() + serial);
        return `${excelBase.getUTCFullYear()}-${pad2(
          excelBase.getUTCMonth() + 1,
        )}-${pad2(excelBase.getUTCDate())}`;
      }

      if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
        return `${rawValue.getFullYear()}-${pad2(
          rawValue.getMonth() + 1,
        )}-${pad2(rawValue.getDate())}`;
      }

      if (typeof rawValue !== "string") return null;
      const value = rawValue.trim();
      if (!value) return null;

      // DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY
      let match = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (match) {
        const [, d, m, y] = match;
        return buildDate(y, m, d);
      }

      // YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
      match = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (match) {
        const [, y, m, d] = match;
        return buildDate(y, m, d);
      }

      // Last fallback for textual date strings
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(
          parsed.getDate(),
        )}`;
      }

      return null;
    };

    const values = plots.map((plot) => {
      const normalizeKey = (key) =>
        key
          ?.toString()
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

      const normalizeCode = (code) => {
        const raw = code?.toString().replace(/\s+/g, "").toUpperCase();
        if (!raw) return "";
        const match = raw.match(/^([A-Z]+)0*([0-9]+)$/);
        return match ? `${match[1]}${Number(match[2])}` : raw;
      };

      const normalizedPlot = new Proxy(plot, {
        get(target, prop) {
          if (typeof prop !== "string") return target[prop];
          if (Reflect.has(target, prop)) return target[prop];
          const normalizedProp = normalizeKey(prop);
          for (const key of Object.keys(target)) {
            if (normalizeKey(key) === normalizedProp) {
              return target[key];
            }
          }
          return undefined;
        },
      });

      plot = normalizedPlot;
      const normalizeHeaderLoose = (value) =>
        normalizeKey(value).replace(/[^a-z0-9]+/g, "");
      const getCell = (...headers) => {
        for (const header of headers) {
          const value = plot[header];
          if (value !== undefined && value !== null && value !== "") return value;
        }

        const rowEntries = Object.entries(plot).map(([k, v]) => [
          normalizeHeaderLoose(k),
          v,
        ]);

        for (const header of headers) {
          const target = normalizeHeaderLoose(header);
          const matched = rowEntries.find(
            ([k, v]) => k === target && v !== undefined && v !== null && v !== "",
          );
          if (matched) return matched[1];
        }

        return null;
      };

      const get = (code, ...fallbacks) => {
        const direct = plot[code];
        if (direct !== undefined && direct !== null && direct !== "") return direct;

        const canonicalCode = normalizeCode(code);
        if (canonicalCode && canonicalCode !== code) {
          const canonical = plot[canonicalCode];
          if (canonical !== undefined && canonical !== null && canonical !== "") {
            return canonical;
          }
        }

        return getCell(...fallbacks);
      };

      // LO - Land owner / tenant fields
      const surveyNo = get("LO05", "SES Survey No.");
      const recordedTenant = get(
        "LO01",
        "LO1-Name of Recorded Tenant (RT)",
        "Name of Tenant",
      );
      const presentTenant = get(
        "LO02",
        "LO2-Name of Present Tenant(s)",
        "Name of Tenant",
      );
      const address = get("LO03", "Present Address");
      const displaced = get("LO04", "Displaced/Affected Person");
      const awardDate = toMysqlDate(get("LO06", "Date of Award", "Date of award"));

      // LD - Land detail fields
      const district = get("LD01", "District", "district");
      const villageName = get("LD02", "Name of Village", "name of village");
      const tahasil = get("LD03", "Name of the Tahasil", "Tahasil/Thana");
      const riCircle = get("LD04", "Name of the R.I. Circle");
      const thanaNo = get("LD05", "Thana No.", "Thana no", "Thana No");
      const khataNo = get("LD06", "Khata No.", "Khata No");
      const plotNo = get("LD07", "Plot No.");
      const kissam = get("LD08", "Kissam of the Land", "Kissam");
      const landCategory = get("LD09", "LO12-Category of Land");
      const ldRemarks = get("LD10", "LO13-Remarks");
      const fullPart = get("LD11", "Full/Part", "Full Part");

      // LA - Land acquisition fields
      let totalAcres =
        parseFloat(
          get(
            "LA01",
            "LA1-Land Area (Total Area in Acres)",
            "Land Area (Total Area in Acres)",
          ),
        ) || null;
      let totalHectares =
        parseFloat(
          get(
            "LA02",
            "LA2-Land Area (Total Area in Ha.)",
            "Land Area (Total Area in Ha.)",
            "ROR Area In Ha.",
          ),
        ) || null;
      let acquiredAcres =
        parseFloat(
          get(
            "LA03",
            "Land Area (Total Acquired Area in Acres)",
            "Land Area (Acquired Area in Acres)",
          ),
        ) || null;
      let acquiredHectares =
        parseFloat(
          get(
            "LA04",
            "Land Area (Total Acquired Area in Ha.)",
            "Land Area (Acquired Area in Ha.)",
            "Area occupied in Ha.",
          ),
        ) || null;

      if (totalAcres && !totalHectares)
        totalHectares = parseFloat((totalAcres / 2.47105).toFixed(4));
      if (totalHectares && !totalAcres)
        totalAcres = parseFloat((totalHectares * 2.47105).toFixed(4));
      if (acquiredAcres && !acquiredHectares)
        acquiredHectares = parseFloat((acquiredAcres / 2.47105).toFixed(4));
      if (acquiredHectares && !acquiredAcres)
        acquiredAcres = parseFloat((acquiredHectares * 2.47105).toFixed(4));

      const benchMarkValue = get(
        "LA05",
        "Market Value fixed U/S.26 of RFCTLARR Act 2013 (Per Acre)",
      );
      const basicLandValue = get("LA06", "Basic Land value");
      const landValueWithMF = get(
        "LA07",
        "Land value  with multiplication factor (Values from 1 to 2)",
      );
      const noOfTrees = get("LA08", "No. of Trees");
      const totalTreeValue = get("LA09", "Total Value of Trees ");
      const noOfHouse = get("LA10", "No. of House");
      const houseValue = get("LA11", "Value of Structure (house)");
      const otherStructureDetails = get("LA12", "Detail of Structures other than House");
      const otherStructureValue = get("LA13", "Value of structures other than house");
      const totalValue = get(
        "LA14",
        "Total Value  (Land-22 + Tree-24 + House-26 + Structures-28)",
      );
      const solatium = get("LA15", "Solatium @ of (100%)");
      const noDaysInterest = get(
        "LA16",
        "No. of days of Interest",
        "No of days of Interest",
        "No. of Days of Interest",
        "No of Days of Interest",
        "No. of days interest",
        "No of days interest",
      );
      const additional12 = get(
        "LA17",
        "12% additional compensation on market value of land area",
      );
      const totalCompensation = get("LA18", "Total Compensation Amount");
      const apportionment = get(
        "LA19",
        "LA18-Apportionment Amount of the Award for the Individual Family Member",
      );
      const priority = get("LA20", "LA19-Priority/Urgency");
      const landUsePlan = get("LA21", "LA20-Land Use Plan");
      const laRemarks = get("LA22", "LA21-Remarks");

      // BK - Bank
      const bankAccount = get("BK01", "BK01-Bank Account No.");
      const bankName = get("BK02", "BK02-Name of the Bank");
      const branchIFSC = get("BK03", "BK03-Name of the Branch with IFSC Code");

      // PD - Personal details
      const aadhaar = get("PD01", "PD01-Aadhaar No.");
      const pan = get("PD02", "PAN No.");
      const age = get("PD03", "Age");
      const caste = get("PD04", "Caste");
      const maritalStatus = get("PD05", "Marital Status");
      const education = get("PD06", "Education");
      const occupation = get("PD07", "Occupation");
      const income = get("PD08", "Annual Income");
      const skill = get("PD09", "PD09- Skill Acquired");
      const affidavit = get("PD10", "PD10-Affidavit with subject details (if any)");

      // FD - Family details
      const majorMale = get("FD01", "FD01-No. of Family Members (Major Male)");
      const majorFemale = get("FD02", "No. of Family Members (Major Female)");
      const minorMale = get("FD03", "No. of Family Members (Minor Male)");
      const minorFemale = get("FD04", "No. of Family Members (Minor Female)");
      const majorTrans = get("FD05", "No. of Family Members (Major Transgender)");
      const minorTrans = get("FD06", "No. of Family Members (Minor Transgender)");
      const disability = get("FD07", "No. of Persons with Disability");
      const orphan = get("FD08", "Family with Orphan Members (Y/N)");
      const legalHeir = get("FD09", "FD09-Legal Heir Certificate No. (if any)");

      // LG - Legal details
      const landCaseNo = get("LG01", "LG01-Land Case - No. (Number)");
      const landCaseDate = toMysqlDate(
        get("LG02", "Land Case - Date (Date)", "land case - date (date)"),
      );
      const landCaseType = get("LG03", "Land Case Type");
      const landCaseStatus = get("LG04", "Land case - Status");
      const landCaseAction = get("LG05", "LG05-Land Case - Action");

      // GR/TR/GV
      const grievanceNo = get("GR01", "GR01-Grievance No. ");
      const grievanceDate = toMysqlDate(
        get("GR02", "Grievance  Date", "Grievance Date", "grievance date"),
      );
      const grievanceSubject = get("GR03", "Grievance - Subject Matter");
      const grievanceStatus = get("GR04", "Grievance - Present Status");
      const grievanceAction = get("GR05", "GR05-Grievance - Action taken");

      const tribunal = get("TR01", "TR01-Tribunal (Y/N)");
      const tribunalDate = toMysqlDate(
        get("TR02", "Tribunal - Date of Deposit", "tribunal - date of deposit"),
      );
      const tribunalAmount = get("TR03", "TR03-Tribunal - Amount Deposited");

      const premium = get("GV01", "GV01-Premium");
      const groundRent = get("GV02", "GV02-Ground Rent");
      const cess = get("GV03", "GV03-Cess");
      const incidentalCharges = get("GV04", "GV04-Incidental Charges");
      const total = get("GV05", "GV05-Total");
      const abatement = get("GV06", "Abatement");

      // LA00 is always auto-generated (not taken from Excel input)
      const LA00 = `${clientCode}/${villageName || "NA"}/${khataNo || "NA"}`;
      const laCaseFileNo = LA00;

      return [
        project_id,
        surveyNo || null,
        laCaseFileNo,
        awardDate || null,
        recordedTenant || null,
        presentTenant || null,
        address || null,
        displaced || null,
        district || null,
        villageName || null,
        plot["Village Code"] || null,
        tahasil || null,
        riCircle || null,
        tahasil || null,
        thanaNo || null,
        khataNo || null,
        plotNo || null,
        kissam || null,
        landCategory || null,
        ldRemarks || null,
        totalAcres || null,
        totalHectares || null,
        acquiredAcres || null,
        acquiredHectares || null,
        benchMarkValue || null,
        basicLandValue || null,
        landValueWithMF || null,
        noOfTrees || null,
        totalTreeValue || null,
        noOfHouse || null,
        houseValue || null,
        otherStructureDetails || null,
        otherStructureValue || null,
        totalValue || null,
        solatium || null,
        noDaysInterest || null,
        additional12 || null,
        totalCompensation || null,
        apportionment || null,
        priority || null,
        landUsePlan || null,
        laRemarks || null,
        bankAccount || null,
        bankName || null,
        branchIFSC || null,
        aadhaar || null,
        pan || null,
        age || null,
        caste || null,
        maritalStatus || null,
        education || null,
        occupation || null,
        income || null,
        skill || null,
        affidavit || null,
        majorMale || null,
        majorFemale || null,
        minorMale || null,
        minorFemale || null,
        majorTrans || null,
        minorTrans || null,
        disability || null,
        orphan || null,
        legalHeir || null,
        landCaseNo || null,
        landCaseDate || null,
        landCaseType || null,
        landCaseStatus || null,
        landCaseAction || null,
        grievanceNo || null,
        grievanceDate || null,
        grievanceSubject || null,
        grievanceStatus || null,
        grievanceAction || null,
        tribunal || null,
        tribunalDate || null,
        tribunalAmount || null,
        premium || null,
        groundRent || null,
        cess || null,
        incidentalCharges || null,
        total || null,
        abatement || null,
        type,
        0,
        fullPart || null,
      ];
    });

    const [result] = await db.query(
      `
    INSERT INTO plots (
      project_id, ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant,
      name_of_present_tenant, present_address, displaced_affected_project,
      district, village_name, village_code, tahasil_name, ri_circle_name, thana_name, thana_no, khata_no, plot_no,
      kissam_of_land, land_category, lo13_remarks, land_area_total_acres,
      land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares,
      market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees,
      total_value_of_trees, no_of_house, value_of_house, details_of_other_structures,
      value_of_other_structures, total_value, solatium_100, no_days_interest, additional_12_percent,
      total_compensation, apportionment_amount, priority_urgency, land_use_plan,
      la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no,
      age, caste, marital_status, education, occupation, annual_income, skill_acquired,
      affidavit_details, family_major_male, family_major_female, family_minor_male,
      family_minor_female, family_major_transgender, family_minor_transgender,
      persons_with_disability, family_with_orphan_members, legal_heir_certificate_no,
      land_case_no, land_case_date, land_case_type, land_case_status, land_case_action,grievance_no,
      grievance_date, grievance_subject, grievance_status, grievance_action, tribunal,
      tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess,
	      incidental_charges, total, abatement, type, is_deleted, full_part
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      project_id = VALUES(project_id),
      ses_survey_no = VALUES(ses_survey_no),
      la_case_file_no = VALUES(la_case_file_no),
      date_of_award = VALUES(date_of_award),
      name_of_recorded_tenant = VALUES(name_of_recorded_tenant),
      name_of_present_tenant = VALUES(name_of_present_tenant),
      present_address = VALUES(present_address),
      displaced_affected_project = VALUES(displaced_affected_project),
      district = VALUES(district),
      village_name = VALUES(village_name),
      village_code = VALUES(village_code),
      tahasil_name = VALUES(tahasil_name),
      ri_circle_name = VALUES(ri_circle_name),
      thana_name = VALUES(thana_name),
      thana_no = VALUES(thana_no),
      khata_no = VALUES(khata_no),
      plot_no = VALUES(plot_no),
      kissam_of_land = VALUES(kissam_of_land),
      land_category = VALUES(land_category),
      lo13_remarks = VALUES(lo13_remarks),
      land_area_total_acres = VALUES(land_area_total_acres),
      land_area_total_hectares = VALUES(land_area_total_hectares),
      land_area_acquired_acres = VALUES(land_area_acquired_acres),
      land_area_acquired_hectares = VALUES(land_area_acquired_hectares),
      market_value_per_acre = VALUES(market_value_per_acre),
      basic_land_value = VALUES(basic_land_value),
      land_value_with_mf = VALUES(land_value_with_mf),
      no_of_trees = VALUES(no_of_trees),
      total_value_of_trees = VALUES(total_value_of_trees),
      no_of_house = VALUES(no_of_house),
      value_of_house = VALUES(value_of_house),
      details_of_other_structures = VALUES(details_of_other_structures),
      value_of_other_structures = VALUES(value_of_other_structures),
      total_value = VALUES(total_value),
      solatium_100 = VALUES(solatium_100),
      no_days_interest = VALUES(no_days_interest),
      additional_12_percent = VALUES(additional_12_percent),
      total_compensation = VALUES(total_compensation),
      apportionment_amount = VALUES(apportionment_amount),
      priority_urgency = VALUES(priority_urgency),
      land_use_plan = VALUES(land_use_plan),
      la21_remarks = VALUES(la21_remarks),
      bank_account_no = VALUES(bank_account_no),
      bank_name = VALUES(bank_name),
      branch_ifsc = VALUES(branch_ifsc),
      aadhaar_no = VALUES(aadhaar_no),
      pan_no = VALUES(pan_no),
      age = VALUES(age),
      caste = VALUES(caste),
      marital_status = VALUES(marital_status),
      education = VALUES(education),
      occupation = VALUES(occupation),
      annual_income = VALUES(annual_income),
      skill_acquired = VALUES(skill_acquired),
      affidavit_details = VALUES(affidavit_details),
      family_major_male = VALUES(family_major_male),
      family_major_female = VALUES(family_major_female),
      family_minor_male = VALUES(family_minor_male),
      family_minor_female = VALUES(family_minor_female),
      family_major_transgender = VALUES(family_major_transgender),
      family_minor_transgender = VALUES(family_minor_transgender),
      persons_with_disability = VALUES(persons_with_disability),
      family_with_orphan_members = VALUES(family_with_orphan_members),
      legal_heir_certificate_no = VALUES(legal_heir_certificate_no),
      land_case_no = VALUES(land_case_no),
      land_case_date = VALUES(land_case_date),
      land_case_type = VALUES(land_case_type),
      land_case_status = VALUES(land_case_status),
      land_case_action = VALUES(land_case_action),
      
      grievance_no = VALUES(grievance_no),
      grievance_date = VALUES(grievance_date),
      grievance_subject = VALUES(grievance_subject),
      grievance_status = VALUES(grievance_status),
      grievance_action = VALUES(grievance_action),
      tribunal = VALUES(tribunal),
      tribunal_deposit_date = VALUES(tribunal_deposit_date),
      tribunal_amount = VALUES(tribunal_amount),
      premium = VALUES(premium),
      ground_rent = VALUES(ground_rent),
      cess = VALUES(cess),
      incidental_charges = VALUES(incidental_charges),
      total = VALUES(total),
      abatement = VALUES(abatement),
	      type = VALUES(type),
	      is_deleted = VALUES(is_deleted),
	      full_part = VALUES(full_part),
      updated_at = CURRENT_TIMESTAMP
    `,
      [values],
    );

    return result.affectedRows || 0;
  },
  async getAllPlot(project_id, type = null, limit = 10, offset = 0) {
    // const [rows] = await db.query(
    //   `SELECT p.*,
    //   pr.project_name
    //   FROM plots p
    //   LEFT JOIN projects pr ON p.project_id = pr.id
    //   WHERE p.is_deleted = 0
    //   AND p.project_id = ?
    //   ORDER BY p.id DESC
    //   LIMIT ? OFFSET ?`,
    //   [project_id, limit, offset]
    // );
    let query = `
    SELECT p.*, pr.project_name
    FROM plots p
    LEFT JOIN projects pr ON p.project_id = pr.id
    WHERE COALESCE(p.is_deleted, 0) = 0
    AND p.project_id = ?
  `;

    const params = [project_id];

    if (type) {
      query += " AND p.type = ?";
      params.push(type);
    }

    query += " ORDER BY p.id ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    const updatedRows = rows.map((plot) => {
      if (
        plot.name_of_present_tenant &&
        plot.name_of_present_tenant.trim() !== ""
      ) {
        const tenants = plot.name_of_present_tenant
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "");

        plot.present_tenant_count = tenants.length;
      } else {
        plot.present_tenant_count = "N/A";
      }

      return plot;
    });
    return updatedRows;
  },

  async insertDocument(data) {
    const sql = `
      INSERT IGNORE INTO pvt_plot_documents
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

  async findAllDocuments({ project_id, type }) {
    let sql = `
      SELECT
        d.id,
        d.project_id,
        d.type,
        d.original_filename,
        d.filename,
        d.created_at,
        (
          SELECT GROUP_CONCAT(DISTINCT p.district ORDER BY p.district SEPARATOR ', ')
          FROM plots p
          WHERE p.project_id = d.project_id
            AND p.type = d.type
            AND p.is_deleted = 0
            AND p.district IS NOT NULL
            AND TRIM(p.district) <> ''
        ) AS district,
        (
          SELECT GROUP_CONCAT(DISTINCT CAST(p.no_days_interest AS CHAR) ORDER BY p.no_days_interest SEPARATOR ', ')
          FROM plots p
          WHERE p.project_id = d.project_id
            AND p.type = d.type
            AND p.is_deleted = 0
            AND p.no_days_interest IS NOT NULL
        ) AS no_days_interest
      FROM pvt_plot_documents d
      WHERE 1 = 1
    `;

    const params = [];

    if (project_id) {
      sql += ` AND d.project_id = ?`;
      params.push(project_id);
    }

    if (type) {
      sql += ` AND d.type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY d.created_at DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // async findDocumentByFilename(filename) {
  //   const sql = `
  //   SELECT
  //     filename,
  //     original_filename,
  //     file_path
  //   FROM pvt_plot_documents
  //   WHERE filename = ?
  //   LIMIT 1
  // `;

  //   const [rows] = await db.query(sql, [filename]);
  //   return rows[0];
  // },

  async findDocumentByFilename(filename) {
    const sql = `
    SELECT
      filename,
      original_filename,
      file_path,
      1 AS type
    FROM pvt_plot_documents
    WHERE filename = ?

    UNION ALL

    SELECT
      filename,
      original_filename,
      file_path,
      2 AS type
    FROM govt_plot_documents
    WHERE filename = ?

    LIMIT 1
  `;

    const [rows] = await db.query(sql, [filename, filename]);
    return rows[0];
  },


  async deleteDocumentByFilename(filename) {
    await db.query(`DELETE FROM pvt_plot_documents WHERE filename = ?`, [
      filename,
    ]);
    return true;
  },

  async countAll(project_id, type) {
    // const [rows] = await db.query(
    //   `SELECT COUNT(*) AS total FROM plots WHERE is_deleted = 0 AND project_id = ?`,
    //   [project_id]
    // );
    let query = `SELECT COUNT(*) AS total
               FROM plots
               WHERE COALESCE(is_deleted, 0) = 0
               AND project_id = ?`;

    const params = [project_id];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  // async allPlotcount(projectId = null) {
  //   let query = `SELECT COUNT(*) AS total FROM plots WHERE is_deleted = 0`;
  //   let params = [];

  //   if (projectId) {
  //     query += " AND project_id = ?";
  //     params.push(projectId);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  async allPlotcount(projectIds = null) {
    let query = `SELECT COUNT(*) AS total FROM plots WHERE is_deleted = 0`;
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` AND project_id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  // async landDistribution(projectId = null) {
  //   let query = `
  //   SELECT
  //     SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS private,
  //     SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS govt,
  //     SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) AS forest
  //   FROM plots
  //   WHERE is_deleted = 0
  // `;
  //   let params = [];

  //   if (projectId) {
  //     query += " AND project_id = ?";
  //     params.push(projectId);
  //   }

  //   const [rows] = await db.query(query, params);
  //   return rows[0];
  // },

  async landDistribution(projectIds = null) {
    let query = `
    SELECT
      SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS private,
      SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) AS govt,
      SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) AS forest
    FROM plots
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

  async create(plotData) {
    const {
      project_id,
      ses_survey_no,
      la_case_file_no,
      date_of_award,
      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_project,
      village_name,
      village_code,
      tahasil_name,
      ri_circle_name,
      thana_no,
      khata_no,
      plot_no,
      kissam_of_land,
      land_category,
      lo13_remarks,
      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,
      market_value_per_acre,
      basic_land_value,
      land_value_with_mf,
      no_of_trees,
      total_value_of_trees,
      no_of_house,
      value_of_house,
      details_of_other_structures,
      value_of_other_structures,
      total_value,
      solatium_100,
      no_days_interest,
      additional_12_percent,
      total_compensation,
      apportionment_amount,
      priority_urgency,
      land_use_plan,
      la21_remarks,
      bank_account_no,
      bank_name,
      branch_ifsc,
      aadhaar_no,
      pan_no,
      age,
      caste,
      marital_status,
      education,
      occupation,
      annual_income,
      skill_acquired,
      affidavit_details,
      family_major_male,
      family_major_female,
      family_minor_male,
      family_minor_female,
      family_major_transgender,
      family_minor_transgender,
      persons_with_disability,
      family_with_orphan_members,
      legal_heir_certificate_no,
      land_case_no,
      land_case_date,
      land_case_type,
      land_case_status,
      land_case_action,
      // rr_employment,
      // rr_cash_in_lieu,
      // rr_training_skill_upgradation,
      // rr_self_employment,
      // rr_special_allowance_st_ntfp,
      // rr_homestead_allotment,
      // rr_house_building_assistance,
      // rr_constructed_by,
      // rr_transit_shed,
      // rr_transport_allowance,
      // rr_maintenance_allowance,
      // rr_multiple_displacement_allowance,
      // rr_exgratia,
      // rr_other_benefits,
      grievance_no,
      grievance_date,
      grievance_subject,
      grievance_status,
      grievance_action,
      tribunal,
      tribunal_deposit_date,
      tribunal_amount,
      premium,
      ground_rent,
      cess,
      incidental_charges,
      total,
      admin_charges,
      total_cost,
      abatement,
      type,
      full_part,
    } = plotData;
    const finalThanaName = tahasil_name ?? null;
    const [result] = await db.query(
      `INSERT INTO plots
      (project_id,ses_survey_no, la_case_file_no, date_of_award, name_of_recorded_tenant, name_of_present_tenant, present_address, displaced_affected_project, village_name, village_code, tahasil_name, ri_circle_name, thana_name, thana_no, khata_no, plot_no, kissam_of_land, land_category, lo13_remarks, land_area_total_acres, land_area_total_hectares, land_area_acquired_acres, land_area_acquired_hectares, market_value_per_acre, basic_land_value, land_value_with_mf, no_of_trees, total_value_of_trees, no_of_house, value_of_house, details_of_other_structures, value_of_other_structures, total_value, solatium_100, no_days_interest, additional_12_percent, total_compensation, apportionment_amount, priority_urgency, land_use_plan, la21_remarks, bank_account_no, bank_name, branch_ifsc, aadhaar_no, pan_no, age, caste, marital_status, education, occupation, annual_income, skill_acquired, affidavit_details, family_major_male, family_major_female, family_minor_male, family_minor_female, family_major_transgender, family_minor_transgender, persons_with_disability, family_with_orphan_members, legal_heir_certificate_no, land_case_no, land_case_date, land_case_type, land_case_status, land_case_action, grievance_no, grievance_date, grievance_subject, grievance_status, grievance_action, tribunal, tribunal_deposit_date, tribunal_amount, premium, ground_rent, cess, incidental_charges, total, admin_charges, total_cost, abatement, type, full_part)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        project_id,
        ses_survey_no,
        la_case_file_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_project,
        village_name,
        village_code,
        tahasil_name,
        ri_circle_name,
        finalThanaName,
        thana_no,
        khata_no,
        plot_no,
        kissam_of_land,
        land_category,
        lo13_remarks,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        market_value_per_acre,
        basic_land_value,
        land_value_with_mf,
        no_of_trees,
        total_value_of_trees,
        no_of_house,
        value_of_house,
        details_of_other_structures,
        value_of_other_structures,
        total_value,
        solatium_100,
        no_days_interest,
        additional_12_percent,
        total_compensation,
        apportionment_amount,
        priority_urgency,
        land_use_plan,
        la21_remarks,
        bank_account_no,
        bank_name,
        branch_ifsc,
        aadhaar_no,
        pan_no,
        age,
        caste,
        marital_status,
        education,
        occupation,
        annual_income,
        skill_acquired,
        affidavit_details,
        family_major_male,
        family_major_female,
        family_minor_male,
        family_minor_female,
        family_major_transgender,
        family_minor_transgender,
        persons_with_disability,
        family_with_orphan_members,
        legal_heir_certificate_no,
        land_case_no,
        land_case_date,
        land_case_type,
        land_case_status,
        land_case_action,
        // rr_employment,
        // rr_cash_in_lieu,
        // rr_training_skill_upgradation,
        // rr_self_employment,
        // rr_special_allowance_st_ntfp,
        // rr_homestead_allotment,
        // rr_house_building_assistance,
        // rr_constructed_by,
        // rr_transit_shed,
        // rr_transport_allowance,
        // rr_maintenance_allowance,
        // rr_multiple_displacement_allowance,
        // rr_exgratia,
        // rr_other_benefits,
        grievance_no,
        grievance_date,
        grievance_subject,
        grievance_status,
        grievance_action,
        tribunal,
        tribunal_deposit_date,
        tribunal_amount,
        premium,
        ground_rent,
        cess,
        incidental_charges,
        total,
        admin_charges,
        total_cost,
        abatement,
        type,
        full_part,
      ],
    );
    return { id: result.insertId, ...plotData };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM plots WHERE id = ? AND is_deleted = 0`,
      [id],
    );
    return rows[0];
  },

  async findByCaseAndPlot(project_id, type, la_case_file_no, plot_no) {
    const [rows] = await db.query(
      `SELECT * FROM plots
       WHERE project_id = ?
         AND type = ?
         AND la_case_file_no = ?
         AND plot_no = ?
         AND is_deleted = 0
       LIMIT 1`,
      [project_id, type, la_case_file_no, plot_no],
    );
    return rows.length ? rows[0] : null;
  },

  async updateByCaseAndPlot(project_id, type, la_case_file_no, plot_no, plotData) {
    const {
      project_id: nextProjectId,
      ses_survey_no,
      date_of_award,
      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_project,
      village_name,
      village_code,
      tahasil_name,
      ri_circle_name,
      thana_no,
      khata_no,
      plot_no: nextPlotNo,
      kissam_of_land,
      land_category,
      lo13_remarks,
      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,
      market_value_per_acre,
      basic_land_value,
      land_value_with_mf,
      no_of_trees,
      total_value_of_trees,
      no_of_house,
      value_of_house,
      details_of_other_structures,
      value_of_other_structures,
      total_value,
      solatium_100,
      no_days_interest,
      additional_12_percent,
      total_compensation,
      apportionment_amount,
      priority_urgency,
      land_use_plan,
      la21_remarks,
      bank_account_no,
      bank_name,
      branch_ifsc,
      aadhaar_no,
      pan_no,
      age,
      caste,
      marital_status,
      education,
      occupation,
      annual_income,
      skill_acquired,
      affidavit_details,
      family_major_male,
      family_major_female,
      family_minor_male,
      family_minor_female,
      family_major_transgender,
      family_minor_transgender,
      persons_with_disability,
      family_with_orphan_members,
      legal_heir_certificate_no,
      land_case_no,
      land_case_date,
      land_case_type,
      land_case_status,
      land_case_action,
      // rr_employment,
      // rr_cash_in_lieu,
      // rr_training_skill_upgradation,
      // rr_self_employment,
      // rr_special_allowance_st_ntfp,
      // rr_homestead_allotment,
      // rr_house_building_assistance,
      // rr_constructed_by,
      // rr_transit_shed,
      // rr_transport_allowance,
      // rr_maintenance_allowance,
      // rr_multiple_displacement_allowance,
      // rr_exgratia,
      // rr_other_benefits,
      grievance_no,
      grievance_date,
      grievance_subject,
      grievance_status,
      grievance_action,
      tribunal,
      tribunal_deposit_date,
      tribunal_amount,
      premium,
      ground_rent,
      cess,
      incidental_charges,
      total,
      admin_charges,
      total_cost,
      abatement,
      full_part,
    } = plotData;

    const [result] = await db.query(
      `UPDATE plots SET
      project_id = ?,
      ses_survey_no = ?,
      date_of_award = ?,
      name_of_recorded_tenant = ?,
      name_of_present_tenant = ?,
      present_address = ?,
      displaced_affected_project = ?,
      village_name = ?,
      village_code = ?,
      tahasil_name = ?,
      ri_circle_name = ?,
      thana_name = ?,
      thana_no = ?,
      khata_no = ?,
      plot_no = ?,
      kissam_of_land = ?,
      land_category = ?,
      lo13_remarks = ?,
      land_area_total_acres = ?,
      land_area_total_hectares = ?,
      land_area_acquired_acres = ?,
      land_area_acquired_hectares = ?,
      market_value_per_acre = ?,
      basic_land_value = ?,
      land_value_with_mf = ?,
      no_of_trees = ?,
      total_value_of_trees = ?,
      no_of_house = ?,
      value_of_house = ?,
      details_of_other_structures = ?,
      value_of_other_structures = ?,
      total_value = ?,
      solatium_100 = ?,
      no_days_interest = ?,
      additional_12_percent = ?,
      total_compensation = ?,
      apportionment_amount = ?,
      priority_urgency = ?,
      land_use_plan = ?,
      la21_remarks = ?,
      bank_account_no = ?,
      bank_name = ?,
      branch_ifsc = ?,
      aadhaar_no = ?,
      pan_no = ?,
      age = ?,
      caste = ?,
      marital_status = ?,
      education = ?,
      occupation = ?,
      annual_income = ?,
      skill_acquired = ?,
      affidavit_details = ?,
      family_major_male = ?,
      family_major_female = ?,
      family_minor_male = ?,
      family_minor_female = ?,
      family_major_transgender = ?,
      family_minor_transgender = ?,
      persons_with_disability = ?,
      family_with_orphan_members = ?,
      legal_heir_certificate_no = ?,
      land_case_no = ?,
      land_case_date = ?,
      land_case_type = ?,
      land_case_status = ?,
      land_case_action = ?,
      grievance_no = ?,
      grievance_date = ?,
      grievance_subject = ?,
      grievance_status = ?,
      grievance_action = ?,
      tribunal = ?,
      tribunal_deposit_date = ?,
      tribunal_amount = ?,
      premium = ?,
      ground_rent = ?,
      cess = ?,
      incidental_charges = ?,
      total = ?,
      admin_charges = ?,
      total_cost = ?,
      abatement = ?,
      full_part = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE project_id = ?
      AND type = ?
      AND la_case_file_no = ?
      AND plot_no = ?
      AND is_deleted = 0`,
      [
        nextProjectId,
        ses_survey_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_project,
        village_name,
        village_code,
        tahasil_name,
        ri_circle_name,
        tahasil_name,
        thana_no,
        khata_no,
        plot_no,
        kissam_of_land,
        land_category,
        lo13_remarks,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        market_value_per_acre,
        basic_land_value,
        land_value_with_mf,
        no_of_trees,
        total_value_of_trees,
        no_of_house,
        value_of_house,
        details_of_other_structures,
        value_of_other_structures,
        total_value,
        solatium_100,
        no_days_interest,
        additional_12_percent,
        total_compensation,
        apportionment_amount,
        priority_urgency,
        land_use_plan,
        la21_remarks,
        bank_account_no,
        bank_name,
        branch_ifsc,
        aadhaar_no,
        pan_no,
        age,
        caste,
        marital_status,
        education,
        occupation,
        annual_income,
        skill_acquired,
        affidavit_details,
        family_major_male,
        family_major_female,
        family_minor_male,
        family_minor_female,
        family_major_transgender,
        family_minor_transgender,
        persons_with_disability,
        family_with_orphan_members,
        legal_heir_certificate_no,
        land_case_no,
        land_case_date,
        land_case_type,
        land_case_status,
        land_case_action,
        // rr_employment,
        // rr_cash_in_lieu,
        // rr_training_skill_upgradation,
        // rr_self_employment,
        // rr_special_allowance_st_ntfp,
        // rr_homestead_allotment,
        // rr_house_building_assistance,
        // rr_constructed_by,
        // rr_transit_shed,
        // rr_transport_allowance,
        // rr_maintenance_allowance,
        // rr_multiple_displacement_allowance,
        // rr_exgratia,
        // rr_other_benefits,
        grievance_no,
        grievance_date,
        grievance_subject,
        grievance_status,
        grievance_action,
        tribunal,
        tribunal_deposit_date,
        tribunal_amount,
        premium,
        ground_rent,
        cess,
        incidental_charges,
        total,
        admin_charges,
        total_cost,
        abatement,
        full_part,
        project_id,
        type,
        la_case_file_no, // condition
        nextPlotNo,
      ],
    );

    return result.affectedRows > 0;
  },

  async update(id, plotData) {
    const {
      project_id,
      ses_survey_no,
      la_case_file_no,
      date_of_award,
      name_of_recorded_tenant,
      name_of_present_tenant,
      present_address,
      displaced_affected_project,
      village_name,
      village_code,
      tahasil_name,
      ri_circle_name,
      thana_no,
      khata_no,
      plot_no,
      kissam_of_land,
      land_category,
      lo13_remarks,
      land_area_total_acres,
      land_area_total_hectares,
      land_area_acquired_acres,
      land_area_acquired_hectares,
      market_value_per_acre,
      basic_land_value,
      land_value_with_mf,
      no_of_trees,
      total_value_of_trees,
      no_of_house,
      value_of_house,
      details_of_other_structures,
      value_of_other_structures,
      total_value,
      solatium_100,
      no_days_interest,
      additional_12_percent,
      total_compensation,
      apportionment_amount,
      priority_urgency,
      land_use_plan,
      la21_remarks,
      bank_account_no,
      bank_name,
      branch_ifsc,
      aadhaar_no,
      pan_no,
      age,
      caste,
      marital_status,
      education,
      occupation,
      annual_income,
      skill_acquired,
      affidavit_details,
      family_major_male,
      family_major_female,
      family_minor_male,
      family_minor_female,
      family_major_transgender,
      family_minor_transgender,
      persons_with_disability,
      family_with_orphan_members,
      legal_heir_certificate_no,
      land_case_no,
      land_case_date,
      land_case_type,
      land_case_status,
      land_case_action,
      // rr_employment,
      // rr_cash_in_lieu,
      // rr_training_skill_upgradation,
      // rr_self_employment,
      // rr_special_allowance_st_ntfp,
      // rr_homestead_allotment,
      // rr_house_building_assistance,
      // rr_constructed_by,
      // rr_transit_shed,
      // rr_transport_allowance,
      // rr_maintenance_allowance,
      // rr_multiple_displacement_allowance,
      // rr_exgratia,
      // rr_other_benefits,
      grievance_no,
      grievance_date,
      grievance_subject,
      grievance_status,
      grievance_action,
      tribunal,
      tribunal_deposit_date,
      tribunal_amount,
      premium,
      ground_rent,
      cess,
      incidental_charges,
      total,
      admin_charges,
      total_cost,
      abatement,
      full_part,
    } = plotData;

    await db.query(
      `UPDATE plots
      SET project_id = ?,
      ses_survey_no = ?,
      la_case_file_no = ?,
      date_of_award = ?,
      name_of_recorded_tenant = ?,
      name_of_present_tenant = ?,
      present_address = ?,
      displaced_affected_project = ?,
      village_name = ?,
      village_code = ?,
      tahasil_name = ?,
      ri_circle_name = ?,
      thana_name = ?,
      thana_no = ?,
      khata_no = ?,
      plot_no = ?,
      kissam_of_land = ?,
      land_category = ?,
      lo13_remarks = ?,
      land_area_total_acres = ?,
      land_area_total_hectares = ?,
      land_area_acquired_acres = ?,
      land_area_acquired_hectares = ?,
      market_value_per_acre = ?,
      basic_land_value = ?,
      land_value_with_mf = ?,
      no_of_trees = ?,
      total_value_of_trees = ?,
      no_of_house = ?,
      value_of_house = ?,
      details_of_other_structures = ?,
      value_of_other_structures = ?,
      total_value = ?,
      solatium_100 = ?,
      no_days_interest = ?,
      additional_12_percent = ?,
      total_compensation = ?,
      apportionment_amount = ?,
      priority_urgency = ?,
      land_use_plan = ?,
      la21_remarks = ?,
      bank_account_no = ?,
      bank_name = ?,
      branch_ifsc = ?,
      aadhaar_no = ?,
      pan_no = ?,
      age = ?,
      caste = ?,
      marital_status = ?,
      education = ?,
      occupation = ?,
      annual_income = ?,
      skill_acquired = ?,
      affidavit_details = ?,
      family_major_male = ?,
      family_major_female = ?,
      family_minor_male = ?,
      family_minor_female = ?,
      family_major_transgender = ?,
      family_minor_transgender = ?,
      persons_with_disability = ?,
      family_with_orphan_members = ?,
      legal_heir_certificate_no = ?,
      land_case_no = ?,
      land_case_date = ?,
      land_case_type = ?,
      land_case_status = ?,
      land_case_action = ?,
      grievance_no = ?,
      grievance_date = ?,
      grievance_subject = ?,
      grievance_status = ?,
      grievance_action = ?,
      tribunal = ?,
      tribunal_deposit_date = ?,
      tribunal_amount = ?,
      premium = ?,
      ground_rent = ?,
      cess = ?,
      incidental_charges = ?,
      total = ?,
      admin_charges = ?,
      total_cost = ?,
      abatement = ?,
      full_part = ?
      WHERE id = ? AND is_deleted = 0`,
      [
        project_id,
        ses_survey_no,
        la_case_file_no,
        date_of_award,
        name_of_recorded_tenant,
        name_of_present_tenant,
        present_address,
        displaced_affected_project,
        village_name,
        village_code,
        tahasil_name,
        ri_circle_name,
        tahasil_name,
        thana_no,
        khata_no,
        plot_no,
        kissam_of_land,
        land_category,
        lo13_remarks,
        land_area_total_acres,
        land_area_total_hectares,
        land_area_acquired_acres,
        land_area_acquired_hectares,
        market_value_per_acre,
        basic_land_value,
        land_value_with_mf,
        no_of_trees,
        total_value_of_trees,
        no_of_house,
        value_of_house,
        details_of_other_structures,
        value_of_other_structures,
        total_value,
        solatium_100,
        no_days_interest,
        additional_12_percent,
        total_compensation,
        apportionment_amount,
        priority_urgency,
        land_use_plan,
        la21_remarks,
        bank_account_no,
        bank_name,
        branch_ifsc,
        aadhaar_no,
        pan_no,
        age,
        caste,
        marital_status,
        education,
        occupation,
        annual_income,
        skill_acquired,
        affidavit_details,
        family_major_male,
        family_major_female,
        family_minor_male,
        family_minor_female,
        family_major_transgender,
        family_minor_transgender,
        persons_with_disability,
        family_with_orphan_members,
        legal_heir_certificate_no,
        land_case_no,
        land_case_date,
        land_case_type,
        land_case_status,
        land_case_action,
        // rr_employment,
        // rr_cash_in_lieu,
        // rr_training_skill_upgradation,
        // rr_self_employment,
        // rr_special_allowance_st_ntfp,
        // rr_homestead_allotment,
        // rr_house_building_assistance,
        // rr_constructed_by,
        // rr_transit_shed,
        // rr_transport_allowance,
        // rr_maintenance_allowance,
        // rr_multiple_displacement_allowance,
        // rr_exgratia,
        // rr_other_benefits,
        grievance_no,
        grievance_date,
        grievance_subject,
        grievance_status,
        grievance_action,
        tribunal,
        tribunal_deposit_date,
        tribunal_amount,
        premium,
        ground_rent,
        cess,
        incidental_charges,
        total,
        admin_charges,
        total_cost,
        abatement,
        full_part,
        id,
      ],
    );
    return this.findById(id);
  },

  async plotDelete(id) {
    const [result] = await db.query(
      `UPDATE plots SET is_deleted = 1 WHERE id = ? AND is_deleted = 0`,
      [id],
    );
    return result.affectedRows;
  },

  async getDeletedPlots() {
    const [rows] = await db.query(
      "SELECT * FROM plots WHERE is_deleted = 1 ORDER BY updated_at DESC",
    );
    return rows;
  },

  async restorePlot(id) {
    const [result] = await db.query(
      "UPDATE plots SET is_deleted = 0 WHERE id = ? AND is_deleted = 1",
      [id],
    );
    return result.affectedRows > 0;
  },

  async findByKhataNo(khata_no, type, project_id) {
    const [rows] = await db.query(
      "SELECT * FROM plots WHERE khata_no = ? AND type = ? AND project_id = ?",
      [khata_no, type, project_id],
    );
    return rows;
  },

  async updatePaymentStatus(plot_id, status) {
    await db.query(
      `UPDATE plots SET payment_status = ?
      WHERE id = ? AND is_deleted = 0`,
      [status, plot_id],
    );
    return true;
  },

  // async addPaymentRecord(data) {
  //   const [result] = await db.query(
  //     `INSERT INTO plot_payments
  //    (plot_id, project_id, khata_no, present_tenant_names, total_compensation,
  //     bank_ac, bank_name, ifsc, status)
  //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //     [
  //       data.plot_id,
  //       data.project_id,
  //       data.khata_no,
  //       data.present_tenant_names,
  //       data.total_compensation,
  //       data.bank_ac,
  //       data.bank_name,
  //       data.ifsc,
  //       data.status,
  //     ]
  //   );

  //   const [rows] = await db.query(`SELECT * FROM plot_payments WHERE id = ?`, [
  //     result.insertId,
  //   ]);

  //   return rows[0];
  // },

  async addPaymentRecord(data) {
    const sql = `
      INSERT INTO plot_payments 
      (unique_id, plot_id, plot_no, khata_no, project_id, present_tenant_names, payment_area, total_compensation, 
       bank_ac, bank_name, ifsc, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;

    const params = [
      data.unique_id,
      data.plot_id,
      data.plot_no,
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

  async hasProcessingPayments(plot_id) {
    const [rows] = await db.query(
      `
    SELECT 1
    FROM plot_payments
    WHERE plot_id = ?
      AND status = 'processing'
      AND type = 1
    LIMIT 1
    `,
      [plot_id],
    );

    return rows.length > 0;
  },

  // async updatePaymentRecordStatus(plot_id, status) {
  //   await db.query(
  //     `UPDATE plot_payments
  //    SET status = ?
  //    WHERE plot_id = ?`,
  //     [status, plot_id]
  //   );
  //   return true;
  // },

  async getCompensationByPlotId(plot_id) {
    const [rows] = await db.query(
      `SELECT * FROM plot_payments 
     WHERE plot_id = ?`,
      [plot_id],
    );
    return rows;
  },

  async getAll(project_id = null, type = null, plot_id = null) {
    let query = `SELECT * FROM plot_payments
    WHERE status <> 'complete' AND type = 1
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
    const [rows] = await db.query(`SELECT * FROM plot_payments WHERE id = ? AND type = 1`, [
      land_cost_id,
    ]);
    return rows[0];
  },

  async addPaymentProof(land_cost_id, filePath) {
    const [result] = await db.query(
      `UPDATE plot_payments SET payment_proof = ? WHERE id = ? AND type = 1`,
      [filePath, land_cost_id],
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
        WHERE id = ? AND type = 1`,
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

    // update plots table
    await db.query(
      `
    UPDATE plots
    SET payment_status = 'complete',
        updated_at = NOW()
    WHERE id = ? AND type = 1
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

  async countCompletedPayments(projectIds = null) {
    let query = `
    SELECT COUNT(*) AS total
    FROM plot_payments
    WHERE status = 'complete' AND type = 1
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

module.exports = Plot;
