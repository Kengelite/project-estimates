import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataSubjectById } from "../../../fetchapi/fetch_api_admin";

type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

const BRANCH_COLOR: Record<
  Branch,
  { bg: string; text: string; border: string; avatar: string }
> = {
  CS: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    avatar: "bg-green-400",
  },
  ITII: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    avatar: "bg-yellow-400",
  },
  GIS: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-300",
    avatar: "bg-cyan-400",
  },
  AI: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-300",
    avatar: "bg-pink-400",
  },
  CY: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-300",
    avatar: "bg-orange-400",
  },
};

const BRANCH_NAME: Record<Branch, string> = {
  CS: "วิทยาการคอมพิวเตอร์",
  ITII: "เทคโนโลยีสารสนเทศและนวัตกรรมอัจฉริยะ",
  GIS: "ภูมิสารสนเทศศาสตร์",
  AI: "ปัญญาประดิษฐ์",
  CY: "ความมั่นคงปลอดภัยไซเบอร์",
};

interface SubjectCourseApi {
  id?: string;
  courseId?: string;
  courseName?: string;
  course?: {
    id?: string;
    nameTh?: string;
    shortName?: string;
  };
  pricePerStudent?: number;
  registeredCount?: number;
  totalAmount?: number;
  totalDeductAmount?: number;
  status?: string;
}

interface SubjectDetailApi {
  id: string;
  subjectCode: string;
  subjectName: string;
  yearId?: number;
  year?: string;
  semesterId?: number;
  semester?: string;
  studentYearId?: number;
  studentYear?: string;
  status?: string;
  subjectCourses?: SubjectCourseApi[];
}

interface ProgramRow {
  pricePerPerson: number;
  enrolled: number;
}

interface BranchData {
  branch: Branch;
  normal?: ProgramRow;
  special?: ProgramRow;
}

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

function isSpecialCourseName(courseName: string) {
  const text = normalizeText(courseName);

  return (
    text.includes("พิเศษ") ||
    text.includes("special") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("โครงการพิเศษ")
  );
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

function getStudyYear(value?: string, id?: number) {
  const raw = String(value ?? "").trim();
  const matched = raw.match(/\d+/);
  if (matched) return matched[0];
  return id ? String(id) : "-";
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

function ProgramSection({ label, row }: { label: string; row: ProgramRow }) {
  const total = row.pricePerPerson * row.enrolled;

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>

      <div className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">ราคาต่อคน</p>
          <p className="text-sm font-semibold text-gray-800">
            ฿ {fmt(row.pricePerPerson)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">จำนวนคนที่ลงทะเบียน</p>
          <p className="text-sm font-semibold text-gray-800">
            {fmt(row.enrolled)} คน
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">ราคารวม</p>
          <p className="text-sm font-semibold text-gray-800">
            ฿ {fmt(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BranchCard({ item }: { item: BranchData }) {
  const c = BRANCH_COLOR[item.branch];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${c.avatar} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {item.branch}
        </div>

        <h2 className="text-base font-semibold text-gray-900">
          {BRANCH_NAME[item.branch]}
        </h2>
      </div>

      {item.normal && <ProgramSection label="โครงการปกติ" row={item.normal} />}

      {item.special && (
        <ProgramSection label="โครงการพิเศษ" row={item.special} />
      )}
    </div>
  );
}

function mapSubjectCoursesToBranchData(subjectCourses: SubjectCourseApi[]) {
  const map = new Map<Branch, BranchData>();

  subjectCourses.forEach((item) => {
    const courseName = item.courseName || item.course?.nameTh || "";
    const branch = getBranchFromCourseName(courseName);
    const isSpecial = isSpecialCourseName(courseName);

    const pricePerPerson = Number(item.pricePerStudent || 0);
    const enrolled = Number(item.registeredCount || 0);

    const old = map.get(branch) || { branch };

    const row: ProgramRow = {
      pricePerPerson,
      enrolled,
    };

    map.set(branch, {
      ...old,
      [isSpecial ? "special" : "normal"]: row,
    });
  });

  return Array.from(map.values());
}

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<SubjectDetailApi | null>(null);
  const [loading, setLoading] = useState(false);

  const branchData = useMemo(() => {
    return mapSubjectCoursesToBranchData(detail?.subjectCourses || []);
  }, [detail]);

  const branches = useMemo(() => {
    return branchData.map((item) => item.branch);
  }, [branchData]);

  const semesterName = detail?.semester || "";
  const semesterNo = getSemesterNo(semesterName);
  const semesterThaiName = getSemesterThaiName(semesterName);

  const loadDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await GetDataSubjectById(id);
      const data = response?.data || response;

      setDetail(data);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลรายละเอียดรายวิชาได้",
        confirmButtonColor: "#3b82f6",
      });

      navigate("/subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
          ไม่พบข้อมูลรายวิชา
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <nav className="text-xs text-gray-400">
              <span
                onClick={() => navigate("/")}
                className="hover:text-gray-600 cursor-pointer"
              >
                หน้าแรก
              </span>

              <span className="mx-1.5">›</span>

              <span
                onClick={() => navigate("/subjects")}
                className="hover:text-gray-600 cursor-pointer"
              >
                จัดการรายวิชานอกคณะ
              </span>

              <span className="mx-1.5">›</span>

              <span className="text-gray-700 font-medium">
                {detail.subjectCode}
              </span>
            </nav>

            <button
              type="button"
              onClick={() => navigate(`/subjects/edit/${detail.id}`)}
              className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-4"
            >
              <svg
                width="12"
                height="12"
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
              แก้ไขข้อมูล
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {detail.subjectCode} - {detail.subjectName}
              </h1>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {branches.map((b) => (
                  <BranchBadge key={b} branch={b} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">ปีการศึกษา</p>
              <p className="text-sm font-semibold text-gray-900">
                {detail.year || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">ภาคการศึกษา</p>
              <p className="text-sm font-semibold text-gray-900">
                {semesterNo ? `${semesterNo} (${semesterThaiName})` : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">ชั้นปี</p>
              <p className="text-sm font-semibold text-gray-900">
                {getStudyYear(detail.studentYear, detail.studentYearId)}
              </p>
            </div>
          </div>
        </div>

        {branchData.length > 0 ? (
          branchData.map((item) => <BranchCard key={item.branch} item={item} />)
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
            ไม่พบข้อมูลสาขาที่เปิดสอน
          </div>
        )}
      </div>
    </div>
  );
}