import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  AddDataSubject,
  GetDataCourse,
  GetDataCourseById,
  GetDataSemester,
  GetDataStudentYear,
  GetDataSubjectOutside,
  GetDataYear,
} from "../../../fetchapi/fetch_api_admin";

type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

type CourseItem = {
  id: string;
  degreeLevelId?: string;
  degreeLevelName?: string;
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

type ProjectDetail = {
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
  normal: ProjectDetail | null;
  special: ProjectDetail | null;
  isSaved: boolean;
};

const inputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const readOnlyInputCls =
  "w-full h-10 cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none";

const selectCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:bg-white";

const sectionCls =
  "rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm";

const SUBJECT_CODE_MAX_LENGTH = 8;
const SUBJECT_NAME_MAX_LENGTH = 255;

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

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6 M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 transition-colors hover:text-gray-700"
    >
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
    </button>
  );
}

function ModalBase({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
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

function EmptyAddBox({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  buttonText?: string;
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

function IconButton({
  title,
  variant = "default",
  onClick,
  children,
}: {
  title: string;
  variant?: "default" | "danger" | "primary";
  onClick: () => void;
  children: React.ReactNode;
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

function formatNumberInput(value: string) {
  const raw = stripComma(value).replace(/\D/g, "");
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

function inferBranchFromCourse(course: CourseItem): Branch {
  const text = `${course.nameTh} ${course.shortName}`.toLowerCase();

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

function inferProjectType(course: CourseItem): "normal" | "special" {
  const text =
    `${course.nameTh} ${course.nameEn} ${course.degreeLevelName || ""}`.toLowerCase();

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

function courseDisplayName(course: CourseItem) {
  const branch = inferBranchFromCourse(course);
  return `${branch} - ${course.nameTh}`;
}

function SectionTotal({ price, count }: { price: string; count: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
      ราคารวม :{" "}
      <span className="font-medium text-blue-600">
        ฿ {(toNumber(price) * toNumber(count)).toLocaleString("th-TH")}
      </span>
    </div>
  );
}

export default function SubjectAdd() {
  const navigate = useNavigate();

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
  const [subjectOutsides, setSubjectOutsides] = useState<SubjectOutsideItem[]>(
    [],
  );
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const [offerings, setOfferings] = useState<CourseCard[]>([]);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [forcedBranch, setForcedBranch] = useState<Branch | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          yearList,
          semesterList,
          studentYearList,
          courseList,
          subjectOutsideList,
        ] = await Promise.all([
          GetDataYear(),
          GetDataSemester(),
          GetDataStudentYear(),
          GetDataCourse(),
          GetDataSubjectOutside(),
        ]);

        setYears(
          (yearList || [])
            .map((item: any) => ({
              id: Number(item?.id ?? item?.yearId ?? 0),
              year: String(item?.year ?? ""),
              status: String(item?.status ?? "1"),
            }))
            .filter((item: YearItem) => item.status === "1"),
        );

        setSemesters(
          (semesterList || [])
            .map((item: any) => ({
              id: Number(item?.id ?? item?.semesterId ?? 0),
              name: String(
                item?.name ?? item?.semester ?? item?.semester_name ?? "",
              ),
              status: String(item?.status ?? "1"),
            }))
            .filter((item: SemesterItem) => item.status === "1"),
        );

        setStudentYears(
          (studentYearList || [])
            .map((item: any) => ({
              id: Number(item?.id ?? item?.studentYearId ?? 0),
              studentYear: String(
                item?.studentYear ?? item?.student_year ?? "",
              ),
              status: String(item?.status ?? "1"),
            }))
            .filter((item: StudentYearItem) => item.status === "1"),
        );

        setCourses(
          (courseList || []).filter(
            (item: CourseItem) => String(item.status) === "1",
          ),
        );

        setSubjectOutsides(
          (subjectOutsideList || [])
            .map((item: any) => ({
              id: String(item?.id ?? ""),
              subjectCode: String(item?.subjectCode ?? item?.subject_code ?? ""),
              subjectName: String(item?.subjectName ?? item?.subject_name ?? ""),
              status: String(item?.status ?? "1"),
            }))
            .filter((item: SubjectOutsideItem) => item.status === "1"),
        );
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error || "ไม่สามารถโหลดข้อมูลเริ่มต้นได้",
          confirmButtonColor: "#2563eb",
        });
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const selected = subjectOutsides.find(
      (item) => item.id === subjectOutsideId,
    );

    if (selected) {
      setSubjectCode(
        (selected.subjectCode || "").slice(0, SUBJECT_CODE_MAX_LENGTH),
      );
      setSubjectName(
        (selected.subjectName || "").slice(0, SUBJECT_NAME_MAX_LENGTH),
      );
    }
  }, [subjectOutsideId, subjectOutsides]);

  const selectedCourseOptions = useMemo(() => {
    const usedCourseIds = new Set(
      offerings
        .filter((item) => item.localId !== editingCardId)
        .map((item) => item.courseId),
    );

    return courses.filter((course) => {
      if (isSpecialCourse(course)) return false;
      if (usedCourseIds.has(course.id)) return false;
      if (!forcedBranch) return true;
      return inferBranchFromCourse(course) === forcedBranch;
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
      const detail: CourseDetailResponse = response?.data || response;

      const matched = detail?.subjectOutsideDeducts?.find(
        (item) => String(item.subjectOutsideId) === String(subjectOutsideId),
      );

      const amount = Number(matched?.amount || 0);
      return formatNumberInput(String(amount));
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

  const hasSpecialCourse = (card: CourseCard) => {
    return !!findSpecialCourseForCourse(card.courseId);
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
    const course = courses.find((item) => item.id === selectedCourseId);

    if (!course) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกหลักสูตร/สาขา",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const defaultPrice = await getDefaultPriceByCourse(course.id);

    const newCard: CourseCard = {
      localId: editingCardId || `${Date.now()}`,
      courseId: course.id,
      courseName: course.nameTh,
      courseCode: course.shortName,
      branch: inferBranchFromCourse(course),
      normal: {
        courseId: course.id,
        pricePerStudent: defaultPrice,
        registeredCount: "",
        status: "1",
        isEditing: true,
      },
      special: null,
      isSaved: false,
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
    projectType: "normal" | "special",
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
          isSaved: false,
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
    projectType: "normal" | "special",
    isEditing: boolean,
  ) => {
    setOfferings((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const project = item[projectType];
        if (!project) return item;

        return {
          ...item,
          isSaved: false,
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

  const handleSaveProject = async (
    localId: string,
    projectType: "normal" | "special",
  ) => {
    const target = offerings.find((item) => item.localId === localId);
    if (!target) return;

    const project = target[projectType];
    const projectName =
      projectType === "normal" ? "โครงการปกติ" : "โครงการพิเศษ";

    const isValid = await validateProjectBeforeSave(project, projectName);
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

    setOfferings((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const currentProject = item[projectType];
        if (!currentProject) return item;

        const updatedItem = {
          ...item,
          [projectType]: {
            ...currentProject,
            isEditing: false,
          },
        };

        const normalDone =
          !updatedItem.normal || updatedItem.normal.isEditing === false;
        const specialDone =
          !updatedItem.special || updatedItem.special.isEditing === false;

        return {
          ...updatedItem,
          isSaved: normalDone && specialDone,
        };
      }),
    );

    await Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      text: `บันทึก${projectName}เรียบร้อยแล้ว`,
      confirmButtonColor: "#22c55e",
    });
  };

  const handleSaveBranch = async (localId: string) => {
    const target = offerings.find((item) => item.localId === localId);
    if (!target) return;

    if (!target.normal && !target.special) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเพิ่มโครงการอย่างน้อย 1 โครงการ",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (target.normal) {
      const isValidNormal = await validateProjectBeforeSave(
        target.normal,
        "โครงการปกติ",
      );

      if (!isValidNormal) return;
    }

    if (target.special) {
      const isValidSpecial = await validateProjectBeforeSave(
        target.special,
        "โครงการพิเศษ",
      );

      if (!isValidSpecial) return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text: `ต้องการบันทึกข้อมูลของ ${target.courseName} ใช่ไหม`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setOfferings((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              isSaved: true,
              normal: item.normal
                ? {
                    ...item.normal,
                    isEditing: false,
                  }
                : null,
              special: item.special
                ? {
                    ...item.special,
                    isEditing: false,
                  }
                : null,
            }
          : item,
      ),
    );

    await Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      text: "บันทึกข้อมูลหลักสูตร/สาขาเรียบร้อยแล้ว",
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

    const defaultPrice = await getDefaultPriceByCourse(target.courseId);

    setOfferings((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              isSaved: false,
              normal: {
                courseId: item.courseId,
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
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              normal: null,
              isSaved: false,
            }
          : item,
      ),
    );
  };

  const handleAddSpecial = async (localId: string) => {
    const target = offerings.find((item) => item.localId === localId);
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

    const specialPrice = await getDefaultPriceByCourse(specialCourse.id);

    setOfferings((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? {
              ...item,
              isSaved: false,
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
      prev.map((item) =>
        item.localId === localId
          ? { ...item, special: null, isSaved: false }
          : item,
      ),
    );
  };

  const handleCreateSubject = async () => {
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

      if (item.normal) {
        const isValidNormal = await validateProjectBeforeSave(
          item.normal,
          `${item.courseName} - โครงการปกติ`,
        );

        if (!isValidNormal) return;
      }

      if (item.special) {
        const isValidSpecial = await validateProjectBeforeSave(
          item.special,
          `${item.courseName} - โครงการพิเศษ`,
        );

        if (!isValidSpecial) return;
      }
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึกทั้งหมด",
      text: "ต้องการบันทึกข้อมูลรายวิชาและหลักสูตรทั้งหมดใช่ไหม",
      showCancelButton: true,
      confirmButtonText: "บันทึกทั้งหมด",
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
      subjectOutsideId: subjectOutsideId,
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      status,
      subjectCourses: offerings.flatMap((item) => {
        const rows: {
          courseId: string;
          pricePerStudent: number;
          registeredCount: number;
          status: string;
        }[] = [];

        if (item.normal) {
          rows.push({
            courseId: item.normal.courseId || item.courseId,
            pricePerStudent: Number(stripComma(item.normal.pricePerStudent) || 0),
            registeredCount: Number(stripComma(item.normal.registeredCount) || 0),
            status: item.normal.status,
          });
        }

        if (item.special) {
          rows.push({
            courseId: item.special.courseId || item.courseId,
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

      console.log("CREATE SUBJECT PAYLOAD:", payload);

      await AddDataSubject(payload);

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "เพิ่มรายวิชาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      navigate("/subjects");
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถเพิ่มข้อมูลรายวิชาได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderProjectActions = (
    card: CourseCard,
    projectType: "normal" | "special",
  ) => {
    const project = card[projectType];

    if (!project) return null;

    const handleDelete =
      projectType === "normal" ? handleDeleteNormal : handleDeleteSpecial;

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

          <IconButton
            title={projectType === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
            variant="danger"
            onClick={() => handleDelete(card.localId)}
          >
            <TrashIcon />
          </IconButton>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <IconButton
          title={projectType === "normal" ? "แก้ไขโครงการปกติ" : "แก้ไขโครงการพิเศษ"}
          variant="primary"
          onClick={() => setProjectEditing(card.localId, projectType, true)}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title={projectType === "normal" ? "ลบโครงการปกติ" : "ลบโครงการพิเศษ"}
          variant="danger"
          onClick={() => handleDelete(card.localId)}
        >
          <TrashIcon />
        </IconButton>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-3 sm:p-5">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <h1 className="text-lg font-bold text-black sm:text-xl">
          เพิ่มรายวิชาใหม่
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
                onChange={(e) => setSubjectOutsideId(e.target.value)}
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
                value={subjectName}
                maxLength={SUBJECT_NAME_MAX_LENGTH}
                onChange={(e) =>
                  setSubjectName(e.target.value.slice(0, SUBJECT_NAME_MAX_LENGTH))
                }
                placeholder="เช่น ภาษาอังกฤษ 3"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                รหัสวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subjectCode}
                maxLength={SUBJECT_CODE_MAX_LENGTH}
                onChange={(e) =>
                  setSubjectCode(e.target.value.slice(0, SUBJECT_CODE_MAX_LENGTH))
                }
                placeholder="เช่น LI102003"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>
              <select
                value={yearId}
                onChange={(e) => setYearId(e.target.value)}
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
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className={selectCls}
              >
                <option value="">เลือกภาคการศึกษา</option>
                {semesters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-800">
                ชั้นปี <span className="text-red-500">*</span>
              </label>
              <select
                value={studentYearId}
                onChange={(e) => setStudentYearId(e.target.value)}
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
        </section>

        <section className={sectionCls}>
          <div className="flex items-center justify-between gap-4">
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
                buttonText="เพิ่มสาขา"
                onClick={() => openAddModal()}
              />
            ) : (
              <div className="space-y-4">
                {offerings.map((card) => {
                  const branchStyle = BRANCH_STYLE[card.branch];

                  return (
                    <div
                      key={card.localId}
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
                              {card.courseName}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {card.courseCode || "หลักสูตร/สาขา"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1.5 lg:justify-end">
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

                          <IconButton
                            title="แก้ไขหลักสูตร"
                            variant="primary"
                            onClick={() => openEditModal(card)}
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            title="ลบหลักสูตร"
                            variant="danger"
                            onClick={() => handleDeleteBranch(card.localId)}
                          >
                            <TrashIcon />
                          </IconButton>
                        </div>
                      </div>

                      {card.normal && (
                        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-3">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base font-semibold text-black">
                              โครงการปกติ
                            </h4>

                            {renderProjectActions(card, "normal")}
                          </div>

                          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs text-black">
                                ราคาต่อคน (บาท)
                              </label>
                              <input
                                type="text"
                                value={card.normal.pricePerStudent}
                                readOnly
                                disabled
                                title="ราคาดึงจากวิชานอกคณะ ไม่สามารถแก้ไขได้"
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
                                pattern="[0-9]*"
                                maxLength={14}
                                value={card.normal.registeredCount}
                                disabled={!card.normal.isEditing}
                                readOnly={!card.normal.isEditing}
                                onChange={(e) =>
                                  updateProjectField(
                                    card.localId,
                                    "normal",
                                    "registeredCount",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                className={
                                  card.normal.isEditing ? inputCls : readOnlyInputCls
                                }
                              />
                            </div>
                          </div>

                          <SectionTotal
                            price={card.normal.pricePerStudent}
                            count={card.normal.registeredCount}
                          />
                        </div>
                      )}

                      {card.special && (
                        <div className="mt-3 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-3">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base font-semibold text-black">
                              โครงการพิเศษ
                            </h4>

                            {renderProjectActions(card, "special")}
                          </div>

                          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs text-black">
                                ราคาต่อคน (บาท)
                              </label>
                              <input
                                type="text"
                                value={card.special.pricePerStudent}
                                readOnly
                                disabled
                                title="ราคาดึงจากวิชานอกคณะ ไม่สามารถแก้ไขได้"
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
                                pattern="[0-9]*"
                                maxLength={14}
                                value={card.special.registeredCount}
                                disabled={!card.special.isEditing}
                                readOnly={!card.special.isEditing}
                                onChange={(e) =>
                                  updateProjectField(
                                    card.localId,
                                    "special",
                                    "registeredCount",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                className={
                                  card.special.isEditing ? inputCls : readOnlyInputCls
                                }
                              />
                            </div>
                          </div>

                          <SectionTotal
                            price={card.special.pricePerStudent}
                            count={card.special.registeredCount}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 border border-gray-400 hover:bg-gray-50 text-gray-800 text-xs font-medium px-10 py-3 rounded-lg transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleCreateSubject}
            disabled={submitting}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SaveIcon />
            {submitting ? "กำลังบันทึก..." : "สร้างรายวิชา"}
          </button>
        </div>
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