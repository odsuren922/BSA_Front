import React, { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "../../fragge-gantt.css";

const GanttChart = ({ tasks, isReadOnly = true }) => {
  const ganttRef = useRef();

  useEffect(() => {
    // if (!ganttRef.current || tasks.length === 0) return;

    const container = ganttRef.current;
    container.innerHTML = "";

    const gantt = new Gantt(container, tasks, {
      container_height: 500, // диаграммын өндөр
      language: "mn", // хэл
      view_mode_select: true, // хэрэглэгч харагдац өөрчлөх боломжтой
      date_format: "YYYY-MM-DD", // огнооны формат
      readonly: isReadOnly, // өөрчлөх боломжтой эсэх
      bar_readonly: isReadOnly, // бар өөрчлөх боломж
      popup_trigger: isReadOnly ? "click" : "mouseover", // попап хэзээ гарч ирэх

      custom_popup_html: (task) => `
        <div class="details-container">
          <h5>${task.name}</h5>
          <p>Start: ${task.start}</p>
          <p>End: ${task.end}</p>
          <p>Status: ${task.progress}% complete</p>
        </div>
      `,
    });

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [tasks, isReadOnly]);

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <div ref={ganttRef} />
    </div>
  );
};

export default GanttChart;
