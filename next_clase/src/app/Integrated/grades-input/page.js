// src/app/Integrated/grade_input/page.js

import { GradesInputContent } from "../../components/Integrated_content/grades_input_content";
import "./grades-input.css";
import IntegratedMenu from "@/app/components/IntegratedMenu";

export default function GradesInputPage() {
  return (
    <div style= {{display: "flex" ,alignItems:"flex-start"}}>
    <IntegratedMenu/>
   
    <div className="grades-input-page">
      <GradesInputContent />
    </div>
    </div>
  );
}