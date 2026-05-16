import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataCourse } from "../../../../fetchapi/fetch_api_admin";

type SummaryType = "yearly" | "semester";

type SelectedCourseYear = {
  yearId: number;
  year: string;
  studentCount: number;
};

type SelectedCourse = {
  courseId: string;
  courseName: string;
  shortName: string;
  degreeLevelId?: string;
  degreeLevelName?: string;
  sectionName?: string;
  sectionTitle: string;
  projectType: "normal" | "special";
  riskPercent: number;
  years: SelectedCourseYear[];
};

type LocationState = {
  summaryType?: SummaryType;
  selectedSemesterId?: number | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: SelectedCourse[];
};

type CourseItem = {
  id: string;
  nameTh?: string;
  nameTH?: string;
  name_th?: string;
  nameEn?: string;
  nameEN?: string;
  name_en?: string;
  shortName?: string;
  short_name?: string;
  tuitionFees?: number;
  tuition_fees?: number;
  deductToUni?: number;
  deduct_to_uni?: number;
  status?: string;
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

type SectionGroup = {
  sectionTitle: string;
  rows: CalculatedCourse[];
  totalIncome: number;
  totalAfterRiskAmount: number;
  totalUniversityDeductAmount: number;
  totalRemainingAmount: number;
};

const SIDEBAR_STEPS = [
  "เลือกหลักสูตร",
  "จัดสรรเป็นรายได้ส่วนกลาง",
  "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค",
  "หักบริหารส่วนกลางวิทยาลัย",
  "บริหารงานวิทยาลัย",
  "สรุปผลงบประมาณ",
];

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getCourseName(course?: CourseItem) {
  return String(
    course?.nameTh ||
    course?.nameTH ||
    course?.name_th ||
    course?.nameEn ||
    course?.nameEN ||
    course?.name_en ||
    "",
  );
}

function getCourseShortName(course?: CourseItem) {
  return String(course?.shortName || course?.short_name || "");
}

function getCourseTuitionFees(course?: CourseItem) {
  return Number(course?.tuitionFees ?? course?.tuition_fees ?? 0);
}

function getCourseDeductToUni(course?: CourseItem) {
  return Number(course?.deductToUni ?? course?.deduct_to_uni ?? 0);
}

function getTotalStudentAmount(years: SelectedCourseYear[]) {
  return (years || []).reduce((sum, item) => {
    return sum + Number(item.studentCount || 0);
  }, 0);
}

function calculateCourses(
  selectedCourses: SelectedCourse[],
  allCourses: CourseItem[],
): CalculatedCourse[] {
  return selectedCourses.map((selected) => {
    const courseDetail = allCourses.find(
      (course) => String(course.id) === String(selected.courseId),
    );

    const shortName = selected.shortName || getCourseShortName(courseDetail);
    const courseName =
      getCourseName(courseDetail) || selected.courseName || "-";

    const selectedStudentAmount = getTotalStudentAmount(selected.years || []);
    const tuitionFees = getCourseTuitionFees(courseDetail);
    const deductToUni = getCourseDeductToUni(courseDetail);

    const totalIncome = selectedStudentAmount * tuitionFees;
    const riskDeductAmount =
      totalIncome * (Number(selected.riskPercent || 0) / 100);
    const afterRiskAmount = totalIncome - riskDeductAmount;
    const universityDeductAmount = selectedStudentAmount * deductToUni;
    const remainingAmount = afterRiskAmount - universityDeductAmount;

    return {
      courseId: selected.courseId,
      courseName,
      shortName,
      sectionTitle: selected.sectionTitle || selected.degreeLevelName || "-",
      projectType: selected.projectType || "normal",
      riskPercent: Number(selected.riskPercent || 0),
      selectedStudentAmount,
      tuitionFees,
      deductToUni,
      totalIncome,
      riskDeductAmount,
      afterRiskAmount,
      universityDeductAmount,
      remainingAmount,
      years: selected.years || [],
    };
  });
}

function groupCalculatedCourses(rows: CalculatedCourse[]): SectionGroup[] {
  const map = new Map<string, CalculatedCourse[]>();

  rows.forEach((row) => {
    const key = row.sectionTitle || "-";
    const old = map.get(key) || [];
    map.set(key, [...old, row]);
  });

  return Array.from(map.entries()).map(([sectionTitle, sectionRows]) => {
    const totalIncome = sectionRows.reduce(
      (sum, row) => sum + row.totalIncome,
      0,
    );

    const totalAfterRiskAmount = sectionRows.reduce(
      (sum, row) => sum + row.afterRiskAmount,
      0,
    );

    const totalUniversityDeductAmount = sectionRows.reduce(
      (sum, row) => sum + row.universityDeductAmount,
      0,
    );

    const totalRemainingAmount = sectionRows.reduce(
      (sum, row) => sum + row.remainingAmount,
      0,
    );

    return {
      sectionTitle,
      rows: sectionRows,
      totalIncome,
      totalAfterRiskAmount,
      totalUniversityDeductAmount,
      totalRemainingAmount,
    };
  });
}

export default function BudgetSummaryStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 1;

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const summaryType: SummaryType = locationState.summaryType || "yearly";
  const selectedSemesterId =
    summaryType === "semester"
      ? Number(locationState.selectedSemesterId || 0)
      : null;

  const selectedCourses = useMemo(() => {
    return locationState.selectedCourses || [];
  }, [locationState.selectedCourses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const courseList = await GetDataCourse();
        setCourses(courseList || []);
      } catch (error: any) {
        console.error("Error loading budget summary step2:", error);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error || "ไม่สามารถดึงข้อมูลหลักสูตรได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculatedCourses = useMemo(() => {
    return calculateCourses(selectedCourses, courses);
  }, [selectedCourses, courses]);

  const groups = useMemo(() => {
    return groupCalculatedCourses(calculatedCourses);
  }, [calculatedCourses]);

  const totalIncome = useMemo(() => {
    return calculatedCourses.reduce((sum, row) => sum + row.totalIncome, 0);
  }, [calculatedCourses]);

  const totalAfterRiskAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.afterRiskAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalUniversityDeductAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.universityDeductAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalRemainingAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.remainingAmount,
      0,
    );
  }, [calculatedCourses]);

  const handleBack = () => {
    navigate("/annual-budget-summary/step1", {
      state: locationState,
    });
  };

  const handleNext = () => {
    navigate("/annual-budget-summary/step3", {
      state: {
        ...locationState,
        summaryType,
        selectedSemesterId,
        selectedCourses,
        step2: {
          courses: calculatedCourses,
          totalIncome,
          totalAfterRiskAmount,
          totalUniversityDeductAmount,
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
                รายละเอียดการจัดสรรเป็นรายได้ส่วนกลาง
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                กำลังโหลดข้อมูล...
              </div>
            ) : calculatedCourses.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลหลักสูตรที่เลือกจากขั้นตอนก่อนหน้า
              </div>
            ) : (
              <div className="p-7 space-y-8 min-w-0">
                {groups.map((group) => (
                  <div key={group.sectionTitle} className="space-y-3 min-w-0">
                    <div className="text-sm font-semibold text-gray-500">
                      {group.sectionTitle}
                    </div>

                    <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
                      <table className="min-w-[850px] w-full table-fixed text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600">
                            <th className="w-[260px] px-3 py-4 text-left font-semibold whitespace-nowrap">
                              หลักสูตร
                            </th>
                            <th className="px-3 py-4 text-right font-semibold whitespace-nowrap">
                              รายได้รวม (บาท)
                            </th>
                            <th className="px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือหลังหักความเสี่ยง
                            </th>
                            <th className="px-3 py-4 text-right font-semibold whitespace-nowrap">
                              หักให้มหาวิทยาลัย
                            </th>
                            <th className="px-3 py-4 text-right font-semibold whitespace-nowrap">
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
                                {formatMoney(row.totalIncome)}
                              </td>

                              <td className="px-3 py-4 text-right text-gray-800 font-semibold whitespace-nowrap">
                                {formatMoney(row.afterRiskAmount)}
                              </td>

                              <td className="px-3 py-4 text-right text-red-500 font-semibold whitespace-nowrap">
                                -{formatMoney(row.universityDeductAmount)}
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
                              {formatMoney(group.totalIncome)}
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                              {formatMoney(group.totalAfterRiskAmount)}
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap">
                              -{formatMoney(
                                group.totalUniversityDeductAmount,
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
                      รวมเงินหักให้มหาวิทยาลัย
                    </span>

                    <span className="text-xl font-bold text-red-500 whitespace-nowrap">
                      -{formatMoney(totalUniversityDeductAmount)} บาท
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