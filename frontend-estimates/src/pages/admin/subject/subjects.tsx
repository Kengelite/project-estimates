import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  GetDataSubject,
  DeleteDataSubject,
  GetDataYear,
  GetDataSemester,
  UpdateDataSubjectStatus,
} from "../../../fetchapi/fetch_api_admin";
import Pagination from "./Pagination";

type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

interface SubjectApiRow {
  id: string;
  subjectCourseId?: string;
  courseId: string;
  courseName: string;
  yearId: number;
  year: string;
  studentYearId: number;
  studentYear: string;
  semesterId: number;
  semester: string;
  subjectCode: string;
  subjectName: string;
  pricePerStudent?: number;
  registeredCount?: number;
  totalAmount?: number;
  totalDeductAmount?: number;
  status: string;
}

interface SubjectCourseItem {
  id: string;
  subjectCourseId?: string;
  courseId: string;
  courseName: string;
  branch: Branch;
  totalDeductAmount: number;
  active: boolean;
}

interface SubjectRow {
  id: string;
  ids: string[];
  subjectCourseIds: string[];
  code: string;
  name: string;
  year: number;
  yearId: number;
  semesterId: number;
  semesterLabel: string;
  semesterDisplay: string;
  branches: Branch[];
  active: boolean;
  courseName: string;
  totalDeductAmount: number;
  courseItems: SubjectCourseItem[];
}

interface YearOption {
  id: number;
  year: string;
  status?: string;
}

interface SemesterOption {
  id: number;
  name: string;
  status?: string;
}

const BRANCH_COLOR: Record<
  Branch,
  { bg: string; text: string; border: string }
> = {
  CS: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  ITII: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  GIS: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-300",
  },
  AI: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-300",
  },
  CY: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-300",
  },
};

const BRANCH_AVATAR: Record<Branch, string> = {
  CS: "bg-green-400",
  ITII: "bg-yellow-400",
  GIS: "bg-cyan-400",
  AI: "bg-pink-400",
  CY: "bg-orange-400",
};

const BRANCH_ORDER: Branch[] = ["CS", "ITII", "GIS", "AI", "CY"];

function fmt(n: number) {
  return Number(n || 0).toLocaleString("th-TH");
}

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function getBranchFromCourseName(courseName: string): Branch {
  const text = normalizeText(courseName);

  if (text.includes("วิทยาการคอมพิวเตอร์")) return "CS";
  if (text.includes("เทคโนโลยีสารสนเทศ")) return "ITII";
  if (text.includes("ภูมิสารสนเทศศาสตร์")) return "GIS";
  if (text.includes("ภูมิสารสนเทศ")) return "GIS";
  if (text.includes("ปัญญาประดิษฐ์")) return "AI";
  if (text.includes("ความมั่นคงปลอดภัย")) return "CY";

  return "CS";
}

function getStudyYearFromApi(row: SubjectApiRow): number {
  const raw = String(row.studentYear ?? "").trim();
  const matched = raw.match(/\d+/);
  if (matched) return Number(matched[0]);
  return Number(row.studentYearId || 0);
}

function getSemesterNo(value: string) {
  const text = String(value ?? "").trim();
  const matched = text.match(/\d+/);
  return matched?.[0] || text;
}

function getSemesterThaiName(value: string) {
  const text = normalizeText(value);

  if (text === "1" || text.includes("ต้น")) return "ภาคต้น";
  if (text === "2" || text.includes("ปลาย")) return "ภาคปลาย";
  if (text === "3" || text.includes("ฤดูร้อน") || text.includes("summer")) {
    return "ภาคฤดูร้อน";
  }

  const no = getSemesterNo(value);
  if (no === "1") return "ภาคต้น";
  if (no === "2") return "ภาคปลาย";
  if (no === "3") return "ภาคฤดูร้อน";

  return value || "-";
}

function mapYearOption(item: any): YearOption {
  return {
    id: Number(item?.id ?? item?.yearId ?? 0),
    year: String(item?.year ?? item?.name ?? ""),
    status: String(item?.status ?? "1"),
  };
}

function mapSemesterOption(item: any): SemesterOption {
  return {
    id: Number(item?.id ?? item?.semesterId ?? 0),
    name: String(item?.name ?? item?.semester ?? item?.semester_name ?? ""),
    status: String(item?.status ?? "1"),
  };
}

function buildSemesterLabel(yearText: string, semesterName: string) {
  const semesterNo = getSemesterNo(semesterName);
  if (!yearText || !semesterNo) return "";
  return `${yearText}/${semesterNo}`;
}

function buildSemesterDisplay(yearText: string, semesterName: string) {
  const label = buildSemesterLabel(yearText, semesterName);
  if (!label) return "";
  return `${label} (${getSemesterThaiName(semesterName)})`;
}

function isSpecialCourseName(courseName: string) {
  const text = normalizeText(courseName);
  return (
    text.includes("พิเศษ") ||
    text.includes("special") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("โครงการพิเศษ")
  );
}

function makeGroupKey(row: SubjectRow) {
  return [
    normalizeText(row.code).replace(/\s+/g, ""),
    normalizeText(row.name),
    row.year,
    row.yearId,
    row.semesterId,
    row.semesterLabel,
  ].join("|");
}

function sortBranches(branches: Branch[]) {
  return [...branches].sort(
    (a, b) => BRANCH_ORDER.indexOf(a) - BRANCH_ORDER.indexOf(b),
  );
}

function uniqueArray<T>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function mapApiToSubjectRow(
  row: SubjectApiRow,
  yearMap: Map<number, string>,
  semesterMap: Map<number, string>,
): SubjectRow {
  const yearText =
    String(row.year || "").trim() || yearMap.get(Number(row.yearId)) || "";
  const semesterName =
    String(row.semester || "").trim() ||
    semesterMap.get(Number(row.semesterId)) ||
    "";

  const total =
    Number(row.totalAmount ?? 0) || Number(row.totalDeductAmount ?? 0);

  const branch = getBranchFromCourseName(row.courseName);
  const active = String(row.status) === "1";

  return {
    id: row.id,
    ids: [row.id],
    subjectCourseIds: row.subjectCourseId ? [row.subjectCourseId] : [],
    code: row.subjectCode,
    name: row.subjectName,
    year: getStudyYearFromApi(row),
    yearId: Number(row.yearId),
    semesterId: Number(row.semesterId),
    semesterLabel: buildSemesterLabel(yearText, semesterName),
    semesterDisplay: buildSemesterDisplay(yearText, semesterName),
    branches: [branch],
    active,
    courseName: row.courseName,
    totalDeductAmount: total,
    courseItems: [
      {
        id: row.id,
        subjectCourseId: row.subjectCourseId,
        courseId: row.courseId,
        courseName: row.courseName,
        branch,
        totalDeductAmount: total,
        active,
      },
    ],
  };
}

function groupSubjectRows(rows: SubjectRow[]) {
  const map = new Map<string, SubjectRow>();

  rows.forEach((row) => {
    const key = makeGroupKey(row);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...row,
        ids: uniqueArray(row.ids),
        subjectCourseIds: uniqueArray(row.subjectCourseIds),
        branches: sortBranches(uniqueArray(row.branches)),
        courseItems: [...row.courseItems],
      });
      return;
    }

    const mergedCourseItems = [...existing.courseItems, ...row.courseItems];
    const mergedBranches = sortBranches(
      uniqueArray([
        ...existing.branches,
        ...row.branches,
        ...mergedCourseItems.map((item) => item.branch),
      ]),
    );

    map.set(key, {
      ...existing,
      ids: uniqueArray([...existing.ids, ...row.ids]),
      subjectCourseIds: uniqueArray([
        ...existing.subjectCourseIds,
        ...row.subjectCourseIds,
      ]),
      branches: mergedBranches,
      active: existing.active || row.active,
      totalDeductAmount:
        Number(existing.totalDeductAmount || 0) +
        Number(row.totalDeductAmount || 0),
      courseItems: mergedCourseItems,
    });
  });

  return Array.from(map.values());
}

function BranchBadge({ branch }: { branch: Branch }) {
  const c = BRANCH_COLOR[branch];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {branch}
    </span>
  );
}

function Toggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-8 w-[64px] items-center rounded-full px-1 transition-colors ${active ? "bg-emerald-500" : "bg-gray-300"
        }`}
    >
      <span
        className={`absolute text-[11px] font-bold text-white transition-all ${active ? "left-2" : "right-2"
          }`}
      >
        {active ? "เปิด" : "ปิด"}
      </span>

      <span
        className={`relative z-10 h-6 w-6 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[32px]" : "translate-x-0"
          }`}
      />
    </button>
  );
}

function SummaryCards({
  summaryData,
}: {
  summaryData: {
    branch: Branch;
    label: string;
    normal: number;
    special: number;
  }[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {summaryData.map((s) => (
        <div
          key={s.branch}
          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={`w-9 h-9 rounded-xl ${BRANCH_AVATAR[s.branch]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
            >
              {s.branch}
            </div>
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {s.label}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">โครงการปกติ</span>
              <span className="text-sm font-semibold text-gray-800">
                ฿ {fmt(s.normal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">โครงการพิเศษ</span>
              <span className="text-sm font-semibold text-gray-800">
                ฿ {fmt(s.special)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SubjectManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const loadPageData = async () => {
    try {
      setLoading(true);

      const [subjectList, yearList, semesterList] = await Promise.all([
        GetDataSubject(),
        GetDataYear(),
        GetDataSemester(),
      ]);

      const mappedYears: YearOption[] = (yearList || []).map((item: any) =>
        mapYearOption(item),
      );

      const mappedSemesters: SemesterOption[] = (semesterList || []).map(
        (item: any) => mapSemesterOption(item),
      );

      const yearMap = new Map<number, string>();
      mappedYears.forEach((item: YearOption) => {
        yearMap.set(item.id, item.year);
      });

      const semesterMap = new Map<number, string>();
      mappedSemesters.forEach((item: SemesterOption) => {
        semesterMap.set(item.id, item.name);
      });

      const mappedSubjects = (subjectList || []).map((item: SubjectApiRow) =>
        mapApiToSubjectRow(item, yearMap, semesterMap),
      );

      setYears(mappedYears);
      setSemesters(mappedSemesters);
      setSubjects(groupSubjectRows(mappedSubjects));
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลรายวิชาได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const semesterOptions = useMemo(() => {
    const activeYears = years
      .filter((item) => String(item.status ?? "1") === "1")
      .map((item) => String(item.year).trim())
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a, "th"));

    const activeSemesters = semesters
      .filter((item) => String(item.status ?? "1") === "1")
      .map((item) => ({
        id: item.id,
        name: item.name,
        no: getSemesterNo(item.name),
        thaiName: getSemesterThaiName(item.name),
      }))
      .filter((item) => item.no)
      .sort((a, b) => Number(a.no) - Number(b.no));

    const options: { value: string; label: string }[] = [];

    activeYears.forEach((year) => {
      activeSemesters.forEach((semesterItem) => {
        options.push({
          value: `${year}/${semesterItem.no}`,
          label: `${year}/${semesterItem.no} (${semesterItem.thaiName})`,
        });
      });
    });

    return options;
  }, [years, semesters]);

  useEffect(() => {
    if (semesterOptions.length === 0) {
      if (semester !== "") setSemester("");
      return;
    }

    const hasCurrentSemester = semesterOptions.some(
      (option) => option.value === semester,
    );

    if (!hasCurrentSemester) {
      setSemester(semesterOptions[0].value);
      setPage(1);
    }
  }, [semesterOptions, semester]);

  const summaryData = useMemo(() => {
    const seed: Record<
      Branch,
      { branch: Branch; label: string; normal: number; special: number }
    > = {
      CS: {
        branch: "CS",
        label: "วิทยาการคอมพิวเตอร์",
        normal: 0,
        special: 0,
      },
      ITII: {
        branch: "ITII",
        label: "เทคโนโลยีสารสนเทศ...",
        normal: 0,
        special: 0,
      },
      GIS: {
        branch: "GIS",
        label: "ภูมิสารสนเทศศาสตร์",
        normal: 0,
        special: 0,
      },
      AI: { branch: "AI", label: "ปัญญาประดิษฐ์", normal: 0, special: 0 },
      CY: {
        branch: "CY",
        label: "ความมั่นคงปลอดภัย...",
        normal: 0,
        special: 0,
      },
    };

    subjects.forEach((subject) => {
      subject.courseItems.forEach((item) => {
        if (isSpecialCourseName(item.courseName)) {
          seed[item.branch].special += Number(item.totalDeductAmount || 0);
        } else {
          seed[item.branch].normal += Number(item.totalDeductAmount || 0);
        }
      });
    });

    return Object.values(seed);
  }, [subjects]);

  const handleAddSubject = () => {
    navigate("/subjects/add");
  };

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return subjects.filter((c) => {
      const matchedSearch =
        !keyword ||
        c.name.toLowerCase().includes(keyword) ||
        c.code.toLowerCase().includes(keyword) ||
        c.branches.some((b) => b.toLowerCase().includes(keyword));

      const matchedSemester = !semester || c.semesterLabel === semester;

      return matchedSearch && matchedSemester;
    });
  }, [subjects, search, semester]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, safePage, pageSize]);

  const toggleActive = async (row: SubjectRow) => {
    const nextStatus = row.active ? "0" : "1";

    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${nextStatus === "1" ? "เปิด" : "ปิด"}สถานะรายวิชานี้ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const ids = uniqueArray(row.ids);
      await Promise.all(
        ids.map((id) => UpdateDataSubjectStatus(id, { status: nextStatus })),
      );

      setSubjects((prev) =>
        prev.map((item) => {
          const hasMatchedId = item.ids.some((id) => ids.includes(id));
          if (!hasMatchedId) return item;

          return {
            ...item,
            active: nextStatus === "1",
            courseItems: item.courseItems.map((courseItem) => ({
              ...courseItem,
              active: nextStatus === "1",
            })),
          };
        }),
      );

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อัปเดตสถานะเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถอัปเดตสถานะรายวิชาได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDelete = async (row: SubjectRow) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ต้องการลบรายวิชา ${row.code || ""} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const ids = uniqueArray(row.ids);
      await Promise.all(ids.map((id) => DeleteDataSubject(id)));

      setSubjects((prev) =>
        prev.filter((item) => !item.ids.some((id) => ids.includes(id))),
      );

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบข้อมูลรายวิชาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถลบข้อมูลรายวิชาได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <SummaryCards summaryData={summaryData} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <nav className="text-sm text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">
            จัดการรายวิชานอกคณะ
          </span>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">ปีการศึกษา</span>
          <select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 bg-white outline-none focus:border-blue-400 cursor-pointer"
          >
            {semesterOptions.length === 0 ? (
              <option value="">ไม่พบปีการศึกษา</option>
            ) : (
              semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">รายวิชานอกคณะ</h1>
        <button
          type="button"
          onClick={handleAddSubject}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          เพิ่มรายวิชา
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหารหัสวิชา, รายวิชา, หรือสาขา..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-gray-100 border-t border-b border-gray-200">
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  ลำดับ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  รหัสวิชา
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  รายวิชา
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  ชั้นปี
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  สาขา
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="border-t border-gray-100">
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((row, index) => (
                  <tr
                    key={`${row.code}-${row.name}-${row.yearId}-${row.semesterId}-${row.subjectCourseIds.join("-")}`}
                    className="border-t border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5 text-center">
                      {(safePage - 1) * pageSize + index + 1}
                    </td>

                    <td className="px-6 py-5 text-center font-medium text-gray-800">
                      {row.code}
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-800">
                      {row.name}
                    </td>

                    <td className="px-6 py-5 text-center text-gray-700">
                      {row.year}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {row.branches.map((b) => (
                          <BranchBadge key={b} branch={b} />
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          active={row.active}
                          onChange={() => toggleActive(row)}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          className="text-blue-400 transition-colors hover:text-blue-600"
                          onClick={() => navigate(`${row.id}`)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="text-gray-400 transition-colors hover:text-gray-700"
                          onClick={() => navigate(`edit/${row.id}`)}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-red-400 transition-colors hover:text-red-600"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6 M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-gray-100">
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    ไม่พบรายวิชา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}