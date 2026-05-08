import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  GetDataCourseById,
  GetDataDegreeLevel,
  GetDataSubjectCategory,
  GetDataSubjectOutside,
  GetDataYear,
  EditDataCourse,
} from "../../../fetchapi/fetch_api_admin";

interface DegreeLevelOption {
  id: string;
  name: string;
  shortName: string;
  sectionId?: number;
  sectionName?: string;
}

interface SubjectCategoryOption {
  id: string;
  name: string;
}

interface SubjectOutsideOption {
  id: string;
  subjectCode: string;
  subjectName: string;
}

interface YearOption {
  id: number;
  year: string;
}

interface SubjectGroup {
  id: string;
  subjectCategoryId: string;
  credit: string;
}

interface OutsideSubject {
  id: string;
  subjectOutsideId: string;
  amount: string;
}

interface StudentYear {
  id: string;
  yearId: string;
  studentAmount: string;
}

type CourseDetailResponse = {
  id: string;
  degreeLevelId: string;
  degreeLevelName: string;
  sectionName: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  studyDuration: number;
  tuitionFees: number;
  deductToUni: number;
  status: string;
  structures: {
    id: string;
    subjectCategoryId: string;
    subjectCategoryName: string;
    credit: number;
  }[];
  subjectOutsideDeducts: {
    id: string;
    subjectOutsideId: string;
    subjectCode: string;
    subjectName: string;
    amount: number;
  }[];
  students: {
    id: string;
    yearId: number;
    year: string;
    amount: number;
  }[];
};

const inputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const numberInputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const sectionCls =
  "rounded-[24px] border border-gray-300 bg-white px-5 py-5 shadow-sm";

const selectCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:bg-white appearance-none";

const viewBoxCls =
  "w-full min-h-[40px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 flex items-center";

const AddBigIcon = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6 M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const EditIcon = () => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const SaveSmallIcon = () => (
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
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

function SectionTitle({
  title,
  required = false,
}: {
  title: string;
  required?: boolean;
}) {
  return (
    <h2 className="text-[18px] font-semibold text-gray-900">
      {title} {required && <span className="text-red-500">*</span>}
    </h2>
  );
}

function HeaderAddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[40px] items-center gap-2 rounded-[14px] bg-blue-500 px-6 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
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
      {label}
    </button>
  );
}

function SelectArrow() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
      className="mt-5 flex min-h-[182px] w-full flex-col items-center justify-center rounded-[14px] border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:bg-gray-50"
    >
      <AddBigIcon />
      <p className="mt-3 text-[18px] font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </button>
  );
}

function makeLocalId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function numberOrZero(value: any) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function stringValue(value: any) {
  return String(value ?? "").trim();
}

function onlyInteger(value: string) {
  if (value === "") return "";
  if (!/^\d+$/.test(value)) return null;
  return value;
}

function onlyNumberWithDecimal(value: string) {
  if (value === "") return "";
  if (!/^\d*\.?\d{0,2}$/.test(value)) return null;
  return value;
}

function formatDegreeLabel(level: DegreeLevelOption) {
  const sectionName = (level.sectionName || "").trim();
  if (!sectionName) return level.name;
  return `${level.name} (${sectionName})`;
}

function buildCourseCodePrefix(level?: DegreeLevelOption | null) {
  if (!level?.shortName) return "";
  return level.shortName.trim().toUpperCase();
}

function mapCourseDetail(raw: any): CourseDetailResponse {
  const data = raw?.data ?? raw ?? {};

  return {
    id: stringValue(data.id),
    degreeLevelId: stringValue(data.degreeLevelId ?? data.degree_level_id),
    degreeLevelName: stringValue(
      data.degreeLevelName ?? data.degreeLevel?.name ?? data.degree_level_name,
    ),
    sectionName: stringValue(
      data.sectionName ??
      data.degreeLevel?.sectionName ??
      data.degreeLevel?.section?.sectionName ??
      data.degreeLevel?.section?.name,
    ),
    nameTh: stringValue(data.nameTh ?? data.name_th),
    nameEn: stringValue(data.nameEn ?? data.name_en),
    shortName: stringValue(data.shortName ?? data.short_name),
    studyDuration: numberOrZero(data.studyDuration ?? data.study_duration),
    tuitionFees: numberOrZero(data.tuitionFees ?? data.tuition_fees),
    deductToUni: numberOrZero(data.deductToUni ?? data.deduct_to_uni),
    status: stringValue(data.status || "1"),
    structures: (data.structures ?? []).map((item: any) => ({
      id: stringValue(item.id),
      subjectCategoryId: stringValue(
        item.subjectCategoryId ?? item.subject_category_id,
      ),
      subjectCategoryName: stringValue(
        item.subjectCategoryName ??
        item.subjectCategory?.name ??
        item.subject_category_name,
      ),
      credit: numberOrZero(item.credit ?? item.credits),
    })),
    subjectOutsideDeducts: (
      data.subjectOutsideDeducts ??
      data.subject_outside_deducts ??
      []
    ).map((item: any) => ({
      id: stringValue(item.id),
      subjectOutsideId: stringValue(
        item.subjectOutsideId ?? item.subject_outside_id,
      ),
      subjectCode: stringValue(
        item.subjectCode ??
        item.subjectOutside?.subjectCode ??
        item.subjectOutside?.subject_code,
      ),
      subjectName: stringValue(
        item.subjectName ??
        item.subjectOutside?.subjectName ??
        item.subjectOutside?.subject_name,
      ),
      amount: numberOrZero(item.amount),
    })),
    students: (data.students ?? [])
      .map((item: any) => ({
        id: stringValue(item.id),
        yearId: numberOrZero(item.yearId ?? item.year_id),
        year: stringValue(
          item.year ?? item.yearData?.year ?? item.year_data?.year,
        ),
        amount: numberOrZero(
          item.amount ?? item.studentAmount ?? item.student_amount,
        ),
      }))
      .sort((a: any, b: any) => Number(a.year) - Number(b.year)),
  };
}

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [degreeLevels, setDegreeLevels] = useState<DegreeLevelOption[]>([]);
  const [subjectCategories, setSubjectCategories] = useState<
    SubjectCategoryOption[]
  >([]);
  const [subjectOutsides, setSubjectOutsides] = useState<SubjectOutsideOption[]>(
    [],
  );
  const [years, setYears] = useState<YearOption[]>([]);

  const [degreeLevelId, setDegreeLevelId] = useState("");
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [duration, setDuration] = useState("");
  const [fee, setFee] = useState("");
  const [uniDeduct, setUniDeduct] = useState("");
  const [status, setStatus] = useState("1");

  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [outsideSubjects, setOutsideSubjects] = useState<OutsideSubject[]>([]);
  const [students, setStudents] = useState<StudentYear[]>([]);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingOutsideId, setEditingOutsideId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const stripComma = (value: string) => {
    return String(value || "").replace(/,/g, "");
  };

  const formatNumberWithComma = (value: string) => {
    const raw = stripComma(value);
    if (!raw) return "";

    const [integerPart, decimalPart] = raw.split(".");
    const formattedInteger = integerPart
      ? Number(integerPart).toLocaleString("en-US")
      : "";

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const handleMoneyInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const raw = stripComma(value);

    if (raw === "") {
      setter("");
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;

    setter(formatNumberWithComma(raw));
  };

  const handleIntegerCommaInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const raw = stripComma(value);

    if (raw === "") {
      setter("");
      return;
    }

    if (!/^\d+$/.test(raw)) return;

    setter(Number(raw).toLocaleString("en-US"));
  };

  const selectedDegreeLevel = useMemo(
    () => degreeLevels.find((item) => item.id === degreeLevelId) || null,
    [degreeLevels, degreeLevelId],
  );

  const courseCodePrefix = useMemo(
    () => buildCourseCodePrefix(selectedDegreeLevel),
    [selectedDegreeLevel],
  );

  const totalCredits = useMemo(
    () =>
      groups.reduce(
        (sum, item) => sum + (Number(stripComma(item.credit)) || 0),
        0,
      ),
    [groups],
  );

  const totalStudents = useMemo(
    () =>
      students.reduce(
        (sum, item) => sum + (Number(stripComma(item.studentAmount)) || 0),
        0,
      ),
    [students],
  );

  const loadInitialData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [degreeRes, categoryRes, outsideRes, yearRes, courseRes] =
        await Promise.all([
          GetDataDegreeLevel(),
          GetDataSubjectCategory(),
          GetDataSubjectOutside(),
          GetDataYear(),
          GetDataCourseById(id),
        ]);

      const mappedDegreeLevels: DegreeLevelOption[] = (degreeRes || []).map(
        (item: any) => ({
          id: item.id,
          name: item.name || item.degreeLevel || "",
          shortName: item.shortName || "",
          sectionId: Number(item.sectionId ?? item.section?.id ?? 0),
          sectionName:
            item.sectionName ||
            item.section?.sectionName ||
            item.section?.name ||
            "",
        }),
      );

      const mappedCategories: SubjectCategoryOption[] = (categoryRes || []).map(
        (item: any) => ({
          id: item.id,
          name: item.name || "",
        }),
      );

      const mappedOutsides: SubjectOutsideOption[] = (outsideRes || []).map(
        (item: any) => ({
          id: item.id,
          subjectCode: item.subjectCode || "",
          subjectName: item.subjectName || "",
        }),
      );

      const mappedYears: YearOption[] = (yearRes || []).map((item: any) => ({
        id: numberOrZero(item.id),
        year: stringValue(item.year),
      }));

      const course = mapCourseDetail(courseRes);

      setDegreeLevels(mappedDegreeLevels);
      setSubjectCategories(mappedCategories);
      setSubjectOutsides(mappedOutsides);
      setYears(mappedYears);

      setDegreeLevelId(course.degreeLevelId);
      setCode(course.shortName || "");
      setNameTh(course.nameTh || "");
      setNameEn(course.nameEn || "");
      setDuration(String(course.studyDuration || ""));
      setFee(String(course.tuitionFees || ""));
      setUniDeduct(String(course.deductToUni || ""));
      setStatus(course.status || "1");

      setGroups(
        (course.structures || []).map((item) => ({
          id: item.id || makeLocalId(),
          subjectCategoryId: item.subjectCategoryId,
          credit: String(item.credit ?? 0),
        })),
      );

      setOutsideSubjects(
        (course.subjectOutsideDeducts || []).map((item) => ({
          id: item.id || makeLocalId(),
          subjectOutsideId: item.subjectOutsideId,
          amount: String(item.amount ?? 0),
        })),
      );

      setStudents(
        (course.students || []).map((item) => ({
          id: item.id || makeLocalId(),
          yearId: String(item.yearId ?? ""),
          studentAmount: String(item.amount ?? 0),
        })),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถโหลดข้อมูลหลักสูตรได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const handleCodeChange = (value: string) => {
    const prefix = courseCodePrefix ? `${courseCodePrefix}.` : "";
    let next = value.toUpperCase().replace(/[^A-Z0-9.]/g, "");

    if (!prefix) {
      setCode(next.slice(0, 10));
      return;
    }

    if (!next.startsWith(prefix)) {
      if (next === "" || prefix.startsWith(next)) {
        setCode(next);
        return;
      }

      const normalizedPrefix = prefix.replace(/\./g, "");
      const normalizedValue = next.replace(/\./g, "");

      if (normalizedValue.startsWith(normalizedPrefix)) {
        const suffix = normalizedValue
          .slice(normalizedPrefix.length)
          .slice(0, 10);
        setCode(`${prefix}${suffix}`);
        return;
      }
    }

    if (next.startsWith(prefix)) {
      const suffix = next.slice(prefix.length).slice(0, 10);
      setCode(`${prefix}${suffix}`);
      return;
    }

    setCode(next.slice(0, prefix.length + 10));
  };

  const confirmDelete = async (text: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });
    return result.isConfirmed;
  };

  const confirmSaveItem = async (text: string) => {
    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึก",
      text,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });
    return result.isConfirmed;
  };

  const addGroup = () => {
    const newId = makeLocalId();
    setGroups((prev) => [
      ...prev,
      { id: newId, subjectCategoryId: "", credit: "" },
    ]);
    setEditingGroupId(newId);
  };

  const addOutsideSubject = () => {
    const newId = makeLocalId();
    setOutsideSubjects((prev) => [
      ...prev,
      { id: newId, subjectOutsideId: "", amount: "" },
    ]);
    setEditingOutsideId(newId);
  };

  const addStudent = () => {
    const newId = makeLocalId();
    setStudents((prev) => [
      ...prev,
      { id: newId, yearId: "", studentAmount: "" },
    ]);
    setEditingStudentId(newId);
  };

  const updateGroup = (
    id: string,
    field: keyof SubjectGroup,
    value: string,
  ) => {
    if (field === "subjectCategoryId" && value) {
      const duplicated = groups.some(
        (item) => item.id !== id && item.subjectCategoryId === value,
      );

      if (duplicated) {
        Swal.fire({
          icon: "warning",
          title: "เลือกข้อมูลซ้ำ",
          text: "หมวดวิชานี้ถูกเลือกแล้ว",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    setGroups((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const updateOutsideSubject = (
    id: string,
    field: keyof OutsideSubject,
    value: string,
  ) => {
    if (field === "subjectOutsideId" && value) {
      const duplicated = outsideSubjects.some(
        (item) => item.id !== id && item.subjectOutsideId === value,
      );

      if (duplicated) {
        Swal.fire({
          icon: "warning",
          title: "เลือกข้อมูลซ้ำ",
          text: "รายวิชานอกคณะนี้ถูกเลือกแล้ว",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    setOutsideSubjects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const updateStudent = (
    id: string,
    field: keyof StudentYear,
    value: string,
  ) => {
    if (field === "yearId" && value) {
      const duplicated = students.some(
        (item) => item.id !== id && item.yearId === value,
      );

      if (duplicated) {
        Swal.fire({
          icon: "warning",
          title: "เลือกข้อมูลซ้ำ",
          text: "ปีการศึกษานี้ถูกเลือกแล้ว",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    setStudents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeGroup = async (id: string) => {
    const ok = await confirmDelete("ต้องการลบหมวดวิชานี้ใช่หรือไม่");
    if (!ok) return;

    setGroups((prev) => prev.filter((item) => item.id !== id));
    if (editingGroupId === id) setEditingGroupId(null);

    await Swal.fire({
      icon: "success",
      title: "ลบข้อมูลสำเร็จ",
      text: "ลบหมวดวิชาเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const removeOutsideSubject = async (id: string) => {
    const ok = await confirmDelete("ต้องการลบรายวิชานอกคณะนี้ใช่หรือไม่");
    if (!ok) return;

    setOutsideSubjects((prev) => prev.filter((item) => item.id !== id));
    if (editingOutsideId === id) setEditingOutsideId(null);

    await Swal.fire({
      icon: "success",
      title: "ลบข้อมูลสำเร็จ",
      text: "ลบรายวิชานอกคณะเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const removeStudent = async (id: string) => {
    const ok = await confirmDelete("ต้องการลบข้อมูลปีการศึกษานี้ใช่หรือไม่");
    if (!ok) return;

    setStudents((prev) => prev.filter((item) => item.id !== id));
    if (editingStudentId === id) setEditingStudentId(null);

    await Swal.fire({
      icon: "success",
      title: "ลบข้อมูลสำเร็จ",
      text: "ลบข้อมูลปีการศึกษาเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const saveGroupItem = async (group: SubjectGroup) => {
    if (!group.subjectCategoryId) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณาเลือกหมวดวิชา",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const ok = await confirmSaveItem("ต้องการบันทึกหมวดวิชานี้ใช่หรือไม่");
    if (!ok) return;

    setEditingGroupId(null);

    await Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลสำเร็จ",
      text: "บันทึกหมวดวิชาเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const saveOutsideItem = async (item: OutsideSubject) => {
    if (!item.subjectOutsideId) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณาเลือกรายวิชานอกคณะ",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const ok = await confirmSaveItem(
      "ต้องการบันทึกรายวิชานอกคณะนี้ใช่หรือไม่",
    );
    if (!ok) return;

    setEditingOutsideId(null);

    await Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลสำเร็จ",
      text: "บันทึกรายวิชานอกคณะเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const saveStudentItem = async (item: StudentYear) => {
    if (!item.yearId) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณาเลือกปีการศึกษา",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const ok = await confirmSaveItem(
      "ต้องการบันทึกข้อมูลปีการศึกษานี้ใช่หรือไม่",
    );
    if (!ok) return;

    setEditingStudentId(null);

    await Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลสำเร็จ",
      text: "บันทึกข้อมูลปีการศึกษาเรียบร้อยแล้ว",
      confirmButtonColor: "#22c55e",
    });
  };

  const getSubjectCategoryName = (id: string) => {
    return subjectCategories.find((item) => item.id === id)?.name || "-";
  };

  const getSubjectOutsideLabel = (id: string) => {
    const found = subjectOutsides.find((item) => item.id === id);
    if (!found) return "-";
    return `${found.subjectCode} - ${found.subjectName}`;
  };

  const getYearLabel = (id: string) => {
    return years.find((item) => String(item.id) === id)?.year || "-";
  };

  const handleSubmit = async () => {
    if (!id) return;

    const prefix = courseCodePrefix ? `${courseCodePrefix}.` : "";
    const suffixOnly =
      prefix && code.trim().startsWith(prefix)
        ? code.trim().slice(prefix.length)
        : code.trim();

    if (!degreeLevelId) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณาเลือกระดับปริญญา",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!suffixOnly.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอกรหัสหลักสูตร",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!nameTh.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อหลักสูตรภาษาไทย",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!nameEn.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อหลักสูตรภาษาอังกฤษ",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    for (const item of groups) {
      if (!item.subjectCategoryId) {
        await Swal.fire({
          icon: "warning",
          title: "กรอกข้อมูลไม่ครบ",
          text: "กรุณาเลือกหมวดวิชาให้ครบ",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    for (const item of outsideSubjects) {
      if (!item.subjectOutsideId) {
        await Swal.fire({
          icon: "warning",
          title: "กรอกข้อมูลไม่ครบ",
          text: "กรุณาเลือกรายวิชานอกคณะให้ครบ",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    for (const item of students) {
      if (!item.yearId) {
        await Swal.fire({
          icon: "warning",
          title: "กรอกข้อมูลไม่ครบ",
          text: "กรุณาเลือกปีการศึกษาให้ครบ",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }

    const payload = {
      degreeLevelId,
      nameTh: nameTh.trim(),
      nameEn: nameEn.trim(),
      shortName: code.trim(),
      studyDuration: Number(stripComma(duration) || 0),
      tuitionFees: Number(stripComma(fee) || 0),
      deductToUni: Number(stripComma(uniDeduct) || 0),
      status,
      structures: groups.map((item) => ({
        subjectCategoryId: item.subjectCategoryId,
        credit: Number(stripComma(item.credit) || 0),
      })),
      subjectOutsideDeducts: outsideSubjects.map((item) => ({
        subjectOutsideId: item.subjectOutsideId,
        amount: Number(stripComma(item.amount) || 0),
      })),
      students: students.map((item) => ({
        yearId: Number(item.yearId || 0),
        studentAmount: Number(stripComma(item.studentAmount) || 0),
      })),
    };

    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการบันทึกข้อมูล",
      html: `ต้องการแก้ไขหลักสูตร <b>${nameTh.trim()}</b> ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึกข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await EditDataCourse(id, payload);

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แก้ไขหลักสูตรเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      navigate(`/courses`);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถแก้ไขหลักสูตรได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-4 sm:p-6">
        <div className="mx-auto max-w-[1280px] rounded-[24px] border border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-400 shadow-sm">
          กำลังโหลดข้อมูลหลักสูตร...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <h1 className="text-[20px] font-bold text-black sm:text-[22px]">
          แก้ไขหลักสูตร
        </h1>

        <section className={sectionCls}>
          <SectionTitle title="ข้อมูลพื้นฐาน" required />

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ระดับปริญญา <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={degreeLevelId}
                  onChange={(e) => setDegreeLevelId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">เลือกระดับปริญญา</option>
                  {degreeLevels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {formatDegreeLabel(item)}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                รหัสหลักสูตร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ชื่อหลักสูตร (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value.slice(0, 255))}
                className={inputCls}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ชื่อหลักสูตร (ภาษาอังกฤษ){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value.slice(0, 255))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ระยะเวลาการศึกษา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={duration}
                maxLength={11}
                onChange={(e) => handleIntegerCommaInput(e.target.value, setDuration)}
                className={numberInputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ค่าธรรมเนียมการศึกษา (บาท/ภาคการศึกษา){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fee}
                maxLength={10}
                onChange={(e) => handleMoneyInput(e.target.value, setFee)}
                className={numberInputCls}
              />
            </div>
          </div>
        </section>

        <section className={sectionCls}>
          <div className="flex items-center justify-between gap-4">
            <SectionTitle title="โครงสร้างและรายละเอียดหลักสูตร" />
            <HeaderAddButton label="เพิ่มหมวดวิชา" onClick={addGroup} />
          </div>

          {groups.length === 0 ? (
            <EmptyAddBox
              title="ยังไม่มีโครงสร้างและรายละเอียดหลักสูตร"
              description='กดปุ่ม "เพิ่มหมวดวิชา" เพื่อเพิ่มรายละเอียดของหลักสูตร'
              onClick={addGroup}
            />
          ) : (
            <div className="mt-5 space-y-4">
              {groups.map((group, index) => {
                const isEditing = editingGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className="rounded-[14px] border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        หมวดวิชาที่ {index + 1}
                      </p>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveGroupItem(group)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-3 text-white transition hover:bg-blue-600"
                          >
                            <SaveSmallIcon />
                            <span className="text-xs font-medium">บันทึก</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingGroupId(group.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-400 px-3 text-white transition hover:bg-orange-500"
                          >
                            <EditIcon />
                            <span className="text-xs font-medium">แก้ไข</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeGroup(group.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-white transition hover:bg-red-600"
                        >
                          <TrashIcon />
                          <span className="text-xs font-medium">ลบ</span>
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            หมวดวิชา <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={group.subjectCategoryId}
                              onChange={(e) =>
                                updateGroup(
                                  group.id,
                                  "subjectCategoryId",
                                  e.target.value,
                                )
                              }
                              className={selectCls}
                            >
                              <option value="">เลือกหมวดวิชา</option>
                              {subjectCategories.map((category) => {
                                const isUsedByOther = groups.some(
                                  (item) =>
                                    item.id !== group.id &&
                                    item.subjectCategoryId === category.id,
                                );

                                return (
                                  <option
                                    key={category.id}
                                    value={category.id}
                                    disabled={isUsedByOther}
                                  >
                                    {category.name}
                                  </option>
                                );
                              })}
                            </select>
                            <SelectArrow />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            หน่วยกิต <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={group.credit}
                            maxLength={11}
                            onChange={(e) => {
                              const raw = stripComma(e.target.value);

                              if (raw === "") {
                                updateGroup(group.id, "credit", "");
                                return;
                              }

                              if (!/^\d+$/.test(raw)) return;

                              updateGroup(group.id, "credit", Number(raw).toLocaleString("en-US"));
                            }}
                            className={numberInputCls}
                            placeholder="เช่น 30"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            หมวดวิชา
                          </label>
                          <div className={viewBoxCls}>
                            {getSubjectCategoryName(group.subjectCategoryId)}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            หน่วยกิต
                          </label>
                          <div className={viewBoxCls}>
                            {Number(stripComma(group.credit) || 0).toLocaleString("en-US")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 rounded-[14px] bg-gray-100 px-8 py-5">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold text-gray-800">
                หน่วยกิตรวมตลอดหลักสูตร
              </p>

              <div className="flex items-end gap-2">
                <span className="text-[38px] font-medium leading-none text-blue-600">
                  {totalCredits}
                </span>
                <span className="pb-2 text-[16px] text-gray-500">
                  หน่วยกิต
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionCls}>
          <SectionTitle title="ยอดเงินหักให้ภายนอกคณะ" />

          <div className="mt-5 rounded-[14px] bg-gray-100 px-5 py-5">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_540px]">
              <div>
                <label className="block text-[16px] font-semibold text-gray-800">
                  ยอดเงินที่หักให้มหาวิทยาลัย
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  จำนวน (บาท)
                </label>
                <input
                  type="text"
                  value={uniDeduct}
                  maxLength={10}
                  onChange={(e) => handleMoneyInput(e.target.value, setUniDeduct)}
                  className={numberInputCls}
                />
              </div>
            </div>
          </div>

          <div className="my-6 h-px bg-gray-200" />

          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[16px] font-semibold text-gray-800">
              ยอดเงินที่หักให้รายวิชานอกคณะ
            </h3>
            <HeaderAddButton
              label="เพิ่มรายวิชานอกคณะ"
              onClick={addOutsideSubject}
            />
          </div>

          {outsideSubjects.length === 0 ? (
            <div className="mt-5">
              <EmptyAddBox
                title="ยังไม่มีรายวิชานอกคณะ"
                description='กดปุ่ม "เพิ่มรายวิชานอกคณะ" เพื่อเพิ่มยอดเงินที่หักให้รายวิชานอกคณะ'
                onClick={addOutsideSubject}
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {outsideSubjects.map((item, index) => {
                const isEditing = editingOutsideId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-[14px] border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        รายวิชานอกคณะที่ {index + 1}
                      </p>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveOutsideItem(item)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-3 text-white transition hover:bg-blue-600"
                          >
                            <SaveSmallIcon />
                            <span className="text-xs font-medium">บันทึก</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingOutsideId(item.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-400 px-3 text-white transition hover:bg-orange-500"
                          >
                            <EditIcon />
                            <span className="text-xs font-medium">แก้ไข</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeOutsideSubject(item.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-white transition hover:bg-red-600"
                        >
                          <TrashIcon />
                          <span className="text-xs font-medium">ลบ</span>
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            รายวิชานอกคณะ{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.subjectOutsideId}
                              onChange={(e) =>
                                updateOutsideSubject(
                                  item.id,
                                  "subjectOutsideId",
                                  e.target.value,
                                )
                              }
                              className={selectCls}
                            >
                              <option value="">เลือกรายวิชานอกคณะ</option>
                              {subjectOutsides.map((outside) => {
                                const isUsedByOther = outsideSubjects.some(
                                  (row) =>
                                    row.id !== item.id &&
                                    row.subjectOutsideId === outside.id,
                                );

                                return (
                                  <option
                                    key={outside.id}
                                    value={outside.id}
                                    disabled={isUsedByOther}
                                  >
                                    {outside.subjectCode} -{" "}
                                    {outside.subjectName}
                                  </option>
                                );
                              })}
                            </select>
                            <SelectArrow />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            จำนวนเงิน (บาท){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.amount}
                            maxLength={10}
                            onChange={(e) => {
                              const raw = stripComma(e.target.value);

                              if (raw === "") {
                                updateOutsideSubject(item.id, "amount", "");
                                return;
                              }

                              if (!/^\d*\.?\d{0,2}$/.test(raw)) return;

                              updateOutsideSubject(item.id, "amount", formatNumberWithComma(raw));
                            }}
                            className={numberInputCls}
                            placeholder="เช่น 500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            รายวิชานอกคณะ
                          </label>
                          <div className={viewBoxCls}>
                            {getSubjectOutsideLabel(item.subjectOutsideId)}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            จำนวนเงิน (บาท)
                          </label>
                          <div className={viewBoxCls}>
                            {Number(stripComma(item.amount) || 0).toLocaleString("en-US")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={sectionCls}>
          <div className="flex items-center justify-between gap-4">
            <SectionTitle title="ข้อมูลนักศึกษา" />
            <HeaderAddButton label="เพิ่มปีการศึกษา" onClick={addStudent} />
          </div>

          {students.length === 0 ? (
            <EmptyAddBox
              title="ยังไม่มีข้อมูลนักศึกษา"
              description='กดปุ่ม "เพิ่มปีการศึกษา" เพื่อเพิ่มข้อมูลของนักศึกษา'
              onClick={addStudent}
            />
          ) : (
            <div className="mt-5 space-y-4">
              {students.map((student, index) => {
                const isEditing = editingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className="rounded-[14px] border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        ปีการศึกษาที่ {index + 1}
                      </p>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveStudentItem(student)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-3 text-white transition hover:bg-blue-600"
                          >
                            <SaveSmallIcon />
                            <span className="text-xs font-medium">บันทึก</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingStudentId(student.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-400 px-3 text-white transition hover:bg-orange-500"
                          >
                            <EditIcon />
                            <span className="text-xs font-medium">แก้ไข</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeStudent(student.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-white transition hover:bg-red-600"
                        >
                          <TrashIcon />
                          <span className="text-xs font-medium">ลบ</span>
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            ปีการศึกษา <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={student.yearId}
                              onChange={(e) =>
                                updateStudent(
                                  student.id,
                                  "yearId",
                                  e.target.value,
                                )
                              }
                              className={selectCls}
                            >
                              <option value="">เลือกปีการศึกษา</option>
                              {years.map((year) => {
                                const isUsedByOther = students.some(
                                  (row) =>
                                    row.id !== student.id &&
                                    row.yearId === String(year.id),
                                );

                                return (
                                  <option
                                    key={year.id}
                                    value={year.id}
                                    disabled={isUsedByOther}
                                  >
                                    {year.year}
                                  </option>
                                );
                              })}
                            </select>
                            <SelectArrow />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            จำนวน(คน) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={student.studentAmount}
                            maxLength={11}
                            onChange={(e) => {
                              const raw = stripComma(e.target.value);

                              if (raw === "") {
                                updateStudent(student.id, "studentAmount", "");
                                return;
                              }

                              if (!/^\d+$/.test(raw)) return;

                              updateStudent(student.id, "studentAmount", Number(raw).toLocaleString("en-US"));
                            }}
                            className={numberInputCls}
                            placeholder="เช่น 120"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            ปีการศึกษา
                          </label>
                          <div className={viewBoxCls}>
                            {getYearLabel(student.yearId)}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            จำนวน(คน)
                          </label>
                          <div className={viewBoxCls}>
                            <div className={viewBoxCls}>
                              {Number(stripComma(student.studentAmount) || 0).toLocaleString("en-US")}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 rounded-[14px] bg-gray-100 px-8 py-5">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold text-gray-800">
                จำนวนนักศึกษาทั้งหมด
              </p>

              <div className="flex items-end gap-2">
                <span className="text-[38px] font-medium leading-none text-blue-600">
                  {totalStudents}
                </span>
                <span className="pb-2 text-[16px] text-gray-500">คน</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/courses`)}
            className="flex items-center gap-1.5 border border-gray-400 hover:bg-gray-50 text-gray-800 text-xs font-medium px-10 py-3 rounded-lg transition-colors"
            disabled={submitting}
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors"
            disabled={submitting}
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
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </div>
    </div>
  );
}