import { useEffect, useMemo, useState, type ReactNode } from "react";
import Swal from "sweetalert2";
import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  GetDataAnnualBudgetSummary,
  GetDataAnnualBudgetSummaryByID,
  GetDataDegreeLevel,
  GetDataSemester,
  GetDataYear,
} from "../../fetchapi/fetch_api_admin";

type SummaryMode = "yearly" | "semester";
type ChartMode = "pie" | "line";

type BudgetStepKey =
  | "universityIncome"
  | "outsideSubject"
  | "fund"
  | "central"
  | "universityWork";

interface YearOption {
  id: string;
  year: string;
}

interface SemesterOption {
  id: string;
  value: string;
  name: string;
}

interface PeriodOption {
  id: string;
  yearId: string;
  semesterId?: string;
  label: string;
  summaryType: SummaryMode;
  summaryId?: string;
}

interface DegreeLevelOption {
  id: string;
  label: string;
}

interface CourseBudgetItem {
  id: string;
  code: string;
  name: string;
  degreeLevelId: string;
  degreeLevelLabel: string;
  income: number;
  remaining: number;
  universityIncome: number;
  outsideSubject: number;
  fund: number;
  central: number;
  universityWork: number;
}

const COLORS = [
  "#22c55e",
  "#facc15",
  "#38bdf8",
  "#d946ef",
  "#fb923c",
  "#2563eb",
  "#14b8a6",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

const budgetStepLabels: Record<BudgetStepKey, string> = {
  universityIncome: "จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย",
  outsideSubject: "จ่ายให้เจ้าของรายวิชานอกคณะ",
  fund: "หักเข้ากองทุน/สาธารณูปโภค",
  central: "หักบริหารส่วนกลางวิทยาลัย",
  universityWork: "หักบริหารงานวิทยาลัย",
};

function pickArrayFromResponse<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.Items)) return response.Items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function unwrapResponse(response: any) {
  return response?.data?.data || response?.data || response?.Data || response;
}

function toText(value: any) {
  return String(value ?? "").trim();
}

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function absMoney(value: any) {
  return Math.abs(toNumber(value));
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function formatMoney(value: number) {
  return `${formatNumber(value)} บาท`;
}

function getId(row: any) {
  return toText(row?.id ?? row?.ID);
}

function getYearId(row: any) {
  return toText(
    row?.yearId ??
      row?.year_id ??
      row?.YearID ??
      row?.YearId ??
      row?.year?.id ??
      row?.year?.ID ??
      row?.Year?.id ??
      row?.Year?.ID,
  );
}

function getYearText(row: any) {
  return toText(
    row?.year ??
      row?.Year ??
      row?.yearName ??
      row?.year_name ??
      row?.year?.year ??
      row?.year?.Year ??
      row?.Year?.year ??
      row?.Year?.Year ??
      row?.name ??
      row?.Name,
  );
}

function getSemesterId(row: any) {
  return toText(
    row?.semesterId ??
      row?.semester_id ??
      row?.SemesterID ??
      row?.SemesterId ??
      row?.semester?.id ??
      row?.semester?.ID ??
      row?.Semester?.id ??
      row?.Semester?.ID,
  );
}

function getSemesterValue(row: any) {
  return toText(
    row?.semester ??
      row?.Semester ??
      row?.semesterName ??
      row?.semester_name ??
      row?.semester?.semester ??
      row?.semester?.Semester ??
      row?.Semester?.semester ??
      row?.Semester?.Semester ??
      row?.name ??
      row?.Name,
  );
}

function getSemesterDisplayName(value: string) {
  const clean = String(value || "").trim();

  if (clean === "1") return "ภาคต้น";
  if (clean === "2") return "ภาคปลาย";
  if (clean === "3") return "ภาคฤดูร้อน";

  if (clean.includes("ต้น")) return "ภาคต้น";
  if (clean.includes("ปลาย")) return "ภาคปลาย";
  if (clean.includes("ร้อน")) return "ภาคฤดูร้อน";

  return clean || "-";
}

function getSummaryType(row: any): SummaryMode {
  const type = toText(
    row?.summaryType ??
      row?.summary_type ??
      row?.SummaryType ??
      row?.type ??
      row?.Type,
  );

  const semesterId = getSemesterId(row);

  if (
    type === "semester" ||
    type === "term" ||
    type === "รายปีแยกเทอม" ||
    type === "แยกตามภาค" ||
    Boolean(semesterId)
  ) {
    return "semester";
  }

  return "yearly";
}

function normalizeYear(row: any): YearOption {
  return {
    id: getId(row) || getYearId(row),
    year: getYearText(row),
  };
}

function normalizeSemester(row: any): SemesterOption {
  const value = getSemesterValue(row);

  return {
    id: getId(row) || getSemesterId(row),
    value,
    name: getSemesterDisplayName(value),
  };
}

function normalizeDegreeLevel(row: any): DegreeLevelOption {
  const id = getId(row);

  const name = toText(
    row?.name ??
      row?.Name ??
      row?.degreeLevelName ??
      row?.degree_level_name ??
      row?.DegreeLevelName,
  );

  const shortName = toText(
    row?.shortName ??
      row?.short_name ??
      row?.ShortName ??
      row?.short_name_snapshot,
  );

  const section =
    row?.section ??
    row?.Section ??
    row?.sectionData ??
    row?.SectionData ??
    {};

  const sectionName = toText(
    row?.sectionName ??
      row?.section_name ??
      row?.SectionName ??
      section?.section_name ??
      section?.sectionName ??
      section?.name ??
      section?.Name,
  );

  const mainName = name || shortName;
  const label = sectionName ? `${mainName} (${sectionName})` : mainName;

  return {
    id,
    label: label || "-",
  };
}

function getAnyNestedCourse(row: any) {
  return (
    row?.course ??
    row?.Course ??
    row?.curriculum ??
    row?.Curriculum ??
    row?.courseData ??
    row?.CourseData ??
    row?.curriculumData ??
    row?.CurriculumData ??
    null
  );
}

function getCourseObject(row: any) {
  return getAnyNestedCourse(row) || row;
}

function getCourseId(row: any) {
  const course = getCourseObject(row);

  return toText(
    row?.courseId ??
      row?.course_id ??
      row?.CourseID ??
      row?.CourseId ??
      row?.curriculumId ??
      row?.curriculum_id ??
      row?.CurriculumID ??
      row?.CurriculumId ??
      row?.id_course ??
      course?.id ??
      course?.ID,
  );
}

function getCourseCode(row: any) {
  const course = getCourseObject(row);

  return toText(
    row?.courseShortNameSnapshot ??
      row?.course_short_name_snapshot ??
      row?.CourseShortNameSnapshot ??
      row?.courseCode ??
      row?.course_code ??
      row?.CourseCode ??
      row?.code ??
      row?.Code ??
      row?.shortName ??
      row?.short_name ??
      row?.ShortName ??
      row?.curriculumCode ??
      row?.curriculum_code ??
      row?.CurriculumCode ??
      course?.courseShortNameSnapshot ??
      course?.course_short_name_snapshot ??
      course?.CourseShortNameSnapshot ??
      course?.courseCode ??
      course?.course_code ??
      course?.CourseCode ??
      course?.code ??
      course?.Code ??
      course?.shortName ??
      course?.short_name ??
      course?.ShortName,
  );
}

function getCourseName(row: any) {
  const course = getCourseObject(row);

  return toText(
    row?.courseNameSnapshot ??
      row?.course_name_snapshot ??
      row?.CourseNameSnapshot ??
      row?.courseName ??
      row?.course_name ??
      row?.CourseName ??
      row?.curriculumName ??
      row?.curriculum_name ??
      row?.CurriculumName ??
      row?.name ??
      row?.Name ??
      course?.courseNameSnapshot ??
      course?.course_name_snapshot ??
      course?.CourseNameSnapshot ??
      course?.courseName ??
      course?.course_name ??
      course?.CourseName ??
      course?.curriculumName ??
      course?.curriculum_name ??
      course?.CurriculumName ??
      course?.name ??
      course?.Name,
  );
}

function getDegreeLevelIdFromCourse(row: any) {
  const course = getCourseObject(row);
  const degreeLevel =
    row?.degreeLevel ??
    row?.DegreeLevel ??
    row?.degree_level ??
    row?.Degree_Level ??
    row?.degree ??
    row?.Degree ??
    course?.degreeLevel ??
    course?.DegreeLevel ??
    course?.degree_level ??
    course?.Degree_Level ??
    {};

  return toText(
    row?.degreeLevelId ??
      row?.degree_level_id ??
      row?.DegreeLevelID ??
      row?.DegreeLevelId ??
      row?.degree_id ??
      row?.degreeId ??
      degreeLevel?.id ??
      degreeLevel?.ID ??
      course?.degree_level_id ??
      course?.degreeLevelId ??
      course?.DegreeLevelID,
  );
}

function getDegreeLevelLabelFromCourse(row: any) {
  const course = getCourseObject(row);

  const snapshot = toText(
    row?.sectionTitleSnapshot ??
      row?.section_title_snapshot ??
      row?.SectionTitleSnapshot ??
      course?.sectionTitleSnapshot ??
      course?.section_title_snapshot ??
      course?.SectionTitleSnapshot,
  );

  if (snapshot) return snapshot;

  const degreeLevel =
    row?.degreeLevel ??
    row?.DegreeLevel ??
    row?.degree_level ??
    row?.Degree_Level ??
    course?.degreeLevel ??
    course?.DegreeLevel ??
    course?.degree_level ??
    {};

  const name = toText(
    degreeLevel?.name ??
      degreeLevel?.Name ??
      row?.degreeLevelName ??
      row?.degree_level_name,
  );

  const section =
    degreeLevel?.section ??
    degreeLevel?.Section ??
    row?.section ??
    row?.Section ??
    {};

  const sectionName = toText(
    section?.section_name ??
      section?.sectionName ??
      section?.name ??
      section?.Name ??
      row?.sectionName ??
      row?.section_name,
  );

  if (name && sectionName) return `${name} (${sectionName})`;
  if (name) return name;

  return "-";
}

function getUniversityIncome(row: any) {
  return absMoney(
    row?.step2DeductAmount ??
      row?.step2_deduct_amount ??
      row?.Step2DeductAmount ??
      row?.universityIncome ??
      row?.university_income ??
      row?.deductToUni ??
      row?.deduct_to_uni,
  );
}

function getOutsideSubject(row: any) {
  return absMoney(
    row?.step3DeductAmount ??
      row?.step3_deduct_amount ??
      row?.Step3DeductAmount ??
      row?.outsideSubject ??
      row?.outside_subject ??
      row?.outsideSubjectAmount ??
      row?.outside_subject_amount,
  );
}

function getFund(row: any) {
  return absMoney(
    row?.step4DeductAmount ??
      row?.step4_deduct_amount ??
      row?.Step4DeductAmount ??
      row?.fund ??
      row?.fundAmount ??
      row?.fund_amount,
  );
}

function getCentral(row: any) {
  return absMoney(
    row?.step5DeductAmount ??
      row?.step5_deduct_amount ??
      row?.Step5DeductAmount ??
      row?.central ??
      row?.centralAmount ??
      row?.central_amount,
  );
}

function getUniversityWork(row: any) {
  return absMoney(
    row?.step6DeductAmount ??
      row?.step6_deduct_amount ??
      row?.Step6DeductAmount ??
      row?.universityWork ??
      row?.university_work ??
      row?.universityWorkAmount ??
      row?.university_work_amount,
  );
}

function getRemaining(row: any) {
  return toNumber(
    row?.finalRemainingAmount ??
      row?.final_remaining_amount ??
      row?.FinalRemainingAmount ??
      row?.step6RemainingAmount ??
      row?.step6_remaining_amount ??
      row?.Step6RemainingAmount ??
      row?.remaining ??
      row?.balance ??
      row?.remain ??
      row?.totalRemaining ??
      row?.total_remaining ??
      row?.curriculumAmount ??
      row?.curriculum_amount ??
      row?.totalCurriculumAmount ??
      row?.total_curriculum_amount,
  );
}

function getIncome(row: any) {
  const direct = toNumber(
    row?.initialAmount ??
      row?.initial_amount ??
      row?.InitialAmount ??
      row?.income ??
      row?.totalIncome ??
      row?.total_income ??
      row?.totalRevenue ??
      row?.total_revenue ??
      row?.revenue ??
      row?.amount ??
      row?.totalAmount ??
      row?.total_amount ??
      row?.budget ??
      row?.total_budget,
  );

  if (direct > 0) return direct;

  const remaining = getRemaining(row);
  const deduct =
    getUniversityIncome(row) +
    getOutsideSubject(row) +
    getFund(row) +
    getCentral(row) +
    getUniversityWork(row);

  return remaining + deduct;
}

function hasMoney(row: any) {
  return (
    getIncome(row) > 0 ||
    getRemaining(row) > 0 ||
    getUniversityIncome(row) > 0 ||
    getOutsideSubject(row) > 0 ||
    getFund(row) > 0 ||
    getCentral(row) > 0 ||
    getUniversityWork(row) > 0
  );
}

function collectCourseRowsFromDetail(input: any): any[] {
  const root = unwrapResponse(input);
  const result: any[] = [];
  const visited = new WeakSet<object>();

  const courseArrayKeys = [
    "courses",
    "Courses",
    "annualBudgetSummaryCourses",
    "AnnualBudgetSummaryCourses",
    "annual_budget_summary_courses",
    "courseDetails",
    "CourseDetails",
    "course_details",
    "annualBudgetSummaryDetails",
    "AnnualBudgetSummaryDetails",
    "annual_budget_summary_details",
    "details",
    "Details",
    "items",
    "Items",
  ];

  const shouldPushCourse = (value: any) => {
    if (!value || typeof value !== "object") return false;

    const code = getCourseCode(value);
    const name = getCourseName(value);
    const courseId = getCourseId(value);

    const hasSnapshot =
      Boolean(value?.course_name_snapshot) ||
      Boolean(value?.courseNameSnapshot) ||
      Boolean(value?.course_short_name_snapshot) ||
      Boolean(value?.courseShortNameSnapshot);

    if (hasSnapshot && hasMoney(value)) return true;

    if (!courseId && !code && !name) return false;
    if ((code === "-" || !code) && (name === "-" || !name)) return false;

    return hasMoney(value);
  };

  const walk = (value: any, parentDegreeLevel?: any) => {
    if (!value || typeof value !== "object") return;

    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, parentDegreeLevel));
      return;
    }

    const currentDegreeLevel =
      value.degreeLevel ||
      value.DegreeLevel ||
      value.degree_level ||
      value.Degree_Level ||
      value.degree ||
      value.Degree ||
      parentDegreeLevel;

    if (shouldPushCourse(value)) {
      const nestedCourse = getAnyNestedCourse(value);

      result.push({
        ...value,
        ...(nestedCourse || {}),
        course: nestedCourse || value.course || value.Course,
        Course: nestedCourse || value.Course || value.course,
        curriculum: nestedCourse || value.curriculum || value.Curriculum,
        Curriculum: nestedCourse || value.Curriculum || value.curriculum,
        degreeLevel:
          value.degreeLevel ||
          value.DegreeLevel ||
          value.degree_level ||
          nestedCourse?.degreeLevel ||
          nestedCourse?.DegreeLevel ||
          nestedCourse?.degree_level ||
          currentDegreeLevel,
        DegreeLevel:
          value.DegreeLevel ||
          value.degreeLevel ||
          value.degree_level ||
          nestedCourse?.DegreeLevel ||
          nestedCourse?.degreeLevel ||
          nestedCourse?.degree_level ||
          currentDegreeLevel,
        degree_level:
          value.degree_level ||
          value.degreeLevel ||
          value.DegreeLevel ||
          nestedCourse?.degree_level ||
          nestedCourse?.degreeLevel ||
          nestedCourse?.DegreeLevel ||
          currentDegreeLevel,
      });

      return;
    }

    for (const key of courseArrayKeys) {
      const child = value?.[key];

      if (Array.isArray(child)) {
        child.forEach((item) => walk(item, currentDegreeLevel));
      }
    }

    Object.entries(value).forEach(([key, child]) => {
      if (courseArrayKeys.includes(key)) return;
      walk(child, currentDegreeLevel);
    });
  };

  walk(root);

  return result.filter((row) => {
    const code = getCourseCode(row);
    const name = getCourseName(row);
    const courseId = getCourseId(row);

    return Boolean(courseId || code || name) && code !== "-" && name !== "-";
  });
}

function normalizeCourseFromDetail(row: any): CourseBudgetItem {
  const nestedCourse = getAnyNestedCourse(row) || {};

  const courseId = getCourseId(row) || getId(nestedCourse);
  const code = getCourseCode(row);
  const name = getCourseName(row);

  const degreeLevelId =
    getDegreeLevelIdFromCourse(row) || getDegreeLevelIdFromCourse(nestedCourse);

  const degreeLevelLabel =
    getDegreeLevelLabelFromCourse(row) ||
    getDegreeLevelLabelFromCourse(nestedCourse) ||
    "-";

  const universityIncome = getUniversityIncome(row);
  const outsideSubject = getOutsideSubject(row);
  const fund = getFund(row);
  const central = getCentral(row);
  const universityWork = getUniversityWork(row);
  const remaining = getRemaining(row);

  let income = getIncome(row);

  if (!income) {
    income =
      universityIncome +
      outsideSubject +
      fund +
      central +
      universityWork +
      remaining;
  }

  return {
    id: courseId || `${code || name}`,
    code: code || name,
    name: name || code,
    degreeLevelId,
    degreeLevelLabel,
    income,
    remaining,
    universityIncome,
    outsideSubject,
    fund,
    central,
    universityWork,
  };
}

function mergeCourseRows(rows: CourseBudgetItem[]) {
  const map = new Map<string, CourseBudgetItem>();

  rows.forEach((row) => {
    const key = row.id || `${row.code}-${row.name}`;
    const old = map.get(key);

    if (!old) {
      map.set(key, row);
      return;
    }

    map.set(key, {
      ...old,
      income: old.income + row.income,
      remaining: old.remaining + row.remaining,
      universityIncome: old.universityIncome + row.universityIncome,
      outsideSubject: old.outsideSubject + row.outsideSubject,
      fund: old.fund + row.fund,
      central: old.central + row.central,
      universityWork: old.universityWork + row.universityWork,
    });
  });

  return Array.from(map.values());
}

function PieIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-8" />
    </svg>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400">{title}</p>
      <p className="mt-3 text-2xl font-black text-gray-900">{value}</p>
      <p className="mt-2 text-xs font-semibold text-gray-400">{description}</p>
    </div>
  );
}

function ToggleMode({
  value,
  onChange,
}: {
  value: SummaryMode;
  onChange: (value: SummaryMode) => void;
}) {
  return (
    <div className="grid h-10 w-full grid-cols-2 overflow-hidden rounded-xl bg-gray-100 p-1 sm:w-[230px]">
      <button
        type="button"
        onClick={() => onChange("yearly")}
        className={`rounded-lg text-sm font-bold transition-all ${
          value === "yearly"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-700"
        }`}
      >
        รายปี
      </button>

      <button
        type="button"
        onClick={() => onChange("semester")}
        className={`rounded-lg text-sm font-bold transition-all ${
          value === "semester"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-700"
        }`}
      >
        แยกตามภาค
      </button>
    </div>
  );
}

function ChartTypeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
        active
          ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-100"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-gray-900">{item.name}</p>
      <p className="mt-1 text-gray-500">{formatMoney(item.value)}</p>
    </div>
  );
}

function CustomLineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-gray-900">{label}</p>

      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[430px] flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">
        <PieIcon />
      </div>

      <p className="text-sm font-bold text-gray-400">{text}</p>
      <p className="mt-1 text-xs text-gray-400">
        ตรวจสอบว่า API รายละเอียดสรุปงบประมาณส่งข้อมูลรายหลักสูตรออกมาแล้ว
      </p>
    </div>
  );
}

function BudgetPieChart({ data }: { data: { name: string; value: number }[] }) {
  const chartData = data.filter((item) => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!chartData.length) {
    return <EmptyChart text="ไม่พบยอดเงินสำหรับแสดงกราฟ" />;
  }

  return (
    <div className="grid min-h-[430px] gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="flex min-h-[430px] items-center justify-center rounded-[22px] border border-gray-100 bg-gray-50/70">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={138}
              paddingAngle={2}
              label={false}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-gray-900">รายการหลักสูตร</p>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              รวมทั้งหมด {formatMoney(total)}
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
            {chartData.length} รายการ
          </span>
        </div>

        <div className="max-h-[355px] space-y-3 overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div
                key={`${item.name}-${index}`}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 transition hover:border-gray-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-relaxed text-gray-800">
                      {item.name}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-gray-900">
                        {formatMoney(item.value)}
                      </p>

                      <p className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-gray-500">
                        {percent.toFixed(1)}%
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RemainingLineChart({
  data,
  courses,
}: {
  data: any[];
  courses: CourseBudgetItem[];
}) {
  const activeCourses = courses.filter((course) =>
    data.some((row) => toNumber(row[course.code]) > 0),
  );

  if (!data.length || !activeCourses.length) {
    return <EmptyChart text="ไม่พบยอดเงินสำหรับแสดงกราฟ" />;
  }

  return (
    <div className="h-[470px] w-full rounded-[22px] border border-gray-100 bg-gray-50/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 24, right: 30, left: 10, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="step"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            interval={0}
            height={70}
          />

          <YAxis
            tickFormatter={(value) => formatNumber(Number(value))}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />

          <Tooltip content={<CustomLineTooltip />} />

          {activeCourses.map((course, index) => (
            <Line
              key={course.id}
              type="monotone"
              dataKey={course.code}
              name={course.code}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CourseSelectBox({
  courses,
  selectedCourseIds,
  onToggle,
}: {
  courses: CourseBudgetItem[];
  selectedCourseIds: string[];
  onToggle: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, CourseBudgetItem[]>();

    courses.forEach((course) => {
      const key = course.degreeLevelLabel || "-";
      const old = map.get(key) || [];
      old.push(course);
      map.set(key, old);
    });

    return Array.from(map.entries());
  }, [courses]);

  return (
    <div className="h-full rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-gray-900">เลือกหลักสูตร</p>
        <p className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
          {selectedCourseIds.length}/{courses.length}
        </p>
      </div>

      <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
        {grouped.map(([degreeLevelLabel, items]) => (
          <div key={degreeLevelLabel}>
            <p className="mb-2 text-xs font-black text-gray-700">
              {degreeLevelLabel}
            </p>

            <div className="space-y-2">
              {items.map((course) => (
                <label
                  key={course.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course.id)}
                    onChange={() => onToggle(course.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />

                  <span className="font-semibold">
                    {course.code} ({course.name})
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon,
  children,
  mode,
  periodValue,
  degreeLevelValue,
  periodOptions,
  degreeLevelOptions,
  chartMode,
  showChartToggle,
  showDegreeLevelFilter = true,
  onModeChange,
  onPeriodChange,
  onDegreeLevelChange,
  onChartModeChange,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  mode: SummaryMode;
  periodValue: string;
  degreeLevelValue: string;
  periodOptions: PeriodOption[];
  degreeLevelOptions: DegreeLevelOption[];
  chartMode?: ChartMode;
  showChartToggle?: boolean;
  showDegreeLevelFilter?: boolean;
  onModeChange: (value: SummaryMode) => void;
  onPeriodChange: (value: string) => void;
  onDegreeLevelChange: (value: string) => void;
  onChartModeChange?: (value: ChartMode) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm">
      <div className="bg-white px-5 py-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(260px,1fr)_minmax(360px,540px)] xl:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
              {icon}
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="text-xl font-black leading-snug text-gray-900">
                {title}
              </h2>
              <p className="mt-1 text-xs font-semibold text-gray-400">
                แสดงข้อมูลจากสรุปงบประมาณที่บันทึกไว้
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-gray-50/80 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto] sm:items-center">
              <ToggleMode value={mode} onChange={onModeChange} />

              <select
                value={periodValue}
                onChange={(event) => onPeriodChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 outline-none transition-colors focus:border-blue-400"
              >
                {periodOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>

              {showChartToggle ? (
                <div className="flex items-center gap-2">
                  <ChartTypeButton
                    active={chartMode === "pie"}
                    onClick={() => onChartModeChange?.("pie")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                      <path d="M22 12A10 10 0 0 0 12 2v10z" />
                    </svg>
                  </ChartTypeButton>

                  <ChartTypeButton
                    active={chartMode === "line"}
                    onClick={() => onChartModeChange?.("line")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m7 16 4-5 4 3 5-8" />
                    </svg>
                  </ChartTypeButton>
                </div>
              ) : (
                <div />
              )}
            </div>

            {showDegreeLevelFilter && (
              <div className="mt-2">
                <select
                  value={degreeLevelValue}
                  onChange={(event) => onDegreeLevelChange(event.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 outline-none transition-colors focus:border-blue-400"
                >
                  {degreeLevelOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-5">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [years, setYears] = useState<YearOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevelOption[]>([]);
  const [annualSummaries, setAnnualSummaries] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any>(null);

  const [mode, setMode] = useState<SummaryMode>("yearly");
  const [periodValue, setPeriodValue] = useState("");
  const [degreeLevelValue, setDegreeLevelValue] = useState("all");
  const [chartMode, setChartMode] = useState<ChartMode>("pie");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const yearlyPeriodOptions = useMemo<PeriodOption[]>(() => {
    const map = new Map<string, PeriodOption>();

    annualSummaries.forEach((item) => {
      if (getSummaryType(item) !== "yearly") return;

      const id = getId(item);
      const yearId = getYearId(item);

      if (!id || !yearId) return;

      const yearName =
        years.find((yearItem) => yearItem.id === yearId)?.year ||
        getYearText(item) ||
        yearId;

      map.set(yearId, {
        id: yearId,
        yearId,
        label: yearName,
        summaryType: "yearly",
        summaryId: id,
      });
    });

    if (map.size === 0) {
      years.forEach((yearItem) => {
        map.set(yearItem.id, {
          id: yearItem.id,
          yearId: yearItem.id,
          label: yearItem.year,
          summaryType: "yearly",
        });
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      b.label.localeCompare(a.label, "th", { numeric: true }),
    );
  }, [annualSummaries, years]);

  const semesterPeriodOptions = useMemo<PeriodOption[]>(() => {
    const map = new Map<string, PeriodOption>();

    annualSummaries.forEach((item) => {
      if (getSummaryType(item) !== "semester") return;

      const id = getId(item);
      const yearId = getYearId(item);
      const semesterId = getSemesterId(item);

      if (!id || !yearId || !semesterId) return;

      const yearName =
        years.find((yearItem) => yearItem.id === yearId)?.year ||
        getYearText(item) ||
        yearId;

      const semesterOption =
        semesters.find((semesterItem) => semesterItem.id === semesterId) ||
        normalizeSemester(item);

      const semesterValue = semesterOption.value || semesterId;

      map.set(`${yearId}_${semesterId}`, {
        id: `${yearId}_${semesterId}`,
        yearId,
        semesterId,
        label: `${yearName}/${semesterValue} (${semesterOption.name})`,
        summaryType: "semester",
        summaryId: id,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      b.label.localeCompare(a.label, "th", { numeric: true }),
    );
  }, [annualSummaries, years, semesters]);

  const activePeriodOptions =
    mode === "yearly" ? yearlyPeriodOptions : semesterPeriodOptions;

  const activePeriod = useMemo(() => {
    return activePeriodOptions.find((item) => item.id === periodValue);
  }, [activePeriodOptions, periodValue]);

  const degreeLevelOptions = useMemo<DegreeLevelOption[]>(() => {
    return [{ id: "all", label: "ทั้งหมด" }, ...degreeLevels];
  }, [degreeLevels]);

  const allCourseRows = useMemo(() => {
    const rawRows = collectCourseRowsFromDetail(detailData);

    const normalized = rawRows
      .map((row) => normalizeCourseFromDetail(row))
      .filter((item) => {
        const hasName = Boolean(item.name && item.name !== "-");
        const hasCode = Boolean(item.code && item.code !== "-");
        const hasAnyMoney =
          item.income > 0 ||
          item.remaining > 0 ||
          item.universityIncome > 0 ||
          item.outsideSubject > 0 ||
          item.fund > 0 ||
          item.central > 0 ||
          item.universityWork > 0;

        return Boolean(item.id) && (hasName || hasCode) && hasAnyMoney;
      });

    return mergeCourseRows(normalized);
  }, [detailData]);

  const filteredCourses = useMemo(() => {
    return allCourseRows.filter((course) => {
      const selectedDegreeLabel =
        degreeLevelOptions.find((item) => item.id === degreeLevelValue)?.label ||
        "";

      const matchDegreeLevel =
        degreeLevelValue === "all" ||
        course.degreeLevelId === degreeLevelValue ||
        course.degreeLevelLabel === selectedDegreeLabel;

      const matchSelected =
        selectedCourseIds.length === 0 || selectedCourseIds.includes(course.id);

      return matchDegreeLevel && matchSelected;
    });
  }, [allCourseRows, degreeLevelValue, selectedCourseIds, degreeLevelOptions]);

  const selectedOnlyCourses = useMemo(() => {
    return allCourseRows.filter((course) => {
      return (
        selectedCourseIds.length === 0 || selectedCourseIds.includes(course.id)
      );
    });
  }, [allCourseRows, selectedCourseIds]);

  const totalIncome = useMemo(() => {
    return filteredCourses.reduce((sum, item) => sum + item.income, 0);
  }, [filteredCourses]);

  const totalRemaining = useMemo(() => {
    return filteredCourses.reduce((sum, item) => sum + item.remaining, 0);
  }, [filteredCourses]);

  const totalDeduct = useMemo(() => {
    return filteredCourses.reduce(
      (sum, item) =>
        sum +
        item.universityIncome +
        item.outsideSubject +
        item.fund +
        item.central +
        item.universityWork,
      0,
    );
  }, [filteredCourses]);

  const incomePieData = useMemo(() => {
    return filteredCourses.map((course) => ({
      name: `${course.name} (${course.code})`,
      value: course.income,
    }));
  }, [filteredCourses]);

  const remainingPieData = useMemo(() => {
    return filteredCourses.map((course) => ({
      name: `${course.name} (${course.code})`,
      value: course.remaining,
    }));
  }, [filteredCourses]);

  const allocationPieData = useMemo(() => {
    const keys: BudgetStepKey[] = [
      "universityIncome",
      "outsideSubject",
      "fund",
      "central",
      "universityWork",
    ];

    return keys.map((key) => ({
      name: budgetStepLabels[key],
      value: filteredCourses.reduce((sum, course) => sum + course[key], 0),
    }));
  }, [filteredCourses]);

  const remainingLineData = useMemo(() => {
    const steps: BudgetStepKey[] = [
      "universityIncome",
      "outsideSubject",
      "fund",
      "central",
      "universityWork",
    ];

    return steps.map((step) => {
      const row: Record<string, string | number> = {
        step: budgetStepLabels[step],
      };

      selectedOnlyCourses.forEach((course) => {
        row[course.code] = course[step];
      });

      return row;
    });
  }, [selectedOnlyCourses]);

  const periodDescription = activePeriod?.label || "-";

  const handleModeChange = (nextMode: SummaryMode) => {
    setMode(nextMode);
    setDetailData(null);
    setSelectedCourseIds([]);

    const nextOptions =
      nextMode === "yearly" ? yearlyPeriodOptions : semesterPeriodOptions;

    setPeriodValue(nextOptions[0]?.id || "");
  };

  const handleToggleCourse = (id: string) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);

        const [yearResponse, semesterResponse, degreeResponse, summaryResponse] =
          await Promise.all([
            GetDataYear(),
            GetDataSemester(),
            GetDataDegreeLevel(),
            GetDataAnnualBudgetSummary(),
          ]);

        const yearList = pickArrayFromResponse<any>(yearResponse)
          .map(normalizeYear)
          .filter((item) => item.id && item.year);

        const semesterList = pickArrayFromResponse<any>(semesterResponse)
          .map(normalizeSemester)
          .filter((item) => item.id && item.value);

        const degreeLevelList = pickArrayFromResponse<any>(degreeResponse)
          .map(normalizeDegreeLevel)
          .filter((item) => item.id && item.label && item.label !== "-");

        const summaryList = pickArrayFromResponse<any>(summaryResponse);

        setYears(yearList);
        setSemesters(semesterList);
        setDegreeLevels(degreeLevelList);
        setAnnualSummaries(summaryList);

        const firstYearly = summaryList.find(
          (item) => getSummaryType(item) === "yearly" && getYearId(item),
        );

        if (firstYearly) {
          setPeriodValue(getYearId(firstYearly));
        } else if (yearList[0]) {
          setPeriodValue(yearList[0].id);
        }
      } catch (error: any) {
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error?.message || error || "ไม่สามารถดึงข้อมูล Dashboard ได้",
          confirmButtonColor: "#3b82f6",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    if (!activePeriodOptions.length) return;

    const exists = activePeriodOptions.some((item) => item.id === periodValue);

    if (!exists) {
      setPeriodValue(activePeriodOptions[0]?.id || "");
    }
  }, [activePeriodOptions, periodValue]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!activePeriod?.summaryId) {
        setDetailData(null);
        return;
      }

      try {
        setLoading(true);

        const response = await GetDataAnnualBudgetSummaryByID(
          activePeriod.summaryId,
        );
        const data = unwrapResponse(response);

        setDetailData(data);
      } catch (error: any) {
        setDetailData(null);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text:
            error?.message ||
            error ||
            "ไม่สามารถดึงข้อมูลรายละเอียดสรุปงบประมาณได้",
          confirmButtonColor: "#3b82f6",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [activePeriod?.summaryId]);

  useEffect(() => {
    setSelectedCourseIds(allCourseRows.map((item) => item.id));
  }, [detailData, allCourseRows.length]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-gray-400">
            ภาพรวมสรุปงบประมาณ รายได้ และยอดคงเหลือของหลักสูตร
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryCard
            title="รายได้รวม"
            value={loading ? "กำลังโหลด..." : formatMoney(totalIncome)}
            description={`${periodDescription} / ${
              mode === "yearly" ? "รายปี" : "แยกตามภาค"
            }`}
          />

          <SummaryCard
            title="ยอดหักรวม"
            value={loading ? "กำลังโหลด..." : formatMoney(totalDeduct)}
            description="รวมรายการหักทุกงบประมาณ"
          />

          <SummaryCard
            title="คงเหลือรวม"
            value={loading ? "กำลังโหลด..." : formatMoney(totalRemaining)}
            description="รวมยอดคงเหลือทุกหลักสูตรที่เลือก"
          />
        </div>

        <ChartCard
          title="สรุปงบประมาณประจำปี แต่ละหลักสูตร"
          icon={<PieIcon />}
          mode={mode}
          periodValue={periodValue}
          degreeLevelValue={degreeLevelValue}
          periodOptions={activePeriodOptions}
          degreeLevelOptions={degreeLevelOptions}
          chartMode={chartMode}
          showChartToggle
          showDegreeLevelFilter
          onModeChange={handleModeChange}
          onPeriodChange={(value) => {
            setPeriodValue(value);
            setDetailData(null);
          }}
          onDegreeLevelChange={setDegreeLevelValue}
          onChartModeChange={setChartMode}
        >
          {chartMode === "pie" ? (
            <BudgetPieChart data={incomePieData} />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
              <RemainingLineChart
                data={remainingLineData}
                courses={selectedOnlyCourses}
              />

              <CourseSelectBox
                courses={allCourseRows}
                selectedCourseIds={selectedCourseIds}
                onToggle={handleToggleCourse}
              />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="สรุปยอดเงินคงเหลือ แต่ละหลักสูตร"
          icon={<LineIcon />}
          mode={mode}
          periodValue={periodValue}
          degreeLevelValue={degreeLevelValue}
          periodOptions={activePeriodOptions}
          degreeLevelOptions={degreeLevelOptions}
          chartMode="line"
          showDegreeLevelFilter={false}
          onModeChange={handleModeChange}
          onPeriodChange={(value) => {
            setPeriodValue(value);
            setDetailData(null);
          }}
          onDegreeLevelChange={setDegreeLevelValue}
        >
          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <RemainingLineChart
              data={remainingLineData}
              courses={selectedOnlyCourses}
            />

            <CourseSelectBox
              courses={allCourseRows}
              selectedCourseIds={selectedCourseIds}
              onToggle={handleToggleCourse}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="สรุปงบประมาณคงเหลือแต่ละหลักสูตร"
          icon={<PieIcon />}
          mode={mode}
          periodValue={periodValue}
          degreeLevelValue={degreeLevelValue}
          periodOptions={activePeriodOptions}
          degreeLevelOptions={degreeLevelOptions}
          showDegreeLevelFilter
          onModeChange={handleModeChange}
          onPeriodChange={(value) => {
            setPeriodValue(value);
            setDetailData(null);
          }}
          onDegreeLevelChange={setDegreeLevelValue}
        >
          <BudgetPieChart data={remainingPieData} />
        </ChartCard>

        <ChartCard
          title="เปรียบเทียบรายได้ของแต่ละหลักสูตร"
          icon={<PieIcon />}
          mode={mode}
          periodValue={periodValue}
          degreeLevelValue={degreeLevelValue}
          periodOptions={activePeriodOptions}
          degreeLevelOptions={degreeLevelOptions}
          showDegreeLevelFilter
          onModeChange={handleModeChange}
          onPeriodChange={(value) => {
            setPeriodValue(value);
            setDetailData(null);
          }}
          onDegreeLevelChange={setDegreeLevelValue}
        >
          <BudgetPieChart data={incomePieData} />
        </ChartCard>

        <ChartCard
          title="เปรียบเทียบส่วนแบ่งจ่ายแต่ละงบประมาณ"
          icon={<PieIcon />}
          mode={mode}
          periodValue={periodValue}
          degreeLevelValue={degreeLevelValue}
          periodOptions={activePeriodOptions}
          degreeLevelOptions={degreeLevelOptions}
          showDegreeLevelFilter
          onModeChange={handleModeChange}
          onPeriodChange={(value) => {
            setPeriodValue(value);
            setDetailData(null);
          }}
          onDegreeLevelChange={setDegreeLevelValue}
        >
          <BudgetPieChart data={allocationPieData} />
        </ChartCard>
      </div>
    </div>
  );
}