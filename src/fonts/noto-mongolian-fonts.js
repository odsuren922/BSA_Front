import mongolFont from "./NotoSansMongolian-Regular.ttf";
import { jsPDF } from "jspdf";

export const registerMongolFont = () => {
  jsPDF.API.events.push([
    "addFonts",
    function () {
      this.addFileToVFS("NotoSansMongolian-Regular.ttf", mongolFont);
      this.addFont("NotoSansMongolian-Regular.ttf", "NotoSansMongolian", "normal");
    },
  ]);
};
