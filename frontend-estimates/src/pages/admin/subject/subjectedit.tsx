import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  EditDataSubject,
  GetDataCourse,
  GetDataCourseById,
  GetDataSemester,
  GetDataStudentYear,
  GetDataSubjectById,
  GetDataSubjectOutside,
  GetDataYear,
} from "../../../fetchapi/fetch_api_admin";

type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";
type ProjectType = "normal" | "special";

type SectionLike = {
  id?: string;
  name?: string;
  sectionName?: string;
  section_name?: string;
  sectionTitle?: string;
  section_title?: string;
};

type DegreeLevelLike = {
  id?: string;
  name?: string;
  shortName?: string;
  short_name?: string;
  sectionName?: string;
  section_name?: string;
  sectionTitle?: string;
  section_title?: string;
  section?: SectionLike | null;
};

type CourseItem = {
  id: string;
  degreeLevelId?: string;
  degree_level_id?: string;
  degreeLevelName?: string;
  degree_level_name?: string;
  degreeLevel?: DegreeLevelLike | null;
  degree_level?: DegreeLevelLike | null;
  sectionId?: string;
  section_id?: string;
  sectionName?: string;
  section_name?: string;
  sectionTitle?: string;
  section_title?: string;
  section?: SectionLike | null;
  nameTh: string;
  nameEn: string;
  shortName: string;
  studyDuration?: number;
  tuitionFees?: number;
  deductToUni?: number;
  status: string;
};

type CourseDetailResponse = {
  id?: string;
  nameTh?: string;
  shortName?: string;
  subjectOutsideDeducts?: {
    id: string;
    subjectOutsideId: string;
    amount: number;
    subjectOutside?: {
      id: string;
      subjectCode: string;
      subjectName: string;
    };
  }[];
};

type YearItem = {
  id: number;
  year: string;
  status?: string;
};

type SemesterItem = {
  id: number;
  name: string;
  status?: string;
};

type StudentYearItem = {
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
  subject_course_id?: string;
  courseId?: string;
  course_id?: string;
  pricePerStudent?: number;
  price_per_student?: number;
  registeredCount?: number;
  registered_count?: number;
  status?: string;
  course?: Partial<CourseItem> | null;
};

type SubjectDetailApi = {
  id?: string;
  yearId?: number;
  year_id?: number;
  studentYearId?: number;
  student_year_id?: number;
  semesterId?: number;
  semester_id?: number;
  subjectOutsideId?: string;
  subject_outside_id?: string;
  subjectCode?: string;
  subject_code?: string;
  subjectName?: string;
  subject_name?: string;
  status?: string;
  subjectCourses?: SubjectCourseApi[];
  subject_courses?: SubjectCourseApi[];
  subjectOutside?: {
    id?: string;
    subjectCode?: string;
    subjectName?: string;
  };
  subject_outside?: {
    id?: string;
    subject_code?: string;
    subject_name?: string;
  };
};

type ProjectDetail = {
  subjectCourseId?: string;
  courseId: string;
  pricePerStudent: string;
  registeredCount: string;
  status: string;
  isEditing: boolean;
};

type CourseCard = {
  localId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  branch: Branch;
  baseKey: string;
  normal: ProjectDetail | null;
  special: ProjectDetail | null;
};

const inputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const readOnlyInputCls =
  "w-full h-10 cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none";

const selectCls =
  "w-full h-10 appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:bg-white";

const sectionCls =
  "rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm";

const SUBJECT_CODE_MAX_LENGTH = 8;
const SUBJECT_NAME_MAX_LENGTH = 255;

const BRANCH_STYLE: Record<Branch, { bg: string; text: string }> = {
  CS: { bg: "from-green-500 to-emerald-300", text: "CS" },
  ITII: { bg: "from-yellow-500 to-amber-300", text: "ITII" },
  GIS: { bg: "from-cyan-500 to-sky-300", text: "GIS" },
  AI: { bg: "from-pink-500 to-fuchsia-300", text: "AI" },
  CY: { bg: "from-orange-500 to-orange-300", text: "CY" },
};

function unwrapResponse<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

function unwrapArray<T>(response: any): T[] {
  const data = unwrapResponse<any>(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6 M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-gray-400 transition-colors hover:text-gray-700">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function ModalBase({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  children,
  disabled = false,
  className = "",
}: {
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${selectCls} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400">
        <ChevronDownIcon />
      </div>
    </div>
  );
}

function EmptyAddBox({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:bg-gray-50"
    >
      <PlusIcon className="h-10 w-10 text-gray-400" />
      <p className="mt-4 text-base font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </button>
  );
}

function ActionIconButton({
  title,
  variant,
  onClick,
  children,
}: {
  title: string;
  variant: "edit" | "delete";
  onClick: () => void;
  children: ReactNode;
}) {
  const cls =
    variant === "edit"
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : "bg-red-500 text-white hover:bg-red-600";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition ${cls}`}
    >
      {children}
    </button>
  );
}

function stripComma(value: string) {
  return String(value || "").replace(/,/g, "").trim();
}

function formatNumberInput(value: string | number) {
  const raw = stripComma(String(value ?? "")).replace(/\D/g, "");
  if (!raw) return "";
  return Number(raw).toLocaleString("th-TH");
}

function formatIntInput(value: string, maxDigits = 11) {
  const raw = stripComma(value).replace(/\D/g, "").slice(0, maxDigits);
  if (!raw) return "";
  return Number(raw).toLocaleString("th-TH");
}

function toNumber(value: string) {
  const raw = stripComma(value);
  return raw ? Number(raw) : 0;
}

function normalizeCourse(raw: any): CourseItem {
  return {
    ...raw,
    id: String(raw?.id ?? raw?.courseId ?? raw?.course_id ?? ""),
    nameTh: String(raw?.nameTh ?? raw?.name_th ?? raw?.name ?? raw?.courseName ?? raw?.course_name ?? ""),
    nameEn: String(raw?.nameEn ?? raw?.name_en ?? ""),
    shortName: String(raw?.shortName ?? raw?.short_name ?? raw?.code ?? ""),
    status: String(raw?.status ?? "1"),
  };
}

function inferBranchFromCourse(course: Partial<CourseItem>): Branch {
  const text = `${course.nameTh || ""} ${course.nameEn || ""} ${course.shortName || ""}`.toLowerCase();

  if (text.includes("วิทยาการคอมพิวเตอร์") || text.includes("b.sc.cs")) return "CS";

  if (
    text.includes("เทคโนโลยีสารสนเทศ") ||
    text.includes("นวัตกรรมอัจฉริยะ") ||
    text.includes("b.sc.it") ||
    text.includes("b.sc.iti")
  ) {
    return "ITII";
  }

  if (text.includes("ภูมิสารสนเทศ") || text.includes("gis")) return "GIS";
  if (text.includes("ปัญญาประดิษฐ์") || text.includes("ai")) return "AI";
  if (text.includes("ความมั่นคงปลอดภัย") || text.includes("cy")) return "CY";

  return "CS";
}

function getDegreeLevelName(course: Partial<CourseItem>) {
  return String(
    course.degreeLevelName ??
      course.degree_level_name ??
      course.degreeLevel?.name ??
      course.degree_level?.name ??
      "ไม่ระบุระดับปริญญา",
  ).trim();
}

function getRawSectionName(course: Partial<CourseItem>) {
  return String(
    course.sectionName ??
      course.section_name ??
      course.sectionTitle ??
      course.section_title ??
      course.section?.sectionName ??
      course.section?.section_name ??
      course.section?.sectionTitle ??
      course.section?.section_title ??
      course.section?.name ??
      course.degreeLevel?.sectionName ??
      course.degreeLevel?.section_name ??
      course.degreeLevel?.sectionTitle ??
      course.degreeLevel?.section_title ??
      course.degreeLevel?.section?.sectionName ??
      course.degreeLevel?.section?.section_name ??
      course.degreeLevel?.section?.sectionTitle ??
      course.degreeLevel?.section?.section_title ??
      course.degreeLevel?.section?.name ??
      course.degree_level?.sectionName ??
      course.degree_level?.section_name ??
      course.degree_level?.sectionTitle ??
      course.degree_level?.section_title ??
      course.degree_level?.section?.sectionName ??
      course.degree_level?.section?.section_name ??
      course.degree_level?.section?.sectionTitle ??
      course.degree_level?.section?.section_title ??
      course.degree_level?.section?.name ??
      "",
  ).trim();
}

function normalizeSectionName(course: Partial<CourseItem>) {
  const raw = getRawSectionName(course);
  const allText = `${raw} ${course.nameTh || ""} ${course.nameEn || ""} ${
    course.degreeLevelName || ""
  } ${course.degree_level_name || ""}`.toLowerCase();

  if (
    allText.includes("พิเศษ") ||
    allText.includes("special") ||
    allText.includes("ภาคพิเศษ") ||
    allText.includes("โครงการพิเศษ")
  ) {
    return "โครงการพิเศษ";
  }

  if (
    allText.includes("ปกติ") ||
    allText.includes("normal") ||
    allText.includes("ภาคปกติ") ||
    allText.includes("โครงการปกติ")
  ) {
    return "โครงการปกติ";
  }

  return raw || "ไม่ระบุโครงการ";
}

function inferProjectType(course: Partial<CourseItem>): ProjectType {
  return normalizeSectionName(course).includes("พิเศษ") ? "special" : "normal";
}

function isSpecialCourse(course: Partial<CourseItem>) {
  return inferProjectType(course) === "special";
}

function normalizeDegreeNameForKey(course: Partial<CourseItem>) {
  return getDegreeLevelName(course)
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/โครงการพิเศษ/g, "")
    .replace(/โครงการปกติ/g, "")
    .replace(/ภาคพิเศษ/g, "")
    .replace(/ภาคปกติ/g, "")
    .replace(/special/g, "")
    .replace(/normal/g, "");
}

function courseMatchKey(course: Partial<CourseItem>) {
  return `${normalizeDegreeNameForKey(course)}-${inferBranchFromCourse(course)}`;
}

function courseDisplayName(course: Partial<CourseItem>) {
  const branch = inferBranchFromCourse(course);
  return `${branch} - ${course.nameTh || ""}`;
}

function getCourseGroupLabel(course: Partial<CourseItem>) {
  return getDegreeLevelName(course);
}

function pickRepresentativeCourse(courseList: CourseItem[]) {
  return courseList.find((item) => !isSpecialCourse(item)) || courseList[0];
}

function getUniqueBaseCourses(courses: CourseItem[]) {
  const map = new Map<string, CourseItem[]>();

  courses.forEach((course) => {
    const key = courseMatchKey(course);
    map.set(key, [...(map.get(key) || []), course]);
  });

  return Array.from(map.entries())
    .map(([baseKey, list]) => {
      return {
        ...pickRepresentativeCourse(list),
        __baseKey: baseKey,
      } as CourseItem & { __baseKey: string };
    })
    .sort((a, b) => {
      const groupCompare = getCourseGroupLabel(a).localeCompare(getCourseGroupLabel(b), "th");
      if (groupCompare !== 0) return groupCompare;
      return courseDisplayName(a).localeCompare(courseDisplayName(b), "th");
    });
}

function groupUniqueCoursesByDegreeLevel(courses: CourseItem[]) {
  return courses.reduce<Record<string, CourseItem[]>>((acc, course) => {
    const groupName = getCourseGroupLabel(course);
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(course);
    return acc;
  }, {});
}

function GroupedCourseCardDropdown({
  value,
  courses,
  disabled = false,
  onChange,
}: {
  value: string;
  courses: CourseItem[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const groupedCourses = useMemo(() => {
    const groups = groupUniqueCoursesByDegreeLevel(courses);

    return Object.entries(groups)
      .map(([groupName, courseList]) => {
        return [
          groupName,
          [...courseList].sort((a, b) =>
            courseDisplayName(a).localeCompare(courseDisplayName(b), "th"),
          ),
        ] as [string, CourseItem[]];
      })
      .sort(([a], [b]) => a.localeCompare(b, "th"));
  }, [courses]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(value)),
    [courses, value],
  );

  const selectedLabel = selectedCourse ? courseDisplayName(selectedCourse) : "เลือกหลักสูตร/สาขา";
  const selectedGroupLabel = selectedCourse ? getCourseGroupLabel(selectedCourse) : "";

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-sm outline-none transition-all ${
          open
            ? "border-blue-400 bg-white ring-2 ring-blue-100"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
        } ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : "cursor-pointer text-gray-800"}`}
      >
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>

        <ChevronDownIcon
          className={`ml-2 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {selectedCourse && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
            {selectedGroupLabel}
          </span>

          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {inferBranchFromCourse(selectedCourse)}
          </span>
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-[46px] z-[70] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/10">
          <div className="max-h-[315px] overflow-y-auto p-2">
            {groupedCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-5 text-center text-xs text-gray-400">
                ไม่พบหลักสูตร/สาขาที่สามารถเลือกได้
              </div>
            ) : (
              <div className="space-y-2">
                {groupedCourses.map(([groupName, courseList]) => (
                  <div key={groupName} className="rounded-xl border border-gray-100 bg-gray-50/70 p-2">
                    <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
                      <p className="truncate text-[11px] font-bold text-gray-500">
                        {groupName}
                      </p>

                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-400 ring-1 ring-gray-100">
                        {courseList.length} รายการ
                      </span>
                    </div>

                    <div className="space-y-1">
                      {courseList.map((course) => {
                        const isSelected = String(value) === String(course.id);
                        const branch = inferBranchFromCourse(course);

                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => {
                              onChange(course.id);
                              setOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                              isSelected
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                                isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {branch}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">{course.nameTh}</p>
                              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                                {course.shortName || branch}
                              </p>
                            </div>

                            {isSelected && <CheckIcon className="shrink-0 text-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTotal({ price, count }: { price: string; count: string }) {
  return (
    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
      ราคารวม :{" "}
      <span className="font-medium text-blue-600">
        ฿ {(toNumber(price) * toNumber(count)).toLocaleString("th-TH")}
      </span>
    </div>
  );
}

export default function SubjectEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const subjectId = String(params.id ?? params.subjectId ?? "");

  const loadedSubjectOutsideIdRef = useRef("");
  const hasLoadedSubjectRef = useRef(false);

  const [subjectOutsideId, setSubjectOutsideId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [yearId, setYearId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [studentYearId, setStudentYearId] = useState("");
  const [status] = useState("1");

  const [years, setYears] = useState<YearItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [studentYears, setStudentYears] = useState<StudentYearItem[]>([]);
  const [subjectOutsides, setSubjectOutsides] = useState<SubjectOutsideItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [offerings, setOfferings] = useState<CourseCard[]>([]);

  const [showMajorModal, setShowMajorModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [forcedBranch, setForcedBranch] = useState<Branch | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coursesById = useMemo(() => {
    return new Map(courses.map((course) => [String(course.id), course]));
  }, [courses]);

  const buildOfferingsFromSubject = (detail: SubjectDetailApi, courseList: CourseItem[]) => {
    const map = new Map<string, CourseCard>();
    const courseMap = new Map(courseList.map((course) => [String(course.id), course]));
    const subjectCourses = detail.subjectCourses ?? detail.subject_courses ?? [];

    subjectCourses.forEach((row, index) => {
      const courseId = String(row.courseId ?? row.course_id ?? row.course?.id ?? "");
      if (!courseId) return;

      const baseCourse = courseMap.get(courseId) ?? normalizeCourse(row.course ?? { id: courseId });
      const projectType = inferProjectType(baseCourse);
      const baseKey = courseMatchKey(baseCourse);

      const representative =
        courseList.find((item) => courseMatchKey(item) === baseKey && !isSpecialCourse(item)) ??
        baseCourse;

      const old = map.get(baseKey);

      const project: ProjectDetail = {
        subjectCourseId: String(row.id ?? row.subjectCourseId ?? row.subject_course_id ?? ""),
        courseId,
        pricePerStudent: formatNumberInput(row.pricePerStudent ?? row.price_per_student ?? 0),
        registeredCount: formatNumberInput(row.registeredCount ?? row.registered_count ?? 0),
        status: String(row.status ?? "1"),
        isEditing: false,
      };

      const nextCard: CourseCard = old ?? {
        localId: baseKey || `${Date.now()}-${index}`,
        courseId: representative.id,
        courseName: representative.nameTh,
        courseCode: representative.shortName,
        branch: inferBranchFromCourse(representative),
        baseKey,
        normal: null,
        special: null,
      };

      if (projectType === "special") {
        nextCard.special = project;
      } else {
        nextCard.normal = project;
      }

      map.set(baseKey, nextCard);
    });

    setOfferings(Array.from(map.values()));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!subjectId) return;

      try {
        setLoading(true);
        hasLoadedSubjectRef.current = false;

        const [
          yearRes,
          semesterRes,
          studentYearRes,
          courseRes,
          subjectOutsideRes,
          subjectRes,
        ] = await Promise.all([
          GetDataYear(),
          GetDataSemester(),
          GetDataStudentYear(),
          GetDataCourse(),
          GetDataSubjectOutside(),
          GetDataSubjectById(subjectId),
        ]);

        const yearList = unwrapArray<any>(yearRes)
          .map((item) => ({
            id: Number(item?.id ?? item?.yearId ?? 0),
            year: String(item?.year ?? ""),
            status: String(item?.status ?? "1"),
          }))
          .filter((item) => item.status === "1");

        const semesterList = unwrapArray<any>(semesterRes)
          .map((item) => ({
            id: Number(item?.id ?? item?.semesterId ?? 0),
            name: String(item?.name ?? item?.semester ?? item?.semester_name ?? ""),
            status: String(item?.status ?? "1"),
          }))
          .filter((item) => item.status === "1");

        const studentYearList = unwrapArray<any>(studentYearRes)
          .map((item) => ({
            id: Number(item?.id ?? item?.studentYearId ?? 0),
            studentYear: String(item?.studentYear ?? item?.student_year ?? ""),
            status: String(item?.status ?? "1"),
          }))
          .filter((item) => item.status === "1");

        const courseList = unwrapArray<any>(courseRes)
          .map(normalizeCourse)
          .filter((item) => item.id && String(item.status) === "1");

        const subjectOutsideList = unwrapArray<any>(subjectOutsideRes)
          .map((item) => ({
            id: String(item?.id ?? ""),
            subjectCode: String(item?.subjectCode ?? item?.subject_code ?? ""),
            subjectName: String(item?.subjectName ?? item?.subject_name ?? ""),
            status: String(item?.status ?? "1"),
          }))
          .filter((item) => item.id && item.status === "1");

        const detail = unwrapResponse<SubjectDetailApi>(subjectRes);

        const loadedSubjectOutsideId = String(
          detail.subjectOutsideId ??
            detail.subject_outside_id ??
            detail.subjectOutside?.id ??
            detail.subject_outside?.id ??
            "",
        );

        const loadedSubjectCode = String(
          detail.subjectCode ??
            detail.subject_code ??
            "",
        ).slice(0, SUBJECT_CODE_MAX_LENGTH);

        const loadedSubjectName = String(
          detail.subjectName ??
            detail.subject_name ??
            "",
        ).slice(0, SUBJECT_NAME_MAX_LENGTH);

        loadedSubjectOutsideIdRef.current = loadedSubjectOutsideId;

        setYears(yearList);
        setSemesters(semesterList);
        setStudentYears(studentYearList);
        setCourses(courseList);
        setSubjectOutsides(subjectOutsideList);

        setSubjectOutsideId(loadedSubjectOutsideId);
        setSubjectCode(loadedSubjectCode);
        setSubjectName(loadedSubjectName);

        setYearId(String(detail.yearId ?? detail.year_id ?? ""));
        setSemesterId(String(detail.semesterId ?? detail.semester_id ?? ""));
        setStudentYearId(String(detail.studentYearId ?? detail.student_year_id ?? ""));

        buildOfferingsFromSubject(detail, courseList);

        hasLoadedSubjectRef.current = true;
      } catch (error: any) {
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error || "ไม่สามารถโหลดข้อมูลรายวิชาได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  useEffect(() => {
    if (!hasLoadedSubjectRef.current) return;
    if (!subjectOutsideId) return;

    if (subjectOutsideId === loadedSubjectOutsideIdRef.current) {
      return;
    }

    const selected = subjectOutsides.find((item) => item.id === subjectOutsideId);

    if (selected) {
      setSubjectCode((selected.subjectCode || "").slice(0, SUBJECT_CODE_MAX_LENGTH));
      setSubjectName((selected.subjectName || "").slice(0, SUBJECT_NAME_MAX_LENGTH));
    }
  }, [subjectOutsideId, subjectOutsides]);

  const selectedCourseOptions = useMemo(() => {
    const usedBaseKeys = new Set(
      offerings
        .filter((item) => item.localId !== editingCardId)
        .map((item) => item.baseKey),
    );

    const activeCourses = courses.filter((course) => {
      return !forcedBranch || inferBranchFromCourse(course) === forcedBranch;
    });

    return getUniqueBaseCourses(activeCourses).filter((course) => {
      return !usedBaseKeys.has(course.__baseKey || courseMatchKey(course));
    });
  }, [courses, offerings, forcedBranch, editingCardId]);

  const resetModal = () => {
    setSelectedCourseId("");
    setForcedBranch(null);
    setEditingCardId(null);
  };

  const getDefaultPriceByCourse = async (courseId: string) => {
    if (!subjectOutsideId) return "0";

    try {
      const response = await GetDataCourseById(courseId);
      const detail: CourseDetailResponse = unwrapResponse(response);
      const matched = detail?.subjectOutsideDeducts?.find((item) => {
        return String(item.subjectOutsideId) === String(subjectOutsideId);
      });

      return formatNumberInput(Number(matched?.amount || 0));
    } catch {
      return "0";
    }
  };

  const findSpecialCourseForCourse = (courseId: string) => {
    const selectedCourse = coursesById.get(String(courseId));
    if (!selectedCourse) return null;

    const key = courseMatchKey(selectedCourse);

    return (
      courses.find(
        (item) =>
          item.id !== courseId &&
          isSpecialCourse(item) &&
          courseMatchKey(item) === key,
      ) ??
      courses.find((item) => isSpecialCourse(item) && courseMatchKey(item) === key) ??
      null
    );
  };

  const findNormalCourseForCourse = (courseId: string) => {
    const selectedCourse = coursesById.get(String(courseId));
    if (!selectedCourse) return null;

    const key = courseMatchKey(selectedCourse);

    return courses.find((item) => !isSpecialCourse(item) && courseMatchKey(item) === key) ?? null;
  };

  const hasSpecialCourse = (card: CourseCard) => {
    return courses.some((item) => {
      return isSpecialCourse(item) && courseMatchKey(item) === card.baseKey;
    });
  };

  const openAddModal = async (branch?: Branch) => {
    if (!subjectOutsideId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกวิชานอกคณะก่อน",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    resetModal();

    if (branch) {
      setForcedBranch(branch);
    }

    setShowMajorModal(true);
  };

  const openEditModal = async (card: CourseCard) => {
    setEditingCardId(card.localId);
    setForcedBranch(card.branch);
    setSelectedCourseId(card.courseId);
    setShowMajorModal(true);
  };

  const handleAddCourseCard = async () => {
    const selectedCourse = courses.find((item) => item.id === selectedCourseId);

    if (!selectedCourse) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกหลักสูตร/สาขา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const baseKey = courseMatchKey(selectedCourse);
    const normalCourse = findNormalCourseForCourse(selectedCourse.id);
    const specialCourse = findSpecialCourseForCourse(selectedCourse.id);

    if (!normalCourse && !specialCourse) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่พบข้อมูลหลักสูตร",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const representativeCourse = normalCourse || specialCourse || selectedCourse;
    const normalPrice = normalCourse ? await getDefaultPriceByCourse(normalCourse.id) : "";
    const specialPrice =
      !normalCourse && specialCourse ? await getDefaultPriceByCourse(specialCourse.id) : "";

    const oldCard = editingCardId
      ? offerings.find((item) => item.localId === editingCardId)
      : null;

    const newCard: CourseCard = {
      localId: editingCardId || `${Date.now()}`,
      courseId: representativeCourse.id,
      courseName: representativeCourse.nameTh,
      courseCode: representativeCourse.shortName,
      branch: inferBranchFromCourse(representativeCourse),
      baseKey,
      normal: normalCourse
        ? oldCard?.normal && oldCard.normal.courseId === normalCourse.id
          ? oldCard.normal
          : {
              courseId: normalCourse.id,
              pricePerStudent: normalPrice,
              registeredCount: "",
              status: "1",
              isEditing: true,
            }
        : null,
      special:
        !normalCourse && specialCourse
          ? {
              courseId: specialCourse.id,
              pricePerStudent: specialPrice,
              registeredCount: "",
              status: "1",
              isEditing: true,
            }
          : oldCard?.special ?? null,
    };

    if (editingCardId) {
      setOfferings((prev) =>
        prev.map((item) => (item.localId === editingCardId ? newCard : item)),
      );
    } else {
      setOfferings((prev) => [...prev, newCard]);
    }

    setShowMajorModal(false);
    resetModal();
  };

  const updateProjectField = (
    localId: string,
    projectType: ProjectType,
    field: "pricePerStudent" | "registeredCount",
    value: string,
  ) => {
    if (field === "pricePerStudent") return;

    setOfferings((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const project = item[projectType];
        if (!project || !project.isEditing) return item;

        return {
          ...item,
          [projectType]: {
            ...project,
            registeredCount: formatIntInput(value, 11),
          },
        };
      }),
    );
  };

  const setProjectEditing = (
    localId: string,
    projectType: ProjectType,
    isEditing: boolean,
  ) => {
    setOfferings((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const project = item[projectType];
        if (!project) return item;

        return {
          ...item,
          [projectType]: {
            ...project,
            isEditing,
          },
        };
      }),
    );
  };

  const validateProjectBeforeSave = async (
    project: ProjectDetail | null,
    projectName: string,
  ) => {
    if (!project) return false;

    if (!stripComma(project.pricePerStudent)) {
      await Swal.fire({
        icon: "warning",
        title: `กรุณากรอกราคาต่อคนของ${projectName}`,
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!stripComma(project.registeredCount)) {
      await Swal.fire({
        icon: "warning",
        title: `กรุณากรอกจำนวนคนที่ลงทะเบียนของ${projectName}`,
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    return true;
  };

  const handleSaveProject = async (localId: string, projectType: ProjectType) => {
    const target = offerings.find((item) => item.localId === localId);
    if (!target) return;

    const projectName = projectType === "normal" ? "โครงการปกติ" : "โครงการพิเศษ";

    const isValid = await validateProjectBeforeSave(target[projectType], projectName);
    if (!isValid) return;

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text: `ต้องการบันทึก${projectName}ของ ${target.courseName} ใช่ไหม`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setProjectEditing(localId, projectType, false);

    await Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      text: `บันทึก${projectName}เรียบร้อยแล้ว`,
      confirmButtonColor: "#22c55e",
    });
  };

  const handleDeleteBranch = async (localId: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "ต้องการลบหลักสูตร/สาขานี้ใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setOfferings((prev) => prev.filter((item) => item.localId !== localId));
  };

  const handleAddNormal = async (localId: string) => {
    const target = offerings.find((item) => item.localId === localId);
    if (!target || target.normal) return;

    const normalCourse = courses.find((item) => {
      return !isSpecialCourse(item) && courseMatchKey(item) === target.baseKey;
    });

    if (!normalCourse) {
      await Swal.fire({
        icon: "warning",
        title: "หลักสูตรนี้ไม่มีโครงการปกติ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const defaultPrice = await getDefaultPriceByCourse(normalCourse.id);

    setOfferings((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              normal: {
                courseId: normalCourse.id,
                pricePerStudent: defaultPrice,
                registeredCount: "",
                status: "1",
                isEditing: true,
              },
            }
          : item,
      ),
    );
  };

  const handleDeleteNormal = async (localId: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "ต้องการลบโครงการปกติใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setOfferings((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, normal: null } : item)),
    );
  };

  const handleAddSpecial = async (localId: string) => {
    const target = offerings.find((item) => item.localId === localId);
    if (!target || target.special) return;

    const specialCourse = courses.find((item) => {
      return isSpecialCourse(item) && courseMatchKey(item) === target.baseKey;
    });

    if (!specialCourse) {
      await Swal.fire({
        icon: "warning",
        title: "หลักสูตรนี้ไม่มีโครงการพิเศษ",
        text: "ไม่พบหลักสูตรภาคพิเศษที่ผูกกับสาขานี้",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const specialPrice = await getDefaultPriceByCourse(specialCourse.id);

    setOfferings((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              special: {
                courseId: specialCourse.id,
                pricePerStudent: specialPrice,
                registeredCount: "",
                status: "1",
                isEditing: true,
              },
            }
          : item,
      ),
    );
  };

  const handleDeleteSpecial = async (localId: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "ต้องการลบโครงการพิเศษใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setOfferings((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, special: null } : item)),
    );
  };

  const handleUpdateSubject = async () => {
    if (!subjectOutsideId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกวิชานอกคณะ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!subjectCode.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกรหัสวิชา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!subjectName.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อวิชา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (subjectCode.trim().length > SUBJECT_CODE_MAX_LENGTH) {
      await Swal.fire({
        icon: "warning",
        title: `รหัสวิชาต้องไม่เกิน ${SUBJECT_CODE_MAX_LENGTH} ตัวอักษร`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (subjectName.trim().length > SUBJECT_NAME_MAX_LENGTH) {
      await Swal.fire({
        icon: "warning",
        title: `ชื่อวิชาต้องไม่เกิน ${SUBJECT_NAME_MAX_LENGTH} ตัวอักษร`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!yearId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกปีการศึกษา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!semesterId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกภาคการศึกษา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!studentYearId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกชั้นปี",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (offerings.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเพิ่มหลักสูตรที่เปิดสอนอย่างน้อย 1 รายการ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    for (const item of offerings) {
      if (!item.normal && !item.special) {
        await Swal.fire({
          icon: "warning",
          title: `กรุณาเพิ่มโครงการของ ${item.courseName} อย่างน้อย 1 โครงการ`,
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      if (
        item.normal &&
        !(await validateProjectBeforeSave(item.normal, `${item.courseName} - โครงการปกติ`))
      ) {
        return;
      }

      if (
        item.special &&
        !(await validateProjectBeforeSave(item.special, `${item.courseName} - โครงการพิเศษ`))
      ) {
        return;
      }
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึกการเปลี่ยนแปลง",
      text: "ต้องการบันทึกข้อมูลรายวิชานี้ใช่ไหม",
      showCancelButton: true,
      confirmButtonText: "บันทึกการเปลี่ยนแปลง",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    const payload = {
      yearId: Number(yearId),
      studentYearId: Number(studentYearId),
      semesterId: Number(semesterId),
      subjectOutsideId,
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      status,
      subjectCourses: offerings.flatMap((item) => {
        const rows: any[] = [];

        if (item.normal) {
          rows.push({
            id: item.normal.subjectCourseId || undefined,
            subjectCourseId: item.normal.subjectCourseId || undefined,
            courseId: item.normal.courseId,
            pricePerStudent: Number(stripComma(item.normal.pricePerStudent) || 0),
            registeredCount: Number(stripComma(item.normal.registeredCount) || 0),
            status: item.normal.status,
          });
        }

        if (item.special) {
          rows.push({
            id: item.special.subjectCourseId || undefined,
            subjectCourseId: item.special.subjectCourseId || undefined,
            courseId: item.special.courseId,
            pricePerStudent: Number(stripComma(item.special.pricePerStudent) || 0),
            registeredCount: Number(stripComma(item.special.registeredCount) || 0),
            status: item.special.status,
          });
        }

        return rows;
      }),
    };

    try {
      setSubmitting(true);

      await EditDataSubject(subjectId, payload);

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แก้ไขรายวิชาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      navigate("/subjects");
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถแก้ไขข้อมูลรายวิชาได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderProjectActions = (card: CourseCard, projectType: ProjectType) => {
    const project = card[projectType];
    if (!project) return null;

    const handleDelete = projectType === "normal" ? handleDeleteNormal : handleDeleteSpecial;

    if (project.isEditing) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveProject(card.localId, projectType)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white transition hover:bg-blue-600"
          >
            <SaveIcon />
            บันทึก
          </button>

          <ActionIconButton
            title={projectType === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
            variant="delete"
            onClick={() => handleDelete(card.localId)}
          >
            <TrashIcon />
          </ActionIconButton>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <ActionIconButton
          title={projectType === "normal" ? "แก้ไขโครงการปกติ" : "แก้ไขโครงการพิเศษ"}
          variant="edit"
          onClick={() => setProjectEditing(card.localId, projectType, true)}
        >
          <EditIcon />
        </ActionIconButton>

        <ActionIconButton
          title={projectType === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
          variant="delete"
          onClick={() => handleDelete(card.localId)}
        >
          <TrashIcon />
        </ActionIconButton>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-5 text-sm text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-3 sm:p-5">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <h1 className="text-lg font-bold text-black sm:text-xl">
          แก้ไขรายวิชา
        </h1>

        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-gray-900">
            ข้อมูลพื้นฐาน <span className="text-red-500">*</span>
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                วิชานอกคณะ <span className="text-red-500">*</span>
              </label>

              <SelectBox
                value={subjectOutsideId}
                onChange={(e) => setSubjectOutsideId(e.target.value)}
              >
                <option value="">เลือกวิชานอกคณะ</option>
                {subjectOutsides.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.subjectCode} - {item.subjectName}
                  </option>
                ))}
              </SelectBox>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                ชื่อวิชา <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                maxLength={SUBJECT_NAME_MAX_LENGTH}
                value={subjectName}
                onChange={(e) =>
                  setSubjectName(e.target.value.slice(0, SUBJECT_NAME_MAX_LENGTH))
                }
                placeholder="เช่น ภาษาอังกฤษ 3"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                รหัสวิชา <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                maxLength={SUBJECT_CODE_MAX_LENGTH}
                value={subjectCode}
                onChange={(e) =>
                  setSubjectCode(
                    e.target.value.toUpperCase().slice(0, SUBJECT_CODE_MAX_LENGTH),
                  )
                }
                placeholder="เช่น LI102003"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>

              <SelectBox value={yearId} onChange={(e) => setYearId(e.target.value)}>
                <option value="">เลือกปีการศึกษา</option>
                {years.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.year}
                  </option>
                ))}
              </SelectBox>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                ภาคการศึกษา <span className="text-red-500">*</span>
              </label>

              <SelectBox
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
              >
                <option value="">เลือกภาคการศึกษา</option>
                {semesters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectBox>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black">
                ชั้นปี <span className="text-red-500">*</span>
              </label>

              <SelectBox
                value={studentYearId}
                onChange={(e) => setStudentYearId(e.target.value)}
              >
                <option value="">เลือกชั้นปี</option>
                {studentYears.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.studentYear}
                  </option>
                ))}
              </SelectBox>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-400 px-10 py-3 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleUpdateSubject}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SaveIcon />
              {submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </section>

        <section className={sectionCls}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              สาขาที่เปิดสอน
            </h2>

            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex h-[40px] items-center gap-2 rounded-[14px] bg-blue-500 px-6 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              <PlusIcon />
              เพิ่มสาขา
            </button>
          </div>

          <div className="mt-4">
            {offerings.length === 0 ? (
              <EmptyAddBox
                title="ยังไม่มีสาขา"
                description='กดปุ่ม "เพิ่มสาขา" เพื่อเพิ่มสาขาที่เปิดสอนวิชานี้'
                onClick={() => openAddModal()}
              />
            ) : (
              <div className="space-y-4">
                {offerings.map((card) => {
                  const branchStyle = BRANCH_STYLE[card.branch];

                  return (
                    <div
                      key={card.localId}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${branchStyle.bg} text-[18px] font-semibold text-white shadow-sm`}
                          >
                            {branchStyle.text}
                          </div>

                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-base font-bold leading-6 text-black sm:text-lg">
                              {card.courseName}
                            </h3>

                            <p className="mt-0.5 text-xs font-medium text-gray-400">
                              {card.courseCode || "หลักสูตร/สาขา"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1.5">
                          {!card.normal && (
                            <button
                              type="button"
                              onClick={() => handleAddNormal(card.localId)}
                              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <PlusIcon />
                              เพิ่มโครงการปกติ
                            </button>
                          )}

                          {!card.special && hasSpecialCourse(card) && (
                            <button
                              type="button"
                              onClick={() => handleAddSpecial(card.localId)}
                              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-500 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <PlusIcon />
                              เพิ่มโครงการพิเศษ
                            </button>
                          )}

                          <ActionIconButton
                            title="แก้ไขหลักสูตร"
                            variant="edit"
                            onClick={() => openEditModal(card)}
                          >
                            <EditIcon />
                          </ActionIconButton>

                          <ActionIconButton
                            title="ลบหลักสูตร"
                            variant="delete"
                            onClick={() => handleDeleteBranch(card.localId)}
                          >
                            <TrashIcon />
                          </ActionIconButton>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(["normal", "special"] as ProjectType[]).map((type) => {
                          const project = card[type];
                          if (!project) return null;

                          const title = type === "normal" ? "โครงการปกติ" : "โครงการพิเศษ";

                          return (
                            <div
                              key={type}
                              className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_8px_rgba(15,23,42,0.04)]"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h4 className="text-sm font-bold text-gray-900">
                                  {title}
                                </h4>

                                {renderProjectActions(card, type)}
                              </div>

                              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-black">
                                    ราคาต่อคน (บาท)
                                  </label>

                                  <input
                                    type="text"
                                    value={project.pricePerStudent}
                                    readOnly
                                    disabled
                                    title="ราคาดึงจากวิชานอกคณะ ไม่สามารถแก้ไขได้"
                                    className={readOnlyInputCls}
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-black">
                                    จำนวนคนที่ลงทะเบียน
                                  </label>

                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={14}
                                    value={project.registeredCount}
                                    disabled={!project.isEditing}
                                    readOnly={!project.isEditing}
                                    onChange={(e) =>
                                      updateProjectField(
                                        card.localId,
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
                                    className={project.isEditing ? inputCls : readOnlyInputCls}
                                  />
                                </div>
                              </div>

                              <SectionTotal
                                price={project.pricePerStudent}
                                count={project.registeredCount}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {showMajorModal && (
        <ModalBase
          onClose={() => {
            setShowMajorModal(false);
            resetModal();
          }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#155EEF22]">
              <PlusIcon className="text-[#155EEF]" />
            </div>

            <h2 className="flex-1 text-base font-bold text-gray-900">
              {editingCardId ? "แก้ไขหลักสูตร/สาขา" : "เพิ่มหลักสูตร/สาขา"}
            </h2>

            <CloseBtn
              onClick={() => {
                setShowMajorModal(false);
                resetModal();
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                หลักสูตร/สาขา <span className="text-red-500">*</span>
              </label>

              <GroupedCourseCardDropdown
                value={selectedCourseId}
                courses={selectedCourseOptions}
                onChange={setSelectedCourseId}
              />

              {selectedCourseOptions.length === 0 && (
                <p className="mt-2 text-xs text-red-400">
                  ไม่พบหลักสูตร/สาขาที่สามารถเลือกได้
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowMajorModal(false);
                resetModal();
              }}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleAddCourseCard}
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