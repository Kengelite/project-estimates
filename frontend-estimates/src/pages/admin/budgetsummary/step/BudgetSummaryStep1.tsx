import  { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Types & Mock Data ────────────────────────────────────────────────
type YearOption = { label: string; value: string };
type Course = { id: string; name: string; years?: YearOption[] };
type DegreeSection = { title: string; courses: Course[] };

const SIDEBAR_STEPS = [
  "เลือกหลักสูตร",
  "จัดสรรเป็นรายได้ส่วนกลาง",
  "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค",
  "หักบริหารส่วนกลางวิทยาลัย",
  "บริหารงานวิทยาลัย",
  "สรุปผลงบประมาณ",
];

const MOCK_DATA: DegreeSection[] = [
  {
    title: "ปริญญาตรี (ปกติ)",
    courses: [
      {
        id: "b_norm_cs",
        name: "หลักสูตร วท.บ. สาขาวิชาวิทยาการคอมพิวเตอร์ (B.SC.CS)",
        years: [
          { label: "2563 (3 คน)", value: "2563" },
          { label: "2564 (19 คน)", value: "2564" },
          { label: "2565 (59 คน)", value: "2565" },
          { label: "2566 (78 คน)", value: "2566" },
          { label: "2567 (97 คน)", value: "2567" },
          { label: "2568 (94 คน)", value: "2568" },
        ],
      },
      { id: "b_norm_it", name: "หลักสูตร วท.บ. สาขาวิชาเทคโนโลยีสารสนเทศ (B.SC.IT)" },
      { id: "b_norm_gis", name: "หลักสูตร วท.บ. สาขาวิชาภูมิสารสนเทศศาสตร์ (B.SC.GIS)" },
      { id: "b_norm_ai", name: "หลักสูตร วท.บ. สาขาวิชาปัญญาประดิษฐ์ (B.SC.AI)" },
      { id: "b_norm_cy", name: "หลักสูตร วท.บ. สาขาวิชาความมั่นคงปลอดภัยไซเบอร์ (B.SC.CY)" },
    ],
  },
  {
    title: "ปริญญาตรี (พิเศษ)",
    courses: [
      {
        id: "b_sp_cs",
        name: "หลักสูตร วท.บ. สาขาวิชาวิทยาการคอมพิวเตอร์ (B.SC.CS)",
        years: [
          { label: "2563 (11 คน)", value: "2563" },
          { label: "2564 (22 คน)", value: "2564" },
          { label: "2565 (45 คน)", value: "2565" },
          { label: "2566 (69 คน)", value: "2566" },
          { label: "2567 (77 คน)", value: "2567" },
          { label: "2568 (86 คน)", value: "2568" },
        ],
      },
      { id: "b_sp_it", name: "หลักสูตร วท.บ. สาขาวิชาเทคโนโลยีสารสนเทศ (B.SC.IT)" },
      { id: "b_sp_gis", name: "หลักสูตร วท.บ. สาขาวิชาภูมิสารสนเทศศาสตร์ (B.SC.GIS)" },
      { id: "b_sp_ai", name: "หลักสูตร วท.บ. สาขาวิชาปัญญาประดิษฐ์ (B.SC.AI)" },
      { id: "b_sp_cy", name: "หลักสูตร วท.บ. สาขาวิชาความมั่นคงปลอดภัยไซเบอร์ (B.SC.CY)" },
    ],
  },
  {
    title: "ปริญญาโท (ปกติ)",
    courses: [
      {
        id: "m_norm_gis",
        name: "หลักสูตร วท.ม สาขาวิชาภูมิสารสนเทศศาสตร์ (M.SC.GIS)",
        years: [
          { label: "2563 (1 คน)", value: "2563" },
          { label: "2566 (1 คน)", value: "2566" },
          { label: "2567 (5 คน)", value: "2567" },
          { label: "2568 (5 คน)", value: "2568" },
        ],
      },
      { id: "m_norm_it", name: "หลักสูตร วท.ม สาขาวิชาวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ (M.SC.IT)" },
      { id: "m_norm_dsai", name: "หลักสูตร วท.ม สาขาวิชาวิทยาการข้อมูลและปัญญาประดิษฐ์ (M.SC.DSAI)" },
    ],
  },
  {
    title: "ปริญญาเอก (ปกติ)",
    courses: [
      {
        id: "d_norm_gis",
        name: "หลักสูตร ปร.ด สาขาวิชาภูมิสารสนเทศศาสตร์ (Ph.D.GIS)",
        years: [
          { label: "2563 (2 คน)", value: "2563" },
          { label: "2566 (1 คน)", value: "2566" },
          { label: "2567 (2 คน)", value: "2567" },
          { label: "2568 (3 คน)", value: "2568" },
        ],
      },
      { id: "d_norm_it", name: "หลักสูตร วท.ม สาขาวิชาวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ (Ph.D.CS&IT)" },
    ],
  },
];

const RISK_OPTIONS = ["0 %", "1 %", "3 %", "5 %"];

export default function BudgetSummaryStep1() {
  const navigate = useNavigate();
  const [courseState, setCourseState] = useState<Record<string, { selected: boolean; years: string[]; risk: string }>>({});

  const toggleCourse = (courseId: string) => {
    setCourseState((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        selected: !prev[courseId]?.selected,
        years: prev[courseId]?.years || [],
        risk: prev[courseId]?.risk || "",
      },
    }));
  };

  const toggleYear = (courseId: string, yearValue: string) => {
    setCourseState((prev) => {
      const currentYears = prev[courseId]?.years || [];
      const newYears = currentYears.includes(yearValue)
        ? currentYears.filter((y) => y !== yearValue)
        : [...currentYears, yearValue];
      return { ...prev, [courseId]: { ...prev[courseId], years: newYears } };
    });
  };

  const setRisk = (courseId: string, riskValue: string) => {
    setCourseState((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], risk: riskValue },
    }));
  };

  const currentStep = 0; // Step 1

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Nav ── */}
      <div className="px-6 py-4">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>
        <h1 className="text-xl font-bold text-gray-900">สรุปงบประมาณประจำปี</h1>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 px-6 pb-24 max-w-[1400px] w-full mx-auto gap-8">
        
        {/* ── Sidebar Stepper ── */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200"></div>
              <div className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all" style={{ height: `${(currentStep / (SIDEBAR_STEPS.length - 1)) * 100}%` }}></div>
              
              {SIDEBAR_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;
                return (
                  <div key={idx} className="relative flex items-center gap-4 py-3.5">
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                      {isCompleted && <div className="w-4 h-4 rounded-full bg-blue-500" />}
                      {isActive && (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        </div>
                      )}
                      {isPending && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <span className={`text-sm font-medium ${isActive || isCompleted ? "text-blue-600" : "text-gray-400"}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 space-y-6">
          {MOCK_DATA.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-white">
                <h2 className="text-[15px] font-bold text-gray-800">{section.title}</h2>
              </div>
              <div className="p-6 space-y-5">
                {section.courses.map((course) => {
                  const state = courseState[course.id] || { selected: false, years: [], risk: "" };
                  
                  return (
                    <div key={course.id} className="space-y-4">
                      {/* Course Checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={() => toggleCourse(course.id)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[14px] text-gray-700 group-hover:text-gray-900 leading-snug">
                          {course.name}
                        </span>
                      </label>

                      {/* Sub-options (Years & Risk) - Show only if selected AND has years data */}
                      {state.selected && course.years && (
                        <div className="pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          
                          {/* Years Row */}
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="text-[13px] text-gray-500 w-20">ปีการศึกษา :</span>
                            <div className="flex flex-wrap items-center gap-4">
                              {course.years.map((yr) => (
                                <label key={yr.value} className="flex items-center gap-2 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={state.years.includes(yr.value)}
                                    onChange={() => toggleYear(course.id, yr.value)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{yr.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Risk Row */}
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="text-[13px] text-gray-500 w-20">ความเสี่ยง :</span>
                            <div className="flex flex-wrap items-center gap-6">
                              {RISK_OPTIONS.map((risk) => (
                                <label key={risk} className="flex items-center gap-2 cursor-pointer group">
                                  <input
                                    type="radio"
                                    name={`risk-${course.id}`}
                                    value={risk}
                                    checked={state.risk === risk}
                                    onChange={() => setRisk(course.id, risk)}
                                    className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{risk}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-8 flex justify-end gap-3 z-40">
        <button onClick={() => navigate(-1)} className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button onClick={() => navigate("/annual-budget-summary/step2")} className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
          ถัดไป
        </button>
      </div>
    </div>
  );
}