import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  GetDataCourse,
  GetDataDegreeLevel,
  GetDataYear,
} from "../../../../fetchapi/fetch_api_admin";

type SummaryType = "yearly" | "semester";
type ProjectType = "normal" | "special" | "graduate";

type LocationState = {
  yearId?: string | number | null;
  selectedYearId?: string | number | null;
  selectedYear?: YearItem | null;

  summaryType?: SummaryType;
  selectedSemesterId?: string | number | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];
};

type YearItem = {
  id: string;
  year: string;
  name?: string;
  status?: string | number;
};

type DegreeLevelItem = {
  id: string;
  name: string;
  shortName?: string;
  sectionId?: string | number;
  sectionName?: string;
  status?: string | number;
};

type CourseStudentItem = {
  id?: string;
  courseId?: string;
  course_id?: string;

  yearId?: string | number;
  year_id?: string | number;
  year?: string | number | { id?: string | number; year?: string | number };

  studentAmount?: number | string;
  student_amount?: number | string;
  studentCount?: number | string;
  student_count?: number | string;
  count?: number | string;
  amount?: number | string;
  total?: number | string;

  status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
};

type CourseItem = {
  id?: string;
  ID?: string;

  degreeLevelId?: string | number;
  degree_level_id?: string | number;
  degreeLevelName?: string;
  degree_level_name?: string;

  degreeLevel?: DegreeLevelRelation;
  degree_level?: DegreeLevelRelation;

  name?: string;
  Name?: string;
  nameTh?: string;
  nameTH?: string;
  name_th?: string;
  nameEn?: string;
  nameEN?: string;
  name_en?: string;

  shortName?: string;
  short_name?: string;

  status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;

  students?: CourseStudentItem[];
  courseStudents?: CourseStudentItem[];
  course_students?: CourseStudentItem[];
  CourseStudents?: CourseStudentItem[];
};

type DegreeLevelRelation = {
  id?: string | number;
  ID?: string | number;

  name?: string;
  degreeLevelName?: string;
  degree_level_name?: string;
  levelName?: string;
  level_name?: string;

  shortName?: string;
  short_name?: string;

  sectionId?: string | number;
  section_id?: string | number;
  sectionName?: string;
  section_name?: string;

  section?: {
    id?: string | number;
    ID?: string | number;
    sectionName?: string;
    section_name?: string;
    name?: string;
  };
};

type CourseYearOption = {
  yearId: string;
  year: string;
  studentCount: number;
  value: string;
  label: string;
};

type CourseRow = {
  id: string;
  name: string;
  shortName: string;
  degreeLevelId: string;
  degreeLevelName: string;
  sectionName: string;
  sectionTitle: string;
  projectType: ProjectType;
  years: CourseYearOption[];
};

type DegreeSection = {
  id: string;
  title: string;
  degreeLevelName: string;
  sectionName: string;
  courses: CourseRow[];
};

type CourseSelectState = {
  selected: boolean;
  years: string[];
  risk: string;
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

const RISK_OPTIONS = ["0 %", "1 %", "3 %", "5 %"];

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/,/g, "").replace("%", "").trim();
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[().\-_/]/g, "")
    .trim();
}

function pickArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function isActiveRow(row: any) {
  const deletedAt = row?.deletedAt ?? row?.deleted_at ?? row?.DeletedAt ?? null;
  if (deletedAt) return false;

  const status = String(row?.status ?? row?.Status ?? "1");
  return status !== "0" && status !== "false";
}

function mapYearOption(item: any): YearItem {
  return {
    id: String(item?.id ?? item?.ID ?? item?.yearId ?? item?.year_id ?? ""),
    year: String(item?.year ?? item?.name ?? item?.Name ?? ""),
    name: String(item?.name ?? item?.Name ?? item?.year ?? ""),
    status: item?.status ?? item?.Status ?? "1",
  };
}

function mapDegreeLevelOption(item: any): DegreeLevelItem {
  const section = item?.section || item?.Section || {};

  return {
    id: String(item?.id ?? item?.ID ?? item?.degreeLevelId ?? item?.degree_level_id ?? ""),
    name: String(
      item?.name ??
        item?.Name ??
        item?.degreeLevelName ??
        item?.degree_level_name ??
        item?.levelName ??
        item?.level_name ??
        "",
    ),
    shortName: String(item?.shortName ?? item?.short_name ?? ""),
    sectionId: item?.sectionId ?? item?.section_id ?? section?.id ?? section?.ID ?? "",
    sectionName: String(
      item?.sectionName ??
        item?.section_name ??
        section?.sectionName ??
        section?.section_name ??
        section?.name ??
        "",
    ),
    status: item?.status ?? item?.Status ?? "1",
  };
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

function findYearById(years: YearItem[], id: any) {
  if (id === null || id === undefined || id === "") return null;
  return years.find((item) => String(item.id) === String(id)) || null;
}

function findYearByYearName(years: YearItem[], yearName: any) {
  if (yearName === null || yearName === undefined || yearName === "") return null;
  return years.find((item) => String(item.year) === String(yearName)) || null;
}

function getCourseId(course: CourseItem) {
  return String(course.id ?? course.ID ?? "");
}

function getCourseName(course: CourseItem) {
  return String(
    course.nameTh ||
      course.nameTH ||
      course.name_th ||
      course.name ||
      course.Name ||
      course.nameEn ||
      course.nameEN ||
      course.name_en ||
      "",
  );
}

function getCourseShortName(course: CourseItem) {
  return String(course.shortName || course.short_name || getCourseName(course));
}

function getCourseDegreeLevelId(course: CourseItem) {
  return String(
    course.degreeLevelId ||
      course.degree_level_id ||
      course.degreeLevel?.id ||
      course.degreeLevel?.ID ||
      course.degree_level?.id ||
      course.degree_level?.ID ||
      "",
  );
}

function getCourseDegreeLevelName(course: CourseItem) {
  return String(
    course.degreeLevelName ||
      course.degree_level_name ||
      course.degreeLevel?.degreeLevelName ||
      course.degreeLevel?.degree_level_name ||
      course.degreeLevel?.levelName ||
      course.degreeLevel?.level_name ||
      course.degreeLevel?.name ||
      course.degree_level?.degreeLevelName ||
      course.degree_level?.degree_level_name ||
      course.degree_level?.levelName ||
      course.degree_level?.level_name ||
      course.degree_level?.name ||
      "",
  );
}

function getCourseDegreeSectionName(course: CourseItem) {
  return String(
    course.degreeLevel?.sectionName ||
      course.degreeLevel?.section_name ||
      course.degreeLevel?.section?.sectionName ||
      course.degreeLevel?.section?.section_name ||
      course.degreeLevel?.section?.name ||
      course.degree_level?.sectionName ||
      course.degree_level?.section_name ||
      course.degree_level?.section?.sectionName ||
      course.degree_level?.section?.section_name ||
      course.degree_level?.section?.name ||
      "",
  );
}

function getCourseStudentRows(course: CourseItem) {
  return (
    course.courseStudents ||
    course.course_students ||
    course.CourseStudents ||
    course.students ||
    []
  );
}

function getStudentYearId(item: CourseStudentItem) {
  const yearObj = typeof item.year === "object" ? item.year : null;

  return String(
    item.yearId ??
      item.year_id ??
      yearObj?.id ??
      "",
  );
}

function getStudentYearName(item: CourseStudentItem) {
  const yearObj = typeof item.year === "object" ? item.year : null;

  return String(
    yearObj?.year ??
      item.year ??
      item.yearId ??
      item.year_id ??
      "",
  );
}

function getStudentAmount(item: CourseStudentItem) {
  return toNumber(
    item.studentAmount ??
      item.student_amount ??
      item.studentCount ??
      item.student_count ??
      item.count ??
      item.amount ??
      item.total,
  );
}

function getSectionTitle(degreeLevelName: string, sectionName: string) {
  const text = normalizeText(`${degreeLevelName} ${sectionName}`);

  if (
    text.includes("graduate") ||
    text.includes("บัณฑิต") ||
    text.includes("ปโท") ||
    text.includes("ปเอก") ||
    text.includes("โท") ||
    text.includes("เอก")
  ) {
    return "บัณฑิต";
  }

  if (
    text.includes("special") ||
    text.includes("พิเศษ") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("โครงการพิเศษ")
  ) {
    return "ปริญญาตรี (โครงการพิเศษ)";
  }

  return "ปริญญาตรี (โครงการปกติ)";
}

function detectProjectType(sectionTitle: string, degreeLevelName = ""): ProjectType {
  const text = normalizeText(`${sectionTitle} ${degreeLevelName}`);

  if (
    text.includes("graduate") ||
    text.includes("บัณฑิต") ||
    text.includes("ปโท") ||
    text.includes("ปเอก") ||
    text.includes("โท") ||
    text.includes("เอก")
  ) {
    return "graduate";
  }

  if (
    text.includes("special") ||
    text.includes("พิเศษ") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("โครงการพิเศษ")
  ) {
    return "special";
  }

  return "normal";
}

function buildCourseYears(course: CourseItem, years: YearItem[]) {
  const rows = getCourseStudentRows(course).filter(isActiveRow);

  const options = rows
    .map((studentRow) => {
      const yearId = getStudentYearId(studentRow);
      const matchedYear = years.find((year) => String(year.id) === String(yearId));
      const yearName = matchedYear?.year || getStudentYearName(studentRow);
      const studentCount = getStudentAmount(studentRow);

      return {
        yearId,
        year: yearName,
        studentCount,
        value: yearId || yearName,
        label: `${yearName} (${formatNumber(studentCount)} คน)`,
      };
    })
    .filter((item) => item.value && item.studentCount > 0);

  const unique = new Map<string, CourseYearOption>();
  options.forEach((item) => unique.set(item.value, item));

  return Array.from(unique.values()).sort((a, b) =>
    String(a.year).localeCompare(String(b.year), "th"),
  );
}

function getBudgetYearIdFromState(
  state: LocationState,
  years: YearItem[],
  selectedCourses: any[],
) {
  const direct =
    state.yearId ??
    state.selectedYearId ??
    state.selectedYear?.id ??
    (state.selectedYear as any)?.yearId ??
    (state as any).idYear ??
    (state as any).id_year ??
    (state as any).year?.id ??
    (state as any).year?.yearId ??
    (state as any).year?.ID ??
    null;

  if (direct !== null && direct !== undefined && String(direct) !== "") {
    return String(direct);
  }

  const yearName =
    state.selectedYear?.year ??
    state.selectedYear?.name ??
    (state as any).year?.year ??
    (state as any).year?.name ??
    null;

  const matchedFromName = findYearByYearName(years, yearName);
  if (matchedFromName) return String(matchedFromName.id);

  const storageKeys = [
    "annualBudgetSummaryYear",
    "selectedYear",
    "year",
    "budgetSummaryYear",
    "currentYear",
    "academicYear",
    "selectedAcademicYear",
  ];

  for (const key of storageKeys) {
    const data = getStoredJSON(key);

    const id =
      data?.id ??
      data?.ID ??
      data?.yearId ??
      data?.year_id ??
      data?.idYear ??
      data?.id_year ??
      data?.year?.id ??
      data?.year?.yearId ??
      data?.year?.ID ??
      null;

    if (id !== null && id !== undefined && String(id) !== "") {
      return String(id);
    }

    const storedYearName =
      data?.year ?? data?.name ?? data?.year?.year ?? data?.year?.name;
    const matched = findYearByYearName(years, storedYearName);
    if (matched) return String(matched.id);
  }

  const selectedYearIds = selectedCourses
    .flatMap((course: any) => course?.years || [])
    .map((year: any) => Number(year?.yearId))
    .filter((value: number) => Number.isFinite(value) && value > 0);

  if (selectedYearIds.length > 0) {
    return String(Math.max(...selectedYearIds));
  }

  return "";
}

function getBudgetYearData(years: YearItem[], yearId: string) {
  const matched = findYearById(years, yearId);
  if (matched) return matched;

  return {
    id: yearId,
    year: String(yearId),
    name: String(yearId),
    status: "1",
  };
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
        checked
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-transparent hover:border-blue-400"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
}

export default function BudgetSummaryStep1() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 0;

  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<YearItem[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevelItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const [selectedYearId, setSelectedYearId] = useState<string>(
    String(
      locationState.yearId ||
        locationState.selectedYearId ||
        locationState.selectedYear?.id ||
        "",
    ),
  );

  const [summaryType, setSummaryType] = useState<SummaryType>(
    locationState.summaryType || "yearly",
  );

  const [selectedSemesterId, setSelectedSemesterId] = useState<
    string | number | null
  >(locationState.selectedSemesterId ?? null);

  const [selectedSemesterName, setSelectedSemesterName] = useState<string | null>(
    locationState.selectedSemesterName ?? null,
  );

  const [courseSelects, setCourseSelects] = useState<
    Record<string, CourseSelectState>
  >({});

  const selectedYear = useMemo(() => {
    return findYearById(years, selectedYearId);
  }, [years, selectedYearId]);

  const courseRows = useMemo<CourseRow[]>(() => {
    return courses
      .filter(isActiveRow)
      .map((course) => {
        const degreeLevelId = getCourseDegreeLevelId(course);
        const degreeFromMaster = degreeLevels.find(
          (item) => String(item.id) === String(degreeLevelId),
        );

        const degreeLevelName =
          getCourseDegreeLevelName(course) || degreeFromMaster?.name || "-";

        const sectionName =
          getCourseDegreeSectionName(course) ||
          degreeFromMaster?.sectionName ||
          "";

        const sectionTitle = getSectionTitle(degreeLevelName, sectionName);

        return {
          id: getCourseId(course),
          name: getCourseName(course),
          shortName: getCourseShortName(course),
          degreeLevelId,
          degreeLevelName,
          sectionName,
          sectionTitle,
          projectType: detectProjectType(sectionTitle, degreeLevelName),
          years: buildCourseYears(course, years),
        };
      })
      .filter((course) => course.id && course.name);
  }, [courses, degreeLevels, years]);

  const sections = useMemo<DegreeSection[]>(() => {
    const map = new Map<string, DegreeSection>();

    courseRows.forEach((course) => {
      const key = course.sectionTitle || "-";
      const old = map.get(key);

      if (old) {
        old.courses.push(course);
      } else {
        map.set(key, {
          id: key,
          title: key,
          degreeLevelName: course.degreeLevelName,
          sectionName: course.sectionName,
          courses: [course],
        });
      }
    });

    return Array.from(map.values()).map((section) => ({
      ...section,
      courses: section.courses.sort((a, b) =>
        a.name.localeCompare(b.name, "th"),
      ),
    }));
  }, [courseRows]);

  const selectedCourses = useMemo(() => {
    return courseRows
      .map((course) => {
        const select = courseSelects[course.id];
        if (!select?.selected) return null;

        const selectedYearOptions = course.years.filter((year) =>
          select.years.includes(year.value),
        );

        const totalStudentAmount = selectedYearOptions.reduce(
          (sum, year) => sum + year.studentCount,
          0,
        );

        return {
          courseId: course.id,
          id: course.id,
          courseName: course.name,
          name: course.name,
          shortName: course.shortName,
          degreeLevelId: course.degreeLevelId,
          degreeLevelName: course.degreeLevelName,
          sectionName: course.sectionName,
          sectionTitle: course.sectionTitle,
          projectType: course.projectType,

          yearId: selectedYearId,
          selectedBudgetYearId: selectedYearId,
          selectedBudgetYear: selectedYear?.year || selectedYear?.name || "",

          years: selectedYearOptions,
          selectedYears: selectedYearOptions,
          courseYears: selectedYearOptions,
          studentYears: selectedYearOptions,

          totalStudentAmount,
          studentAmount: totalStudentAmount,
          studentCount: totalStudentAmount,

          riskPercent: toNumber(select.risk),
          risk: select.risk,
        };
      })
      .filter(Boolean);
  }, [courseRows, courseSelects, selectedYearId, selectedYear]);

  const totalSelectedCourses = selectedCourses.length;

  const totalSelectedStudents = selectedCourses.reduce((sum, item: any) => {
    return sum + toNumber(item.totalStudentAmount);
  }, 0);

  const loadData = async () => {
    try {
      setLoading(true);

      const [yearResponse, degreeResponse, courseResponse] = await Promise.all([
        GetDataYear(),
        GetDataDegreeLevel(),
        GetDataCourse(),
      ]);

      const yearList = pickArrayFromResponse(yearResponse)
        .map(mapYearOption)
        .filter(isActiveRow)
        .filter((item: YearItem) => item.id);

      const degreeLevelList = pickArrayFromResponse(degreeResponse)
        .map(mapDegreeLevelOption)
        .filter(isActiveRow)
        .filter((item: DegreeLevelItem) => item.id);

      const courseList = pickArrayFromResponse(courseResponse) as CourseItem[];

      setYears(yearList);
      setDegreeLevels(degreeLevelList);
      setCourses(courseList);

      if (!selectedYearId && yearList.length > 0) {
        setSelectedYearId(yearList[yearList.length - 1].id);
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงข้อมูลได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureCourseState = (courseId: string) => {
    const old = courseSelects[courseId];

    if (old) return old;

    return {
      selected: false,
      years: [],
      risk: "0 %",
    };
  };

  const handleToggleCourse = (course: CourseRow) => {
    setCourseSelects((prev) => {
      const old = prev[course.id] || ensureCourseState(course.id);
      const nextSelected = !old.selected;

      return {
        ...prev,
        [course.id]: {
          selected: nextSelected,
          years: nextSelected ? old.years : [],
          risk: old.risk || "0 %",
        },
      };
    });
  };

  const handleToggleCourseYear = (courseId: string, yearValue: string) => {
    setCourseSelects((prev) => {
      const old = prev[courseId] || ensureCourseState(courseId);
      const exists = old.years.includes(yearValue);

      return {
        ...prev,
        [courseId]: {
          ...old,
          selected: true,
          years: exists
            ? old.years.filter((item) => item !== yearValue)
            : [...old.years, yearValue],
        },
      };
    });
  };

  const handleRiskChange = (courseId: string, risk: string) => {
    setCourseSelects((prev) => {
      const old = prev[courseId] || ensureCourseState(courseId);

      return {
        ...prev,
        [courseId]: {
          ...old,
          selected: true,
          risk,
        },
      };
    });
  };

  const handleSelectAllInSection = (section: DegreeSection) => {
    const allSelected = section.courses.every((course) => {
      return courseSelects[course.id]?.selected;
    });

    setCourseSelects((prev) => {
      const next = { ...prev };

      section.courses.forEach((course) => {
        const old = next[course.id] || ensureCourseState(course.id);

        next[course.id] = {
          ...old,
          selected: !allSelected,
          years: !allSelected ? old.years : [],
          risk: old.risk || "0 %",
        };
      });

      return next;
    });
  };

  const handleNext = async () => {
    if (!selectedYearId) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่พบปีงบประมาณ",
        text: "กรุณาเลือกปีงบประมาณก่อนดำเนินการต่อ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (summaryType === "semester" && !selectedSemesterId) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่พบภาคการศึกษา",
        text: "กรุณาเลือกภาคการศึกษาก่อนดำเนินการต่อ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (selectedCourses.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกหลักสูตร",
        text: "กรุณาเลือกหลักสูตรอย่างน้อย 1 หลักสูตร",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const invalidCourse = selectedCourses.find((course: any) => {
      return !course.selectedYears || course.selectedYears.length === 0;
    });

    if (invalidCourse) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกชั้นปี/ปีนักศึกษา",
        text: `กรุณาเลือกปีนักศึกษาของหลักสูตร ${
          invalidCourse.shortName || invalidCourse.courseName
        }`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const budgetYearId =
      selectedYearId || getBudgetYearIdFromState(locationState, years, selectedCourses);

    if (!budgetYearId) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่พบปีงบประมาณ",
        text: "กรุณาเลือกปีงบประมาณก่อนดำเนินการต่อ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const budgetYear = getBudgetYearData(years, String(budgetYearId));

    const nextState = {
      ...locationState,
      yearId: String(budgetYearId),
      selectedYearId: String(budgetYearId),
      selectedYear: budgetYear,
      summaryType,
      selectedSemesterId,
      selectedSemesterName,
      selectedCourses: selectedCourses.map((course: any) => ({
        ...course,
        yearId: String(budgetYearId),
        selectedBudgetYearId: String(budgetYearId),
        selectedBudgetYear: budgetYear.year,
      })),
    };

    sessionStorage.setItem(
      "annualBudgetSummaryYear",
      JSON.stringify({
        id: String(budgetYearId),
        yearId: String(budgetYearId),
        year: budgetYear.year,
        name: budgetYear.name || budgetYear.year,
      }),
    );

    console.log("STEP1 nextState:", nextState);

    navigate("/annual-budget-summary/step2", {
      state: nextState,
    });
  };

  const handleBack = () => {
    navigate("/annual-budget-summary", {
      state: locationState,
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
              ? `แบบแยกภาคการศึกษา / ${selectedSemesterName || "-"}`
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
                  height: `${(currentStep / (SIDEBAR_STEPS.length - 1)) * 100}%`,
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

        <div className="min-w-0 w-full space-y-6">
          <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เลือกหลักสูตร</h2>
            </div>

            <div className="p-7 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ปีงบประมาณ <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={selectedYearId}
                    onChange={(e) => setSelectedYearId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
                  >
                    <option value="">เลือกปีงบประมาณ</option>
                    {years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.year || year.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ประเภทรายงาน
                  </label>

                  <select
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value as SummaryType)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
                  >
                    <option value="yearly">แบบรายปี</option>
                    <option value="semester">แบบแยกภาคการศึกษา</option>
                  </select>
                </div>

                {summaryType === "semester" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ภาคการศึกษา
                    </label>

                    <select
                      value={String(selectedSemesterId || "")}
                      onChange={(e) => {
                        setSelectedSemesterId(e.target.value || null);
                        const label =
                          e.target.selectedOptions?.[0]?.textContent || null;
                        setSelectedSemesterName(label);
                      }}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
                    >
                      <option value="">เลือกภาคการศึกษา</option>
                      <option value="1">ภาคต้น</option>
                      <option value="2">ภาคปลาย</option>
                      <option value="3">ภาคฤดูร้อน</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-blue-50 px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">เลือกแล้ว</span>
                    <div className="mt-1 text-xl font-bold text-blue-600">
                      {formatNumber(totalSelectedCourses)} หลักสูตร
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">จำนวนนักศึกษารวม</span>
                    <div className="mt-1 text-xl font-bold text-blue-600">
                      {formatNumber(totalSelectedStudents)} คน
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">ปีงบประมาณ</span>
                    <div className="mt-1 text-xl font-bold text-blue-600">
                      {selectedYear?.year || selectedYear?.name || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : sections.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  ไม่พบข้อมูลหลักสูตร
                </div>
              ) : (
                <div className="space-y-7">
                  {sections.map((section) => {
                    const allSelected = section.courses.every((course) => {
                      return courseSelects[course.id]?.selected;
                    });

                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-base font-bold text-gray-800">
                            {section.title}
                          </h3>

                          <button
                            type="button"
                            onClick={() => handleSelectAllInSection(section)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                          </button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] table-fixed text-sm">
                              <colgroup>
                                <col className="w-[70px]" />
                                <col className="w-[260px]" />
                                <col className="w-[180px]" />
                                <col className="w-[330px]" />
                                <col className="w-[140px]" />
                              </colgroup>

                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                                  <th className="px-4 py-4 text-center font-semibold">
                                    เลือก
                                  </th>
                                  <th className="px-4 py-4 text-left font-semibold">
                                    หลักสูตร
                                  </th>
                                  <th className="px-4 py-4 text-left font-semibold">
                                    ประเภท
                                  </th>
                                  <th className="px-4 py-4 text-left font-semibold">
                                    ปีนักศึกษา / จำนวนคน
                                  </th>
                                  <th className="px-4 py-4 text-left font-semibold">
                                    หักความเสี่ยง
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100">
                                {section.courses.map((course) => {
                                  const select =
                                    courseSelects[course.id] ||
                                    ensureCourseState(course.id);

                                  return (
                                    <tr
                                      key={course.id}
                                      className="transition-colors hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center">
                                          <Checkbox
                                            checked={!!select.selected}
                                            onChange={() => handleToggleCourse(course)}
                                          />
                                        </div>
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        <div className="font-bold text-gray-900">
                                          {course.shortName || "-"}
                                        </div>
                                        <div className="mt-1 text-xs leading-5 text-gray-400">
                                          {course.name || "-"}
                                        </div>
                                      </td>

                                      <td className="px-4 py-4 align-top text-gray-600">
                                        {course.degreeLevelName}
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        {course.years.length === 0 ? (
                                          <span className="text-sm text-gray-400">
                                            ไม่มีข้อมูลจำนวนนักศึกษา
                                          </span>
                                        ) : (
                                          <div className="flex flex-wrap gap-2">
                                            {course.years.map((year) => {
                                              const checked = select.years.includes(
                                                year.value,
                                              );

                                              return (
                                                <button
                                                  key={year.value}
                                                  type="button"
                                                  onClick={() =>
                                                    handleToggleCourseYear(
                                                      course.id,
                                                      year.value,
                                                    )
                                                  }
                                                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                                                    checked
                                                      ? "border-blue-500 bg-blue-50 text-blue-600"
                                                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                                                  }`}
                                                >
                                                  {year.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        <select
                                          value={select.risk}
                                          onChange={(e) =>
                                            handleRiskChange(course.id, e.target.value)
                                          }
                                          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-400"
                                        >
                                          {RISK_OPTIONS.map((risk) => (
                                            <option key={risk} value={risk}>
                                              {risk}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 pb-6">
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