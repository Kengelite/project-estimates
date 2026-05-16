import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataAnnualBudgetSummaryByID } from "../../../fetchapi/fetch_api_admin";

interface AnnualBudgetSummaryCourseDetail {
  id?: string;
  step?: string;
  refType?: string;
  refId?: string | null;
  nameSnapshot?: string;
  percent?: number;
  deductAmount?: number;
}

interface AnnualBudgetSummaryCourse {
  id?: string;
  courseId?: string | null;
  courseNameSnapshot?: string;
  courseShortNameSnapshot?: string;
  sectionTitleSnapshot?: string;
  initialAmount?: number;
  step2DeductAmount?: number;
  step2RemainingAmount?: number;
  step3DeductAmount?: number;
  step3RemainingAmount?: number;
  step4DeductAmount?: number;
  step4RemainingAmount?: number;
  step5DeductAmount?: number;
  step5RemainingAmount?: number;
  step6DeductAmount?: number;
  finalRemainingAmount?: number;
  details?: AnnualBudgetSummaryCourseDetail[];
}

interface AnnualBudgetSummaryItem {
  id: string;
  yearId?: string | number;
  year?: {
    id?: string | number;
    year?: string | number;
    name?: string;
  } | null;
  summaryType?: "yearly" | "semester" | string;
  semesterId?: string | number | null;
  semester?: {
    id?: string | number;
    name?: string;
    semester?: string | number;
  } | null;
  totalUniversityWorkAmount?: number;
  totalCurriculumAmount?: number;
  status?: string | number;
  created_at?: string;
  createdAt?: string;
  courses?: AnnualBudgetSummaryCourse[];
}

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/,/g, "").replace("%", "").trim();
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: any) {
  return toNumber(value).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDeduct(value: any) {
  const number = Math.abs(toNumber(value));

  if (number <= 0) return "0";

  return `- ${formatMoney(number)}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickObjectFromResponse(response: any): AnnualBudgetSummaryItem | null {
  if (!response) return null;
  if (response?.data?.id) return response.data;
  if (response?.Data?.id) return response.Data;
  if (response?.item?.id) return response.item;
  if (response?.result?.id) return response.result;
  if (response?.id) return response;
  return null;
}

function getYearLabel(item?: AnnualBudgetSummaryItem | null) {
  if (!item) return "-";
  return String(item.year?.year ?? item.year?.name ?? item.yearId ?? "-");
}

function getSemesterLabel(item?: AnnualBudgetSummaryItem | null) {
  if (!item) return "-";
  if (item.summaryType === "yearly") return "-";

  return String(
    item.semester?.name ??
      item.semester?.semester ??
      item.semesterId ??
      "-",
  );
}

function getSummaryTypeLabel(item?: AnnualBudgetSummaryItem | null) {
  if (!item) return "-";
  if (item.summaryType === "semester") return "แบบแยกภาคการศึกษา";
  return "แบบรายปี";
}

function isActiveStatus(status?: string | number) {
  return String(status ?? "1") === "1";
}

function getStatusText(status?: string | number) {
  return isActiveStatus(status) ? "เปิด" : "ปิด";
}

function SummaryRow({
  label,
  deductAmount,
  remainingAmount,
  canToggle = false,
  expanded = false,
  onToggle,
}: {
  label: string;
  deductAmount: number;
  remainingAmount: number;
  canToggle?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_220px_220px] items-center gap-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <span>{label}</span>

        {canToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={`text-sm font-medium underline underline-offset-2 transition-colors ${
              expanded
                ? "text-red-500 hover:text-red-600"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            {expanded ? "ย่อข้อมูล" : "ดูเพิ่มเติม"}
          </button>
        )}
      </div>

      <div className="text-right text-base font-semibold text-red-500">
        {formatDeduct(deductAmount)}
      </div>

      <div className="text-right text-base font-bold text-blue-600">
        {formatMoney(remainingAmount)}
      </div>
    </div>
  );
}

function DetailChildRow({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_220px_220px] items-center gap-4 py-1.5 text-sm">
      <div className="pl-5 text-gray-500">- {label}</div>

      <div className="text-right font-medium text-red-400">
        {formatDeduct(amount)}
      </div>

      <div />
    </div>
  );
}

function CourseStep7Block({ course }: { course: AnnualBudgetSummaryCourse }) {
  const details = course.details || [];

  const fundDetails = details.filter((detail) => detail.step === "step4");
  const centralDetails = details.filter((detail) => detail.step === "step5");
  const universityWorkDetails = details.filter(
    (detail) => detail.step === "step6",
  );

  // default = ดูเพิ่มเติม
  const [expanded, setExpanded] = useState({
    step4: false,
    step5: false,
    step6: false,
  });

  const step2Deduct = toNumber(course.step2DeductAmount);
  const step2Remaining = toNumber(course.step2RemainingAmount);

  const step3Deduct = toNumber(course.step3DeductAmount);
  const step3Remaining = toNumber(course.step3RemainingAmount);

  const step4Deduct = toNumber(course.step4DeductAmount);
  const step4Remaining = toNumber(course.step4RemainingAmount);

  const step5Deduct = toNumber(course.step5DeductAmount);
  const step5Remaining = toNumber(course.step5RemainingAmount);

  const step6Deduct = toNumber(course.step6DeductAmount);
  const finalRemaining = toNumber(course.finalRemainingAmount);

  return (
    <div className="mb-14">
      <div className="mb-6">
        <h4 className="text-xl font-extrabold text-gray-900">
          {course.courseShortNameSnapshot || "-"}
        </h4>

        <p className="mt-2 text-sm font-medium text-gray-400">
          {course.courseNameSnapshot || "-"}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_220px_220px] gap-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-400">
        <div>รายการ</div>
        <div className="text-right">ยอดเงินที่ถูกหัก (บาท)</div>
        <div className="text-right">คงเหลือ (บาท)</div>
      </div>

      <div className="pt-4">
        <SummaryRow
          label="จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย"
          deductAmount={step2Deduct}
          remainingAmount={step2Remaining}
        />

        <SummaryRow
          label="จ่ายให้เจ้าของรายวิชานอกคณะ"
          deductAmount={step3Deduct}
          remainingAmount={step3Remaining}
        />

        <SummaryRow
          label="หักเข้ากองทุน/สาธารณูปโภค"
          deductAmount={step4Deduct}
          remainingAmount={step4Remaining}
          canToggle={fundDetails.length > 0}
          expanded={expanded.step4}
          onToggle={() =>
            setExpanded((prev) => ({
              ...prev,
              step4: !prev.step4,
            }))
          }
        />

        {expanded.step4 &&
          fundDetails.map((detail) => (
            <DetailChildRow
              key={detail.id || `${detail.nameSnapshot}-${detail.deductAmount}`}
              label={detail.nameSnapshot || "-"}
              amount={toNumber(detail.deductAmount)}
            />
          ))}

        <SummaryRow
          label="หักบริหารส่วนกลางวิทยาลัย"
          deductAmount={step5Deduct}
          remainingAmount={step5Remaining}
          canToggle={centralDetails.length > 0}
          expanded={expanded.step5}
          onToggle={() =>
            setExpanded((prev) => ({
              ...prev,
              step5: !prev.step5,
            }))
          }
        />

        {expanded.step5 &&
          centralDetails.map((detail) => (
            <DetailChildRow
              key={detail.id || `${detail.nameSnapshot}-${detail.deductAmount}`}
              label={detail.nameSnapshot || "-"}
              amount={toNumber(detail.deductAmount)}
            />
          ))}

        <SummaryRow
          label="หักบริหารงานวิทยาลัย"
          deductAmount={step6Deduct}
          remainingAmount={finalRemaining}
          canToggle={universityWorkDetails.length > 0}
          expanded={expanded.step6}
          onToggle={() =>
            setExpanded((prev) => ({
              ...prev,
              step6: !prev.step6,
            }))
          }
        />

        {expanded.step6 &&
          universityWorkDetails.map((detail) => (
            <DetailChildRow
              key={detail.id || `${detail.nameSnapshot}-${detail.deductAmount}`}
              label={detail.nameSnapshot || "-"}
              amount={toNumber(detail.deductAmount)}
            />
          ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>รวมเงินบริหารงานวิทยาลัย</span>
          <span className="text-blue-600">
            {formatMoney(step6Deduct)} บาท
          </span>
        </div>

        <div className="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>รวมเงินบริหารหลักสูตร</span>
          <span className="text-blue-600">
            {formatMoney(finalRemaining)} บาท
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gray-50 px-8 py-6">
        <div className="flex items-center justify-between text-xl font-extrabold text-gray-900">
          <span>รวมเงินบริหารงานวิทยาลัย</span>
          <span className="text-2xl text-blue-600">
            {formatMoney(step6Deduct)} บาท
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between text-xl font-extrabold text-gray-900">
          <span>รวมเงินบริหารหลักสูตร</span>
          <span className="text-2xl text-blue-600">
            {formatMoney(finalRemaining)} บาท
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BudgetSummaryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const stateSummary = (location.state as any)?.summary as
    | AnnualBudgetSummaryItem
    | undefined;

  const [item, setItem] = useState<AnnualBudgetSummaryItem | null>(
    stateSummary || null,
  );
  const [loading, setLoading] = useState(!stateSummary);

  const id = params.id;

  const loadDetail = async () => {
    if (!id) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่พบรหัสข้อมูล",
        text: "กรุณากลับไปเลือกข้อมูลใหม่อีกครั้ง",
        confirmButtonColor: "#2563eb",
      });

      navigate("/annual-budget-management");
      return;
    }

    try {
      setLoading(true);

      const response = await GetDataAnnualBudgetSummaryByID(id);
      const data = pickObjectFromResponse(response);

      if (!data) {
        throw new Error("ไม่พบข้อมูลสรุปงบประมาณ");
      }

      setItem(data);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงรายละเอียดได้",
        confirmButtonColor: "#2563eb",
      });

      navigate("/annual-budget-management");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stateSummary) {
      loadDetail();
    }
  }, [id]);

  const courses = item?.courses || [];

  const groupedCourses = useMemo(() => {
    const map = new Map<string, AnnualBudgetSummaryCourse[]>();

    courses.forEach((course) => {
      const key = course.sectionTitleSnapshot || "-";
      const old = map.get(key) || [];
      map.set(key, [...old, course]);
    });

    return Array.from(map.entries()).map(([sectionTitle, rows]) => ({
      sectionTitle,
      rows,
    }));
  }, [courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center text-sm text-gray-400 shadow-sm">
          กำลังโหลดรายละเอียด...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center text-sm text-gray-400 shadow-sm">
          ไม่พบข้อมูล
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-5">
        <nav className="mb-4 text-sm text-gray-400">
          <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span
            onClick={() => navigate("/annual-budget-management")}
            className="cursor-pointer hover:text-gray-600"
          >
            สรุปข้อมูลงบประมาณ
          </span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-700">
            รายละเอียดสรุปงบประมาณ
          </span>
        </nav>

        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">
            รายละเอียดสรุปงบประมาณ
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            ปีงบประมาณ {getYearLabel(item)} / {getSummaryTypeLabel(item)}
            {item.summaryType === "semester"
              ? ` / เทอม ${getSemesterLabel(item)}`
              : ""}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-8 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  สรุปผลงบประมาณประจำปี
                </h2>

                <p className="mt-2 text-sm font-medium text-gray-400">
                  วันที่บันทึก:{" "}
                  {formatDateTime(item.created_at || item.createdAt)}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                  isActiveStatus(item.status)
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {getStatusText(item.status)}
              </span>
            </div>
          </div>

          <div className="px-10 py-10">
            {groupedCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
                ไม่มีรายละเอียดสรุปงบประมาณ
              </div>
            ) : (
              groupedCourses.map((group) => (
                <div key={group.sectionTitle} className="mb-14">
                  <h3 className="mb-8 mt-4 text-xl font-bold text-gray-900">
                    {group.sectionTitle}
                  </h3>

                  {group.rows.map((course) => (
                    <CourseStep7Block
                      key={
                        course.id ||
                        course.courseId ||
                        course.courseNameSnapshot
                      }
                      course={course}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}