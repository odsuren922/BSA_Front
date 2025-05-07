import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const taskTable = (tasks, planStart, planEnd) => {
  const startDate = new Date(planStart).getTime();
  const endDate = new Date(planEnd).getTime();

  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const totalWeeks = Math.ceil(totalDays / 7);

  const weekColumns = Array.from({ length: totalWeeks }, (_, i) => ({
    text: `${i + 1}`,
    bold: true,
  }));

  const tableBody = [
    [
      { text: "№", bold: true },
      { text: "Дэд Хийх ажил", bold: true },
      ...weekColumns,
      { text: "Тайлбар", bold: true },
    ],
  ];

  let taskIndex = 1;

  tasks.forEach((task) => {
    tableBody.push([
      { text: taskIndex, alignment: "left" },
      {
        text: task.name || "",
        colSpan: totalWeeks + 2,
        bold: true,
        alignment: "left",
      },
      ...Array(totalWeeks + 1).fill(""),
    ]);

    (task.subtasks || []).forEach((subTask, subIndex) => {
      tableBody.push([
        { text: `${taskIndex}.${subIndex + 1}`, alignment: "left" },
        { text: subTask.name || "" },
        ...generateWeekCellsDate(
          planStart,
          planEnd,
          subTask.start_date,
          subTask.end_date
        ),
        { text: subTask.description || "" },
      ]);
    });

    taskIndex++;
  });

  const columnWidths = totalWeeks > 13
    ? ["4%", "18%", ...Array(totalWeeks).fill("4%"), "12%"]
    : ["5%", "18%", ...Array(totalWeeks).fill("5%"), "14%"];

  return {
    style: "tableExample",
    table: {
      widths: columnWidths,
      body: tableBody,
    },
  };
};

const generateWeekCellsDate = (planStart, planEnd, taskStart, taskEnd) => {
  const blueColor = "#abceed";
  const redColor = "#5ca4e6";

  const startDate = new Date(planStart);
  const endDate = new Date(planEnd);
  const taskStartDate = taskStart ? new Date(taskStart) : null;
  const taskEndDate = taskEnd ? new Date(taskEnd) : null;

  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const totalWeeks = Math.ceil(totalDays / 7);

  if (!taskStartDate || isNaN(taskStartDate.getTime()) || !taskEndDate || isNaN(taskEndDate.getTime())) {
    return Array.from({ length: totalWeeks }, () => "");
  }

  return Array.from({ length: totalWeeks }, (_, weekIndex) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + weekIndex * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const overlapStart = taskStartDate > weekStart ? taskStartDate : weekStart;
    const overlapEnd = taskEndDate < weekEnd ? taskEndDate : weekEnd;
    const overlapDays = Math.max(
      0,
      (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24) + 1
    );

    if (overlapDays > 3) {
      return { text: "", fillColor: redColor };
    } else if (overlapDays > 0) {
      return { text: "", fillColor: blueColor };
    } else {
      return "";
    }
  });
};

const generatePDF = (data, thesis, thesisCycle) => {
  if (!data || data.length === 0) {
    alert("Төлөвлөгөө байхгүй байна.");
    return;
  }

  const currentDate = new Date();
  const year = currentDate.toLocaleDateString("en-GB", { year: "numeric" });
  const month = currentDate.toLocaleDateString("en-GB", { month: "2-digit" });
  const day = currentDate.toLocaleDateString("en-GB", { day: "2-digit" });

  const head_dep = thesis?.student?.department?.head_of_department || {};
  const firstletter = head_dep.lastname?.charAt(0)?.toUpperCase() || "";

  const thesis_cycle = thesisCycle;
  const start = new Date(thesis_cycle?.start_date);
  const end = new Date(thesis_cycle?.end_date);
  const diffInMs = end - start;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const weeks_num = Math.ceil(diffInDays / 7);

  const getAcronym = (programName) => {
    return (programName || "")
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const docDefinition = {
    pageOrientation: "landscape",
    content: [
      { text: "Батлав.", alignment: "left", bold: true, style: "normal" },
      {
        columns: [
          {
            text: `МКУТ-ийн эрхлэгч:................................../ ${firstletter}. ${head_dep.firstname || ""}/`,
            alignment: "left",
            style: "normal",
          },
          {
            text: `${year} оны ${month} сарын ${day} нд`,
            alignment: "right",
            style: "normal",
          },
        ],
      },
      { text: `${thesis.name_mongolian || ""}`, style: "header" },
      { text: `${thesis.name_english || ""}`, style: "header" },
      { text: `Сэдэвт бакалаврын судалгааны ажлын`, style: "subheader" },
      { text: ` 7 хоногийн үечилсэн төлөвлөгөө`, style: "subheader" },
      {
        text: `Хугацаа: ${thesis_cycle?.start_date || "-"} - ${thesis_cycle?.end_date || "-"} (${weeks_num} долоо хоног)`,
        style: "normal",
      },

      taskTable(data, thesis_cycle?.start_date, thesis_cycle?.end_date),

      {
        text: `\nЗөвшөөрсөн: Удирдагч багш ..................... / ${thesis?.supervisor?.lastname?.charAt(0)?.toUpperCase() || ""}. ${thesis?.supervisor?.firstname || ""} /`,
        alignment: "right",
        style: "normal",
      },
      {
        text: `Боловсруулсан: Оюутан ................................. /${getAcronym(
          thesis?.student?.program
        )} ${thesis?.student?.lastname?.charAt(0)?.toUpperCase() || ""}. ${
          thesis?.student?.firstname || ""
        } /`,
        alignment: "right",
        style: "normal",
      },
      {
        text: `Оюутны ID ${thesis?.student?.sisi_id || "-"}  Холбогдох утас: ${thesis?.student?.phone || "-"}`,
        alignment: "right",
        style: "normal",
      },
    ],
    styles: {
      header: { fontSize: 11, bold: true, alignment: "center" },
      subheader: { fontSize: 11, alignment: "center" },
      normal: { fontSize: 11 },
      tableExample: { margin: [0, 5, 0, 15], fontSize: 11 },
    },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);

  const existingModal = document.getElementById("pdfPreviewModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "pdfPreviewModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "white";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "5px";
  modalContent.style.width = "80%";
  modalContent.style.height = "90%";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";

  const previewContainer = document.createElement("div");
  previewContainer.style.flex = "1";
  previewContainer.style.marginBottom = "10px";
  previewContainer.style.overflow = "hidden";

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "PDF татаж авах";
  downloadBtn.style.alignSelf = "flex-end";
  downloadBtn.style.padding = "10px 20px";
  downloadBtn.style.backgroundColor = "#007bff";
  downloadBtn.style.color = "white";
  downloadBtn.style.border = "none";
  downloadBtn.style.borderRadius = "4px";
  downloadBtn.style.cursor = "pointer";

pdfDoc.getBlob((blob) => {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.src = URL.createObjectURL(blob); // instead of dataUrl
    previewContainer.appendChild(iframe);
  });
  

  downloadBtn.addEventListener("click", () => {
    pdfDoc.download("work_plan.pdf");
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modalContent.appendChild(previewContainer);
  modalContent.appendChild(downloadBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
};

export default generatePDF;