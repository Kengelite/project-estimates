import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AddDataAnnualBudgetSummary } from "../../../../fetchapi/fetch_api_admin";

const SIDEBAR_STEPS = [
  "เลือกหลักสูตร",
  "จัดสรรเป็นรายได้ส่วนกลาง",
  "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค",
  "หักบริหารส่วนกลางวิทยาลัย",
  "บริหารงานวิทยาลัย",
  "สรุปผลงบประมาณ",
];

type SummaryType = "yearly" | "semester";
type AnyObject = Record<string, any>;

type DeductSubItem = {
  id: string;
  label: string;
  deductionAmount: number;
  percent?: number;
};

type SummaryItem = {
  id: string;
  label: string;
  deductionAmount: number;
  balanceAmount: number;
  subItems?: DeductSubItem[];
};

type FinalCourseSummary = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  items: SummaryItem[];
  totalUniversityWorkAmount: number;
  totalCurriculumAmount: number;
};

type SectionGroup = {
  sectionTitle: string;
  courses: FinalCourseSummary[];
  totalUniversityWorkAmount: number;
  totalCurriculumAmount: number;
};

type LocationState = {
  yearId?: string | number | null;
  selectedYearId?: string | number | null;
  selectedYear?: {
    id?: string | number;
    ID?: string | number;
    yearId?: string | number;
    year_id?: string | number;
    name?: string;
    year?: string;
  } | null;

  summaryType?: SummaryType;
  selectedSemesterId?: string | number | null;
  selectedSemester?: string | number | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];

  step2?: {
    courses?: any[];
    totalCentralIncomeAmount?: number;
    totalUniversityDeductAmount?: number;
    totalRemainingAmount?: number;
  };

  step3?: {
    courses?: any[];
    totalOutsideSubjectPaymentAmount?: number;
    totalRemainingAmount?: number;
  };

  step4?: {
    funds?: any[];
    courses?: any[];
    totalFundDeductAmount?: number;
    totalRemainingAmount?: number;
  };

  step5?: {
    centrals?: any[];
    courses?: any[];
    totalCentralDeductAmount?: number;
    totalRemainingAmount?: number;
  };

  step6?: {
    universityWorks?: any[];
    courses?: any[];
    totalUniversityWorkDeductAmount?: number;
    totalRemainingAmount?: number;
  };
};

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/,/g, "").replace("%", "").trim();
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDeductMoney(value: number) {
  const amount = toNumber(value);
  if (amount <= 0) return "0";
  return `- ${formatMoney(amount)}`;
}

function isUUID(value: any) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim(),
  );
}

function pickFirstNumber(item: AnyObject | undefined, keys: string[]) {
  if (!item) return 0;

  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return toNumber(item[key]);
    }
  }

  return 0;
}

function getCourseId(item: AnyObject, fallbackIndex = 0) {
  return String(
    item.courseId ??
      item.course_id ??
      item.id ??
      item.ID ??
      `course-${fallbackIndex}`,
  );
}

function getCourseName(item: AnyObject) {
  return String(
    item.courseName ??
      item.course_name ??
      item.name ??
      item.Name ??
      item.curriculumName ??
      item.curriculum_name ??
      item.course?.nameTh ??
      item.course?.name_th ??
      item.course?.name ??
      "-",
  );
}

function getShortName(item: AnyObject) {
  return String(
    item.shortName ??
      item.short_name ??
      item.courseShortName ??
      item.course_short_name ??
      item.courseCode ??
      item.course_code ??
      item.shortname ??
      item.course?.shortName ??
      item.course?.short_name ??
      item.name ??
      "-",
  );
}

function getSectionTitle(item: AnyObject) {
  return String(
    item.sectionTitle ??
      item.section_title ??
      item.degreeName ??
      item.degree_name ??
      item.sectionName ??
      item.section_name ??
      item.degreeLevelName ??
      item.degree_level_name ??
      "-",
  );
}

function buildCourseMap(items: any[] = []) {
  const map = new Map<string, AnyObject>();

  items.forEach((item, index) => {
    const id = getCourseId(item, index);
    map.set(id, item || {});
  });

  return map;
}

function getBalance(item: AnyObject | undefined, fallback = 0) {
  if (!item) return fallback;

  const balance = pickFirstNumber(item, [
    "remainingAmount",
    "remaining_amount",
    "balance",
    "Balance",
    "latestRemainingAmount",
    "latest_remaining_amount",
  ]);

  if (balance !== 0) return balance;

  return fallback;
}

function getStep2Deduction(step2Course: AnyObject | undefined) {
  if (!step2Course) return 0;

  const directAmount = pickFirstNumber(step2Course, [
    "universityDeductAmount",
    "university_deduct_amount",
    "totalUniversityDeductAmount",
    "total_university_deduct_amount",
    "centralIncomeAmount",
    "central_income_amount",
    "totalCentralIncomeAmount",
    "total_central_income_amount",
    "deductToUniAmount",
    "deduct_to_uni_amount",
    "deductToUniversityAmount",
    "deduct_to_university_amount",
    "universityIncomeAmount",
    "university_income_amount",
  ]);

  if (directAmount > 0) return directAmount;

  const percent = pickFirstNumber(step2Course, [
    "deductToUni",
    "deduct_to_uni",
    "DeductToUni",
    "deductToUniversity",
    "deduct_to_university",
  ]);

  if (percent <= 0) return 0;

  const totalIncome = pickFirstNumber(step2Course, [
    "afterRiskAmount",
    "after_risk_amount",
    "totalIncome",
    "total_income",
    "incomeAmount",
    "income_amount",
    "selectedStudentAmount",
    "selected_student_amount",
    "latestRemainingAmount",
    "latest_remaining_amount",
    "remainingAmount",
    "remaining_amount",
  ]);

  const riskDeductAmount = pickFirstNumber(step2Course, [
    "riskDeductAmount",
    "risk_deduct_amount",
  ]);

  const afterRiskAmount = pickFirstNumber(step2Course, [
    "afterRiskAmount",
    "after_risk_amount",
  ]);

  const baseAmount =
    afterRiskAmount || Math.max(totalIncome - riskDeductAmount, 0) || totalIncome;

  return (baseAmount * percent) / 100;
}

function getStep3Deduction(step3Course: AnyObject | undefined) {
  return pickFirstNumber(step3Course, [
    "outsideSubjectPaymentAmount",
    "outside_subject_payment_amount",
    "totalOutsideSubjectPaymentAmount",
    "total_outside_subject_payment_amount",
    "outsideSubjectDeductAmount",
    "outside_subject_deduct_amount",
    "totalDeductAmount",
    "total_deduct_amount",
    "deductAmount",
    "deduct_amount",
  ]);
}

function getStep4Deduction(step4Course: AnyObject | undefined) {
  return pickFirstNumber(step4Course, [
    "totalFundDeductAmount",
    "total_fund_deduct_amount",
    "fundDeductAmount",
    "fund_deduct_amount",
    "totalDeductAmount",
    "total_deduct_amount",
    "deductAmount",
    "deduct_amount",
  ]);
}

function getStep5Deduction(step5Course: AnyObject | undefined) {
  return pickFirstNumber(step5Course, [
    "totalCentralDeductAmount",
    "total_central_deduct_amount",
    "centralDeductAmount",
    "central_deduct_amount",
    "totalDeductAmount",
    "total_deduct_amount",
    "deductAmount",
    "deduct_amount",
  ]);
}

function getStep6Deduction(step6Course: AnyObject | undefined) {
  return pickFirstNumber(step6Course, [
    "totalUniversityWorkDeductAmount",
    "total_university_work_deduct_amount",
    "universityWorkDeductAmount",
    "university_work_deduct_amount",
    "totalDeductAmount",
    "total_deduct_amount",
    "deductAmount",
    "deduct_amount",
  ]);
}

function getFundSubItems(step4Course: AnyObject | undefined): DeductSubItem[] {
  const items =
    step4Course?.fundDeductions ||
    step4Course?.fund_deductions ||
    step4Course?.funds ||
    [];

  if (!Array.isArray(items)) return [];

  return items.map((item: AnyObject, index: number) => ({
    id: String(
      item.fundId ?? item.fund_id ?? item.id ?? item.ID ?? `fund-${index}`,
    ),
    label: String(
      item.fundName ??
        item.fund_name ??
        item.name ??
        item.Name ??
        item.label ??
        item.Label ??
        "-",
    ),
    percent: pickFirstNumber(item, [
      "percent",
      "Percent",
      "pctSplit",
      "pct_split",
    ]),
    deductionAmount: pickFirstNumber(item, [
      "amount",
      "deductAmount",
      "deduct_amount",
      "fundDeductAmount",
      "fund_deduct_amount",
    ]),
  }));
}

function getCentralSubItems(step5Course: AnyObject | undefined): DeductSubItem[] {
  const items =
    step5Course?.centralDeductions ||
    step5Course?.central_deductions ||
    step5Course?.centrals ||
    [];

  if (!Array.isArray(items)) return [];

  return items.map((item: AnyObject, index: number) => ({
    id: String(
      item.centralId ??
        item.central_id ??
        item.id ??
        item.ID ??
        `central-${index}`,
    ),
    label: String(
      item.centralName ??
        item.central_name ??
        item.name ??
        item.Name ??
        item.label ??
        item.Label ??
        "-",
    ),
    percent: pickFirstNumber(item, [
      "percent",
      "Percent",
      "pctSplit",
      "pct_split",
    ]),
    deductionAmount: pickFirstNumber(item, [
      "amount",
      "deductAmount",
      "deduct_amount",
      "centralDeductAmount",
      "central_deduct_amount",
    ]),
  }));
}

function getUniversityWorkSubItems(
  step6Course: AnyObject | undefined,
): DeductSubItem[] {
  const items =
    step6Course?.universityWorkDeductions ||
    step6Course?.university_work_deductions ||
    step6Course?.universityWorks ||
    step6Course?.university_works ||
    [];

  if (!Array.isArray(items)) return [];

  return items.map((item: AnyObject, index: number) => ({
    id: String(
      item.universityWorkId ??
        item.university_work_id ??
        item.id ??
        item.ID ??
        `university-work-${index}`,
    ),
    label: String(
      item.universityWorkName ??
        item.university_work_name ??
        item.name ??
        item.Name ??
        item.label ??
        item.Label ??
        "-",
    ),
    percent: pickFirstNumber(item, [
      "percent",
      "Percent",
      "pctSplit",
      "pct_split",
    ]),
    deductionAmount: pickFirstNumber(item, [
      "amount",
      "deductAmount",
      "deduct_amount",
      "universityWorkDeductAmount",
      "university_work_deduct_amount",
    ]),
  }));
}

function buildFinalCourseSummaries(state: LocationState): FinalCourseSummary[] {
  const step2Courses = state.step2?.courses || [];
  const step3Courses = state.step3?.courses || [];
  const step4Courses = state.step4?.courses || [];
  const step5Courses = state.step5?.courses || [];
  const step6Courses = state.step6?.courses || [];

  const baseCourses =
    step6Courses.length > 0
      ? step6Courses
      : step5Courses.length > 0
        ? step5Courses
        : step4Courses.length > 0
          ? step4Courses
          : step3Courses.length > 0
            ? step3Courses
            : step2Courses;

  const step2Map = buildCourseMap(step2Courses);
  const step3Map = buildCourseMap(step3Courses);
  const step4Map = buildCourseMap(step4Courses);
  const step5Map = buildCourseMap(step5Courses);
  const step6Map = buildCourseMap(step6Courses);

  return baseCourses.map((baseCourse: AnyObject, index: number) => {
    const courseId = getCourseId(baseCourse, index);

    const step2Course = step2Map.get(courseId);
    const step3Course = step3Map.get(courseId);
    const step4Course = step4Map.get(courseId);
    const step5Course = step5Map.get(courseId);
    const step6Course = step6Map.get(courseId);

    const sourceCourse =
      step6Course ||
      step5Course ||
      step4Course ||
      step3Course ||
      step2Course ||
      baseCourse;

    const step2Deduction = getStep2Deduction(step2Course);
    const step2Balance = getBalance(step2Course);

    const step3Deduction = getStep3Deduction(step3Course);
    const step3Balance = getBalance(
      step3Course,
      Math.max(step2Balance - step3Deduction, 0),
    );

    const step4Deduction = getStep4Deduction(step4Course);
    const step4Balance = getBalance(
      step4Course,
      Math.max(step3Balance - step4Deduction, 0),
    );

    const step5Deduction = getStep5Deduction(step5Course);
    const step5Balance = getBalance(
      step5Course,
      Math.max(step4Balance - step5Deduction, 0),
    );

    const step6Deduction = getStep6Deduction(step6Course);
    const step6Balance = getBalance(
      step6Course,
      Math.max(step5Balance - step6Deduction, 0),
    );

    const items: SummaryItem[] = [
      {
        id: `${courseId}-step2`,
        label: "จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย",
        deductionAmount: step2Deduction,
        balanceAmount: step2Balance,
      },
      {
        id: `${courseId}-step3`,
        label: "จ่ายให้เจ้าของรายวิชานอกคณะ",
        deductionAmount: step3Deduction,
        balanceAmount: step3Balance,
      },
      {
        id: `${courseId}-step4`,
        label: "หักเข้ากองทุน/สาธารณูปโภค",
        deductionAmount: step4Deduction,
        balanceAmount: step4Balance,
        subItems: getFundSubItems(step4Course),
      },
      {
        id: `${courseId}-step5`,
        label: "หักบริหารส่วนกลางวิทยาลัย",
        deductionAmount: step5Deduction,
        balanceAmount: step5Balance,
        subItems: getCentralSubItems(step5Course),
      },
      {
        id: `${courseId}-step6`,
        label: "หักบริหารงานวิทยาลัย",
        deductionAmount: step6Deduction,
        balanceAmount: step6Balance,
        subItems: getUniversityWorkSubItems(step6Course),
      },
    ];

    return {
      courseId,
      courseName: getCourseName(sourceCourse),
      shortName: getShortName(sourceCourse),
      sectionTitle: getSectionTitle(sourceCourse),
      items,
      totalUniversityWorkAmount: step6Deduction,
      totalCurriculumAmount: step6Balance,
    };
  });
}

function groupBySection(rows: FinalCourseSummary[]): SectionGroup[] {
  const map = new Map<string, FinalCourseSummary[]>();

  rows.forEach((row) => {
    const key = row.sectionTitle || "-";
    const old = map.get(key) || [];
    map.set(key, [...old, row]);
  });

  return Array.from(map.entries()).map(([sectionTitle, courses]) => ({
    sectionTitle,
    courses,
    totalUniversityWorkAmount: courses.reduce(
      (sum, row) => sum + row.totalUniversityWorkAmount,
      0,
    ),
    totalCurriculumAmount: courses.reduce(
      (sum, row) => sum + row.totalCurriculumAmount,
      0,
    ),
  }));
}

function getStoredJSON(key: string) {
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getYearIdFromState(state: LocationState) {
  const direct =
    state.yearId ??
    state.selectedYearId ??
    state.selectedYear?.id ??
    state.selectedYear?.ID ??
    state.selectedYear?.yearId ??
    state.selectedYear?.year_id ??
    (state as any).idYear ??
    (state as any).id_year ??
    (state as any).year?.id ??
    (state as any).year?.ID ??
    (state as any).year?.yearId ??
    (state as any).year?.year_id ??
    null;

  if (direct !== null && direct !== undefined && String(direct).trim() !== "") {
    return String(direct);
  }

  const courseSources = [
    ...(state.selectedCourses || []),
    ...(state.step2?.courses || []),
    ...(state.step3?.courses || []),
    ...(state.step4?.courses || []),
    ...(state.step5?.courses || []),
    ...(state.step6?.courses || []),
  ];

  for (const course of courseSources) {
    const id =
      course?.yearId ??
      course?.year_id ??
      course?.idYear ??
      course?.id_year ??
      course?.selectedYearId ??
      course?.selectedBudgetYearId ??
      course?.budgetYearId ??
      course?.budget_year_id ??
      course?.year?.id ??
      course?.year?.ID ??
      course?.year?.yearId ??
      course?.year?.year_id ??
      course?.course?.yearId ??
      course?.course?.year_id ??
      course?.course?.year?.id ??
      null;

    if (id !== null && id !== undefined && String(id).trim() !== "") {
      return String(id);
    }
  }

  const possibleKeys = [
    "annualBudgetSummaryYear",
    "selectedYear",
    "year",
    "budgetSummaryYear",
    "annualBudgetYear",
    "currentYear",
    "academicYear",
    "selectedAcademicYear",
  ];

  for (const key of possibleKeys) {
    const data = getStoredJSON(key);

    const id =
      data?.id ??
      data?.ID ??
      data?.yearId ??
      data?.year_id ??
      data?.idYear ??
      data?.id_year ??
      data?.year?.id ??
      data?.year?.ID ??
      data?.year?.yearId ??
      data?.year?.year_id ??
      null;

    if (id !== null && id !== undefined && String(id).trim() !== "") {
      return String(id);
    }
  }

  return "";
}

function getSemesterIdFromState(state: LocationState) {
  const value =
    state.selectedSemesterId ??
    state.selectedSemester ??
    (state as any).semesterId ??
    (state as any).semester_id ??
    null;

  if (value !== null && value !== undefined && String(value).trim() !== "") {
    return String(value);
  }

  return null;
}

function buildDetailsPayload(course: FinalCourseSummary) {
  const step4Details =
    course.items[2]?.subItems?.map((item) => ({
      step: "step4" as const,
      refType: "fund" as const,
      refId: isUUID(item.id) ? item.id : null,
      nameSnapshot: item.label,
      percent: toNumber(item.percent),
      deductAmount: toNumber(item.deductionAmount),
    })) || [];

  const step5Details =
    course.items[3]?.subItems?.map((item) => ({
      step: "step5" as const,
      refType: "central" as const,
      refId: isUUID(item.id) ? item.id : null,
      nameSnapshot: item.label,
      percent: toNumber(item.percent),
      deductAmount: toNumber(item.deductionAmount),
    })) || [];

  const step6Details =
    course.items[4]?.subItems?.map((item) => ({
      step: "step6" as const,
      refType: "university_work" as const,
      refId: isUUID(item.id) ? item.id : null,
      nameSnapshot: item.label,
      percent: toNumber(item.percent),
      deductAmount: toNumber(item.deductionAmount),
    })) || [];

  return [...step4Details, ...step5Details, ...step6Details];
}

function buildSavePayload(
  state: LocationState,
  finalCourses: FinalCourseSummary[],
  totalUniversityWorkAmount: number,
  totalCurriculumAmount: number,
) {
  const summaryType = state.summaryType || "yearly";
  const yearId = getYearIdFromState(state);
  const semesterId =
    summaryType === "semester" ? getSemesterIdFromState(state) : null;

  return {
    yearId,
    summaryType,
    semesterId,
    totalUniversityWorkAmount,
    totalCurriculumAmount,
    status: "1",
    createdById: null,
    courses: finalCourses.map((course) => {
      const step2 = course.items[0];
      const step3 = course.items[1];
      const step4 = course.items[2];
      const step5 = course.items[3];
      const step6 = course.items[4];

      return {
        courseId: isUUID(course.courseId) ? course.courseId : null,
        courseNameSnapshot: course.courseName || "-",
        courseShortNameSnapshot: course.shortName || "-",
        sectionTitleSnapshot: course.sectionTitle || "-",

        initialAmount:
          toNumber(step2?.deductionAmount) + toNumber(step2?.balanceAmount),

        step2DeductAmount: toNumber(step2?.deductionAmount),
        step2RemainingAmount: toNumber(step2?.balanceAmount),

        step3DeductAmount: toNumber(step3?.deductionAmount),
        step3RemainingAmount: toNumber(step3?.balanceAmount),

        step4DeductAmount: toNumber(step4?.deductionAmount),
        step4RemainingAmount: toNumber(step4?.balanceAmount),

        step5DeductAmount: toNumber(step5?.deductionAmount),
        step5RemainingAmount: toNumber(step5?.balanceAmount),

        step6DeductAmount: toNumber(step6?.deductionAmount),
        finalRemainingAmount: toNumber(step6?.balanceAmount),

        details: buildDetailsPayload(course),
      };
    }),
  };
}

export default function BudgetSummaryStep7() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 6;
  const summaryType: SummaryType = locationState.summaryType || "yearly";

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const finalCourses = useMemo(() => {
    return buildFinalCourseSummaries(locationState);
  }, [locationState]);

  const sectionGroups = useMemo(() => {
    return groupBySection(finalCourses);
  }, [finalCourses]);

  const totalUniversityWorkAmount = useMemo(() => {
    return finalCourses.reduce(
      (sum, row) => sum + row.totalUniversityWorkAmount,
      0,
    );
  }, [finalCourses]);

  const totalCurriculumAmount = useMemo(() => {
    return finalCourses.reduce((sum, row) => sum + row.totalCurriculumAmount, 0);
  }, [finalCourses]);

  const totalCourseCount = finalCourses.length;
  const totalSectionCount = sectionGroups.length;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };

  const handleBack = () => {
    navigate("/annual-budget-summary/step6", {
      state: locationState,
    });
  };

  const handleSave = async () => {
    try {
      const payload = buildSavePayload(
        locationState,
        finalCourses,
        totalUniversityWorkAmount,
        totalCurriculumAmount,
      );

      console.log("STEP7 locationState:", locationState);
      console.log("STEP7 save payload:", payload);

      if (!payload.yearId) {
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่พบปีงบประมาณ",
          text: "กรุณากลับไปเลือกปีงบประมาณก่อนบันทึกข้อมูล",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      if (payload.summaryType === "semester" && !payload.semesterId) {
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่พบภาคการศึกษา",
          text: "กรุณากลับไปเลือกภาคการศึกษาก่อนบันทึกข้อมูล",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      if (payload.courses.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่มีข้อมูลหลักสูตร",
          text: "ไม่พบข้อมูลสำหรับบันทึกสรุปงบประมาณ",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      setSaving(true);

      await AddDataAnnualBudgetSummary(payload);

      setShowConfirmModal(false);

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกสรุปงบประมาณเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      navigate("/annual-budget-summary", {
        state: {
          ...locationState,
          summaryType,
          step7: {
            courses: finalCourses,
            totalUniversityWorkAmount,
            totalCurriculumAmount,
          },
        },
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถบันทึกสรุปงบประมาณได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="px-6 py-4">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">
            สรุปงบประมาณประจำปี
          </span>
        </nav>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900">
            สรุปงบประมาณประจำปี
          </h1>

          <p className="text-sm text-gray-400">
            {summaryType === "semester"
              ? `แบบแยกภาคการศึกษา / ${
                  locationState.selectedSemesterName || "-"
                }`
              : "แบบรายปี"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-8 px-6 pb-28">
        <div className="w-[280px]">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200" />

              <div
                className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all"
                style={{ height: "100%" }}
              />

              {SIDEBAR_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <div
                    key={step}
                    className="relative flex items-center gap-4 py-3.5"
                  >
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                      {isCompleted && (
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                      )}

                      {isActive && (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        </div>
                      )}

                      {isPending && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full">
          <div className="w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                สรุปผลงบประมาณประจำปี
              </h2>
            </div>

            {sectionGroups.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลสรุปงบประมาณจากขั้นตอนก่อนหน้า
              </div>
            ) : (
              <div className="p-7 space-y-9">
                {sectionGroups.map((section) => (
                  <div key={section.sectionTitle} className="space-y-6">
                    <h3 className="text-base font-bold text-gray-800">
                      {section.sectionTitle}
                    </h3>

                    {section.courses.map((course, courseIndex) => (
                      <div
                        key={course.courseId}
                        className={`space-y-4 ${
                          courseIndex > 0
                            ? "border-t border-gray-200 pt-6"
                            : ""
                        }`}
                      >
                        <div>
                          <h4 className="text-[15px] font-bold text-gray-800">
                            {course.shortName || "-"}
                          </h4>

                          <p className="mt-1 text-xs text-gray-400">
                            {course.courseName || "-"}
                          </p>
                        </div>

                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 pb-2 text-xs text-gray-400">
                          <div className="col-span-6">รายการ</div>
                          <div className="col-span-3 text-right">
                            ยอดเงินที่ถูกหัก (บาท)
                          </div>
                          <div className="col-span-3 text-right">
                            คงเหลือ (บาท)
                          </div>
                        </div>

                        <div className="space-y-3">
                          {course.items.map((item) => {
                            const hasSubItems =
                              item.subItems && item.subItems.length > 0;

                            const isExpanded = expandedItems.includes(item.id);

                            return (
                              <div key={item.id} className="space-y-2">
                                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                  <div className="col-span-6 flex items-center gap-2">
                                    <span className="text-gray-800">
                                      {item.label}
                                    </span>

                                    {hasSubItems && (
                                      <button
                                        type="button"
                                        onClick={() => toggleExpand(item.id)}
                                        className={`text-xs underline transition-colors ${
                                          isExpanded
                                            ? "text-red-500 hover:text-red-600"
                                            : "text-blue-500 hover:text-blue-600"
                                        }`}
                                      >
                                        {isExpanded
                                          ? "ย่อข้อมูล"
                                          : "ดูเพิ่มเติม"}
                                      </button>
                                    )}
                                  </div>

                                  <div className="col-span-3 text-right font-medium text-red-500">
                                    {formatDeductMoney(item.deductionAmount)}
                                  </div>

                                  <div className="col-span-3 text-right font-medium text-blue-600">
                                    {formatMoney(item.balanceAmount)}
                                  </div>
                                </div>

                                {hasSubItems && isExpanded && (
                                  <div className="space-y-2 pb-2 pl-4">
                                    {item.subItems?.map((subItem) => (
                                      <div
                                        key={subItem.id}
                                        className="grid grid-cols-12 gap-4 text-[13px]"
                                      >
                                        <div className="col-span-6 text-gray-600">
                                          - {subItem.label}
                                        </div>

                                        <div className="col-span-3 text-right text-red-400">
                                          {formatDeductMoney(
                                            subItem.deductionAmount,
                                          )}
                                        </div>

                                        <div className="col-span-3" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-9 text-[15px] font-bold text-gray-800">
                              รวมเงินบริหารงานวิทยาลัย
                            </div>

                            <div className="col-span-3 text-right text-base font-bold text-blue-600">
                              {formatMoney(course.totalUniversityWorkAmount)}
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-9 text-[15px] font-bold text-gray-800">
                              รวมเงินบริหารหลักสูตร
                            </div>

                            <div className="col-span-3 text-right text-base font-bold text-blue-600">
                              {formatMoney(course.totalCurriculumAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-2xl bg-gray-50 px-6 py-5 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-bold text-gray-800">
                          รวมเงินบริหารงานวิทยาลัย
                        </span>

                        <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                          {formatMoney(section.totalUniversityWorkAmount)} บาท
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-bold text-gray-800">
                          รวมเงินบริหารหลักสูตร
                        </span>

                        <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                          {formatMoney(section.totalCurriculumAmount)} บาท
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 pb-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={saving || finalCourses.length === 0}
              className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-2xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  ยืนยันการบันทึกข้อมูล
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  ต้องการบันทึกสรุปงบประมาณนี้ใช่หรือไม่
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between gap-4">
                <span>ประเภทรายงาน</span>
                <span className="font-bold text-gray-800">
                  {summaryType === "semester"
                    ? "แบบแยกภาคการศึกษา"
                    : "แบบรายปี"}
                </span>
              </div>

              {summaryType === "semester" && (
                <div className="flex justify-between gap-4">
                  <span>ภาคการศึกษา</span>
                  <span className="font-bold text-gray-800">
                    {locationState.selectedSemesterName || "-"}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span>จำนวนกลุ่มหลักสูตร</span>
                <span className="font-bold text-blue-600">
                  {totalSectionCount} กลุ่ม
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span>จำนวนหลักสูตร</span>
                <span className="font-bold text-blue-600">
                  {totalCourseCount} หลักสูตร
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-400">
              หลังบันทึกแล้ว ระบบจะเก็บข้อมูลลงตารางสรุปงบประมาณประจำปี
              พร้อมรายละเอียดรายหลักสูตรและรายการย่อย
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}