
// import React, { useEffect, useRef } from "react";
// import Gantt from "frappe-gantt";
// import "../../fragge-gantt.css";

// const GanttChart = ({ tasks }) => {
//   const ganttRef = useRef();

//   useEffect(() => {
//     if (ganttRef.current && tasks.length > 0) {
//       ganttRef.current.innerHTML = "";

//       const gantt = new Gantt(ganttRef.current, tasks, {
//         container_height: 500,
//         language: 'mn',
//         view_mode_select: true,
//         date_format: "YYYY-MM-DD",
//       });

//       return () => {
//         ganttRef.current.innerHTML = ""; // Clear previous gantt
//       };
//     }
//   }, [tasks]);

//   return (
//     <div style={{ overflowX: 'auto', width: '100%' }}>
//       <div ref={ganttRef} />
//     </div>
//   );
// };

// export default GanttChart;


import React, { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "../../fragge-gantt.css";

const GanttChart = ({ tasks, isReadOnly = true }) => {
  const ganttRef = useRef();

  useEffect(() => {
    if (!ganttRef.current || tasks.length === 0) return;
  
    const container = ganttRef.current;
    container.innerHTML = "";
  
    const gantt = new Gantt(container, tasks, {
      container_height: 500,
      language: 'mn',
      view_mode_select: true,
      date_format: "YYYY-MM-DD",
      readonly: isReadOnly,
      bar_readonly: isReadOnly,
      popup_trigger: isReadOnly ? 'click' : 'mouseover',
      custom_popup_html: task => `
        <div class="details-container">
          <h5>${task.name}</h5>
          <p>Start: ${task.start}</p>
          <p>End: ${task.end}</p>
          <p>Status: ${task.progress}% complete</p>
        </div>
      `
    });
  
    return () => {
      if (container) container.innerHTML = "";
    };
  }, [tasks, isReadOnly]);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <div ref={ganttRef} />
    </div>
  );
};

export default GanttChart;
