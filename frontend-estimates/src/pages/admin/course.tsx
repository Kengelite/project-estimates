import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────
interface Course {
  id: number;
  name: string;
  code: string;
  type: "ปกติ" | "พิเศษ";
}

interface Level {
  id: number;
  name: string;
  icon: string; // emoji fallback
  courses: Course[];
}

// ── Mock Data ───────────────────────────────────────────────────────
const initialLevels: Level[] = [
  {
    id: 1,
    name: "ระดับปริญญาตรี (ปกติ)",
    icon: "🎓",
    courses: [
      {
        id: 1,
        name: "หลักสูตร วก.บ สาขาวิชาวิทยาการคอมพิวเตอร์",
        code: "B.SC.CS",
        type: "ปกติ",
      },
      {
        id: 2,
        name: "หลักสูตร วก.บ สาขาวิชาเทคโนโลยีสารสนเทศ",
        code: "B.SC.IT",
        type: "ปกติ",
      },
      {
        id: 3,
        name: "หลักสูตร วก.บ สาขาวิชาภูมิสารสนเทศศาสตร์",
        code: "B.SC.GIS",
        type: "ปกติ",
      },
      {
        id: 4,
        name: "หลักสูตร วก.บ สาขาวิชาปัญญาประดิษฐ์",
        code: "B.SC.AI",
        type: "ปกติ",
      },
      {
        id: 5,
        name: "หลักสูตร วก.บ สาขาวิชาความมั่นคงปลอดภัยไซเบอร์",
        code: "B.SC.CY",
        type: "ปกติ",
      },
    ],
  },
  {
    id: 2,
    name: "ระดับปริญญาตรี (โครงการพิเศษ)",
    icon: "🎓",
    courses: [
      {
        id: 6,
        name: "หลักสูตร วก.บ สาขาวิชาวิทยาการคอมพิวเตอร์",
        code: "B.SC.C",
        type: "พิเศษ",
      },
      {
        id: 7,
        name: "หลักสูตร วก.บ สาขาวิชาเทคโนโลยีสารสนเทศ",
        code: "B.SC.IT",
        type: "พิเศษ",
      },
      {
        id: 8,
        name: "หลักสูตร วก.บ สาขาวิชาภูมิสารสนเทศศาสตร์",
        code: "B.SC.GIS",
        type: "พิเศษ",
      },
      {
        id: 9,
        name: "หลักสูตร วก.บ สาขาวิชาปัญญาประดิษฐ์",
        code: "B.SC.AI",
        type: "พิเศษ",
      },
      {
        id: 10,
        name: "หลักสูตร วก.บ สาขาวิชาความมั่นคงปลอดภัยไซเบอร์",
        code: "B.SC.CY",
        type: "พิเศษ",
      },
    ],
  },
  {
    id: 3,
    name: "ระดับปริญญาโท (ปกติ)",
    icon: "📘",
    courses: [
      {
        id: 11,
        name: "หลักสูตร วก.บ สาขาวิชาภูมิสารสนเทศศาสตร์",
        code: "M.SC.GIS",
        type: "ปกติ",
      },
      {
        id: 12,
        name: "หลักสูตร วก.บ สาขาวิชาวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ",
        code: "M.SC.CS&IT",
        type: "ปกติ",
      },
      {
        id: 13,
        name: "หลักสูตร วก.บ สาขาวิชาวิทยาการข้อมูลและปัญญาประดิษฐ์",
        code: "M.SC.DSAI",
        type: "ปกติ",
      },
    ],
  },
];

// ── Badge ───────────────────────────────────────────────────────────
function Badge({ text, variant }: { text: string; variant: "code" | "type" }) {
  if (variant === "code") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
        {text}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        text === "พิเศษ"
          ? "bg-orange-50 text-orange-600 border-orange-100"
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {text}
    </span>
  );
}

// ── Course Card ──────────────────────────────────────────────────────
function CourseCard({
  course,
  onEdit,
  onDelete,
}: {
  course: Course;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
        <p className="text-sm font-medium text-gray-800 leading-snug">
          {course.name}
        </p>
        <div className="flex items-center gap-2">
          <Badge text={course.code} variant="code" />
          <Badge text={course.type} variant="type" />
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
            ดูรายละเอียดหลักสูตร
          </button>
          <button
            onClick={() => onEdit(course.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-400 hover:bg-orange-500 text-white transition-colors flex-shrink-0"
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
            onClick={() => onDelete(course.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
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
    </>
  );
}

// ── Level Section ────────────────────────────────────────────────────
function LevelSection({
  level,
  onAddCourse,
  onEdit,
  onDelete,
}: {
  level: Level;
  onAddCourse: (levelId: number) => void;
  onEdit: (courseId: number) => void;
  onDelete: (courseId: number) => void;
}) {
  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl shadow-sm">
            {level.icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {level.name}
            </h2>
            <p className="text-sm text-gray-400">
              จำนวน {level.courses.length} หลักสูตร
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddCourse(level.id)}
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
          + เพิ่มรายวิชา
        </button>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {level.courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function CourseList() {
  const [levels, setLevels] = useState<Level[]>(initialLevels);

  const handleEdit = (courseId: number) => {
    alert(`แก้ไขหลักสูตร ID: ${courseId}`);
  };

  const handleDelete = (courseId: number) => {
    if (!confirm("ต้องการลบหลักสูตรนี้ใช่หรือไม่?")) return;
    setLevels((prev) =>
      prev.map((level) => ({
        ...level,
        courses: level.courses.filter((c) => c.id !== courseId),
      })),
    );
  };

  const handleAddCourse = (levelId: number) => {
    alert(`เพิ่มหลักสูตรในระดับ ID: ${levelId}`);
  };

  return (
    <>
      <div className="space-y-10 p-6">
        {levels.map((level) => (
          <LevelSection
            key={level.id}
            level={level}
            onAddCourse={handleAddCourse}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}
