import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  GetDataCourseGrouped,
  GetDataDegreeLevel,
  DeleteDataCourse,
  EditStatusCourse,
} from "../../../fetchapi/fetch_api_admin";

type CourseItem = {
  id: string;
  degreeLevelId: string;
  degreeLevelName: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  studyDuration: number;
  tuitionFees: number;
  deductToUni: number;
  status: string;
};

type CourseGroup = {
  degreeLevelId: string;
  degreeLevelName: string;
  degreeShortName: string;
  sectionId: number;
  sectionName: string;
  count: number;
  courses: CourseItem[];
};

type DegreeLevelItem = {
  id: string;
  name: string;
  shortName: string;
  sectionId: number;
  sectionName: string;
};

function Badge({
  text,
  variant,
}: {
  text: string;
  variant: "code" | "type";
}) {
  if (variant === "code") {
    return (
      <span className="inline-flex items-center rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        {text || "-"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${
        text === "พิเศษ"
          ? "border-orange-100 bg-orange-50 text-orange-600"
          : "border-gray-200 bg-gray-100 text-gray-500"
      }`}
    >
      {text}
    </span>
  );
}

function DegreeIcon({ name }: { name: string }) {
  const label = (name || "").toLowerCase();

  let emoji = "🎓";
  if (label.includes("โท") || label.includes("master")) emoji = "📘";
  if (label.includes("เอก") || label.includes("doctor")) emoji = "📙";

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-2xl shadow-sm">
      {emoji}
    </div>
  );
}

function inferProgramType(sectionName: string) {
  const text = (sectionName || "").toLowerCase();

  if (
    text.includes("พิเศษ") ||
    text.includes("special") ||
    text.includes("โครงการพิเศษ")
  ) {
    return "พิเศษ";
  }

  return "ปกติ";
}

function StatusSwitch({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-8 w-[58px] flex-shrink-0 items-center rounded-full border transition-all ${
        checked
          ? "border-emerald-500 bg-emerald-500 shadow-[0_4px_10px_rgba(16,185,129,0.28)]"
          : "border-gray-300 bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:opacity-95"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-2 text-[10px] font-semibold text-white transition-opacity ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      >
        เปิด
      </span>

      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function CourseCard({
  course,
  sectionName,
  updatingStatusId,
  onEdit,
  onDelete,
  onDetail,
  onToggleStatus,
}: {
  course: CourseItem;
  sectionName: string;
  updatingStatusId: string | null;
  onEdit: (id: string) => void;
  onDelete: (course: CourseItem) => void;
  onDetail: (id: string) => void;
  onToggleStatus: (course: CourseItem) => void;
}) {
  const type = inferProgramType(sectionName);
  const isActive = course.status === "1";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-gray-800">
          {course.nameTh}
        </p>

        <StatusSwitch
          checked={isActive}
          disabled={course.id === updatingStatusId}
          onChange={() => onToggleStatus(course)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Badge text={course.shortName} variant="code" />
        <Badge text={type} variant="type" />
      </div>

      <div className="mt-auto flex items-center gap-2">
        <button
          className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-600"
          onClick={() => onDetail(course.id)}
        >
          ดูรายละเอียดหลักสูตร
        </button>

        <button
          onClick={() => onEdit(course.id)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-400 text-white transition-colors hover:bg-orange-500"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(course)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
    </div>
  );
}

function formatDegreeLevelTitle(group: CourseGroup) {
  const degreeName = (group.degreeLevelName || "").trim();
  const sectionName = (group.sectionName || "").trim();

  if (!degreeName && !sectionName) return "-";
  if (!sectionName) return `ระดับ${degreeName}`;
  return `ระดับ${degreeName} (${sectionName})`;
}

function normalizeSectionName(value: any) {
  const text = String(value || "").trim();
  if (!text) return "";

  if (text === "ปกติ" || text.toLowerCase() === "normal") {
    return "ปกติ";
  }

  if (
    text === "พิเศษ" ||
    text === "โครงการพิเศษ" ||
    text.toLowerCase() === "special" ||
    text.toLowerCase() === "project"
  ) {
    return "โครงการพิเศษ";
  }

  return text;
}

function mapDegreeLevelItem(level: any): DegreeLevelItem {
  return {
    id: level?.id || "",
    name: level?.name || level?.degreeLevel || "",
    shortName: level?.shortName || "",
    sectionId: Number(level?.sectionId ?? level?.section?.id ?? 0),
    sectionName: normalizeSectionName(
      level?.sectionName ?? level?.section?.sectionName ?? level?.section?.name ?? "",
    ),
  };
}

function LevelSection({
  group,
  updatingStatusId,
  onAddCourse,
  onEdit,
  onDelete,
  onDetail,
  onToggleStatus,
}: {
  group: CourseGroup;
  updatingStatusId: string | null;
  onAddCourse: (degreeLevelId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (course: CourseItem) => void;
  onDetail: (id: string) => void;
  onToggleStatus: (course: CourseItem) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DegreeIcon name={group.degreeLevelName} />

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDegreeLevelTitle(group)}
            </h2>
            <p className="text-sm text-gray-400">จำนวน {group.count} หลักสูตร</p>
          </div>
        </div>

        <button
          onClick={() => onAddCourse(group.degreeLevelId)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
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
          เพิ่มหลักสูตร
        </button>
      </div>

      {group.courses.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-2xl text-sm text-gray-400">
          ยังไม่มีข้อมูลหลักสูตร
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {group.courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              sectionName={group.sectionName}
              updatingStatusId={updatingStatusId}
              onEdit={onEdit}
              onDelete={onDelete}
              onDetail={onDetail}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CoursePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevelItem[]>([]);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [groupedRes, degreeRes] = await Promise.all([
        GetDataCourseGrouped(),
        GetDataDegreeLevel(),
      ]);

      const mappedDegreeLevels: DegreeLevelItem[] = (degreeRes || []).map(
        (item: any) => mapDegreeLevelItem(item),
      );

      const mappedGrouped: CourseGroup[] = (groupedRes || []).map((group: any) => ({
        degreeLevelId: group?.degreeLevelId || "",
        degreeLevelName: group?.degreeLevelName || "",
        degreeShortName: group?.degreeShortName || "",
        sectionId: Number(group?.sectionId ?? 0),
        sectionName: normalizeSectionName(group?.sectionName || ""),
        count: Number(group?.count ?? (group?.courses || []).length ?? 0),
        courses: (group?.courses || []).map((course: any) => ({
          id: course?.id || "",
          degreeLevelId: course?.degreeLevelId || group?.degreeLevelId || "",
          degreeLevelName: course?.degreeLevelName || group?.degreeLevelName || "",
          nameTh: course?.nameTh || "",
          nameEn: course?.nameEn || "",
          shortName: course?.shortName || "",
          studyDuration: Number(course?.studyDuration ?? 0),
          tuitionFees: Number(course?.tuitionFees ?? 0),
          deductToUni: Number(course?.deductToUni ?? 0),
          status: String(course?.status ?? "1"),
        })),
      }));

      const mergedGroups: CourseGroup[] = mappedDegreeLevels.map((level) => {
        const found = mappedGrouped.find((group) => group.degreeLevelId === level.id);

        if (found) {
          return {
            ...found,
            degreeLevelName: found.degreeLevelName || level.name,
            degreeShortName: found.degreeShortName || level.shortName,
            sectionId: found.sectionId || level.sectionId,
            sectionName: found.sectionName || level.sectionName,
            count: found.courses.length,
          };
        }

        return {
          degreeLevelId: level.id,
          degreeLevelName: level.name,
          degreeShortName: level.shortName,
          sectionId: level.sectionId,
          sectionName: level.sectionName,
          count: 0,
          courses: [],
        };
      });

      setDegreeLevels(mappedDegreeLevels);
      setGroups(mergedGroups);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลหลักสูตรได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return groups;

    return groups
      .map((group) => {
        const matchedCourses = group.courses.filter((course) => {
          return (
            course.nameTh.toLowerCase().includes(keyword) ||
            course.nameEn.toLowerCase().includes(keyword) ||
            course.shortName.toLowerCase().includes(keyword) ||
            group.degreeLevelName.toLowerCase().includes(keyword) ||
            group.sectionName.toLowerCase().includes(keyword)
          );
        });

        const matchGroupTitle =
          group.degreeLevelName.toLowerCase().includes(keyword) ||
          group.sectionName.toLowerCase().includes(keyword);

        return {
          ...group,
          courses: matchGroupTitle ? group.courses : matchedCourses,
          count: matchGroupTitle ? group.courses.length : matchedCourses.length,
        };
      })
      .filter((group) => {
        const matchGroupTitle =
          group.degreeLevelName.toLowerCase().includes(keyword) ||
          group.sectionName.toLowerCase().includes(keyword);

        return matchGroupTitle || group.courses.length > 0;
      });
  }, [groups, search]);

  const handleAddCourse = (degreeLevelId: string) => {
    navigate(`/courses/add?degreeLevelId=${degreeLevelId}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/courses/edit/${id}`);
  };

  const handleDetail = (id: string) => {
    navigate(`/courses/${id}`);
  };

  const handleDelete = async (course: CourseItem) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบข้อมูล",
      text: `ต้องการลบหลักสูตร "${course.nameTh}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await DeleteDataCourse(course.id);

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบข้อมูลหลักสูตรเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      await loadData();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถลบข้อมูลหลักสูตรได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleToggleStatus = async (course: CourseItem) => {
    if (updatingStatusId) return;

    const nextStatus = course.status === "1" ? "0" : "1";
    const statusText = nextStatus === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน";

    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${statusText}หลักสูตรนี้ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingStatusId(course.id);
      await EditStatusCourse(course.id, nextStatus);

      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          courses: group.courses.map((item) =>
            item.id === course.id ? { ...item, status: nextStatus } : item,
          ),
        })),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถอัปเดตสถานะหลักสูตรได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหลักสูตร / รหัสหลักสูตร / ระดับปริญญา..."
            className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-400"
          />
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L17 17" />
          </svg>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-400">
            กำลังโหลดข้อมูลหลักสูตร...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-400">
            ไม่พบข้อมูลหลักสูตร
          </div>
        ) : (
          filteredGroups.map((group) => (
            <LevelSection
              key={group.degreeLevelId}
              group={group}
              updatingStatusId={updatingStatusId}
              onAddCourse={handleAddCourse}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDetail={handleDetail}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}