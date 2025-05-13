import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Бакалаврын ажил + үнэлгээтэй Excel файл татах
 * @param {Array} theses - filteredTheses data
 * @param {Object} gradingSchema - grading schema object
 * @param {Object} thesisCycle - cycle info
 */
export const exportThesisToExcel = (theses, gradingSchema, thesisCycle) => {
  const data = theses.map((thesis) => {
    const baseInfo = {
      "БСА Нэр": thesis.name_mongolian,
      "БСА Нэр Англи": thesis.name_english,
      "Суралцагч": `${thesis.student_info.lastname} ${thesis.student_info.firstname}`,
      "Хөтөлбөр": thesis.student_info.program,
      "Удирдагч багш": `${thesis.supervisor_info.lastname} ${thesis.supervisor_info.firstname}`,
    };

    // ➕ Шүүмж багш — by_who === "examiner"
    if (gradingSchema?.[0]?.grading_components) {
      gradingSchema[0].grading_components.forEach((component) => {
        if (component.by_who === "examiner") {
          const assigned = thesis.assigned_gradings?.find(
            (g) => g.component_id === component.id
          );
          const teacher = assigned?.assigned_by;
          baseInfo[`${component.name} (Шүүмж багш)`] = teacher
            ? `${teacher.lastname.charAt(0)}.${teacher.firstname}`
            : "—";
        }
      });

      // ➕ Онооны баганууд
      gradingSchema[0].grading_components.forEach((component) => {
        const scoreObj = thesis.scores?.find((s) => s.component_id === component.id);
        baseInfo[component.name] = scoreObj ? scoreObj.score : "";
      });
    }

    // ➕ Нийт оноо
    const total =
      thesis.scores?.reduce((sum, s) => sum + parseFloat(s.score || 0), 0) || 0;
    baseInfo["Нийт оноо"] = total.toFixed(2);

    return baseInfo;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Thesis Scores");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(
    fileData,
    `${thesisCycle.year}-${thesisCycle.end_year}-${thesisCycle.semester}-Нийтоноо.xlsx`
  );
};
