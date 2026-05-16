import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataSubject } from "../../../../fetchapi/fetch_api_admin";

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

type SelectedCourseYear = {
  yearId: number;
  year: string;
  studentCount: number;
};

type CalculatedCourse = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  projectType: "normal" | "special";
  riskPercent: number;
  selectedStudentAmount: number;
  tuitionFees: number;
  deductToUni: number;
  totalIncome: number;
  riskDeductAmount: number;
  afterRiskAmount: number;
  universityDeductAmount: number;
  remainingAmount: number;
  years: SelectedCourseYear[];
};

type AnyObject = Record<string, any>;

type SubjectDeductItem = {
  id?: string;
  ID?: string;

  subjectCourseId?: string;
  subject_course_id?: string;
  SubjectCourseID?: string;

  subjectOutsideDeductId?: string;
  subject_outside_deduct_id?: string;
  SubjectOutsideDeductID?: string;

  courseId?: string;
  courseID?: string;
  course_id?: string;
  CourseID?: string;

  curriculumId?: string;
  curriculumID?: string;
  curriculum_id?: string;
  CurriculumID?: string;

  courseName?: string;
  course_name?: string;
  CourseName?: string;

  curriculumName?: string;
  curriculum_name?: string;
  CurriculumName?: string;

  courseShortName?: string;
  course_short_name?: string;
  courseCode?: string;
  course_code?: string;
  shortName?: string;
  short_name?: string;

  curriculumShortName?: string;
  curriculum_short_name?: string;
  CurriculumShortName?: string;

  course?: AnyObject;
  Course?: AnyObject;
  curriculum?: AnyObject;
  Curriculum?: AnyObject;

  price?: number | string;
  Price?: number | string;
  pricePerStudent?: number | string;
  price_per_student?: number | string;
  PricePerStudent?: number | string;

  registeredCount?: number | string;
  registered_count?: number | string;
  RegisteredCount?: number | string;
  studentCount?: number | string;
  student_count?: number | string;
  StudentCount?: number | string;
  amountStudent?: number | string;
  amount_student?: number | string;
  AmountStudent?: number | string;

  total?: number | string;
  Total?: number | string;
  amount?: number | string;
  Amount?: number | string;
  totalAmount?: number | string;
  total_amount?: number | string;
  TotalAmount?: number | string;
  totalPrice?: number | string;
  total_price?: number | string;
  TotalPrice?: number | string;
  deductAmount?: number | string;
  deduct_amount?: number | string;
  DeductAmount?: number | string;
  paymentAmount?: number | string;
  payment_amount?: number | string;
  PaymentAmount?: number | string;

  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;
};

type SubjectItem = {
  id?: string;
  ID?: string;

  subjectCourseId?: string;
  subject_course_id?: string;
  SubjectCourseID?: string;

  subjectCode?: string;
  subject_code?: string;
  SubjectCode?: string;
  subjectName?: string;
  subject_name?: string;
  SubjectName?: string;

  studentYearId?: number | string;
  student_year_id?: number | string;
  StudentYearID?: number | string;

  studentYear?: string | number;
  student_year?: string | number;
  StudentYear?: string | number;

  courseId?: string;
  courseID?: string;
  course_id?: string;
  CourseID?: string;

  curriculumId?: string;
  curriculumID?: string;
  curriculum_id?: string;
  CurriculumID?: string;

  courseName?: string;
  course_name?: string;
  CourseName?: string;

  curriculumName?: string;
  curriculum_name?: string;
  CurriculumName?: string;

  courseShortName?: string;
  course_short_name?: string;
  courseCode?: string;
  course_code?: string;
  shortName?: string;
  short_name?: string;

  curriculumShortName?: string;
  curriculum_short_name?: string;
  CurriculumShortName?: string;

  course?: AnyObject;
  Course?: AnyObject;
  curriculum?: AnyObject;
  Curriculum?: AnyObject;

  yearId?: number | string;
  year_id?: number | string;
  YearID?: number | string;
  year?: string | number | AnyObject;
  Year?: string | number | AnyObject;

  semesterId?: number | string;
  semester_id?: number | string;
  SemesterID?: number | string;
  semester?: string | number | AnyObject;
  Semester?: string | number | AnyObject;

  price?: number | string;
  Price?: number | string;
  pricePerStudent?: number | string;
  price_per_student?: number | string;
  PricePerStudent?: number | string;

  registeredCount?: number | string;
  registered_count?: number | string;
  RegisteredCount?: number | string;
  studentCount?: number | string;
  student_count?: number | string;
  StudentCount?: number | string;
  amountStudent?: number | string;
  amount_student?: number | string;
  AmountStudent?: number | string;

  total?: number | string;
  Total?: number | string;
  amount?: number | string;
  Amount?: number | string;
  totalAmount?: number | string;
  total_amount?: number | string;
  TotalAmount?: number | string;
  totalPrice?: number | string;
  total_price?: number | string;
  TotalPrice?: number | string;
  deductAmount?: number | string;
  deduct_amount?: number | string;
  DeductAmount?: number | string;
  paymentAmount?: number | string;
  payment_amount?: number | string;
  PaymentAmount?: number | string;

  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;

  subjectCourses?: SubjectDeductItem[];
  subject_courses?: SubjectDeductItem[];
  SubjectCourses?: SubjectDeductItem[];

  subjectOutsideDeducts?: SubjectDeductItem[];
  subject_outside_deducts?: SubjectDeductItem[];
  SubjectOutsideDeducts?: SubjectDeductItem[];

  deducts?: SubjectDeductItem[];
  Deducts?: SubjectDeductItem[];
  details?: SubjectDeductItem[];
  Details?: SubjectDeductItem[];
};

type LocationState = {
  summaryType?: SummaryType;
  selectedSemesterId?: number | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];
  step2?: {
    courses?: CalculatedCourse[];
    totalIncome?: number;
    totalAfterRiskAmount?: number;
    totalUniversityDeductAmount?: number;
    totalRemainingAmount?: number;
  };
};

type CalculatedStep3Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  latestRemainingAmount: number;
  outsideSubjectPaymentAmount: number;
  remainingAmount: number;
};

type SectionGroup = {
  sectionTitle: string;
  rows: CalculatedStep3Course[];
  totalLatestRemainingAmount: number;
  totalOutsideSubjectPaymentAmount: number;
  totalRemainingAmount: number;
};

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatMinusMoney(value: number) {
  const amount = Number(value || 0);

  if (amount <= 0) {
    return "0";
  }

  return `-${formatMoney(amount)}`;
}

function normalizeValue(value: any) {
  return String(value ?? "").trim();
}

function normalizeCompare(value: any) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[().\-_/]/g, "")
    .trim();
}

function pickArrayFromResponse(response: any): SubjectItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.subjects)) return response.subjects;
  if (Array.isArray(response?.subject_outsides)) return response.subject_outsides;
  if (Array.isArray(response?.SubjectOutsides)) return response.SubjectOutsides;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.subjects)) return response.data.subjects;
  if (Array.isArray(response?.data?.subject_outsides)) {
    return response.data.subject_outsides;
  }

  return [];
}

function getRelationCourseObject(row: AnyObject) {
  return (
    row.course ||
    row.Course ||
    row.curriculum ||
    row.Curriculum ||
    row.curriculumCourse ||
    row.CurriculumCourse ||
    {}
  );
}

function getRelationYearObject(row: AnyObject) {
  return row.year || row.Year || {};
}

function getRelationSemesterObject(row: AnyObject) {
  return row.semester || row.Semester || {};
}

function getSubjectDeductRows(subject: SubjectItem): SubjectDeductItem[] {
  return (
    subject.subjectOutsideDeducts ||
    subject.subject_outside_deducts ||
    subject.SubjectOutsideDeducts ||
    subject.subjectCourses ||
    subject.subject_courses ||
    subject.SubjectCourses ||
    subject.deducts ||
    subject.Deducts ||
    subject.details ||
    subject.Details ||
    []
  );
}

function getRowCourseId(row: AnyObject) {
  const relation = getRelationCourseObject(row);

  return normalizeValue(
    row.courseId ??
    row.courseID ??
    row.course_id ??
    row.CourseID ??
    row.curriculumId ??
    row.curriculumID ??
    row.curriculum_id ??
    row.CurriculumID ??
    relation.id ??
    relation.ID ??
    relation.courseId ??
    relation.course_id ??
    relation.CourseID ??
    relation.curriculumId ??
    relation.curriculum_id ??
    relation.CurriculumID,
  );
}

function getRowCourseShortName(row: AnyObject) {
  const relation = getRelationCourseObject(row);

  return normalizeValue(
    row.courseShortName ??
    row.course_short_name ??
    row.courseCode ??
    row.course_code ??
    row.shortName ??
    row.short_name ??
    row.curriculumShortName ??
    row.curriculum_short_name ??
    row.CurriculumShortName ??
    relation.shortName ??
    relation.short_name ??
    relation.ShortName ??
    relation.courseCode ??
    relation.course_code ??
    relation.CourseCode,
  );
}

function getRowCourseName(row: AnyObject) {
  const relation = getRelationCourseObject(row);

  return normalizeValue(
    row.courseName ??
    row.course_name ??
    row.CourseName ??
    row.curriculumName ??
    row.curriculum_name ??
    row.CurriculumName ??
    relation.name ??
    relation.Name ??
    relation.nameTh ??
    relation.name_th ??
    relation.NameTh ??
    relation.courseName ??
    relation.course_name ??
    relation.CourseName ??
    relation.curriculumName ??
    relation.curriculum_name ??
    relation.CurriculumName,
  );
}

function getRowAmount(row: AnyObject) {
  const directAmount = toNumber(
    row.total ??
    row.Total ??
    row.amount ??
    row.Amount ??
    row.totalAmount ??
    row.total_amount ??
    row.TotalAmount ??
    row.totalPrice ??
    row.total_price ??
    row.TotalPrice ??
    row.deductAmount ??
    row.deduct_amount ??
    row.DeductAmount ??
    row.paymentAmount ??
    row.payment_amount ??
    row.PaymentAmount,
  );

  if (directAmount > 0) return directAmount;

  const pricePerStudent = toNumber(
    row.price ??
    row.Price ??
    row.pricePerStudent ??
    row.price_per_student ??
    row.PricePerStudent,
  );

  const registeredCount = toNumber(
    row.registeredCount ??
    row.registered_count ??
    row.RegisteredCount ??
    row.studentCount ??
    row.student_count ??
    row.StudentCount ??
    row.amountStudent ??
    row.amount_student ??
    row.AmountStudent,
  );

  return pricePerStudent * registeredCount;
}

function getSubjectYearId(subject: SubjectItem) {
  const year = getRelationYearObject(subject);

  return toNumber(
    subject.studentYearId ??
    subject.student_year_id ??
    subject.StudentYearID ??
    subject.yearId ??
    subject.year_id ??
    subject.YearID ??
    year.id ??
    year.ID ??
    year.yearId ??
    year.year_id ??
    year.YearID,
  );
}

function getSubjectYearName(subject: SubjectItem) {
  const studentYear =
    subject.studentYear ?? subject.student_year ?? subject.StudentYear;

  if (studentYear !== undefined && studentYear !== null && studentYear !== "") {
    return normalizeValue(studentYear);
  }

  const rawYear = subject.year ?? subject.Year;
  const year = getRelationYearObject(subject);

  if (typeof rawYear === "object" && rawYear !== null) {
    return normalizeValue(
      rawYear.year ?? rawYear.Year ?? rawYear.name ?? rawYear.Name,
    );
  }

  return normalizeValue(
    rawYear ?? year.year ?? year.Year ?? year.name ?? year.Name,
  );
}

function getSubjectSemesterId(subject: SubjectItem) {
  const semester = getRelationSemesterObject(subject);

  return toNumber(
    subject.semesterId ??
    subject.semester_id ??
    subject.SemesterID ??
    semester.id ??
    semester.ID ??
    semester.semesterId ??
    semester.semester_id ??
    semester.SemesterID,
  );
}

function isActiveRow(row: AnyObject) {
  const deletedAt = row.deletedAt ?? row.deleted_at ?? row.DeletedAt ?? null;
  if (deletedAt) return false;

  const status = String(row.status ?? row.Status ?? "1");

  return status !== "0" && status !== "false";
}

function isMatchedYear(subject: SubjectItem, selectedYears: SelectedCourseYear[]) {
  const selectedYearIds = selectedYears
    .map((item) => toNumber(item.yearId))
    .filter((id) => id > 0);

  const selectedYearNames = selectedYears
    .map((item) => normalizeValue(item.year))
    .filter(Boolean);

  const subjectYearId = getSubjectYearId(subject);
  const subjectYearName = getSubjectYearName(subject);
  const subjectYearNameNumber = toNumber(subjectYearName);

  if (selectedYearIds.length === 0 && selectedYearNames.length === 0) {
    return true;
  }

  if (!subjectYearId && !subjectYearName) {
    return true;
  }

  if (subjectYearId && selectedYearIds.includes(subjectYearId)) {
    return true;
  }

  if (subjectYearNameNumber && selectedYearIds.includes(subjectYearNameNumber)) {
    return true;
  }

  if (subjectYearName && selectedYearNames.includes(subjectYearName)) {
    return true;
  }

  if (subjectYearId && selectedYearNames.includes(String(subjectYearId))) {
    return true;
  }

  return false;
}

function isMatchedSemester(
  subject: SubjectItem,
  summaryType: SummaryType,
  selectedSemesterId: number | null,
) {
  if (summaryType !== "semester") return true;
  if (!selectedSemesterId) return true;

  const subjectSemesterId = getSubjectSemesterId(subject);

  if (!subjectSemesterId) return true;

  return subjectSemesterId === selectedSemesterId;
}

function isMatchedCourseByIdOrShortName(
  row: CalculatedCourse,
  subjectCourseId: string,
  subjectCourseShortName: string,
  subjectCourseName?: string,
) {
  const targetCourseId = normalizeValue(row.courseId);
  const sourceCourseId = normalizeValue(subjectCourseId);

  if (sourceCourseId && targetCourseId && sourceCourseId === targetCourseId) {
    return true;
  }

  const targetShortName = normalizeCompare(row.shortName);
  const sourceShortName = normalizeCompare(subjectCourseShortName);

  if (sourceShortName && targetShortName && sourceShortName === targetShortName) {
    return true;
  }

  const targetCourseName = normalizeCompare(row.courseName);
  const sourceCourseName = normalizeCompare(subjectCourseName);

  if (sourceCourseName && targetCourseName && sourceCourseName === targetCourseName) {
    return true;
  }

  return false;
}

function calculateOutsideSubjectPayment(
  row: CalculatedCourse,
  subjects: SubjectItem[],
  summaryType: SummaryType,
  selectedSemesterId: number | null,
) {
  return subjects.reduce((sum, subject) => {
    if (!isActiveRow(subject)) return sum;
    if (!isMatchedYear(subject, row.years || [])) return sum;
    if (!isMatchedSemester(subject, summaryType, selectedSemesterId)) return sum;

    const deductRows = getSubjectDeductRows(subject);

    if (deductRows.length > 0) {
      const nestedTotal = deductRows.reduce((courseSum, deductRow) => {
        if (!isActiveRow(deductRow)) return courseSum;

        const subjectCourseId = getRowCourseId(deductRow);
        const subjectCourseShortName = getRowCourseShortName(deductRow);
        const subjectCourseName = getRowCourseName(deductRow);

        if (
          !isMatchedCourseByIdOrShortName(
            row,
            subjectCourseId,
            subjectCourseShortName,
            subjectCourseName,
          )
        ) {
          return courseSum;
        }

        return courseSum + getRowAmount(deductRow);
      }, 0);

      return sum + nestedTotal;
    }

    const flatCourseId = getRowCourseId(subject);
    const flatCourseShortName = getRowCourseShortName(subject);
    const flatCourseName = getRowCourseName(subject);

    if (
      !isMatchedCourseByIdOrShortName(
        row,
        flatCourseId,
        flatCourseShortName,
        flatCourseName,
      )
    ) {
      return sum;
    }

    return sum + getRowAmount(subject);
  }, 0);
}

function calculateStep3Courses(
  rows: CalculatedCourse[],
  subjects: SubjectItem[],
  summaryType: SummaryType,
  selectedSemesterId: number | null,
): CalculatedStep3Course[] {
  return (rows || []).map((row) => {
    const latestRemainingAmount = Number(row.remainingAmount || 0);

    const outsideSubjectPaymentAmount = calculateOutsideSubjectPayment(
      row,
      subjects,
      summaryType,
      selectedSemesterId,
    );

    const remainingAmount = latestRemainingAmount - outsideSubjectPaymentAmount;

    return {
      courseId: row.courseId,
      courseName: row.courseName,
      shortName: row.shortName,
      sectionTitle: row.sectionTitle || "-",
      latestRemainingAmount,
      outsideSubjectPaymentAmount,
      remainingAmount,
    };
  });
}

function groupCalculatedCourses(rows: CalculatedStep3Course[]): SectionGroup[] {
  const map = new Map<string, CalculatedStep3Course[]>();

  rows.forEach((row) => {
    const key = row.sectionTitle || "-";
    const old = map.get(key) || [];
    map.set(key, [...old, row]);
  });

  return Array.from(map.entries()).map(([sectionTitle, sectionRows]) => {
    const totalLatestRemainingAmount = sectionRows.reduce(
      (sum, row) => sum + row.latestRemainingAmount,
      0,
    );

    const totalOutsideSubjectPaymentAmount = sectionRows.reduce(
      (sum, row) => sum + row.outsideSubjectPaymentAmount,
      0,
    );

    const totalRemainingAmount = sectionRows.reduce(
      (sum, row) => sum + row.remainingAmount,
      0,
    );

    return {
      sectionTitle,
      rows: sectionRows,
      totalLatestRemainingAmount,
      totalOutsideSubjectPaymentAmount,
      totalRemainingAmount,
    };
  });
}

export default function BudgetSummaryStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 2;

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const summaryType: SummaryType = locationState.summaryType || "yearly";

  const selectedSemesterId =
    summaryType === "semester"
      ? Number(locationState.selectedSemesterId || 0)
      : null;

  const step2Courses = useMemo(() => {
    return locationState.step2?.courses || [];
  }, [locationState.step2?.courses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await GetDataSubject();
        const subjectList = pickArrayFromResponse(response);

        console.log("STEP3 GetDataSubject response:", response);
        console.log("STEP3 normalized subjectList:", subjectList);
        console.log("STEP3 step2Courses:", step2Courses);

        setSubjects(subjectList);
      } catch (error: any) {
        console.error("Error loading subjects for step3:", error);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error?.message || "ไม่สามารถดึงข้อมูลรายวิชานอกคณะได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [step2Courses]);

  const calculatedCourses = useMemo(() => {
    const rows = calculateStep3Courses(
      step2Courses,
      subjects,
      summaryType,
      selectedSemesterId,
    );

    console.log("STEP3 calculatedCourses:", rows);

    return rows;
  }, [step2Courses, subjects, summaryType, selectedSemesterId]);

  const groups = useMemo(() => {
    return groupCalculatedCourses(calculatedCourses);
  }, [calculatedCourses]);

  const totalOutsideSubjectPaymentAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.outsideSubjectPaymentAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalRemainingAmount = useMemo(() => {
    return calculatedCourses.reduce((sum, row) => sum + row.remainingAmount, 0);
  }, [calculatedCourses]);

  const handleBack = () => {
    navigate("/annual-budget-summary/step2", {
      state: locationState,
    });
  };

  const handleNext = () => {
    navigate("/annual-budget-summary/step4", {
      state: {
        ...locationState,
        summaryType,
        selectedSemesterId,
        step3: {
          courses: calculatedCourses,
          totalOutsideSubjectPaymentAmount,
          totalRemainingAmount,
        },
      },
    });
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
              ? `แบบแยกภาคการศึกษา / ${locationState.selectedSemesterName || "-"
              }`
              : "แบบรายปี"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-8 px-6 pb-8">
        <div className="w-[280px]">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200" />

              <div
                className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all"
                style={{
                  height: `${(currentStep / (SIDEBAR_STEPS.length - 1)) * 100
                    }%`,
                }}
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
                      className={`text-sm font-medium ${isActive || isCompleted
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
                รายละเอียดการจ่ายให้เจ้าของรายวิชานอกคณะ
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                กำลังโหลดข้อมูล...
              </div>
            ) : calculatedCourses.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลจากขั้นตอนก่อนหน้า
              </div>
            ) : (
              <div className="p-7 space-y-8 min-w-0">
                {groups.map((group) => (
                  <div key={group.sectionTitle} className="space-y-3 min-w-0">
                    <div className="text-sm font-semibold text-gray-500">
                      {group.sectionTitle}
                    </div>

                    <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
                      <table className="min-w-[760px] w-full table-fixed text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600">
                            <th className="w-[260px] px-3 py-4 text-left font-semibold whitespace-nowrap">
                              หลักสูตร
                            </th>

                            <th className="w-[160px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือล่าสุด
                            </th>

                            <th className="w-[210px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              จ่ายให้รายวิชานอกคณะ
                            </th>

                            <th className="w-[130px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือ
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.rows.map((row) => (
                            <tr
                              key={row.courseId}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="w-[260px] max-w-[260px] px-3 py-4 text-gray-800 align-top">
                                <div className="font-semibold text-gray-900">
                                  {row.shortName || "-"}
                                </div>

                                <div className="mt-1 text-xs font-normal leading-5 text-gray-400 whitespace-normal break-words">
                                  {row.courseName || "-"}
                                </div>
                              </td>

                              <td className="px-3 py-4 text-right text-gray-800 font-semibold whitespace-nowrap">
                                {formatMoney(row.latestRemainingAmount)}
                              </td>

                              <td className="px-3 py-4 text-right text-red-500 font-semibold whitespace-nowrap">
                                {formatMinusMoney(
                                  row.outsideSubjectPaymentAmount,
                                )}
                              </td>

                              <td className="px-3 py-4 text-right text-blue-600 font-bold whitespace-nowrap">
                                {formatMoney(row.remainingAmount)}
                              </td>
                            </tr>
                          ))}

                          <tr className="border-t border-gray-200">
                            <td className="px-3 py-4 font-bold text-gray-900 whitespace-nowrap">
                              รวม
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                              {formatMoney(group.totalLatestRemainingAmount)}
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap">
                              {formatMinusMoney(
                                group.totalOutsideSubjectPaymentAmount,
                              )}
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-blue-600 whitespace-nowrap">
                              {formatMoney(group.totalRemainingAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="space-y-4 pt-2">
                  <div className="rounded-2xl bg-gray-50 px-6 py-5 flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      รวมเงินจ่ายให้เจ้าของรายวิชานอกคณะ
                    </span>

                    <span className="text-xl font-bold text-red-500 whitespace-nowrap">
                      {formatMinusMoney(totalOutsideSubjectPaymentAmount)} บาท
                    </span>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-6 py-5 flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      คงเหลือทั้งหมด
                    </span>

                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      {formatMoney(totalRemainingAmount)} บาท
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 pb-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              ถัดไป
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}