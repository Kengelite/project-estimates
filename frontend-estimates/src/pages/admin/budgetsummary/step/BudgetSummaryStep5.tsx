import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataCentral } from "../../../../fetchapi/fetch_api_admin";

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

type CentralSplitItem = {
  id?: string;
  ID?: string;

  centralId?: string;
  central_id?: string;
  CentralID?: string;

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

type CentralItem = {
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

  centralSplits?: CentralSplitItem[];
  central_splits?: CentralSplitItem[];
  CentralSplits?: CentralSplitItem[];
  splits?: CentralSplitItem[];
  Splits?: CentralSplitItem[];
  details?: CentralSplitItem[];
  Details?: CentralSplitItem[];

  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;
};

type Step4Fund = {
  id?: string;
  fundId?: string;
  name?: string;
  fundName?: string;
  label?: string;
  percent?: number;
};

type Step4Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;

  projectType?: ProjectType | string;

  latestRemainingAmount?: number;
  totalFundDeductAmount?: number;
  remainingAmount: number;

  fundDeductions?: any[];
};

type CentralColumn = {
  centralId: string;
  centralName: string;
  splits: {
    id: string;
    label: string;
    type: ProjectType;
    percent: number;
  }[];
};

type CentralDeduct = {
  centralId: string;
  centralName: string;
  percent: number;
  amount: number;
};

type CalculatedStep5Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  projectType: ProjectType;
  latestRemainingAmount: number;
  centralDeductions: CentralDeduct[];
  totalCentralDeductAmount: number;
  remainingAmount: number;
};

type SectionGroup = {
  sectionTitle: string;
  rows: CalculatedStep5Course[];
  totalLatestRemainingAmount: number;
  totalCentralColumns: number[];
  totalCentralDeductAmount: number;
  totalRemainingAmount: number;
};

type LocationState = {
  summaryType?: SummaryType;
  selectedSemesterId?: number | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];

  step2?: any;
  step3?: any;

  step4?: {
    funds?: Step4Fund[];
    courses?: Step4Course[];
    totalFundDeductAmount?: number;
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

function formatMinusMoney(value: number) {
  const amount = Number(value || 0);
  if (amount <= 0) return "0";
  return `-${formatMoney(amount)}`;
}

function normalizeText(value: any) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[().\-_/]/g, "")
    .trim();
}

function pickArrayFromResponse(response: any): CentralItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.centrals)) return response.centrals;
  if (Array.isArray(response?.Centrals)) return response.Centrals;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.centrals)) return response.data.centrals;

  return [];
}

function isActiveRow(row: AnyObject) {
  const deletedAt = row.deletedAt ?? row.deleted_at ?? row.DeletedAt ?? null;
  if (deletedAt) return false;

  const status = String(row.status ?? row.Status ?? "1");
  return status !== "0" && status !== "false";
}

function getCentralId(central: CentralItem, index: number) {
  return String(central.id ?? central.ID ?? `central-${index + 1}`);
}

function getCentralName(central: CentralItem) {
  return String(central.name ?? central.Name ?? "-");
}

function getCentralDefaultPercent(central: CentralItem) {
  return toNumber(
    central.pct_split ??
      central.pctSplit ??
      central.PctSplit ??
      central.percent ??
      central.Percent,
  );
}

function getCentralSplitRows(central: CentralItem) {
  return (
    central.centralSplits ||
    central.central_splits ||
    central.CentralSplits ||
    central.splits ||
    central.Splits ||
    central.details ||
    central.Details ||
    []
  );
}

function getSplitGroupObject(split: CentralSplitItem) {
  return split.splitGroup || split.split_group || split.SplitGroup || {};
}

function getSplitGroupName(split: CentralSplitItem) {
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

function getSplitPercent(split: CentralSplitItem) {
  return toNumber(
    split.pct_split ??
      split.pctSplit ??
      split.PctSplit ??
      split.percent ??
      split.Percent,
  );
}

function getSplitRawLabel(split: CentralSplitItem) {
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

function detectSplitType(split: CentralSplitItem): ProjectType {
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

function getSplitDisplayLabel(split: CentralSplitItem, type: ProjectType) {
  const rawLabel = getSplitRawLabel(split);
  if (rawLabel) return rawLabel;

  if (type === "special") return "ป.ตรี (พิเศษ)";
  if (type === "graduate") return "บัณฑิต";
  return "ป.ตรี (ปกติ)";
}

function getCourseProjectType(course: Step4Course): ProjectType {
  if (course.projectType) {
    return detectProjectTypeFromText(course.projectType);
  }

  return detectProjectTypeFromText(course.sectionTitle);
}

function normalizeCentrals(centrals: CentralItem[]): CentralColumn[] {
  return (centrals || [])
    .filter(isActiveRow)
    .map((central, centralIndex) => {
      const centralId = getCentralId(central, centralIndex);
      const centralName = getCentralName(central);
      const splitRows = getCentralSplitRows(central).filter(isActiveRow);

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
                `${centralId}-split-${splitIndex}`,
            ),
            label: getSplitDisplayLabel(split, type),
            type,
            percent,
          };
        })
        .filter((split) => split.percent > 0);

      if (splits.length === 0) {
        const normalPercent = toNumber(
          central.normal ??
            central.Normal ??
            central.normalPercent ??
            central.normal_percent ??
            central.NormalPercent ??
            central.bachelorNormal ??
            central.bachelor_normal ??
            central.BachelorNormal,
        );

        const specialPercent = toNumber(
          central.special ??
            central.Special ??
            central.specialPercent ??
            central.special_percent ??
            central.SpecialPercent ??
            central.bachelorSpecial ??
            central.bachelor_special ??
            central.BachelorSpecial,
        );

        const graduatePercent = toNumber(
          central.graduate ??
            central.Graduate ??
            central.graduatePercent ??
            central.graduate_percent ??
            central.GraduatePercent,
        );

        if (normalPercent > 0) {
          splits.push({
            id: `${centralId}-normal`,
            label: "ป.ตรี (ปกติ)",
            type: "normal",
            percent: normalPercent,
          });
        }

        if (specialPercent > 0) {
          splits.push({
            id: `${centralId}-special`,
            label: "ป.ตรี (พิเศษ)",
            type: "special",
            percent: specialPercent,
          });
        }

        if (graduatePercent > 0) {
          splits.push({
            id: `${centralId}-graduate`,
            label: "บัณฑิต",
            type: "graduate",
            percent: graduatePercent,
          });
        }
      }

      if (splits.length === 0) {
        const defaultPercent = getCentralDefaultPercent(central);

        if (defaultPercent > 0) {
          splits = [
            {
              id: `${centralId}-default`,
              label: "ป.ตรี (ปกติ)",
              type: "normal",
              percent: defaultPercent,
            },
          ];
        }
      }

      return {
        centralId,
        centralName,
        splits,
      };
    })
    .filter((central) => central.splits.length > 0);
}

function findPercentByProjectType(
  central: CentralColumn,
  projectType: ProjectType,
) {
  const exact = central.splits.find((split) => split.type === projectType);
  if (exact) return exact.percent;

  const normal = central.splits.find((split) => split.type === "normal");
  if (normal) return normal.percent;

  return central.splits[0]?.percent || 0;
}

function calculateStep5Courses(
  courses: Step4Course[],
  centrals: CentralColumn[],
): CalculatedStep5Course[] {
  return (courses || []).map((course) => {
    const latestRemainingAmount = toNumber(course.remainingAmount);
    const projectType = getCourseProjectType(course);

    const centralDeductions: CentralDeduct[] = centrals.map((central) => {
      const percent = findPercentByProjectType(central, projectType);
      const amount = (latestRemainingAmount * percent) / 100;

      return {
        centralId: central.centralId,
        centralName: central.centralName,
        percent,
        amount,
      };
    });

    const totalCentralDeductAmount = centralDeductions.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const remainingAmount = latestRemainingAmount - totalCentralDeductAmount;

    return {
      courseId: course.courseId,
      courseName: course.courseName,
      shortName: course.shortName,
      sectionTitle: course.sectionTitle || "-",
      projectType,
      latestRemainingAmount,
      centralDeductions,
      totalCentralDeductAmount,
      remainingAmount,
    };
  });
}

function groupCalculatedCourses(
  rows: CalculatedStep5Course[],
  centralLength: number,
): SectionGroup[] {
  const map = new Map<string, CalculatedStep5Course[]>();

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

    const totalCentralColumns = Array.from({ length: centralLength }).map(
      (_, centralIndex) => {
        return sectionRows.reduce((sum, row) => {
          return sum + toNumber(row.centralDeductions[centralIndex]?.amount);
        }, 0);
      },
    );

    const totalCentralDeductAmount = sectionRows.reduce(
      (sum, row) => sum + row.totalCentralDeductAmount,
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
      totalCentralColumns,
      totalCentralDeductAmount,
      totalRemainingAmount,
    };
  });
}

export default function BudgetSummaryStep5() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 4;

  const [loading, setLoading] = useState(false);
  const [centrals, setCentrals] = useState<CentralItem[]>([]);

  const summaryType: SummaryType = locationState.summaryType || "yearly";

  const step4Courses = useMemo(() => {
    return locationState.step4?.courses || [];
  }, [locationState.step4?.courses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await GetDataCentral();
        const centralList = pickArrayFromResponse(response);

        console.log("STEP5 GetDataCentral response:", response);
        console.log("STEP5 normalized centralList:", centralList);

        setCentrals(centralList);
      } catch (error: any) {
        console.error("Error loading centrals for step5:", error);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error?.message || "ไม่สามารถดึงข้อมูลบริหารส่วนกลางวิทยาลัยได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedCentrals = useMemo(() => {
    return normalizeCentrals(centrals);
  }, [centrals]);

  const calculatedCourses = useMemo(() => {
    const rows = calculateStep5Courses(step4Courses, normalizedCentrals);

    console.log("STEP5 normalizedCentrals:", normalizedCentrals);
    console.log("STEP5 calculatedCourses:", rows);

    return rows;
  }, [step4Courses, normalizedCentrals]);

  const groups = useMemo(() => {
    return groupCalculatedCourses(calculatedCourses, normalizedCentrals.length);
  }, [calculatedCourses, normalizedCentrals.length]);

  const totalCentralDeductAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.totalCentralDeductAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalRemainingAmount = useMemo(() => {
    return calculatedCourses.reduce((sum, row) => sum + row.remainingAmount, 0);
  }, [calculatedCourses]);

  const tableMinWidth = useMemo(() => {
    const baseWidth = 230 + 160 + 150 + 150;
    const centralWidth = normalizedCentrals.length * 155;

    return Math.max(900, baseWidth + centralWidth);
  }, [normalizedCentrals.length]);

  const handleBack = () => {
    navigate("/annual-budget-summary/step4", {
      state: locationState,
    });
  };

  const handleNext = () => {
    navigate("/annual-budget-summary/step6", {
      state: {
        ...locationState,
        summaryType,
        step5: {
          centrals: normalizedCentrals,
          courses: calculatedCourses,
          totalCentralDeductAmount,
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
                รายละเอียดการหักบริหารส่วนกลางวิทยาลัย
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
            ) : normalizedCentrals.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลบริหารส่วนกลางวิทยาลัย
              </div>
            ) : (
              <div className="p-7 space-y-8 min-w-0">
                <div className="space-y-5 max-w-full">
                  {normalizedCentrals.map((central) => (
                    <div
                      key={central.centralId}
                      className="min-w-0 space-y-3 border-b border-gray-100 pb-5 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-sm font-bold text-gray-800">
                        {central.centralName}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {central.splits.map((split) => (
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
                      <table
                        className="w-full table-fixed text-sm"
                        style={{ minWidth: `${tableMinWidth}px` }}
                      >
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600">
                            <th className="w-[230px] px-3 py-4 text-left font-semibold whitespace-nowrap">
                              หลักสูตร
                            </th>

                            <th className="w-[160px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือล่าสุด
                            </th>

                            {normalizedCentrals.map((central) => (
                              <th
                                key={central.centralId}
                                className="w-[155px] px-3 py-4 text-right font-semibold whitespace-nowrap"
                              >
                                {central.centralName}
                              </th>
                            ))}

                            <th className="w-[150px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              รวมทั้งหมด
                            </th>

                            <th className="w-[150px] px-3 py-4 text-right font-semibold whitespace-nowrap">
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
                              <td className="w-[230px] max-w-[230px] px-3 py-4 text-gray-800 align-top">
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

                              {row.centralDeductions.map((deduct) => (
                                <td
                                  key={deduct.centralId}
                                  className="px-3 py-4 text-right text-red-500 font-semibold whitespace-nowrap"
                                >
                                  {formatMinusMoney(deduct.amount)}
                                </td>
                              ))}

                              <td className="px-3 py-4 text-right text-red-500 font-bold whitespace-nowrap">
                                {formatMinusMoney(row.totalCentralDeductAmount)}
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

                            {group.totalCentralColumns.map((amount, index) => (
                              <td
                                key={`total-central-${index}`}
                                className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap"
                              >
                                {formatMinusMoney(amount)}
                              </td>
                            ))}

                            <td className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap">
                              {formatMinusMoney(group.totalCentralDeductAmount)}
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
                      รวมเงินหักบริหารส่วนกลางวิทยาลัย
                    </span>

                    <span className="text-xl font-bold text-red-500 whitespace-nowrap">
                      {formatMinusMoney(totalCentralDeductAmount)} บาท
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