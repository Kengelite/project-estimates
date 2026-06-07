import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "./Pagination";
import {
  GetDataAnnualBudgetSummary,
  GetDataAnnualBudgetSummaryByID,
  DeleteDataAnnualBudgetSummary,
  UpdateStatusAnnualBudgetSummary,
} from "../../../fetchapi/fetch_api_admin";

interface CourseStudent {
  id?: string;
  courseId?: string;
  course_id?: string;
  yearId?: string | number;
  year_id?: string | number;
  studentAmount?: number;
  student_amount?: number;
}

interface CourseMaster {
  id?: string;
  nameTH?: string;
  name_th?: string;
  nameEN?: string;
  name_en?: string;
  name?: string;
  shortName?: string;
  short_name?: string;
  tuitionFees?: number;
  tuition_fees?: number;
  deductToUni?: number;
  deduct_to_uni?: number;
  students?: CourseStudent[];
  Students?: CourseStudent[];
}

interface AnnualBudgetSummaryCourseDetail {
  id?: string;
  step?: string;
  Step?: string;
  refType?: string;
  ref_type?: string;
  RefType?: string;
  refId?: string | null;
  ref_id?: string | null;
  RefID?: string | null;
  nameSnapshot?: string;
  name_snapshot?: string;
  NameSnapshot?: string;
  percent?: number;
  Percent?: number;
  percentage?: number;
  rate?: number;
  Rate?: number;
  deductAmount?: number;
  deduct_amount?: number;
  DeductAmount?: number;
  amount?: number;
}

interface AnnualBudgetSummaryCourse {
  id?: string;
  courseId?: string | null;
  course_id?: string | null;
  course?: CourseMaster | null;
  Course?: CourseMaster | null;

  courseNameSnapshot?: string;
  course_name_snapshot?: string;
  courseShortNameSnapshot?: string;
  course_short_name_snapshot?: string;
  sectionTitleSnapshot?: string;
  section_title_snapshot?: string;

  tuitionFees?: number;
  tuition_fees?: number;
  tuitionFee?: number;
  tuition_fee?: number;

  studentAmount?: number;
  student_amount?: number;
  studentCount?: number;
  student_count?: number;
  registeredCount?: number;
  registered_count?: number;
  totalStudent?: number;
  total_student?: number;

  grossAmount?: number;
  gross_amount?: number;
  totalAmount?: number;
  total_amount?: number;
  revenueAmount?: number;
  revenue_amount?: number;

  riskPercent?: number;
  risk_percent?: number;
  riskRate?: number;
  risk_rate?: number;
  riskDeductAmount?: number;
  risk_deduct_amount?: number;
  riskAmount?: number;
  risk_amount?: number;

  initialAmount?: number;
  initial_amount?: number;

  step2DeductAmount?: number;
  step2_deduct_amount?: number;
  step2RemainingAmount?: number;
  step2_remaining_amount?: number;

  step3DeductAmount?: number;
  step3_deduct_amount?: number;
  step3RemainingAmount?: number;
  step3_remaining_amount?: number;

  step4DeductAmount?: number;
  step4_deduct_amount?: number;
  step4RemainingAmount?: number;
  step4_remaining_amount?: number;

  step5DeductAmount?: number;
  step5_deduct_amount?: number;
  step5RemainingAmount?: number;
  step5_remaining_amount?: number;

  step6DeductAmount?: number;
  step6_deduct_amount?: number;
  step6RemainingAmount?: number;
  step6_remaining_amount?: number;

  finalRemainingAmount?: number;
  final_remaining_amount?: number;

  details?: AnnualBudgetSummaryCourseDetail[];
  Details?: AnnualBudgetSummaryCourseDetail[];
  annualBudgetSummaryDetails?: AnnualBudgetSummaryCourseDetail[];
  annual_budget_summary_details?: AnnualBudgetSummaryCourseDetail[];
}

interface AnnualBudgetSummaryItem {
  id: string;
  yearId?: string | number;
  year_id?: string | number;
  year?: {
    id?: string | number;
    year?: string | number;
    name?: string;
  } | null;
  Year?: {
    id?: string | number;
    year?: string | number;
    name?: string;
  } | null;
  summaryType?: "yearly" | "semester" | string;
  summary_type?: "yearly" | "semester" | string;
  semesterId?: string | number | null;
  semester_id?: string | number | null;
  semester?: {
    id?: string | number;
    name?: string;
    semester?: string | number;
  } | null;
  Semester?: {
    id?: string | number;
    name?: string;
    semester?: string | number;
  } | null;
  totalUniversityWorkAmount?: number;
  total_university_work_amount?: number;
  totalCurriculumAmount?: number;
  total_curriculum_amount?: number;
  status?: string | number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  courses?: AnnualBudgetSummaryCourse[];
  Courses?: AnnualBudgetSummaryCourse[];
  annualBudgetSummaryCourses?: AnnualBudgetSummaryCourse[];
  annual_budget_summary_courses?: AnnualBudgetSummaryCourse[];
}

type ExcelDetailTemplate = {
  id: string;
  name: string;
  percent: number;
  step: string;
  refType: string;
  fallbackKey?: "universityWork" | "supplies" | "curriculumProject";
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

function normalizePercent(value: any) {
  const number = toNumber(value);
  if (number <= 0) return 0;
  if (number > 1) return number / 100;
  return number;
}

function formatMoney(value: any) {
  return toNumber(value).toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function formatMoneyWithBaht(value: any) {
  return `${formatMoney(value)} บาท`;
}

function formatPercent(value: any) {
  const percent = normalizePercent(value);
  if (percent <= 0) return "0%";
  return `${Number((percent * 100).toFixed(2))}%`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickArrayFromResponse(response: any): AnnualBudgetSummaryItem[] {
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

function unwrapResponse(response: any): any {
  return response?.data?.data || response?.data || response?.Data || response;
}

function getCourses(
  item: AnnualBudgetSummaryItem | any,
): AnnualBudgetSummaryCourse[] {
  if (Array.isArray(item?.courses)) return item.courses;
  if (Array.isArray(item?.Courses)) return item.Courses;
  if (Array.isArray(item?.annualBudgetSummaryCourses)) {
    return item.annualBudgetSummaryCourses;
  }
  if (Array.isArray(item?.annual_budget_summary_courses)) {
    return item.annual_budget_summary_courses;
  }
  return [];
}

function getCourseDetails(
  course: AnnualBudgetSummaryCourse | any,
): AnnualBudgetSummaryCourseDetail[] {
  if (Array.isArray(course?.details)) return course.details;
  if (Array.isArray(course?.Details)) return course.Details;
  if (Array.isArray(course?.annualBudgetSummaryDetails)) {
    return course.annualBudgetSummaryDetails;
  }
  if (Array.isArray(course?.annual_budget_summary_details)) {
    return course.annual_budget_summary_details;
  }
  return [];
}

function getYearLabel(item: AnnualBudgetSummaryItem | any) {
  return String(
    item.year?.year ??
      item.Year?.year ??
      item.year?.name ??
      item.Year?.name ??
      item.yearId ??
      item.year_id ??
      "-",
  );
}

function getYearId(item: AnnualBudgetSummaryItem | any) {
  return String(
    item.year?.id ?? item.Year?.id ?? item.yearId ?? item.year_id ?? "",
  );
}

function getSemesterLabel(item: AnnualBudgetSummaryItem | any) {
  const summaryType = item.summaryType ?? item.summary_type;

  if (summaryType === "yearly") return "-";

  const semesterValue = String(
    item.semester?.name ??
      item.Semester?.name ??
      item.semester?.semester ??
      item.Semester?.semester ??
      item.semesterId ??
      item.semester_id ??
      "-",
  );

  if (semesterValue === "1") return "ภาคต้น";
  if (semesterValue === "2") return "ภาคปลาย";
  if (semesterValue === "3") return "ภาคฤดูร้อน";

  return semesterValue;
}

function getSummaryTypeLabel(item: AnnualBudgetSummaryItem | any) {
  const summaryType = item.summaryType ?? item.summary_type;
  if (summaryType === "semester") return "แบบแยกภาคการศึกษา";
  return "แบบรายปี";
}

function getTotalUniversityWork(item: AnnualBudgetSummaryItem | any) {
  return toNumber(
    item.totalUniversityWorkAmount ?? item.total_university_work_amount,
  );
}

function getTotalCurriculum(item: AnnualBudgetSummaryItem | any) {
  return toNumber(item.totalCurriculumAmount ?? item.total_curriculum_amount);
}

function isActiveStatus(status?: string | number) {
  return String(status ?? "1") === "1";
}

function getStatusText(status?: string | number) {
  return isActiveStatus(status) ? "เปิด" : "ปิด";
}

function getCourseShortName(course: AnnualBudgetSummaryCourse | any) {
  return toText(
    course.courseShortNameSnapshot ??
      course.course_short_name_snapshot ??
      course.course?.shortName ??
      course.Course?.shortName ??
      course.course?.short_name ??
      course.Course?.short_name ??
      "-",
  );
}

function getSectionTitle(course: AnnualBudgetSummaryCourse | any) {
  return toText(
    course.sectionTitleSnapshot ??
      course.section_title_snapshot ??
      course.sectionTitle ??
      course.section_title ??
      "-",
  );
}

function getTuitionFees(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(
    course.tuitionFees ??
      course.tuition_fees ??
      course.tuitionFee ??
      course.tuition_fee ??
      course.course?.tuitionFees ??
      course.course?.tuition_fees ??
      course.Course?.tuitionFees ??
      course.Course?.tuition_fees,
  );
}

function getInitialAmount(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.initialAmount ?? course.initial_amount);
}

function getGrossAmountExplicit(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(
    course.grossAmount ??
      course.gross_amount ??
      course.totalAmount ??
      course.total_amount ??
      course.revenueAmount ??
      course.revenue_amount,
  );
}

function getStudentAmount(
  course: AnnualBudgetSummaryCourse | any,
  item?: AnnualBudgetSummaryItem | any,
) {
  const direct = toNumber(
    course.studentAmount ??
      course.student_amount ??
      course.studentCount ??
      course.student_count ??
      course.registeredCount ??
      course.registered_count ??
      course.totalStudent ??
      course.total_student,
  );

  if (direct > 0) return direct;

  const students =
    course.course?.students ??
    course.Course?.students ??
    course.course?.Students ??
    course.Course?.Students ??
    [];

  if (Array.isArray(students) && students.length > 0) {
    const yearId = getYearId(item);

    const matched = students.filter((student: CourseStudent | any) => {
      return String(student.yearId ?? student.year_id ?? "") === yearId;
    });

    const selectedStudents = matched.length > 0 ? matched : students;

    const total = selectedStudents.reduce(
      (sum: number, student: CourseStudent | any) => {
        return sum + toNumber(student.studentAmount ?? student.student_amount);
      },
      0,
    );

    if (total > 0) return total;
  }

  const tuitionFees = getTuitionFees(course);
  const gross = getGrossAmountExplicit(course) || getInitialAmount(course);

  if (tuitionFees > 0 && gross > 0) {
    return Math.round(gross / tuitionFees);
  }

  return 0;
}

function getGrossAmount(
  course: AnnualBudgetSummaryCourse | any,
  item?: AnnualBudgetSummaryItem | any,
) {
  const direct = getGrossAmountExplicit(course);
  if (direct > 0) return direct;

  const tuitionFees = getTuitionFees(course);
  const studentAmount = getStudentAmount(course, item);

  if (tuitionFees > 0 && studentAmount > 0) {
    return tuitionFees * studentAmount;
  }

  return getInitialAmount(course);
}

function getRiskAmount(
  course: AnnualBudgetSummaryCourse | any,
  item?: AnnualBudgetSummaryItem | any,
) {
  const direct = absMoney(
    course.riskAmount ??
      course.risk_amount ??
      course.riskDeductAmount ??
      course.risk_deduct_amount,
  );

  if (direct > 0) return direct;

  const gross = getGrossAmount(course, item);
  const initial = getInitialAmount(course);

  if (gross > 0 && initial > 0 && gross >= initial) {
    return gross - initial;
  }

  return 0;
}

function getRemainingAfterRisk(
  course: AnnualBudgetSummaryCourse | any,
  item?: AnnualBudgetSummaryItem | any,
) {
  const initial = getInitialAmount(course);
  if (initial > 0) return initial;

  const gross = getGrossAmount(course, item);
  const riskAmount = getRiskAmount(course, item);

  return Math.max(gross - riskAmount, 0);
}

function getStep2Deduct(course: AnnualBudgetSummaryCourse | any) {
  return absMoney(course.step2DeductAmount ?? course.step2_deduct_amount);
}

function getStep2Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step2RemainingAmount ?? course.step2_remaining_amount);
}

function getStep3Deduct(course: AnnualBudgetSummaryCourse | any) {
  return absMoney(course.step3DeductAmount ?? course.step3_deduct_amount);
}

function getStep3Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step3RemainingAmount ?? course.step3_remaining_amount);
}

function getStep4Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step4RemainingAmount ?? course.step4_remaining_amount);
}

function getStep5Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step5RemainingAmount ?? course.step5_remaining_amount);
}

function getDetailName(detail: AnnualBudgetSummaryCourseDetail | any) {
  return toText(
    detail?.nameSnapshot ??
      detail?.name_snapshot ??
      detail?.NameSnapshot ??
      detail?.name ??
      "-",
  );
}

function getDetailDeduct(detail: AnnualBudgetSummaryCourseDetail | any) {
  return absMoney(
    detail?.deductAmount ??
      detail?.deduct_amount ??
      detail?.DeductAmount ??
      detail?.amount,
  );
}

function getDetailPercent(detail: AnnualBudgetSummaryCourseDetail | any) {
  return normalizePercent(
    detail?.percent ??
      detail?.Percent ??
      detail?.percentage ??
      detail?.rate ??
      detail?.Rate,
  );
}

function getTemplatePercent(detail: AnnualBudgetSummaryCourseDetail | ExcelDetailTemplate | any) {
  if (!detail) return 0;

  return normalizePercent(
    detail.percent ??
      detail.Percent ??
      detail.percentage ??
      detail.rate ??
      detail.Rate,
  );
}

function getTemplateName(detail: AnnualBudgetSummaryCourseDetail | ExcelDetailTemplate | any) {
  return String(detail?.name ?? getDetailName(detail) ?? "-");
}

function getTemplateKey(detail: AnnualBudgetSummaryCourseDetail | ExcelDetailTemplate | any) {
  return String(
    detail?.id ??
      detail?.refId ??
      detail?.ref_id ??
      detail?.RefID ??
      getTemplateName(detail),
  );
}

function getDetailStep(detail: AnnualBudgetSummaryCourseDetail | any) {
  return String(detail.step ?? detail.Step ?? "");
}

function getDetailRefType(detail: AnnualBudgetSummaryCourseDetail | any) {
  return String(detail.refType ?? detail.ref_type ?? detail.RefType ?? "");
}

function getDetailRefId(detail: AnnualBudgetSummaryCourseDetail | any) {
  return String(
    detail.refId ??
      detail.ref_id ??
      detail.RefID ??
      detail.id ??
      getDetailName(detail),
  );
}

function getCreatedAt(item: AnnualBudgetSummaryItem) {
  return item.created_at || item.createdAt;
}

function getDetailRoute(item: AnnualBudgetSummaryItem) {
  return `/annual-budget-management/detail/${item.id}`;
}

function SearchIcon() {
  return <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />;
}

function StatusToggle({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-8 w-[64px] items-center rounded-full px-1 transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute text-[11px] font-semibold text-white ${
          checked ? "left-3" : "right-3"
        }`}
      >
        {checked ? "เปิด" : "ปิด"}
      </span>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function EditInfoModal({
  item,
  onClose,
  onCreateRevision,
}: {
  item: AnnualBudgetSummaryItem;
  onClose: () => void;
  onCreateRevision: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              แก้ไขสรุปงบประมาณ
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              ปีการศึกษา {getYearLabel(item)} / {getSummaryTypeLabel(item)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-700">
          หากต้องการแก้ไขข้อมูลสรุปงบประมาณ ให้สร้างรายการสรุปงบประมาณใหม่
          เพื่อให้ระบบคำนวณข้อมูลตามขั้นตอนล่าสุด
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onCreateRevision}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            สรุปงบประมาณ
          </button>
        </div>
      </div>
    </div>
  );
}

function setBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FF9CA3AF" } },
    left: { style: "thin", color: { argb: "FF9CA3AF" } },
    bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
    right: { style: "thin", color: { argb: "FF9CA3AF" } },
  };
}

function setHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = {
    name: "TH Sarabun New",
    size: 12,
    bold: true,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9EAD3" },
  };
  setBorder(cell);
}

function setBodyStyle(cell: ExcelJS.Cell, align: "left" | "center" | "right") {
  cell.font = {
    name: "TH Sarabun New",
    size: 12,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: align,
    wrapText: true,
  };
  setBorder(cell);
}

function setMoneyStyle(cell: ExcelJS.Cell) {
  cell.numFmt = "#,##0";
  setBodyStyle(cell, "right");
}

function setGroupStyle(cell: ExcelJS.Cell) {
  cell.font = {
    name: "TH Sarabun New",
    size: 13,
    bold: true,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE5CD" },
  };
  setBorder(cell);
}

function setTotalStyle(cell: ExcelJS.Cell) {
  cell.font = {
    name: "TH Sarabun New",
    size: 12,
    bold: true,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "right",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9EAD3" },
  };
  setBorder(cell);
}

function getDetailsByStepAndType(
  course: AnnualBudgetSummaryCourse | any,
  step: string,
  refType?: string,
): AnnualBudgetSummaryCourseDetail[] {
  return getCourseDetails(course).filter((detail: AnnualBudgetSummaryCourseDetail) => {
    const sameStep = getDetailStep(detail) === step;
    const sameType = !refType || getDetailRefType(detail) === refType;
    return sameStep && sameType;
  });
}

function uniqueDetailsFromCourses(
  courses: AnnualBudgetSummaryCourse[],
  step: string,
  refType: string,
): AnnualBudgetSummaryCourseDetail[] {
  const map = new Map<string, AnnualBudgetSummaryCourseDetail>();

  courses.forEach((course: AnnualBudgetSummaryCourse) => {
    getDetailsByStepAndType(course, step, refType).forEach(
      (detail: AnnualBudgetSummaryCourseDetail) => {
        const key = getDetailRefId(detail);
        if (!map.has(key)) map.set(key, detail);
      },
    );
  });

  return Array.from(map.values());
}

function buildStep6CurriculumTemplates(
  courses: AnnualBudgetSummaryCourse[],
): ExcelDetailTemplate[] {
  const savedDetails = uniqueDetailsFromCourses(
    courses,
    "step6",
    "university_work",
  );

  const templates: ExcelDetailTemplate[] = [
    {
      id: "curriculum-university-work",
      name: "บริหารงานวิทยาลัย",
      percent: 0.65,
      step: "step6",
      refType: "university_work",
      fallbackKey: "universityWork",
    },
    {
      id: "curriculum-supplies",
      name: "ค่าตอบแทน ใช้สอย วัสดุ",
      percent: 0.25,
      step: "step6",
      refType: "university_work",
      fallbackKey: "supplies",
    },
    {
      id: "curriculum-project",
      name: "โครงการหลักสูตร",
      percent: 0.1,
      step: "step6",
      refType: "university_work",
      fallbackKey: "curriculumProject",
    },
  ];

  savedDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    const savedName = getDetailName(detail);

    const matchedIndex = templates.findIndex((template: ExcelDetailTemplate) => {
      return (
        template.name === savedName ||
        savedName.includes(template.name) ||
        template.name.includes(savedName)
      );
    });

    if (matchedIndex >= 0) {
      templates[matchedIndex] = {
        ...templates[matchedIndex],
        id: getDetailRefId(detail),
        name: savedName,
        percent: getDetailPercent(detail) || templates[matchedIndex].percent,
      };
    }
  });

  return templates;
}

function findDetailDeductByTemplate(
  course: AnnualBudgetSummaryCourse,
  template: AnnualBudgetSummaryCourseDetail | ExcelDetailTemplate,
  step: string,
  refType: string,
) {
  const targetId = getTemplateKey(template);
  const targetName = getTemplateName(template);

  const detail = getDetailsByStepAndType(course, step, refType).find(
    (item: AnnualBudgetSummaryCourseDetail) => {
      return (
        getDetailRefId(item) === targetId ||
        getDetailName(item) === targetName
      );
    },
  );

  if (detail) return getDetailDeduct(detail);

  if (step === "step6" && refType === "university_work") {
    const templatePercent = getTemplatePercent(template);
    const baseAmount = getStep5Remaining(course);

    if (baseAmount > 0 && templatePercent > 0) {
      return Math.round(baseAmount * templatePercent);
    }

    return 0;
  }

  return 0;
}

function getStep6TotalAmount(
  course: AnnualBudgetSummaryCourse,
  templates: ExcelDetailTemplate[],
) {
  const totalFromTemplates = templates.reduce((sum: number, template: ExcelDetailTemplate) => {
    return (
      sum +
      findDetailDeductByTemplate(
        course,
        template,
        "step6",
        "university_work",
      )
    );
  }, 0);

  if (totalFromTemplates > 0) return totalFromTemplates;

  return toNumber(
    course.step6DeductAmount ??
      course.step6_deduct_amount ??
      course.finalRemainingAmount ??
      course.final_remaining_amount,
  );
}

function groupCoursesBySection(courses: AnnualBudgetSummaryCourse[]) {
  const map = new Map<string, AnnualBudgetSummaryCourse[]>();

  courses.forEach((course: AnnualBudgetSummaryCourse) => {
    const section = getSectionTitle(course) || "ไม่ระบุโครงการ";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(course);
  });

  return Array.from(map.entries()).map(([section, list]) => ({
    section,
    list,
  }));
}

async function createAnnualBudgetSummaryExcel(item: AnnualBudgetSummaryItem) {
  const courses = getCourses(item);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Financial Forecast";
  workbook.created = new Date();

  const yearLabel = getYearLabel(item);
  const sheet = workbook.addWorksheet(`ประมาณการรายรับ-${yearLabel}`, {
    views: [{ state: "frozen", ySplit: 6 }],
  });

  const fundDetails = uniqueDetailsFromCourses(courses, "step4", "fund");
  const centralDetails = uniqueDetailsFromCourses(courses, "step5", "central");
  const curriculumDetails = buildStep6CurriculumTemplates(courses);

  const columns: { key: string; width: number }[] = [
    { key: "course", width: 28 },
    { key: "tuitionFees", width: 16 },
    { key: "studentAmount", width: 14 },
    { key: "grossAmount", width: 18 },
    { key: "riskAmount", width: 16 },
    { key: "remainingAfterRisk", width: 22 },
    { key: "step2Deduct", width: 16 },
    { key: "step2Remaining", width: 20 },
    { key: "outsideSubject", width: 18 },
    { key: "step3Deduct", width: 16 },
    { key: "step3Remaining", width: 20 },
  ];

  fundDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    columns.push({
      key: `fund_${getDetailRefId(detail)}`,
      width: 24,
    });
  });

  columns.push({ key: "step4Remaining", width: 20 });

  centralDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    columns.push({
      key: `central_${getDetailRefId(detail)}`,
      width: 24,
    });
  });

  columns.push({ key: "step5Remaining", width: 20 });

  curriculumDetails.forEach((detail: ExcelDetailTemplate) => {
    columns.push({
      key: `curriculum_${detail.id}`,
      width: 24,
    });
  });

  columns.push({ key: "curriculumTotal", width: 18 });

  sheet.columns = columns.map((column) => ({
    key: column.key,
    width: column.width,
  }));

  const lastCol = columns.length;

  sheet.mergeCells(1, 1, 1, Math.min(8, lastCol));
  sheet.getCell(1, 1).value = `ประมาณการรายรับประจำปีงบประมาณ ${yearLabel}`;
  sheet.getCell(1, 1).font = {
    name: "TH Sarabun New",
    size: 20,
    bold: true,
  };
  sheet.getCell(1, 1).alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  if (lastCol >= 5) {
    sheet.mergeCells(1, Math.max(lastCol - 4, 1), 1, lastCol);
    sheet.getCell(1, Math.max(lastCol - 4, 1)).value = `ข้อมูล ณ วันที่ ${new Date().toLocaleDateString(
      "th-TH",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    )}`;
    sheet.getCell(1, Math.max(lastCol - 4, 1)).font = {
      name: "TH Sarabun New",
      size: 12,
      bold: true,
    };
    sheet.getCell(1, Math.max(lastCol - 4, 1)).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  }

  sheet.getRow(1).height = 30;

  sheet.mergeCells(2, 1, 6, 1);
  sheet.getCell(2, 1).value = "หลักสูตร";

  sheet.mergeCells(2, 2, 6, 2);
  sheet.getCell(2, 2).value = "ค่าธรรมเนียม\nการศึกษา";

  sheet.mergeCells(2, 3, 6, 3);
  sheet.getCell(2, 3).value = "จำนวน\nนักศึกษา";

  sheet.mergeCells(2, 4, 6, 4);
  sheet.getCell(2, 4).value = "จำนวนเงินรวม";

  sheet.mergeCells(2, 5, 6, 5);
  sheet.getCell(2, 5).value = "ความเสี่ยง";

  sheet.mergeCells(2, 6, 6, 6);
  sheet.getCell(2, 6).value = "คงเหลือ\n(หลังจากหักความเสี่ยง)";

  sheet.mergeCells(2, 7, 2, 8);
  sheet.getCell(2, 7).value = "(1) จัดสรรเป็นรายได้ส่วนกลาง มข.";
  sheet.mergeCells(3, 7, 6, 7);
  sheet.getCell(3, 7).value = "หัก (1)";
  sheet.mergeCells(3, 8, 6, 8);
  sheet.getCell(3, 8).value = "คงเหลือ\nหลังจากหัก (1)";

  sheet.mergeCells(2, 9, 2, 11);
  sheet.getCell(2, 9).value = "(2) จ่ายให้เจ้าของรายวิชานอกคณะ";
  sheet.mergeCells(3, 9, 6, 9);
  sheet.getCell(3, 9).value = "รายวิชานอกคณะ";
  sheet.mergeCells(3, 10, 6, 10);
  sheet.getCell(3, 10).value = "หัก (2)";
  sheet.mergeCells(3, 11, 6, 11);
  sheet.getCell(3, 11).value = "คงเหลือ\nหลังจากหัก (2)";

  let col = 12;

  if (fundDetails.length > 0) {
    sheet.mergeCells(2, col, 2, col + fundDetails.length - 1);
    sheet.getCell(2, col).value = "(3) หักเข้ากองทุน/สาธารณูปโภค";
  }

  fundDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    sheet.mergeCells(3, col, 6, col);
    sheet.getCell(3, col).value = `${getDetailName(detail)}\n${formatPercent(
      getDetailPercent(detail),
    )}`;
    col += 1;
  });

  const step4RemainingCol = col;
  sheet.mergeCells(2, step4RemainingCol, 6, step4RemainingCol);
  sheet.getCell(2, step4RemainingCol).value = "คงเหลือ\nหลังจากหัก (3)";
  col += 1;

  if (centralDetails.length > 0) {
    sheet.mergeCells(2, col, 2, col + centralDetails.length - 1);
    sheet.getCell(2, col).value = "(4) หักบริหารส่วนกลางวิทยาลัย";
  }

  centralDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    sheet.mergeCells(3, col, 6, col);
    sheet.getCell(3, col).value = `${getDetailName(detail)}\n${formatPercent(
      getDetailPercent(detail),
    )}`;
    col += 1;
  });

  const step5RemainingCol = col;
  sheet.mergeCells(2, step5RemainingCol, 6, step5RemainingCol);
  sheet.getCell(2, step5RemainingCol).value = "คงเหลือ\nหลังจากหัก (4)";
  col += 1;

  sheet.mergeCells(2, col, 2, col + curriculumDetails.length - 1);
  sheet.getCell(2, col).value = "บริหารหลักสูตร";

  curriculumDetails.forEach((detail: ExcelDetailTemplate) => {
    sheet.mergeCells(3, col, 6, col);
    sheet.getCell(3, col).value = `${detail.name}\n${formatPercent(
      detail.percent,
    )}`;
    col += 1;
  });

  const curriculumTotalCol = col;
  sheet.mergeCells(2, curriculumTotalCol, 6, curriculumTotalCol);
  sheet.getCell(2, curriculumTotalCol).value = "รวม";

  for (let row = 2; row <= 6; row += 1) {
    for (let c = 1; c <= lastCol; c += 1) {
      setHeaderStyle(sheet.getCell(row, c));
    }
  }

  sheet.getRow(2).height = 34;
  sheet.getRow(3).height = 52;
  sheet.getRow(4).height = 22;
  sheet.getRow(5).height = 22;
  sheet.getRow(6).height = 22;

  let rowIndex = 7;
  const groups = groupCoursesBySection(courses);

  groups.forEach((group) => {
    sheet.mergeCells(rowIndex, 1, rowIndex, lastCol);
    sheet.getCell(rowIndex, 1).value = group.section;

    for (let c = 1; c <= lastCol; c += 1) {
      setGroupStyle(sheet.getCell(rowIndex, c));
    }

    rowIndex += 1;

    group.list.forEach((course: AnnualBudgetSummaryCourse) => {
      const tuitionFees = getTuitionFees(course);
      const studentAmount = getStudentAmount(course, item);
      const grossAmount = getGrossAmount(course, item);
      const riskAmount = getRiskAmount(course, item);
      const remainingAfterRisk = getRemainingAfterRisk(course, item);

      sheet.getCell(rowIndex, 1).value = getCourseShortName(course);
      sheet.getCell(rowIndex, 2).value = tuitionFees;
      sheet.getCell(rowIndex, 3).value = studentAmount;
      sheet.getCell(rowIndex, 4).value = grossAmount;
      sheet.getCell(rowIndex, 5).value = riskAmount;
      sheet.getCell(rowIndex, 6).value = remainingAfterRisk;
      sheet.getCell(rowIndex, 7).value = getStep2Deduct(course);
      sheet.getCell(rowIndex, 8).value = getStep2Remaining(course);
      sheet.getCell(rowIndex, 9).value = "";
      sheet.getCell(rowIndex, 10).value = getStep3Deduct(course);
      sheet.getCell(rowIndex, 11).value = getStep3Remaining(course);

      let dataCol = 12;

      fundDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
        sheet.getCell(rowIndex, dataCol).value = findDetailDeductByTemplate(
          course,
          detail,
          "step4",
          "fund",
        );
        dataCol += 1;
      });

      sheet.getCell(rowIndex, step4RemainingCol).value =
        getStep4Remaining(course);

      dataCol = step4RemainingCol + 1;

      centralDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
        sheet.getCell(rowIndex, dataCol).value = findDetailDeductByTemplate(
          course,
          detail,
          "step5",
          "central",
        );
        dataCol += 1;
      });

      sheet.getCell(rowIndex, step5RemainingCol).value =
        getStep5Remaining(course);

      dataCol = step5RemainingCol + 1;

      curriculumDetails.forEach((detail: ExcelDetailTemplate) => {
        sheet.getCell(rowIndex, dataCol).value = findDetailDeductByTemplate(
          course,
          detail,
          "step6",
          "university_work",
        );
        dataCol += 1;
      });

      sheet.getCell(rowIndex, curriculumTotalCol).value = getStep6TotalAmount(
        course,
        curriculumDetails,
      );

      for (let c = 1; c <= lastCol; c += 1) {
        if (c === 1 || c === 9) {
          setBodyStyle(sheet.getCell(rowIndex, c), "left");
        } else {
          setMoneyStyle(sheet.getCell(rowIndex, c));
        }
      }

      rowIndex += 1;
    });
  });

  const totalRow = rowIndex;

  sheet.getCell(totalRow, 1).value = "";
  sheet.getCell(totalRow, 2).value = "รวมทั้งสิ้น";
  sheet.getCell(totalRow, 3).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStudentAmount(course, item),
    0,
  );
  sheet.getCell(totalRow, 4).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getGrossAmount(course, item),
    0,
  );
  sheet.getCell(totalRow, 5).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getRiskAmount(course, item),
    0,
  );
  sheet.getCell(totalRow, 6).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getRemainingAfterRisk(course, item),
    0,
  );
  sheet.getCell(totalRow, 7).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep2Deduct(course),
    0,
  );
  sheet.getCell(totalRow, 8).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep2Remaining(course),
    0,
  );
  sheet.getCell(totalRow, 10).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep3Deduct(course),
    0,
  );
  sheet.getCell(totalRow, 11).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep3Remaining(course),
    0,
  );

  let totalCol = 12;

  fundDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    sheet.getCell(totalRow, totalCol).value = courses.reduce(
      (sum: number, course: AnnualBudgetSummaryCourse) =>
        sum + findDetailDeductByTemplate(course, detail, "step4", "fund"),
      0,
    );
    totalCol += 1;
  });

  sheet.getCell(totalRow, step4RemainingCol).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep4Remaining(course),
    0,
  );

  totalCol = step4RemainingCol + 1;

  centralDetails.forEach((detail: AnnualBudgetSummaryCourseDetail) => {
    sheet.getCell(totalRow, totalCol).value = courses.reduce(
      (sum: number, course: AnnualBudgetSummaryCourse) =>
        sum + findDetailDeductByTemplate(course, detail, "step5", "central"),
      0,
    );
    totalCol += 1;
  });

  sheet.getCell(totalRow, step5RemainingCol).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep5Remaining(course),
    0,
  );

  totalCol = step5RemainingCol + 1;

  curriculumDetails.forEach((detail: ExcelDetailTemplate) => {
    sheet.getCell(totalRow, totalCol).value = courses.reduce(
      (sum: number, course: AnnualBudgetSummaryCourse) =>
        sum +
        findDetailDeductByTemplate(course, detail, "step6", "university_work"),
      0,
    );
    totalCol += 1;
  });

  sheet.getCell(totalRow, curriculumTotalCol).value = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getStep6TotalAmount(course, curriculumDetails),
    0,
  );

  for (let c = 1; c <= lastCol; c += 1) {
    setTotalStyle(sheet.getCell(totalRow, c));
    if (c !== 1 && c !== 2 && c !== 9) {
      sheet.getCell(totalRow, c).numFmt = "#,##0";
    }
  }

  const summaryStartRow = totalRow + 2;
  const summaryLabelCol = Math.min(Math.max(1, lastCol - 5), 7);
  const summaryValueCol = summaryLabelCol + 2;

  const totalGross = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getGrossAmount(course, item),
    0,
  );

  const totalAfterRisk = courses.reduce(
    (sum: number, course: AnnualBudgetSummaryCourse) =>
      sum + getRemainingAfterRisk(course, item),
    0,
  );

  const summaryRows: [string, number][] = [
    ["รายรับค่าธรรมเนียม", totalGross],
    ["รายรับอื่นๆ", 0],
    ["รวมรายรับทั้งหมด", totalGross],
    ["ปรับเสถียรฯ", totalAfterRisk],
  ];

  summaryRows.forEach(([label, value], index) => {
    const row = summaryStartRow + index;
    sheet.mergeCells(row, summaryLabelCol, row, summaryValueCol - 1);
    sheet.getCell(row, summaryLabelCol).value = label;
    sheet.getCell(row, summaryValueCol).value = value;

    for (let c = summaryLabelCol; c <= summaryValueCol; c += 1) {
      setBorder(sheet.getCell(row, c));
      sheet.getCell(row, c).font = {
        name: "TH Sarabun New",
        size: 12,
      };
      sheet.getCell(row, c).alignment = {
        vertical: "middle",
        horizontal: "right",
      };
    }

    sheet.getCell(row, summaryValueCol).numFmt = "#,##0";
  });

  const summarySheet = workbook.addWorksheet("สรุปรายการ");
  summarySheet.columns = [
    { key: "name", width: 35 },
    { key: "amount", width: 22 },
  ];

  summarySheet.getCell("A1").value = "รายการ";
  summarySheet.getCell("B1").value = "จำนวนเงิน";
  summarySheet.getCell("A2").value = "รวมบริหารงานวิทยาลัย";
  summarySheet.getCell("B2").value = getTotalUniversityWork(item);
  summarySheet.getCell("A3").value = "รวมบริหารหลักสูตร";
  summarySheet.getCell("B3").value = getTotalCurriculum(item);
  summarySheet.getCell("A4").value = "รวมรายรับทั้งหมด";
  summarySheet.getCell("B4").value = totalGross;

  for (let r = 1; r <= 4; r += 1) {
    for (let c = 1; c <= 2; c += 1) {
      const cell = summarySheet.getCell(r, c);
      setBorder(cell);
      cell.font = {
        name: "TH Sarabun New",
        size: 12,
        bold: r === 1,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: c === 2 ? "right" : "left",
      };
      if (r === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9EAD3" },
        };
      }
      if (c === 2 && r > 1) {
        cell.numFmt = "#,##0";
      }
    }
  }

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (!cell.font) {
        cell.font = {
          name: "TH Sarabun New",
          size: 12,
        };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export default function BudgetSummaryManagement() {
  const navigate = useNavigate();

  const [items, setItems] = useState<AnnualBudgetSummaryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [goTo, setGoTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<AnnualBudgetSummaryItem | null>(
    null,
  );

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await GetDataAnnualBudgetSummary();
      const list = pickArrayFromResponse(response);
      setItems(list);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงข้อมูลสรุปงบประมาณได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) => {
      const year = getYearLabel(item).toLowerCase();
      const semester = getSemesterLabel(item).toLowerCase();
      const summaryType = getSummaryTypeLabel(item).toLowerCase();
      const status = getStatusText(item.status).toLowerCase();

      return (
        year.includes(keyword) ||
        semester.includes(keyword) ||
        summaryType.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleToggleStatus = async (item: AnnualBudgetSummaryItem) => {
    const nextStatus = isActiveStatus(item.status) ? "0" : "1";
    const nextText = nextStatus === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      html: `ต้องการ${nextText}สรุปงบประมาณปี <b>${getYearLabel(
        item,
      )}</b> ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      await UpdateStatusAnnualBudgetSummary(item.id, nextStatus);
      await loadItems();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "เปลี่ยนสถานะเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถเปลี่ยนสถานะได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: AnnualBudgetSummaryItem) => {
    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบข้อมูล",
      html: `ต้องการลบสรุปงบประมาณปี <b>${getYearLabel(item)}</b> ใช่หรือไม่`,
      text: "การลบข้อมูลนี้จะไม่สามารถกู้คืนได้อีก",
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      await DeleteDataAnnualBudgetSummary(item.id);
      await loadItems();

      await Swal.fire({
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: "ลบข้อมูลสรุปงบประมาณเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถลบข้อมูลได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadExcel = async (item: AnnualBudgetSummaryItem) => {
    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึกไฟล์",
      html: `ต้องการบันทึกไฟล์ Excel สรุปงบประมาณปี <b>${getYearLabel(
        item,
      )}</b> ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึกไฟล์",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);

      const response = await GetDataAnnualBudgetSummaryByID(item.id);
      const detail = unwrapResponse(response);
      const blob = await createAnnualBudgetSummaryExcel(detail);

      const fileName = `ประมาณการรายรับ-${getYearLabel(detail)}.xlsx`;

      saveAs(blob, fileName);

      await Swal.fire({
        icon: "success",
        title: "สร้างไฟล์ Excel สำเร็จ",
        text: "ดาวน์โหลดไฟล์ .xlsx เรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "สร้างไฟล์ไม่สำเร็จ",
        text:
          error?.message ||
          error ||
          "ไม่สามารถสร้างไฟล์ Excel ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRevision = () => {
    setEditingItem(null);
    navigate("/annual-budget-summary");
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleGoToSubmit = () => {
    const nextPage = Math.min(totalPages, Math.max(1, Number(goTo || 1)));
    setPage(nextPage);
    setGoTo("");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-full overflow-x-hidden lg:max-w-[calc(100vw-300px-48px)]">
        <nav className="mb-4 text-sm text-gray-400">
          <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-700">สรุปข้อมูลงบประมาณ</span>
        </nav>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              สรุปข้อมูลงบประมาณ
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-400">
              จัดการรายการสรุปงบประมาณ และดาวน์โหลดไฟล์ Excel
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/annual-budget-summary")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            สรุปงบประมาณ
          </button>
        </div>

        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <SearchIcon />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาปีการศึกษา / รูปแบบ / สถานะ..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="block w-full max-w-full overflow-x-auto overflow-y-hidden">
            <table className="min-w-[1500px] table-fixed text-left">
              <thead>
                <tr className="bg-gray-50 text-sm font-semibold text-gray-500">
                  <th className="w-[80px] whitespace-nowrap px-5 py-4 text-center">
                    ลำดับ
                  </th>
                  <th className="w-[130px] whitespace-nowrap px-5 py-4">
                    ปีการศึกษา
                  </th>
                  <th className="w-[160px] whitespace-nowrap px-5 py-4">
                    รูปแบบ
                  </th>
                  <th className="w-[150px] whitespace-nowrap px-5 py-4">
                    ภาคการศึกษา
                  </th>
                  <th className="w-[220px] whitespace-nowrap px-5 py-4 text-right">
                    รวมบริหารงานวิทยาลัย
                  </th>
                  <th className="w-[200px] whitespace-nowrap px-5 py-4 text-right">
                    รวมบริหารหลักสูตร
                  </th>
                  <th className="w-[130px] whitespace-nowrap px-5 py-4 text-center">
                    สถานะ
                  </th>
                  <th className="w-[190px] whitespace-nowrap px-5 py-4 text-center">
                    วันที่บันทึก
                  </th>
                  <th className="w-[150px] whitespace-nowrap px-5 py-4 text-center">
                    บันทึกไฟล์
                  </th>
                  <th className="w-[180px] whitespace-nowrap px-5 py-4 text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-gray-700 transition-colors hover:bg-gray-50/70"
                    >
                      <td className="w-[80px] whitespace-nowrap px-5 py-4 text-center text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="w-[130px] whitespace-nowrap px-5 py-4">
                        <span className="font-bold text-gray-900">
                          {getYearLabel(item)}
                        </span>
                      </td>

                      <td className="w-[160px] whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {getSummaryTypeLabel(item)}
                        </span>
                      </td>

                      <td className="w-[150px] whitespace-nowrap px-5 py-4 font-medium text-gray-700">
                        {getSemesterLabel(item)}
                      </td>

                      <td className="w-[220px] whitespace-nowrap px-5 py-4 text-right font-bold text-gray-900">
                        {formatMoneyWithBaht(getTotalUniversityWork(item))}
                      </td>

                      <td className="w-[200px] whitespace-nowrap px-5 py-4 text-right font-bold text-blue-600">
                        {formatMoneyWithBaht(getTotalCurriculum(item))}
                      </td>

                      <td className="w-[130px] whitespace-nowrap px-5 py-4 text-center">
                        <StatusToggle
                          checked={isActiveStatus(item.status)}
                          disabled={submitting}
                          onClick={() => handleToggleStatus(item)}
                        />
                      </td>

                      <td className="w-[190px] whitespace-nowrap px-5 py-4 text-center text-gray-500">
                        {formatDateTime(getCreatedAt(item))}
                      </td>

                      <td className="w-[150px] whitespace-nowrap px-5 py-4 text-center">
                        <button
                          type="button"
                          title="บันทึกไฟล์ Excel"
                          disabled={submitting}
                          onClick={() => handleDownloadExcel(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      </td>

                      <td className="w-[180px] whitespace-nowrap px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            title="ดูรายละเอียด"
                            onClick={() => navigate(getDetailRoute(item))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            title="แก้ไข"
                            onClick={() => setEditingItem(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            title="ลบ"
                            disabled={submitting}
                            onClick={() => handleDelete(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <Pagination
              totalItems={filteredItems.length}
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              goTo={goTo}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onGoToChange={setGoTo}
              onGoToSubmit={handleGoToSubmit}
            />
          </div>
        </div>
      </div>

      {editingItem && (
        <EditInfoModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onCreateRevision={handleCreateRevision}
        />
      )}
    </div>
  );
}