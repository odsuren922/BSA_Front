import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const getFirst3 = (str = "") => str.substring(0, 3);

const getShortName = (lastname = "", firstname = "") =>
  `${lastname?.charAt(0).toUpperCase() || ""}.${firstname || ""}`;

const formatScore = (score) => {
  const parsed = parseFloat(score);
  return isNaN(parsed) ? "—" : parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toString();
};

/**
 * Assigned Grading мэдээллийг Excel файл болгон хадгалах
 * @param {Array} scores - Filter хийсэн оюутны мэдээлэл (filteredScores)
 */
export const exportAssignedGradingToExcel = (scores) => {
  const data = scores.map((row, index) => {
    const studentSplit = row.student_name.split(" ");
    const teacherSplit = row.teacher_name.split(" ");
    const supervisorSplit = row.supervisor_name.split(" ");

    return {
      "№": index + 1,
      "Сэдэв": row.thesis_title,
      "Нэр": `${row.student_name}`,
      "Шүүмж багш (богино)": getShortName(teacherSplit[0], teacherSplit[1]),
      "Удирдагч багш (богино)": getShortName(supervisorSplit[0], supervisorSplit[1]),
      "Оноо": formatScore(row.score),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grading");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(fileData, `assigned_grading_${Date.now()}.xlsx`);
};
