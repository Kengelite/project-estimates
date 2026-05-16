import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataUniversityWork } from "../../../../fetchapi/fetch_api_admin";

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
type ProjectType = "normal" | "special" | "graduate";
type AnyObject = Record<string, any>;

type SplitGroupObject = {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  status?: string | number;
  Status?: string | number;
};

type UniversityWorkSplitItem = {
  id?: string;
  ID?: string;

  universityWorkId?: string;
  university_work_id?: string;
  UniversityWorkID?: string;

  splitGroupId?: string;
  split_group_id?: string;
  SplitGroupID?: string;

  splitGroup?: SplitGroupObject;
  split_group?: SplitGroupObject;
  SplitGroup?: SplitGroupObject;

  name?: string;
  Name?: string;
  label?: string;
  Label?: string;

  projectType?: string;
  project_type?: string;
  ProjectType?: string;
  type?: string;
  Type?: string;

  degreeLevelName?: string;
  degree_level_name?: string;
  DegreeLevelName?: string;

  courseType?: string;
  course_type?: string;
  CourseType?: string;

  pct_split?: number | string;
  pctSplit?: number | string;
  PctSplit?: number | string;
  percent?: number | string;
  Percent?: number | string;

  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;
};

type UniversityWorkItem = {
  id?: string;
  ID?: string;

  name?: string;
  Name?: string;

  pct_split?: number | string;
  pctSplit?: number | string;
  PctSplit?: number | string;
  percent?: number | string;
  Percent?: number | string;

  normal?: number | string;
  Normal?: number | string;
  normalPercent?: number | string;
  normal_percent?: number | string;
  NormalPercent?: number | string;
  bachelorNormal?: number | string;
  bachelor_normal?: number | string;
  BachelorNormal?: number | string;

  special?: number | string;
  Special?: number | string;
  specialPercent?: number | string;
  special_percent?: number | string;
  SpecialPercent?: number | string;
  bachelorSpecial?: number | string;
  bachelor_special?: number | string;
  BachelorSpecial?: number | string;

  graduate?: number | string;
  Graduate?: number | string;
  graduatePercent?: number | string;
  graduate_percent?: number | string;
  GraduatePercent?: number | string;

  universityWorkSplits?: UniversityWorkSplitItem[];
  university_work_splits?: UniversityWorkSplitItem[];
  UniversityWorkSplits?: UniversityWorkSplitItem[];
  splits?: UniversityWorkSplitItem[];
  Splits?: UniversityWorkSplitItem[];
  details?: UniversityWorkSplitItem[];
  Details?: UniversityWorkSplitItem[];

  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;
};

type Step5Central = {
  centralId?: string;
  centralName?: string;
  splits?: any[];
};

type Step5Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;

  projectType?: ProjectType | string;

  latestRemainingAmount?: number;
  totalCentralDeductAmount?: number;
  remainingAmount: number;

  centralDeductions?: any[];
};

type UniversityWorkColumn = {
  universityWorkId: string;
  universityWorkName: string;
  splits: {
    id: string;
    label: string;
    type: ProjectType;
    percent: number;
  }[];
};

type UniversityWorkDeduct = {
  universityWorkId: string;
  universityWorkName: string;
  percent: number;
  amount: number;
};

type CalculatedStep6Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  projectType: ProjectType;
  latestRemainingAmount: number;
  universityWorkDeductions: UniversityWorkDeduct[];
  totalUniversityWorkDeductAmount: number;
  remainingAmount: number;
};

type SectionGroup = {
  sectionTitle: string;
  rows: CalculatedStep6Course[];
  totalLatestRemainingAmount: number;
  totalUniversityWorkDeductAmount: number;
  totalRemainingAmount: number;
};

type LocationState = {
  summaryType?: SummaryType;
  selectedSemesterId?: number | string | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];

  yearId?: string | number | null;
  selectedYearId?: string | number | null;
  selectedYear?: any;

  step2?: any;
  step3?: any;
  step4?: any;

  step5?: {
    centrals?: Step5Central[];
    courses?: Step5Course[];
    totalCentralDeductAmount?: number;
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

function normalizeText(value: any) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[().\-_/]/g, "")
    .trim();
}

function pickArrayFromResponse(response: any): UniversityWorkItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.universityWorks)) return response.universityWorks;
  if (Array.isArray(response?.university_works)) return response.university_works;
  if (Array.isArray(response?.UniversityWorks)) return response.UniversityWorks;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.universityWorks)) {
    return response.data.universityWorks;
  }
  if (Array.isArray(response?.data?.university_works)) {
    return response.data.university_works;
  }

  return [];
}

function isActiveRow(row: AnyObject) {
  const deletedAt = row.deletedAt ?? row.deleted_at ?? row.DeletedAt ?? null;
  if (deletedAt) return false;

  const status = String(row.status ?? row.Status ?? "1");
  return status !== "0" && status !== "false";
}

function getUniversityWorkId(item: UniversityWorkItem, index: number) {
  return String(item.id ?? item.ID ?? `university-work-${index + 1}`);
}

function getUniversityWorkName(item: UniversityWorkItem) {
  return String(item.name ?? item.Name ?? "-");
}

function getUniversityWorkDefaultPercent(item: UniversityWorkItem) {
  return toNumber(
    item.pct_split ??
      item.pctSplit ??
      item.PctSplit ??
      item.percent ??
      item.Percent,
  );
}

function getUniversityWorkSplitRows(item: UniversityWorkItem) {
  return (
    item.universityWorkSplits ||
    item.university_work_splits ||
    item.UniversityWorkSplits ||
    item.splits ||
    item.Splits ||
    item.details ||
    item.Details ||
    []
  );
}

function getSplitGroupObject(split: UniversityWorkSplitItem) {
  return split.splitGroup || split.split_group || split.SplitGroup || {};
}

function getSplitGroupName(split: UniversityWorkSplitItem) {
  const splitGroup = getSplitGroupObject(split);

  return String(
    splitGroup.name ??
      splitGroup.Name ??
      split.name ??
      split.Name ??
      split.label ??
      split.Label ??
      "",
  ).trim();
}

function getSplitPercent(split: UniversityWorkSplitItem) {
  return toNumber(
    split.pct_split ??
      split.pctSplit ??
      split.PctSplit ??
      split.percent ??
      split.Percent,
  );
}

function getSplitRawLabel(split: UniversityWorkSplitItem) {
  const splitGroupName = getSplitGroupName(split);
  if (splitGroupName) return splitGroupName;

  return String(
    split.degreeLevelName ??
      split.degree_level_name ??
      split.DegreeLevelName ??
      split.courseType ??
      split.course_type ??
      split.CourseType ??
      split.projectType ??
      split.project_type ??
      split.ProjectType ??
      split.type ??
      split.Type ??
      "",
  ).trim();
}

function detectProjectTypeFromText(value: any): ProjectType {
  const text = normalizeText(value);

  if (
    text.includes("special") ||
    text.includes("พิเศษ") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("ปตรีพิเศษ") ||
    text.includes("ตรีพิเศษ")
  ) {
    return "special";
  }

  if (
    text.includes("graduate") ||
    text.includes("grad") ||
    text.includes("บัณฑิต") ||
    text.includes("บัณฑิตศึกษา") ||
    text.includes("ปโท") ||
    text.includes("ปเอก")
  ) {
    return "graduate";
  }

  return "normal";
}

function detectSplitType(split: UniversityWorkSplitItem): ProjectType {
  const raw =
    getSplitGroupName(split) ||
    split.projectType ||
    split.project_type ||
    split.ProjectType ||
    split.type ||
    split.Type ||
    getSplitRawLabel(split);

  return detectProjectTypeFromText(raw);
}

function getSplitDisplayLabel(split: UniversityWorkSplitItem, type: ProjectType) {
  const rawLabel = getSplitRawLabel(split);
  if (rawLabel) return rawLabel;

  if (type === "special") return "ป.ตรี (พิเศษ)";
  if (type === "graduate") return "บัณฑิต";
  return "ป.ตรี (ปกติ)";
}

function getCourseProjectType(course: Step5Course): ProjectType {
  if (course.projectType) {
    return detectProjectTypeFromText(course.projectType);
  }

  return detectProjectTypeFromText(course.sectionTitle);
}

function normalizeUniversityWorks(
  items: UniversityWorkItem[],
): UniversityWorkColumn[] {
  return (items || [])
    .filter(isActiveRow)
    .map((item, index) => {
      const universityWorkId = getUniversityWorkId(item, index);
      const universityWorkName = getUniversityWorkName(item);
      const splitRows = getUniversityWorkSplitRows(item).filter(isActiveRow);

      let splits = splitRows
        .map((split, splitIndex) => {
          const type = detectSplitType(split);
          const percent = getSplitPercent(split);

          return {
            id: String(
              split.id ??
                split.ID ??
                split.splitGroupId ??
                split.split_group_id ??
                split.SplitGroupID ??
                `${universityWorkId}-split-${splitIndex}`,
            ),
            label: getSplitDisplayLabel(split, type),
            type,
            percent,
          };
        })
        .filter((split) => split.percent > 0);

      if (splits.length === 0) {
        const normalPercent = toNumber(
          item.normal ??
            item.Normal ??
            item.normalPercent ??
            item.normal_percent ??
            item.NormalPercent ??
            item.bachelorNormal ??
            item.bachelor_normal ??
            item.BachelorNormal,
        );

        const specialPercent = toNumber(
          item.special ??
            item.Special ??
            item.specialPercent ??
            item.special_percent ??
            item.SpecialPercent ??
            item.bachelorSpecial ??
            item.bachelor_special ??
            item.BachelorSpecial,
        );

        const graduatePercent = toNumber(
          item.graduate ??
            item.Graduate ??
            item.graduatePercent ??
            item.graduate_percent ??
            item.GraduatePercent,
        );

        if (normalPercent > 0) {
          splits.push({
            id: `${universityWorkId}-normal`,
            label: "ป.ตรี (ปกติ)",
            type: "normal",
            percent: normalPercent,
          });
        }

        if (specialPercent > 0) {
          splits.push({
            id: `${universityWorkId}-special`,
            label: "ป.ตรี (พิเศษ)",
            type: "special",
            percent: specialPercent,
          });
        }

        if (graduatePercent > 0) {
          splits.push({
            id: `${universityWorkId}-graduate`,
            label: "บัณฑิต",
            type: "graduate",
            percent: graduatePercent,
          });
        }
      }

      if (splits.length === 0) {
        const defaultPercent = getUniversityWorkDefaultPercent(item);

        if (defaultPercent > 0) {
          splits = [
            {
              id: `${universityWorkId}-default`,
              label: "ป.ตรี (ปกติ)",
              type: "normal",
              percent: defaultPercent,
            },
          ];
        }
      }

      return {
        universityWorkId,
        universityWorkName,
        splits,
      };
    })
    .filter((item) => item.splits.length > 0);
}

function findPercentByProjectType(
  universityWork: UniversityWorkColumn,
  projectType: ProjectType,
) {
  const exact = universityWork.splits.find((split) => split.type === projectType);
  if (exact) return exact.percent;

  const normal = universityWork.splits.find((split) => split.type === "normal");
  if (normal) return normal.percent;

  return universityWork.splits[0]?.percent || 0;
}

function calculateStep6Courses(
  courses: Step5Course[],
  universityWorks: UniversityWorkColumn[],
): CalculatedStep6Course[] {
  return (courses || []).map((course) => {
    const latestRemainingAmount = toNumber(course.remainingAmount);
    const projectType = getCourseProjectType(course);

    const universityWorkDeductions: UniversityWorkDeduct[] = universityWorks.map(
      (universityWork) => {
        const percent = findPercentByProjectType(universityWork, projectType);
        const amount = (latestRemainingAmount * percent) / 100;

        return {
          universityWorkId: universityWork.universityWorkId,
          universityWorkName: universityWork.universityWorkName,
          percent,
          amount,
        };
      },
    );

    const totalUniversityWorkDeductAmount = universityWorkDeductions.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const remainingAmount =
      latestRemainingAmount - totalUniversityWorkDeductAmount;

    return {
      courseId: course.courseId,
      courseName: course.courseName,
      shortName: course.shortName,
      sectionTitle: course.sectionTitle || "-",
      projectType,
      latestRemainingAmount,
      universityWorkDeductions,
      totalUniversityWorkDeductAmount,
      remainingAmount,
    };
  });
}

function groupCalculatedCourses(rows: CalculatedStep6Course[]): SectionGroup[] {
  const map = new Map<string, CalculatedStep6Course[]>();

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

    const totalUniversityWorkDeductAmount = sectionRows.reduce(
      (sum, row) => sum + row.totalUniversityWorkDeductAmount,
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
      totalUniversityWorkDeductAmount,
      totalRemainingAmount,
    };
  });
}

export default function BudgetSummaryStep6() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 5;

  const [loading, setLoading] = useState(false);
  const [universityWorks, setUniversityWorks] = useState<UniversityWorkItem[]>(
    [],
  );

  const summaryType: SummaryType = locationState.summaryType || "yearly";

  const step5Courses = useMemo(() => {
    return locationState.step5?.courses || [];
  }, [locationState.step5?.courses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await GetDataUniversityWork();
        const universityWorkList = pickArrayFromResponse(response);

        console.log("STEP6 GetDataUniversityWork response:", response);
        console.log("STEP6 normalized universityWorkList:", universityWorkList);

        setUniversityWorks(universityWorkList);
      } catch (error: any) {
        console.error("Error loading university works for step6:", error);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error?.message || "ไม่สามารถดึงข้อมูลบริหารงานวิทยาลัยได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedUniversityWorks = useMemo(() => {
    return normalizeUniversityWorks(universityWorks);
  }, [universityWorks]);

  const calculatedCourses = useMemo(() => {
    const rows = calculateStep6Courses(
      step5Courses,
      normalizedUniversityWorks,
    );

    console.log("STEP6 normalizedUniversityWorks:", normalizedUniversityWorks);
    console.log("STEP6 calculatedCourses:", rows);

    return rows;
  }, [step5Courses, normalizedUniversityWorks]);

  const groups = useMemo(() => {
    return groupCalculatedCourses(calculatedCourses);
  }, [calculatedCourses]);

  const totalUniversityWorkDeductAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.totalUniversityWorkDeductAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalRemainingAmount = useMemo(() => {
    return calculatedCourses.reduce((sum, row) => sum + row.remainingAmount, 0);
  }, [calculatedCourses]);

  const handleBack = () => {
    navigate("/annual-budget-summary/step5", {
      state: locationState,
    });
  };

  const handleNext = () => {
    navigate("/annual-budget-summary/step7", {
      state: {
        ...locationState,
        summaryType,
        step6: {
          universityWorks: normalizedUniversityWorks,
          courses: calculatedCourses,
          totalUniversityWorkDeductAmount,
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
              ? `แบบแยกภาคการศึกษา / ${
                  locationState.selectedSemesterName || "-"
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
                  height: `${
                    (currentStep / (SIDEBAR_STEPS.length - 1)) * 100
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
                รายละเอียดการหักบริหารงานวิทยาลัย
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
            ) : normalizedUniversityWorks.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลบริหารงานวิทยาลัย
              </div>
            ) : (
              <div className="p-7 space-y-8 min-w-0">
                <div className="space-y-5 max-w-full">
                  {normalizedUniversityWorks.map((universityWork) => (
                    <div
                      key={universityWork.universityWorkId}
                      className="min-w-0 space-y-3 border-b border-gray-100 pb-5 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-sm font-bold text-gray-800">
                        {universityWork.universityWorkName}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {universityWork.splits.map((split) => (
                          <div
                            key={split.id}
                            className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 text-sm font-semibold text-gray-700 break-words">
                                {split.label}
                              </div>

                              <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-base font-bold text-blue-600">
                                {formatMoney(split.percent)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {groups.map((group) => (
                  <div key={group.sectionTitle} className="space-y-3 min-w-0">
                    <div className="text-sm font-semibold text-gray-500">
                      {group.sectionTitle}
                    </div>

                    <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
                      <table className="w-full min-w-[760px] table-fixed text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600">
                            <th className="w-[260px] px-3 py-4 text-left font-semibold whitespace-nowrap">
                              หลักสูตร
                            </th>

                            <th className="w-[170px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือล่าสุด
                            </th>

                            <th className="w-[170px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              บริหารงานวิทยาลัย
                            </th>

                            <th className="w-[160px] px-3 py-4 text-right font-semibold whitespace-nowrap">
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

                              <td className="px-3 py-4 text-right text-blue-600 font-bold whitespace-nowrap">
                                {formatMoney(row.totalUniversityWorkDeductAmount)}
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

                            <td className="px-3 py-4 text-right font-bold text-blue-600 whitespace-nowrap">
                              {formatMoney(group.totalUniversityWorkDeductAmount)}
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
                      รวมเงินหักบริหารงานวิทยาลัย
                    </span>

                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      {formatMoney(totalUniversityWorkDeductAmount)} บาท
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