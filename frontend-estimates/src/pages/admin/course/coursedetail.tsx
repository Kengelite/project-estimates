import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from "recharts";
import { GetDataCourseById } from "../../../fetchapi/fetch_api_admin";

type TabKey = "structure" | "students";

type CourseStructureItem = {
  id: string;
  subjectCategoryId: string;
  subjectCategoryName: string;
  credit: number;
};

type SubjectOutsideDeductItem = {
  id: string;
  subjectOutsideId: string;
  subjectCode: string;
  subjectName: string;
  amount: number;
};

type CourseStudentItem = {
  id: string;
  yearId: number;
  year: string;
  amount: number;
};

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
  structures: CourseStructureItem[];
  subjectOutsideDeducts: SubjectOutsideDeductItem[];
  students: CourseStudentItem[];
};

function numberOrZero(value: any) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function stringValue(value: any) {
  return String(value ?? "").trim();
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
      .sort(
        (a: CourseStudentItem, b: CourseStudentItem) =>
          Number(a.year) - Number(b.year),
      ),
  };
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

function formatMoney(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getAvatarLabel(course: CourseDetailResponse | null) {
  if (!course) return "CS";

  const short = course.shortName || "";
  const parts = short.split(".");
  const last = parts[parts.length - 1]?.trim();
  if (last) return last.slice(0, 2).toUpperCase();

  return course.nameTh.slice(0, 2).toUpperCase() || "CS";
}

function structureCardColor(highlight = false) {
  return highlight
    ? "bg-blue-50 border border-blue-200"
    : "bg-gray-100 border border-transparent";
}

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<TabKey>("structure");
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleEditCourse = () => {
    if (!id) return;
    navigate(`/courses/edit/${id}`);
  };

  const loadCourseDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await GetDataCourseById(id);
      setCourse(mapCourseDetail(response));
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
    loadCourseDetail();
  }, [id]);

  const totalCredits = useMemo(() => {
    return (course?.structures || []).reduce((sum, item) => sum + item.credit, 0);
  }, [course]);

  const totalStudents = useMemo(() => {
    return (course?.students || []).reduce((sum, item) => sum + item.amount, 0);
  }, [course]);

  const structureCards = useMemo(() => {
    const items = (course?.structures || []).map((item) => ({
      label: item.subjectCategoryName || "ไม่ระบุหมวดวิชา",
      value: item.credit,
      highlight: false,
    }));

    items.push({
      label: "รวมหน่วยกิตตลอดหลักสูตร",
      value: totalCredits,
      highlight: true,
    });

    return items;
  }, [course, totalCredits]);

  const studentChartData = useMemo(() => {
    return (course?.students || []).map((item) => ({
      year: item.year,
      count: item.amount,
    }));
  }, [course]);

  const deductionRows = useMemo(() => {
    return (course?.subjectOutsideDeducts || []).map((item) => ({
      code: item.subjectCode || "-",
      name: item.subjectName || "-",
      total: item.amount,
    }));
  }, [course]);

  const breadcrumbTitle = course?.nameTh || "รายละเอียดหลักสูตร";
  const programType = inferProgramType(course?.sectionName || "");
  const avatarLabel = getAvatarLabel(course);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          กำลังโหลดข้อมูลหลักสูตร...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          ไม่พบข้อมูลหลักสูตร
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <nav className="text-xs text-gray-400">
              <span
                className="cursor-pointer hover:text-gray-600"
                onClick={() => navigate("/dashboard")}
              >
                หน้าแรก
              </span>
              <span className="mx-1.5">›</span>
              <span
                className="cursor-pointer hover:text-gray-600"
                onClick={() => navigate("/courses")}
              >
                จัดการหลักสูตร
              </span>
              <span className="mx-1.5">›</span>
              <span className="font-medium text-gray-700">{breadcrumbTitle}</span>
            </nav>

            <button
              type="button"
              onClick={handleEditCourse}
              className="ml-4 flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <svg
                width="13"
                height="13"
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

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-400 text-sm font-bold text-white">
              {avatarLabel}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold text-gray-900">
                  {course.nameTh}
                </h1>

                <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {course.shortName}
                </span>

                <span className="inline-flex items-center rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                  {programType}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-gray-400">{course.nameEn}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
            {[
              {
                label: "ระยะเวลาการศึกษา",
                value: `${course.studyDuration} ปี`,
              },
              {
                label: "จำนวนหน่วยกิต",
                value: `${totalCredits} หน่วยกิต`,
              },
              {
                label: "ค่าธรรมเนียมการศึกษา",
                value: `${formatMoney(course.tuitionFees)} บาท/ภาคการศึกษา`,
              },
              {
                label: "จำนวนนักศึกษาทั้งหมด",
                value: `${totalStudents} คน`,
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="mb-1 text-xs text-gray-400">{s.label}</p>
                <p className="text-sm font-semibold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center rounded-2xl bg-gray-100 p-1 shadow-inner">
            {[
              { key: "structure", label: "โครงสร้างหลักสูตร" },
              { key: "students", label: "จำนวนนักศึกษา" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`min-w-[145px] rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "structure" ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">
                โครงสร้างและรายละเอียดของหลักสูตร
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {structureCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-xl p-4 text-center ${structureCardColor(
                      card.highlight,
                    )}`}
                  >
                    <p className="mb-3 text-xs leading-snug text-gray-500">
                      {card.label}
                    </p>
                    <p
                      className={`mb-1 text-3xl font-bold ${card.highlight ? "text-blue-600" : "text-blue-500"
                        }`}
                    >
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-400">หน่วยกิต</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">
                สรุปยอดเงินหักให้ภายนอกคณะ
              </h2>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-100 px-5 py-4">
                <span className="text-sm text-gray-700">
                  ยอดเงินที่หักให้มหาวิทยาลัย
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatMoney(course.deductToUni)}
                  </span>
                  <span className="text-sm text-gray-500">บาท</span>
                </div>
              </div>

              <p className="mb-3 text-xs text-gray-500">
                ยอดเงินที่หักให้รายวิชานอกคณะ
              </p>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {["รหัสวิชา", "รายวิชา", "ยอดรวม"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-center text-xs font-semibold text-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {deductionRows.length > 0 ? (
                      deductionRows.map((row) => (
                        <tr
                          key={`${row.code}-${row.name}`}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-5 py-3.5 text-center text-gray-700">
                            {row.code}
                          </td>
                          <td className="px-5 py-3.5 text-center text-gray-700">
                            {row.name}
                          </td>
                          <td className="px-5 py-3.5 text-center text-gray-700">
                            ฿ {formatMoney(row.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-6 text-center text-sm text-gray-400"
                        >
                          ไม่มีข้อมูลรายวิชานอกคณะ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">
                ตารางสรุปจำนวนนักศึกษา
              </h2>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={studentChartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;

                        const value = Number(payload[0]?.value ?? 0);

                        return (
                          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-md">
                            <p className="mb-2 text-sm font-semibold text-gray-900">
                              ปีการศึกษา {label}
                            </p>
                            <p className="text-sm font-medium text-green-500">
                              จำนวนนักศึกษา : {value} คน
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#d9d9d9"
                      radius={[4, 4, 0, 0]}
                      barSize={52}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#22c55e" }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">
                ตารางสรุปจำนวนนักศึกษา
              </h2>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">
                        ภาค
                      </th>
                      {(course.students || []).map((item) => (
                        <th
                          key={item.id}
                          className="px-5 py-3 text-center text-xs font-semibold text-gray-600"
                        >
                          {item.year}
                        </th>
                      ))}
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">
                        รวม (คน)
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4 text-center font-medium text-gray-700">
                        {programType}
                      </td>
                      {(course.students || []).map((item) => (
                        <td
                          key={item.id}
                          className="px-5 py-4 text-center text-gray-700"
                        >
                          {item.amount}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-center font-semibold text-gray-900">
                        {totalStudents}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                แสดงข้อมูลจากปีการศึกษา {course.students[0]?.year || "-"} ถึง{" "}
                {course.students[course.students.length - 1]?.year || "-"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}