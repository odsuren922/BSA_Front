import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportCommitteeToExcel = (committee) => {
  if (!committee) return;

  const { students = [], members = [], externalReviewers = [] } = committee;
console.log("com", committee)
  const data = students.map((studentObj, index) => {
    const student = studentObj.student;
    const row = {
      "№": index + 1,
      "Овог": `${student.lastname}`,
      "Нэр": `${student.firstname}`,
      "ID": `${student.sisi_id}`,
      "Хөтөлбөр": student.program,
      "Удирдагч багш":
        student.thesis?.supervisor
          ? `${student.thesis.supervisor.lastname} ${student.thesis.supervisor.firstname}`
          : "-",
          "Удирдагч багш товч нэр":
  student.thesis?.supervisor
    ? `${(student.thesis.supervisor.firstname || "")}.${(student.thesis.supervisor.lastname || "").substring(0, 3)}`
    : "-"

    };

    // Багш бүрийн оноо
    members.forEach((member) => {
      const score = member.committeeScores?.find(
        (cs) => cs.student?.id === student.id
      )?.score;
      const key = `${member.teacher?.lastname || "?"} ${member.teacher?.firstname || ""}`;
      row[key] = score !== undefined ? formatScore(score) : "-";
    });

    // Гадны шүүгч бүрийн оноо
    externalReviewers.forEach((rev) => {
      const score = rev.scores?.find((s) => s.student_id === student.id)?.score;
      const key = `${rev.lastname || "?"} ${rev.firstname || ""} (гадаад)`;
      row[key] = score !== undefined ? formatScore(score) : "-";
    });

    // Нийт дундаж
    const allScores = [
      ...members
        .map((m) =>
          m.committeeScores?.find((cs) => cs.student?.id === student.id)?.score
        )
        .filter((s) => s !== undefined),
      ...externalReviewers
        .map((r) =>
          r.scores?.find((s) => s.student_id === student.id)?.score
        )
        .filter((s) => s !== undefined),
    ].map(parseFloat);

    const avg =
      allScores.length > 0
        ? formatScore(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
        : "-";

    row["Нийт дундаж"] = avg;

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Committee Scores");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(fileData, `${committee.name}-оноо-${committee?.grading_component.name}.xlsx`);
};

// Дугуйруулалт: .00 төгсгөлтэй бол бүхэл, бусдаар хэвээр
const formatScore = (score) => {
  const parsed = parseFloat(score);
  return parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toString();
};
