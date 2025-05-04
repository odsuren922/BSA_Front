import React, { useState } from "react";
const convertToGanttTasks = (tasks) => {
    const ganttTasks = [];
  
    tasks.forEach((task) => {
      if (task.subtasks) {
        task.subtasks.forEach((sub) => {
          ganttTasks.push({
            id: `subtask-${sub.id}`,
            name: sub.name,
            start: sub.start_date,
            end: sub.end_date,
            progress: 0, // or use a real value if available
            dependencies: "" // you can fill this in if you track dependencies
          });
        });
      }
    });
  
    return ganttTasks;
  };