import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ── Types ───────────────────────────────────────────────────────────
type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

interface CourseRow {
  id: number;
  code: string;
  name: string;
  year: number;
  branches: Branch[];
  active: boolean;
}

// ── Constants ───────────────────────────────────────────────────────
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
  GIS: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  AI: { bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-300" },
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

const summaryData = [
  {
    branch: "CS" as Branch,
    label: "วิทยาการคอมพิวเตอร์",
    normal: 630135,
    special: 1858800,
  },
  {
    branch: "ITII" as Branch,
    label: "เทคโนโลยีสารสนเทศ...",
    normal: 569250,
    special: 0,
  },
  {
    branch: "GIS" as Branch,
    label: "ภูมิสารสนเทศศาสตร์",
    normal: 741015,
    special: 0,
  },
  {
    branch: "AI" as Branch,
    label: "ปัญญาประดิษฐ์",
    normal: 904860,
    special: 1191000,
  },
  {
    branch: "CY" as Branch,
    label: "ความมั่นคงปลอดภัย...",
    normal: 878130,
    special: 1167000,
  },
];

const ALL_COURSES: CourseRow[] = [
  {
    id: 1,
    code: "LI 102 003",
    name: "ภาษาอังกฤษ 3",
    year: 2,
    branches: ["CS", "ITII", "GIS", "AI", "CY"],
    active: true,
  },
  {
    id: 2,
    code: "GE 363 789",
    name: "ผู้ประกอบการสร้างสรรค์",
    year: 2,
    branches: ["CS", "CY"],
    active: true,
  },
  {
    id: 3,
    code: "SC 402 101",
    name: "พีชคณิตเชิงเส้น 1",
    year: 2,
    branches: ["CS"],
    active: true,
  },
  {
    id: 4,
    code: "SC 602 005",
    name: "ความน่าจะเป็นและสถิติ",
    year: 2,
    branches: ["CS"],
    active: true,
  },
  {
    id: 5,
    code: "GE 362 785",
    name: "การคิดเชิงสร้างสรรค์และ...",
    year: 2,
    branches: ["GIS"],
    active: true,
  },
  {
    id: 6,
    code: "SC 501 000",
    name: "ฟิสิกส์เบื้องต้น",
    year: 2,
    branches: ["GIS"],
    active: true,
  },
  {
    id: 7,
    code: "SC 501 003",
    name: "ปฏิบัติการฟิสิกส์ทั่วไป",
    year: 2,
    branches: ["GIS"],
    active: true,
  },
  {
    id: 8,
    code: "GE 142 145",
    name: "ภาวะผู้นำและการจัดการ",
    year: 2,
    branches: ["AI"],
    active: true,
  },
  {
    id: 9,
    code: "CS 301 001",
    name: "โครงสร้างข้อมูล",
    year: 3,
    branches: ["CS"],
    active: false,
  },
  {
    id: 10,
    code: "CS 401 002",
    name: "ปัญญาประดิษฐ์เบื้องต้น",
    year: 4,
    branches: ["CS", "AI"],
    active: true,
  },
  {
    id: 11,
    code: "IT 201 003",
    name: "เครือข่ายคอมพิวเตอร์",
    year: 2,
    branches: ["ITII", "CY"],
    active: true,
  },
  {
    id: 12,
    code: "GI 301 004",
    name: "ระบบสารสนเทศภูมิศาสตร์",
    year: 3,
    branches: ["GIS"],
    active: false,
  },
  {
    id: 13,
    code: "AI 401 005",
    name: "การเรียนรู้ของเครื่อง",
    year: 4,
    branches: ["AI"],
    active: true,
  },
  {
    id: 14,
    code: "CY 301 006",
    name: "ความปลอดภัยเครือข่าย",
    year: 3,
    branches: ["CY"],
    active: true,
  },
  {
    id: 15,
    code: "GE 101 007",
    name: "คณิตศาสตร์ทั่วไป",
    year: 1,
    branches: ["CS", "ITII", "GIS", "AI", "CY"],
    active: true,
  },
  {
    id: 16,
    code: "SC 201 008",
    name: "ฟิสิกส์ทั่วไป",
    year: 2,
    branches: ["GIS", "CY"],
    active: true,
  },
  {
    id: 17,
    code: "IT 401 009",
    name: "การจัดการฐานข้อมูล",
    year: 4,
    branches: ["ITII"],
    active: false,
  },
  {
    id: 18,
    code: "CS 201 010",
    name: "การเขียนโปรแกรมเชิงวัตถุ",
    year: 2,
    branches: ["CS", "AI"],
    active: true,
  },
  {
    id: 19,
    code: "GE 201 011",
    name: "ภาษาไทยเพื่อการสื่อสาร",
    year: 2,
    branches: ["CS", "ITII", "GIS", "AI", "CY"],
    active: true,
  },
  {
    id: 20,
    code: "CY 401 012",
    name: "การเข้ารหัสข้อมูล",
    year: 4,
    branches: ["CY", "AI"],
    active: true,
  },
  {
    id: 21,
    code: "AI 301 013",
    name: "การประมวลผลภาษาธรรมชาติ",
    year: 3,
    branches: ["AI"],
    active: true,
  },
  {
    id: 22,
    code: "GI 201 014",
    name: "การสำรวจระยะไกล",
    year: 2,
    branches: ["GIS"],
    active: false,
  },
  {
    id: 23,
    code: "IT 301 015",
    name: "การพัฒนาเว็บแอปพลิเคชัน",
    year: 3,
    branches: ["ITII", "CS"],
    active: true,
  },
  {
    id: 24,
    code: "SC 301 016",
    name: "สมการเชิงอนุพันธ์",
    year: 3,
    branches: ["CS", "GIS"],
    active: true,
  },
  {
    id: 25,
    code: "GE 301 017",
    name: "จริยธรรมทางเทคโนโลยี",
    year: 3,
    branches: ["CS", "ITII", "GIS", "AI", "CY"],
    active: true,
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Helpers ─────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("th-TH");
}

// ── Branch Badge ─────────────────────────────────────────────────────
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

// ── Toggle ───────────────────────────────────────────────────────────
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? "bg-green-400" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-6" : "translate-x-1"}`}
      />
      <span
        className={`absolute left-1.5 text-[9px] font-bold ${active ? "text-white" : "text-transparent"}`}
      >
        เปิด
      </span>
    </button>
  );
}

// ── Summary Cards ────────────────────────────────────────────────────
function SummaryCards() {
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

// ── Main ─────────────────────────────────────────────────────────────
export default function SubjectManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");
  const [semester, setSemester] = useState("2569/1");
  const [courses, setCourses] = useState<CourseRow[]>(ALL_COURSES);

  const navigate = useNavigate();

  const filtered = courses.filter(
    (c) =>
      c.name.includes(search) ||
      c.code.includes(search) ||
      c.branches.some((b) => b.toLowerCase().includes(search.toLowerCase())),
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleActive = (id: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("ต้องการลบรายวิชานี้ใช่หรือไม่?")) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Pagination range
  const range = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <SummaryCards />

        {/* Breadcrumb + semester */}
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
              onChange={(e) => setSemester(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 bg-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {["2569/1", "2569/2", "2568/1", "2568/2"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title + Add */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">รายวิชานอกคณะ</h1>
          <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
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
            + เพิ่มรายวิชา
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
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
            placeholder="ค้นหาร้าน, ประเภท, หรือเจ้าของ..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors placeholder-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {[
                    "ลำดับ",
                    "รหัสวิชา",
                    "รายวิชา",
                    "ชั้นปี",
                    "สาขา",
                    "สถานะ",
                    "จัดการ",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      ไม่พบรายวิชา
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center text-gray-500">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-gray-700">
                        {row.code}
                      </td>
                      <td className="px-4 py-3.5 text-gray-800">{row.name}</td>
                      <td className="px-4 py-3.5 text-center text-gray-600">
                        {row.year}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {row.branches.map((b) => (
                            <BranchBadge key={b} branch={b} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Toggle
                          active={row.active}
                          onChange={() => toggleActive(row.id)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {/* View */}
                          <button
                            className="text-blue-400 hover:text-blue-600 transition-colors p-1"
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
                          {/* Edit */}
                          <button className="text-gray-400 hover:text-gray-700 transition-colors p-1"
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
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
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
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Total {filtered.length} items
            </span>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>

              {range().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-blue-500 text-white border border-blue-500"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {/* Page size */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 bg-white outline-none cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} / page
                  </option>
                ))}
              </select>

              {/* Go to */}
              <span>Go to</span>
              <input
                type="number"
                value={goTo}
                min={1}
                max={totalPages}
                onChange={(e) => setGoTo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n = Math.min(totalPages, Math.max(1, Number(goTo)));
                    setPage(n);
                    setGoTo("");
                  }
                }}
                className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-center text-gray-700 bg-white outline-none focus:border-blue-400"
              />
              <span>Page</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
