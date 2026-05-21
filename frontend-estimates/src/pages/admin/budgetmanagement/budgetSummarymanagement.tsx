import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
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

interface AnnualBudgetSummaryCourseDetail {
  id?: string;
  step?: string;
  refType?: string;
  refId?: string | null;
  nameSnapshot?: string;
  name_snapshot?: string;
  percent?: number;
  deductAmount?: number;
  deduct_amount?: number;
}

interface AnnualBudgetSummaryCourse {
  id?: string;
  courseId?: string | null;
  course_id?: string | null;
  courseNameSnapshot?: string;
  course_name_snapshot?: string;
  courseShortNameSnapshot?: string;
  course_short_name_snapshot?: string;
  sectionTitleSnapshot?: string;
  section_title_snapshot?: string;
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
  finalRemainingAmount?: number;
  final_remaining_amount?: number;
  details?: AnnualBudgetSummaryCourseDetail[];
  Details?: AnnualBudgetSummaryCourseDetail[];
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
}

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

function formatMoney(value: any) {
  return toNumber(value).toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function formatMoneyWithBaht(value: any) {
  return `${formatMoney(value)} บาท`;
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

function getCourseDetails(course: AnnualBudgetSummaryCourse | any) {
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

function getCourseName(course: AnnualBudgetSummaryCourse | any) {
  return toText(
    course.courseNameSnapshot ??
      course.course_name_snapshot ??
      course.course?.name ??
      course.Course?.name ??
      course.course?.course_name ??
      course.Course?.course_name ??
      "-",
  );
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

function getInitialAmount(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.initialAmount ?? course.initial_amount);
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

function getStep4Deduct(course: AnnualBudgetSummaryCourse | any) {
  return absMoney(course.step4DeductAmount ?? course.step4_deduct_amount);
}

function getStep4Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step4RemainingAmount ?? course.step4_remaining_amount);
}

function getStep5Deduct(course: AnnualBudgetSummaryCourse | any) {
  return absMoney(course.step5DeductAmount ?? course.step5_deduct_amount);
}

function getStep5Remaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(course.step5RemainingAmount ?? course.step5_remaining_amount);
}

function getStep6Deduct(course: AnnualBudgetSummaryCourse | any) {
  return absMoney(course.step6DeductAmount ?? course.step6_deduct_amount);
}

function getFinalRemaining(course: AnnualBudgetSummaryCourse | any) {
  return toNumber(
    course.finalRemainingAmount ??
      course.final_remaining_amount ??
      course.step6RemainingAmount ??
      course.step6_remaining_amount,
  );
}

function getDetailName(detail: AnnualBudgetSummaryCourseDetail | any) {
  return toText(detail.nameSnapshot ?? detail.name_snapshot ?? "-");
}

function getDetailDeduct(detail: AnnualBudgetSummaryCourseDetail | any) {
  return absMoney(detail.deductAmount ?? detail.deduct_amount);
}

function getDetailPercent(detail: AnnualBudgetSummaryCourseDetail | any) {
  return toNumber(detail.percent);
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
        className={`absolute text-[11px] font-bold text-white transition-all ${
          checked ? "left-2" : "right-2"
        }`}
      >
        {checked ? "เปิด" : "ปิด"}
      </span>

      <span
        className={`relative z-10 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[32px]" : "translate-x-0"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              แก้ไขสรุปข้อมูลงบประมาณ
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-400">
              รายการนี้เป็นข้อมูลที่คำนวณและบันทึกแล้ว
              หากต้องการแก้ไขยอด
              แนะนำให้สร้างฉบับแก้ไขจากเมนูสรุปงบประมาณประจำปี
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <div className="flex justify-between gap-4">
            <span>ปี</span>
            <span className="font-bold text-gray-800">{getYearLabel(item)}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span>เทอม</span>
            <span className="font-bold text-gray-800">
              {getSemesterLabel(item)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>วันที่บันทึก</span>
            <span className="font-bold text-gray-800">
              {formatDateTime(getCreatedAt(item))}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>สถานะ</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActiveStatus(item.status)
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {getStatusText(item.status)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>จำนวนหลักสูตร</span>
            <span className="font-bold text-blue-600">
              {getCourses(item).length} หลักสูตร
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onCreateRevision}
            className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            สร้างฉบับแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

function wordText(
  text: string,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
  },
) {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size ?? 28,
    color: options?.color,
    font: "TH Sarabun New",
  });
}

function wordParagraph(
  text: string,
  options?: {
    bold?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
  },
) {
  return new Paragraph({
    alignment: options?.alignment,
    spacing: {
      after: options?.spacingAfter ?? 120,
    },
    children: [
      wordText(text, {
        bold: options?.bold,
        size: options?.size ?? 28,
      }),
    ],
  });
}

function makeCell(
  text: string,
  options?: {
    bold?: boolean;
    width?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    color?: string;
  },
) {
  return new TableCell({
    width: options?.width
      ? {
          size: options.width,
          type: WidthType.PERCENTAGE,
        }
      : undefined,
    margins: {
      top: 120,
      bottom: 120,
      left: 120,
      right: 120,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    },
    children: [
      new Paragraph({
        alignment: options?.alignment,
        children: [
          wordText(text, {
            bold: options?.bold,
            size: 26,
            color: options?.color,
          }),
        ],
      }),
    ],
  });
}

function makeSectionSummaryTable(item: AnnualBudgetSummaryItem | any) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          makeCell("ปีการศึกษา", { bold: true, width: 25 }),
          makeCell(getYearLabel(item), { width: 25 }),
          makeCell("รูปแบบ", { bold: true, width: 25 }),
          makeCell(getSummaryTypeLabel(item), { width: 25 }),
        ],
      }),
      new TableRow({
        children: [
          makeCell("ภาคการศึกษา", { bold: true, width: 25 }),
          makeCell(getSemesterLabel(item), { width: 25 }),
          makeCell("สถานะ", { bold: true, width: 25 }),
          makeCell(getStatusText(item.status), { width: 25 }),
        ],
      }),
      new TableRow({
        children: [
          makeCell("วันที่บันทึก", { bold: true, width: 25 }),
          makeCell(formatDateTime(getCreatedAt(item)), { width: 25 }),
          makeCell("จำนวนหลักสูตร", { bold: true, width: 25 }),
          makeCell(`${getCourses(item).length} หลักสูตร`, { width: 25 }),
        ],
      }),
      new TableRow({
        children: [
          makeCell("รวมเงินบริหารงานวิทยาลัย", { bold: true, width: 25 }),
          makeCell(formatMoneyWithBaht(getTotalUniversityWork(item)), {
            width: 25,
          }),
          makeCell("รวมเงินบริหารหลักสูตร", { bold: true, width: 25 }),
          makeCell(formatMoneyWithBaht(getTotalCurriculum(item)), {
            width: 25,
          }),
        ],
      }),
    ],
  });
}

function makeCourseTable(course: AnnualBudgetSummaryCourse | any) {
  const rows = [
    ["เงินตั้งต้น", getInitialAmount(course), getInitialAmount(course)],
    [
      "จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย",
      -getStep2Deduct(course),
      getStep2Remaining(course),
    ],
    [
      "จ่ายให้เจ้าของรายวิชานอกคณะ",
      -getStep3Deduct(course),
      getStep3Remaining(course),
    ],
    [
      "หักเข้ากองทุน/สาธารณูปโภค",
      -getStep4Deduct(course),
      getStep4Remaining(course),
    ],
    [
      "หักบริหารส่วนกลางวิทยาลัย",
      -getStep5Deduct(course),
      getStep5Remaining(course),
    ],
    [
      "หักบริหารงานวิทยาลัย",
      -getStep6Deduct(course),
      getFinalRemaining(course),
    ],
  ];

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          makeCell("รายการ", { bold: true, width: 50 }),
          makeCell("ยอดเงินที่ถูกหัก (บาท)", {
            bold: true,
            width: 25,
            alignment: AlignmentType.RIGHT,
          }),
          makeCell("คงเหลือ (บาท)", {
            bold: true,
            width: 25,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
      ...rows.map(
        ([name, deduct, remaining]) =>
          new TableRow({
            children: [
              makeCell(String(name), { width: 50 }),
              makeCell(formatMoney(deduct), {
                width: 25,
                alignment: AlignmentType.RIGHT,
                color: toNumber(deduct) < 0 ? "EF4444" : "111827",
              }),
              makeCell(formatMoney(remaining), {
                width: 25,
                alignment: AlignmentType.RIGHT,
                color: "2563EB",
              }),
            ],
          }),
      ),
    ],
  });
}

function makeDetailTable(details: AnnualBudgetSummaryCourseDetail[]) {
  if (!details.length) return null;

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          makeCell("รายละเอียด", { bold: true, width: 50 }),
          makeCell("เปอร์เซ็นต์", {
            bold: true,
            width: 20,
            alignment: AlignmentType.RIGHT,
          }),
          makeCell("ยอดหัก (บาท)", {
            bold: true,
            width: 30,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
      ...details.map(
        (detail) =>
          new TableRow({
            children: [
              makeCell(getDetailName(detail), { width: 50 }),
              makeCell(`${getDetailPercent(detail)}%`, {
                width: 20,
                alignment: AlignmentType.RIGHT,
              }),
              makeCell(formatMoney(getDetailDeduct(detail)), {
                width: 30,
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
      ),
    ],
  });
}

async function createAnnualBudgetSummaryWord(
  item: AnnualBudgetSummaryItem | any,
) {
  const children: any[] = [];
  const courses = getCourses(item);

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        wordText("สรุปผลงบประมาณประจำปี", {
          bold: true,
          size: 42,
        }),
      ],
    }),
  );

  children.push(
    wordParagraph(
      `ปีงบประมาณ ${getYearLabel(item)} / ${getSummaryTypeLabel(item)}`,
      {
        bold: true,
        size: 30,
        alignment: AlignmentType.CENTER,
        spacingAfter: 240,
      },
    ),
  );

  children.push(makeSectionSummaryTable(item));
  children.push(wordParagraph("", { spacingAfter: 200 }));

  if (!courses.length) {
    children.push(wordParagraph("ไม่พบข้อมูลหลักสูตร", { bold: true }));
  }

  courses.forEach((course, index) => {
    children.push(
      wordParagraph(`${index + 1}. ${getSectionTitle(course)}`, {
        bold: true,
        size: 32,
        spacingAfter: 80,
      }),
    );

    children.push(
      wordParagraph(`${getCourseShortName(course)}`, {
        bold: true,
        size: 32,
        spacingAfter: 40,
      }),
    );

    children.push(
      wordParagraph(getCourseName(course), {
        bold: true,
        size: 28,
        spacingAfter: 160,
      }),
    );

    children.push(makeCourseTable(course));

    const details = getCourseDetails(course);
    const detailTable = makeDetailTable(details);

    if (detailTable) {
      children.push(
        wordParagraph("รายละเอียดเพิ่มเติม", {
          bold: true,
          size: 28,
          spacingAfter: 80,
        }),
      );
      children.push(detailTable);
    }

    children.push(wordParagraph("", { spacingAfter: 240 }));
  });

  children.push(
    wordParagraph("รวมเงินบริหารงานวิทยาลัย", {
      bold: true,
      size: 30,
      spacingAfter: 40,
    }),
  );

  children.push(
    wordParagraph(formatMoneyWithBaht(getTotalUniversityWork(item)), {
      bold: true,
      size: 34,
      alignment: AlignmentType.RIGHT,
      spacingAfter: 80,
    }),
  );

  children.push(
    wordParagraph("รวมเงินบริหารหลักสูตร", {
      bold: true,
      size: 30,
      spacingAfter: 40,
    }),
  );

  children.push(
    wordParagraph(formatMoneyWithBaht(getTotalCurriculum(item)), {
      bold: true,
      size: 34,
      alignment: AlignmentType.RIGHT,
      spacingAfter: 80,
    }),
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "TH Sarabun New",
            size: 28,
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
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

  const handleDownloadWord = async (item: AnnualBudgetSummaryItem) => {
    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึกไฟล์",
      html: `ต้องการบันทึกไฟล์ Word สรุปงบประมาณปี <b>${getYearLabel(
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
      const blob = await createAnnualBudgetSummaryWord(detail);

      const fileName = `สรุปงบประมาณ_${getYearLabel(detail)}_${
        getSemesterLabel(detail) === "-" ? "รายปี" : getSemesterLabel(detail)
      }.docx`;

      saveAs(blob, fileName);

      await Swal.fire({
        icon: "success",
        title: "สร้างไฟล์ Word สำเร็จ",
        text: "ดาวน์โหลดไฟล์ .docx เรียบร้อยแล้ว",
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
          "ไม่สามารถสร้างไฟล์ Word ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRevision = () => {
    setEditingItem(null);
    navigate("/budgetsummary");
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
              จัดการรายการสรุปงบประมาณ และดาวน์โหลดไฟล์ Word
            </p>
          </div>
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
                          title="บันทึกไฟล์ Word"
                          disabled={submitting}
                          onClick={() => handleDownloadWord(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      </td>

                      <td className="w-[180px] whitespace-nowrap px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="ดูรายละเอียด"
                            onClick={() => navigate(getDetailRoute(item))}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            title="แก้ไข"
                            onClick={() => setEditingItem(item)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            title="ลบ"
                            disabled={submitting}
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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