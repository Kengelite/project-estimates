import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  EditDataSubject,
  GetDataCourse,
  GetDataCourseById,
  GetDataSemester,
  GetDataStudentYear,
  GetDataSubject,
  GetDataSubjectById,
  GetDataSubjectOutside,
  GetDataYear,
} from "../../../fetchapi/fetch_api_admin";

type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";
type ProjectType = "normal" | "special";

const SUBJECT_CODE_MAX_LENGTH = 8;
const SUBJECT_NAME_MAX_LENGTH = 255;

type CourseItem = {
  id: string;
  degreeLevelId?: string;
  degreeLevelName?: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  status: string;
};

type CourseDetailResponse = {
  id?: string;
  subjectOutsideDeducts?: {
    id: string;
    subjectOutsideId: string;
    amount: number;
  }[];
};

type YearOption = {
  id: number;
  year: string;
  status?: string;
};

type SemesterOption = {
  id: number;
  name: string;
  status?: string;
};

type StudentYearOption = {
  id: number;
  studentYear: string;
  status?: string;
};

type SubjectOutsideItem = {
  id: string;
  subjectCode: string;
  subjectName: string;
  status?: string;
};

type SubjectCourseApi = {
  id?: string;
  subjectCourseId?: string;
  courseId?: string;
  courseName?: string;
  course?: {
    id?: string;
    nameTh?: string;
    nameEn?: string;
    shortName?: string;
  };
  pricePerStudent?: number;
  registeredCount?: number;
  status?: string;
};

type SubjectDetailApi = {
  id: string;
  yearId?: number;
  studentYearId?: number;
  semesterId?: number;
  subjectCode?: string;
  subjectName?: string;
  status?: string;
  subjectOutsideId?: string;
  subject_outside_id?: string;
  subjectOutside?: {
    id?: string;
    subjectCode?: string;
    subjectName?: string;
  };
  subjectCourses?: SubjectCourseApi[];
  subject_courses?: SubjectCourseApi[];
};

type BasicInfo = {
  subjectCode: string;
  subjectName: string;
  yearId: string;
  semesterId: string;
  studentYearId: string;
  status: string;
};

type ProjectDetail = {
  subjectCourseId?: string;
  courseId: string;
  pricePerStudent: string;
  registeredCount: string;
  status: string;
  isEditing: boolean;
};

type BranchData = {
  localId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  branch: Branch;
  normal: ProjectDetail | null;
  special: ProjectDetail | null;
};

const inputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const readOnlyInputCls =
  "w-full h-10 cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none";

const selectCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:bg-white";

const sectionCls =
  "rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm";

const BRANCH_STYLE: Record<Branch, { bg: string; text: string }> = {
  CS: { bg: "from-green-400 to-green-200", text: "CS" },
  ITII: { bg: "from-yellow-400 to-yellow-200", text: "ITII" },
  GIS: { bg: "from-cyan-400 to-cyan-200", text: "GIS" },
  AI: { bg: "from-pink-400 to-pink-200", text: "AI" },
  CY: { bg: "from-orange-400 to-orange-200", text: "CY" },
};

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
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
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
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
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ModalBase({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function IconButton({
  title,
  variant = "default",
  onClick,
  children,
}: {
  title: string;
  variant?: "default" | "danger" | "primary";
  onClick: () => void;
  children: ReactNode;
}) {
  const cls =
    variant === "danger"
      ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
      : variant === "primary"
        ? "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${cls}`}
    >
      {children}
    </button>
  );
}

function stripComma(value: string) {
  return String(value || "").replace(/,/g, "").trim();
}

function formatNumber(value: string, maxDigits = 11) {
  const raw = stripComma(value).replace(/\D/g, "").slice(0, maxDigits);
  if (!raw) return "";
  return Number(raw).toLocaleString("th-TH");
}

function toNumber(value: string) {
  const raw = stripComma(value);
  return raw ? Number(raw) : 0;
}

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function normalizeCode(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function inferBranchFromCourse(
  course: CourseItem | { nameTh?: string; shortName?: string; nameEn?: string },
): Branch {
  const text = `${course.nameTh || ""} ${course.shortName || ""} ${
    course.nameEn || ""
  }`.toLowerCase();

  if (text.includes("วิทยาการคอมพิวเตอร์") || text.includes("b.sc.cs")) {
    return "CS";
  }

  if (
    text.includes("เทคโนโลยีสารสนเทศ") ||
    text.includes("นวัตกรรมอัจฉริยะ") ||
    text.includes("b.sc.it")
  ) {
    return "ITII";
  }

  if (text.includes("ภูมิสารสนเทศ")) return "GIS";
  if (text.includes("ปัญญาประดิษฐ์")) return "AI";
  if (text.includes("ความมั่นคงปลอดภัย")) return "CY";

  return "CS";
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

function inferProjectType(course: CourseItem): ProjectType {
  const text =
    `${course.nameTh || ""} ${course.nameEn || ""} ${
      course.degreeLevelName || ""
    }`.toLowerCase();

  if (
    text.includes("พิเศษ") ||
    text.includes("special") ||
    text.includes("ภาคพิเศษ") ||
    text.includes("โครงการพิเศษ")
  ) {
    return "special";
  }

  return "normal";
}

function isSpecialCourse(course: CourseItem) {
  return inferProjectType(course) === "special";
}

function courseMatchKey(course: CourseItem) {
  const name = `${course.nameTh || ""} ${course.nameEn || ""}`
    .toLowerCase()
    .replace(/หลักสูตร/g, "")
    .replace(/วิทยาศาสตรบัณฑิต/g, "")
    .replace(/สาขาวิชา/g, "")
    .replace(/โครงการพิเศษ/g, "")
    .replace(/โครงการปกติ/g, "")
    .replace(/ภาคพิเศษ/g, "")
    .replace(/ภาคปกติ/g, "")
    .replace(/special/g, "")
    .replace(/normal/g, "")
    .replace(/[()\[\]{}\s.\-_/]/g, "")
    .trim();

  return `${inferBranchFromCourse(course)}-${name}`;
}

function getCourseName(item: SubjectCourseApi) {
  return item.courseName || item.course?.nameTh || "";
}

function getSubjectCourseId(item: SubjectCourseApi) {
  return String(item.subjectCourseId || item.id || "");
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

function mapStudentYearOption(item: any): StudentYearOption {
  return {
    id: Number(item?.id ?? item?.studentYearId ?? 0),
    studentYear: String(
      item?.studentYear ?? item?.student_year ?? item?.name ?? "",
    ),
    status: String(item?.status ?? "1"),
  };
}

function mapSubjectOutsideOption(item: any): SubjectOutsideItem {
  return {
    id: String(item?.id ?? item?.subjectOutsideId ?? ""),
    subjectCode: String(item?.subjectCode ?? item?.subject_code ?? ""),
    subjectName: String(item?.subjectName ?? item?.subject_name ?? ""),
    status: String(item?.status ?? "1"),
  };
}

function courseDisplayName(course: CourseItem) {
  const branch = inferBranchFromCourse(course);
  return `${branch} - ${course.nameTh}`;
}

function mapSubjectCoursesToBranchData(subjectCourses: SubjectCourseApi[]) {
  const map = new Map<Branch, BranchData>();

  subjectCourses.forEach((item) => {
    const courseName = getCourseName(item);
    const branch = getBranchFromCourseName(courseName);
    const isSpecial = isSpecialCourseName(courseName);

    const courseId = String(item.courseId || item.course?.id || "");
    const courseCode = String(item.course?.shortName || "");

    const row: ProjectDetail = {
      subjectCourseId: getSubjectCourseId(item),
      courseId,
      pricePerStudent: formatNumber(String(item.pricePerStudent ?? 0)),
      registeredCount: formatNumber(String(item.registeredCount ?? 0)),
      status: String(item.status ?? "1"),
      isEditing: false,
    };

    const old =
      map.get(branch) ||
      ({
        localId: `${branch}-${courseId || Date.now()}`,
        courseId,
        courseName,
        courseCode,
        branch,
        normal: null,
        special: null,
      } satisfies BranchData);

    map.set(branch, {
      ...old,
      courseId: isSpecial ? old.courseId : courseId,
      courseName: isSpecial ? old.courseName : courseName,
      courseCode: isSpecial ? old.courseCode : courseCode,
      [isSpecial ? "special" : "normal"]: row,
    });
  });

  return Array.from(map.values());
}

function SectionTotal({ price, count }: { price: string; count: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
      ราคารวม :{" "}
      <span className="text-blue-600 font-medium ml-1">
        ฿ {(toNumber(price) * toNumber(count)).toLocaleString("th-TH")}
      </span>
    </div>
  );
}

export default function EditSubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    subjectCode: "",
    subjectName: "",
    yearId: "",
    semesterId: "",
    studentYearId: "",
    status: "1",
  });

  const [subjectOutsideId, setSubjectOutsideId] = useState("");
  const [data, setData] = useState<BranchData[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [studentYears, setStudentYears] = useState<StudentYearOption[]>([]);
  const [subjectOutsides, setSubjectOutsides] = useState<SubjectOutsideItem[]>(
    [],
  );
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingProjectKey, setSavingProjectKey] = useState("");

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [
        detailResponse,
        yearList,
        semesterList,
        studentYearList,
        subjectOutsideList,
        subjectList,
        courseList,
      ] = await Promise.all([
        GetDataSubjectById(id),
        GetDataYear(),
        GetDataSemester(),
        GetDataStudentYear(),
        GetDataSubjectOutside(),
        GetDataSubject(),
        GetDataCourse(),
      ]);

      const detail: SubjectDetailApi =
        detailResponse?.data || detailResponse?.subject || detailResponse;

      const detailSubjectOutsideId = String(
        detail.subjectOutsideId ||
          detail.subject_outside_id ||
          detail.subjectOutside?.id ||
          "",
      );

      setBasicInfo({
        subjectCode: String(detail.subjectCode || "").slice(
          0,
          SUBJECT_CODE_MAX_LENGTH,
        ),
        subjectName: String(detail.subjectName || "").slice(
          0,
          SUBJECT_NAME_MAX_LENGTH,
        ),
        yearId: detail.yearId ? String(detail.yearId) : "",
        semesterId: detail.semesterId ? String(detail.semesterId) : "",
        studentYearId: detail.studentYearId ? String(detail.studentYearId) : "",
        status: String(detail.status ?? "1"),
      });

      setSubjectOutsideId(detailSubjectOutsideId);

      const subjectCourses =
        detail.subjectCourses || detail.subject_courses || [];

      setData(mapSubjectCoursesToBranchData(subjectCourses));

      setYears(
        (yearList || [])
          .map((item: any) => mapYearOption(item))
          .filter((item: YearOption) => String(item.status ?? "1") === "1"),
      );

      setSemesters(
        (semesterList || [])
          .map((item: any) => mapSemesterOption(item))
          .filter((item: SemesterOption) => String(item.status ?? "1") === "1"),
      );

      setStudentYears(
        (studentYearList || [])
          .map((item: any) => mapStudentYearOption(item))
          .filter(
            (item: StudentYearOption) => String(item.status ?? "1") === "1",
          ),
      );

      setSubjectOutsides(
        (subjectOutsideList || [])
          .map((item: any) => mapSubjectOutsideOption(item))
          .filter(
            (item: SubjectOutsideItem) => String(item.status ?? "1") === "1",
          ),
      );

      setAllSubjects(subjectList || []);

      setCourses(
        (courseList || []).filter(
          (item: CourseItem) => String(item.status ?? "1") === "1",
        ),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลรายวิชาได้",
        confirmButtonColor: "#2563eb",
      });

      await loadData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const selectedCourseOptions = useMemo(() => {
    const usedCourseIds = new Set(data.map((item) => item.courseId));

    return courses.filter((course) => {
      if (isSpecialCourse(course)) return false;

      if (editingCardId) {
        const editingItem = data.find((item) => item.localId === editingCardId);
        if (editingItem?.courseId === course.id) return true;
      }

      return !usedCourseIds.has(course.id);
    });
  }, [courses, data, editingCardId]);

  const updateBasicInfo = (field: keyof BasicInfo, value: string) => {
    if (field === "subjectCode") {
      setBasicInfo((prev) => ({
        ...prev,
        subjectCode: value.slice(0, SUBJECT_CODE_MAX_LENGTH),
      }));
      return;
    }

    if (field === "subjectName") {
      setBasicInfo((prev) => ({
        ...prev,
        subjectName: value.slice(0, SUBJECT_NAME_MAX_LENGTH),
      }));
      return;
    }

    setBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubjectOutsideChange = (value: string) => {
    setSubjectOutsideId(value);

    const selected = subjectOutsides.find((item) => item.id === value);
    if (!selected) return;

    setBasicInfo((prev) => ({
      ...prev,
      subjectCode: selected.subjectCode.slice(0, SUBJECT_CODE_MAX_LENGTH),
      subjectName: selected.subjectName.slice(0, SUBJECT_NAME_MAX_LENGTH),
    }));
  };

  const getDefaultPriceByCourse = async (courseId: string) => {
    if (!subjectOutsideId) return "0";

    try {
      const response = await GetDataCourseById(courseId);
      const detail: CourseDetailResponse = response?.data || response;

      const matched = detail?.subjectOutsideDeducts?.find(
        (item) => String(item.subjectOutsideId) === String(subjectOutsideId),
      );

      const amount = Number(matched?.amount || 0);
      return formatNumber(String(amount));
    } catch {
      return "0";
    }
  };

  const findSpecialCourseForCourse = (courseId: string) => {
    const normalCourse = courses.find((item) => item.id === courseId);
    if (!normalCourse) return null;

    const sameKeySpecial = courses.find(
      (item) =>
        item.id !== courseId &&
        isSpecialCourse(item) &&
        courseMatchKey(item) === courseMatchKey(normalCourse),
    );

    if (sameKeySpecial) return sameKeySpecial;

    return (
      courses.find(
        (item) =>
          item.id !== courseId &&
          isSpecialCourse(item) &&
          inferBranchFromCourse(item) === inferBranchFromCourse(normalCourse),
      ) || null
    );
  };

  const hasSpecialCourse = (card: BranchData) => {
    return !!findSpecialCourseForCourse(card.courseId);
  };

  const buildSubjectCoursesPayload = (targetData = data) => {
    return targetData.flatMap((item) => {
      const rows: {
        courseId: string;
        pricePerStudent: number;
        registeredCount: number;
        status: string;
      }[] = [];

      if (item.normal) {
        rows.push({
          courseId: item.normal.courseId,
          pricePerStudent: toNumber(item.normal.pricePerStudent),
          registeredCount: toNumber(item.normal.registeredCount),
          status: item.normal.status,
        });
      }

      if (item.special) {
        rows.push({
          courseId: item.special.courseId,
          pricePerStudent: toNumber(item.special.pricePerStudent),
          registeredCount: toNumber(item.special.registeredCount),
          status: item.special.status,
        });
      }

      return rows;
    });
  };

  const buildFullPayload = (targetData = data, targetBasic = basicInfo) => {
    const payload: any = {
      yearId: Number(targetBasic.yearId),
      studentYearId: Number(targetBasic.studentYearId),
      semesterId: Number(targetBasic.semesterId),
      subjectCode: targetBasic.subjectCode.trim(),
      subjectName: targetBasic.subjectName.trim(),
      status: targetBasic.status || "1",
      subjectCourses: buildSubjectCoursesPayload(targetData),
    };

    if (subjectOutsideId) {
      payload.subjectOutsideId = subjectOutsideId;
    }

    return payload;
  };

  const saveWholeSubject = async (targetData = data, targetBasic = basicInfo) => {
    if (!id) return;
    await EditDataSubject(id, buildFullPayload(targetData, targetBasic));
  };

  const checkDuplicateSubject = async () => {
    const code = normalizeCode(basicInfo.subjectCode);
    const name = normalizeText(basicInfo.subjectName);
    const yearId = String(basicInfo.yearId);
    const semesterId = String(basicInfo.semesterId);
    const studentYearId = String(basicInfo.studentYearId);
    const currentId = String(id || "");

    const duplicated = allSubjects.some((item: any) => {
      const itemId = String(item?.id ?? "");
      if (itemId === currentId) return false;

      const itemSubjectOutsideId = String(
        item?.subjectOutsideId ||
          item?.subject_outside_id ||
          item?.subjectOutside?.id ||
          "",
      );

      const sameSubjectOutside =
        subjectOutsideId && itemSubjectOutsideId
          ? itemSubjectOutsideId === subjectOutsideId
          : true;

      const sameCode = normalizeCode(item?.subjectCode) === code;
      const sameName = normalizeText(item?.subjectName) === name;
      const sameYear = String(item?.yearId ?? "") === yearId;
      const sameSemester = String(item?.semesterId ?? "") === semesterId;
      const sameStudentYear =
        String(item?.studentYearId ?? "") === studentYearId;

      return (
        sameSubjectOutside &&
        sameCode &&
        sameName &&
        sameYear &&
        sameSemester &&
        sameStudentYear
      );
    });

    if (duplicated) {
      await Swal.fire({
        icon: "warning",
        title: "พบข้อมูลรายวิชาซ้ำ",
        text: "มีรายวิชาที่วิชานอกคณะ รหัสวิชา ชื่อวิชา ปีการศึกษา ภาคการศึกษา และชั้นปีตรงกันอยู่แล้ว",
        confirmButtonColor: "#2563eb",
      });

      return false;
    }

    return true;
  };

  const validateBasicInfo = async () => {
    if (!subjectOutsideId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกวิชานอกคณะ",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!basicInfo.subjectCode.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกรหัสวิชา",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!basicInfo.subjectName.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อวิชา",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!basicInfo.yearId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกปีการศึกษา",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!basicInfo.semesterId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกภาคการศึกษา",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!basicInfo.studentYearId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกชั้นปี",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    const isNotDuplicate = await checkDuplicateSubject();
    if (!isNotDuplicate) return false;

    return true;
  };

  const validateProject = async (project: ProjectDetail | null, name: string) => {
    if (!project) return false;

    if (!stripComma(project.pricePerStudent)) {
      await Swal.fire({
        icon: "warning",
        title: `กรุณากรอกราคาต่อคนของ${name}`,
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!stripComma(project.registeredCount)) {
      await Swal.fire({
        icon: "warning",
        title: `กรุณากรอกจำนวนคนที่ลงทะเบียนของ${name}`,
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    return true;
  };

  const handleSaveBasicInfo = async () => {
    const isValid = await validateBasicInfo();
    if (!isValid) return;

    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text: "ต้องการบันทึกข้อมูลใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSavingBasic(true);

      await saveWholeSubject(data, basicInfo);

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกข้อมูลเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSavingBasic(false);
    }
  };

  const handleUpdateProject = (
    localId: string,
    type: ProjectType,
    field: "pricePerStudent" | "registeredCount",
    value: string,
  ) => {
    if (field === "pricePerStudent") return;

    setData((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const project = item[type];
        if (!project || !project.isEditing) return item;

        return {
          ...item,
          [type]: {
            ...project,
            [field]: formatNumber(value, 11),
          },
        };
      }),
    );
  };

  const setProjectEditing = (
    localId: string,
    type: ProjectType,
    isEditing: boolean,
  ) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const project = item[type];
        if (!project) return item;

        return {
          ...item,
          [type]: {
            ...project,
            isEditing,
          },
        };
      }),
    );
  };

  const handleSaveProject = async (localId: string, type: ProjectType) => {
    const target = data.find((item) => item.localId === localId);
    if (!target) return;

    const project = target[type];
    const projectName = type === "normal" ? "โครงการปกติ" : "โครงการพิเศษ";

    const isValidBasic = await validateBasicInfo();
    if (!isValidBasic) return;

    const isValidProject = await validateProject(project, projectName);
    if (!isValidProject) return;

    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text: `ต้องการบันทึก${projectName}ของ${target.courseName}ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const nextData = data.map((item) => {
      if (item.localId !== localId) return item;

      const currentProject = item[type];
      if (!currentProject) return item;

      return {
        ...item,
        [type]: {
          ...currentProject,
          isEditing: false,
        },
      };
    });

    try {
      setSavingProjectKey(`${localId}-${type}`);

      await saveWholeSubject(nextData, basicInfo);

      setData(nextData);

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: `บันทึก${projectName}เรียบร้อยแล้ว`,
        confirmButtonColor: "#22c55e",
      });

      await loadData();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || `ไม่สามารถบันทึก${projectName}ได้`,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSavingProjectKey("");
    }
  };

  const handleRemoveProject = async (localId: string, type: ProjectType) => {
    const target = data.find((item) => item.localId === localId);
    if (!target) return;

    const projectName = type === "normal" ? "โครงการปกติ" : "โครงการพิเศษ";

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ต้องการลบ${projectName}ของ${target.courseName}ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const nextData = data
      .map((item): BranchData => {
        if (item.localId !== localId) return item;

        return {
          ...item,
          normal: type === "normal" ? null : item.normal,
          special: type === "special" ? null : item.special,
        };
      })
      .filter((item) => item.normal || item.special);

    try {
      await saveWholeSubject(nextData, basicInfo);

      setData(nextData);

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: `ลบ${projectName}เรียบร้อยแล้ว`,
        confirmButtonColor: "#22c55e",
      });

      await loadData();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || `ไม่สามารถลบ${projectName}ได้`,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleDeleteBranch = async (localId: string) => {
    const target = data.find((item) => item.localId === localId);
    if (!target) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ต้องการลบหลักสูตร/สาขา ${target.courseName} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const nextData = data.filter((item) => item.localId !== localId);

    try {
      await saveWholeSubject(nextData, basicInfo);

      setData(nextData);

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบหลักสูตร/สาขาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      await loadData();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถลบหลักสูตร/สาขาได้",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const openAddCourseModal = () => {
    setEditingCardId(null);
    setSelectedCourseId("");
    setShowCourseModal(true);
  };

  const openEditCourseModal = (card: BranchData) => {
    setEditingCardId(card.localId);
    setSelectedCourseId(card.courseId);
    setShowCourseModal(true);
  };

  const handleSaveCourseModal = async () => {
    const course = courses.find((item) => item.id === selectedCourseId);

    if (!course) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกหลักสูตร/สาขา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const price = await getDefaultPriceByCourse(course.id);

    if (editingCardId) {
      setData((prev) =>
        prev.map((item) => {
          if (item.localId !== editingCardId) return item;

          return {
            ...item,
            courseId: course.id,
            courseName: course.nameTh,
            courseCode: course.shortName,
            branch: inferBranchFromCourse(course),
            normal: item.normal
              ? {
                  ...item.normal,
                  courseId: course.id,
                  pricePerStudent: price,
                  isEditing: true,
                }
              : null,
          };
        }),
      );
    } else {
      const newCard: BranchData = {
        localId: `${Date.now()}`,
        courseId: course.id,
        courseName: course.nameTh,
        courseCode: course.shortName,
        branch: inferBranchFromCourse(course),
        normal: {
          courseId: course.id,
          pricePerStudent: price,
          registeredCount: "",
          status: "1",
          isEditing: true,
        },
        special: null,
      };

      setData((prev) => [...prev, newCard]);
    }

    setShowCourseModal(false);
    setSelectedCourseId("");
    setEditingCardId(null);
  };

  const handleAddNormal = async (localId: string) => {
    const target = data.find((item) => item.localId === localId);
    if (!target || target.normal) return;

    const price = await getDefaultPriceByCourse(target.courseId);

    setData((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              normal: {
                courseId: item.courseId,
                pricePerStudent: price,
                registeredCount: "",
                status: "1",
                isEditing: true,
              },
            }
          : item,
      ),
    );
  };

  const handleAddSpecial = async (localId: string) => {
    const target = data.find((item) => item.localId === localId);
    if (!target || target.special) return;

    const specialCourse = findSpecialCourseForCourse(target.courseId);

    if (!specialCourse) {
      await Swal.fire({
        icon: "warning",
        title: "หลักสูตรนี้ไม่มีโครงการพิเศษ",
        text: "ไม่พบหลักสูตรภาคพิเศษที่ผูกกับสาขานี้",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const price = await getDefaultPriceByCourse(specialCourse.id);

    setData((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              special: {
                courseId: specialCourse.id,
                pricePerStudent: price,
                registeredCount: "",
                status: "1",
                isEditing: true,
              },
            }
          : item,
      ),
    );
  };

  const renderProjectActionButtons = (card: BranchData, type: ProjectType) => {
    const project = card[type];
    if (!project) return null;

    const isSaving = savingProjectKey === `${card.localId}-${type}`;

    if (project.isEditing) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveProject(card.localId, type)}
            disabled={isSaving}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SaveIcon />
            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
          </button>

          <IconButton
            title={type === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
            variant="danger"
            onClick={() => handleRemoveProject(card.localId, type)}
          >
            <TrashIcon />
          </IconButton>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <IconButton
          title={type === "normal" ? "แก้ไขโครงการปกติ" : "แก้ไขโครงการพิเศษ"}
          variant="primary"
          onClick={() => setProjectEditing(card.localId, type, true)}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title={type === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
          variant="danger"
          onClick={() => handleRemoveProject(card.localId, type)}
        >
          <TrashIcon />
        </IconButton>
      </div>
    );
  };

  const renderProgramSection = (
    item: BranchData,
    type: ProjectType,
    label: string,
  ) => {
    const project = item[type];

    if (!project) return null;

    const isEditing = project.isEditing;

    return (
      <div
        className={`space-y-3 rounded-2xl border ${
          type === "special"
            ? "border-blue-100 bg-blue-50/30"
            : "border-gray-100 bg-white"
        } p-3 ${type === "special" ? "mt-3" : ""}`}
      >
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-base font-semibold text-black">{label}</h4>
          {renderProjectActionButtons(item, type)}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-black">
              ราคาต่อคน (บาท)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={project.pricePerStudent}
              readOnly
              disabled
              className={readOnlyInputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-black">
              จำนวนคนที่ลงทะเบียน
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={project.registeredCount}
              readOnly={!isEditing}
              disabled={!isEditing}
              onChange={(e) =>
                handleUpdateProject(
                  item.localId,
                  type,
                  "registeredCount",
                  e.target.value,
                )
              }
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={isEditing ? inputCls : readOnlyInputCls}
            />
          </div>
        </div>

        <SectionTotal
          price={project.pricePerStudent}
          count={project.registeredCount}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-3 sm:p-5">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-400 shadow-sm">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-3 sm:p-5">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <h1 className="text-lg font-bold text-black sm:text-xl">
          แก้ไขข้อมูลรายวิชา
        </h1>

        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-gray-900">
            ข้อมูลพื้นฐาน <span className="text-red-500">*</span>
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                วิชานอกคณะ <span className="text-red-500">*</span>
              </label>
              <select
                value={subjectOutsideId}
                onChange={(e) => handleSubjectOutsideChange(e.target.value)}
                className={selectCls}
              >
                <option value="">เลือกวิชานอกคณะ</option>
                {subjectOutsides.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.subjectCode} - {item.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ชื่อวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={basicInfo.subjectName}
                maxLength={SUBJECT_NAME_MAX_LENGTH}
                onChange={(e) =>
                  updateBasicInfo("subjectName", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                รหัสวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={basicInfo.subjectCode}
                maxLength={SUBJECT_CODE_MAX_LENGTH}
                onChange={(e) =>
                  updateBasicInfo("subjectCode", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>
              <select
                value={basicInfo.yearId}
                onChange={(e) => updateBasicInfo("yearId", e.target.value)}
                className={selectCls}
              >
                <option value="">เลือกปีการศึกษา</option>
                {years.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ภาคการศึกษา <span className="text-red-500">*</span>
              </label>
              <select
                value={basicInfo.semesterId}
                onChange={(e) =>
                  updateBasicInfo("semesterId", e.target.value)
                }
                className={selectCls}
              >
                <option value="">เลือกภาคการศึกษา</option>
                {semesters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getSemesterNo(item.name)} ({getSemesterThaiName(item.name)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ชั้นปี <span className="text-red-500">*</span>
              </label>
              <select
                value={basicInfo.studentYearId}
                onChange={(e) =>
                  updateBasicInfo("studentYearId", e.target.value)
                }
                className={selectCls}
              >
                <option value="">เลือกชั้นปี</option>
                {studentYears.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.studentYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveBasicInfo}
              disabled={savingBasic}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SaveIcon />
              {savingBasic ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </section>

        <section className={sectionCls}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-900">
              สาขาที่เปิดสอน
            </h2>

            <button
              type="button"
              onClick={openAddCourseModal}
              className="inline-flex h-[40px] items-center gap-2 rounded-[14px] bg-blue-500 px-6 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              <PlusIcon />
              เพิ่มสาขา
            </button>
          </div>

          <div className="mt-4">
            {data.length === 0 ? (
              <button
                type="button"
                onClick={openAddCourseModal}
                className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:bg-gray-50"
              >
                <PlusIcon className="h-10 w-10 text-gray-400" />
                <p className="mt-4 text-base font-medium text-gray-500">
                  ยังไม่มีสาขา
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  กดปุ่ม "เพิ่มสาขา" เพื่อเพิ่มสาขาที่เปิดสอนวิชานี้
                </p>
              </button>
            ) : (
              <div className="space-y-4">
                {data.map((item) => {
                  const branchStyle = BRANCH_STYLE[item.branch];

                  return (
                    <div
                      key={item.localId}
                      className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
                    >
                      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${branchStyle.bg} text-[18px] font-medium text-white`}
                          >
                            {branchStyle.text}
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-black sm:text-lg">
                              {item.courseName}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {item.courseCode || item.branch}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1.5 lg:justify-end">
                          {!item.normal && (
                            <button
                              type="button"
                              onClick={() => handleAddNormal(item.localId)}
                              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <PlusIcon />
                              เพิ่มโครงการปกติ
                            </button>
                          )}

                          {!item.special && hasSpecialCourse(item) && (
                            <button
                              type="button"
                              onClick={() => handleAddSpecial(item.localId)}
                              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <PlusIcon />
                              เพิ่มโครงการพิเศษ
                            </button>
                          )}

                          <IconButton
                            title="แก้ไขหลักสูตร"
                            variant="primary"
                            onClick={() => openEditCourseModal(item)}
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            title="ลบหลักสูตร"
                            variant="danger"
                            onClick={() => handleDeleteBranch(item.localId)}
                          >
                            <TrashIcon />
                          </IconButton>
                        </div>
                      </div>

                      {item.normal &&
                        renderProgramSection(item, "normal", "โครงการปกติ")}

                      {item.special &&
                        renderProgramSection(item, "special", "โครงการพิเศษ")}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {showCourseModal && (
        <ModalBase
          onClose={() => {
            setShowCourseModal(false);
            setSelectedCourseId("");
            setEditingCardId(null);
          }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <PlusIcon />
            </div>

            <h2 className="flex-1 text-base font-bold text-gray-900">
              {editingCardId ? "แก้ไขหลักสูตร/สาขา" : "เพิ่มหลักสูตร/สาขา"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowCourseModal(false);
                setSelectedCourseId("");
                setEditingCardId(null);
              }}
              className="text-gray-400 transition hover:text-gray-700"
            >
              <CloseIcon />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              หลักสูตร/สาขา <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
            >
              <option value="">เลือกหลักสูตร/สาขา</option>
              {selectedCourseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {courseDisplayName(course)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCourseModal(false);
                setSelectedCourseId("");
                setEditingCardId(null);
              }}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSaveCourseModal}
              className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              {editingCardId ? "บันทึก" : "เพิ่ม"}
            </button>
          </div>
        </ModalBase>
      )}
    </div>
  );
}