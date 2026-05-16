import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Pagination from "./Pagination";
import {
  GetDataAnnualBudgetSummary,
  DeleteDataAnnualBudgetSummary,
  UpdateStatusAnnualBudgetSummary,
} from "../../../fetchapi/fetch_api_admin";

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
  updated_at?: string;
  updatedAt?: string;
  courses?: AnnualBudgetSummaryCourse[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

function pickArrayFromResponse(response: any): AnnualBudgetSummaryItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getYearLabel(item: AnnualBudgetSummaryItem) {
  return String(item.year?.year ?? item.year?.name ?? item.yearId ?? "-");
}

function getSemesterLabel(item: AnnualBudgetSummaryItem) {
  if (item.summaryType === "yearly") return "-";

  return String(
    item.semester?.name ??
      item.semester?.semester ??
      item.semesterId ??
      "-",
  );
}

function getSummaryTypeLabel(item: AnnualBudgetSummaryItem) {
  if (item.summaryType === "semester") return "แบบแยกภาคการศึกษา";
  return "แบบรายปี";
}

function isActiveStatus(status?: string | number) {
  return String(status ?? "1") === "1";
}

function getStatusText(status?: string | number) {
  return isActiveStatus(status) ? "เปิด" : "ปิด";
}

function StatusToggle({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-8 w-[64px] items-center rounded-full px-1 transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute text-[11px] font-bold text-white transition-all ${
          checked ? "left-2" : "right-2"
        }`}
      >
        {checked ? "เปิด" : "ปิด"}
      </span>

      <span
        className={`relative z-10 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[32px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function EditInfoModal({
  item,
  onClose,
  onCreateRevision,
}: {
  item: AnnualBudgetSummaryItem;
  onClose: () => void;
  onCreateRevision: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              แก้ไขสรุปข้อมูลงบประมาณ
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-400">
              รายการนี้เป็นข้อมูลที่คำนวณและบันทึกแล้ว
              หากต้องการแก้ไขยอด แนะนำให้สร้างฉบับแก้ไขจากเมนูสรุปงบประมาณประจำปี
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <div className="flex justify-between gap-4">
            <span>ปี</span>
            <span className="font-bold text-gray-800">{getYearLabel(item)}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span>เทอม</span>
            <span className="font-bold text-gray-800">
              {getSemesterLabel(item)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>วันที่บันทึก</span>
            <span className="font-bold text-gray-800">
              {formatDateTime(item.created_at || item.createdAt)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>สถานะ</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActiveStatus(item.status)
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {getStatusText(item.status)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>จำนวนหลักสูตร</span>
            <span className="font-bold text-blue-600">
              {item.courses?.length || 0} หลักสูตร
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onCreateRevision}
            className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            สร้างฉบับแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetSummaryManagement() {
  const navigate = useNavigate();

  const [data, setData] = useState<AnnualBudgetSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");

  const [editingItem, setEditingItem] =
    useState<AnnualBudgetSummaryItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await GetDataAnnualBudgetSummary();
      const items = pickArrayFromResponse(response);

      setData(items);
      setPage(1);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงข้อมูลสรุปงบประมาณได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((item) => {
      const year = getYearLabel(item).toLowerCase();
      const semester = getSemesterLabel(item).toLowerCase();
      const type = getSummaryTypeLabel(item).toLowerCase();
      const status = getStatusText(item.status).toLowerCase();
      const createdAt = formatDateTime(
        item.created_at || item.createdAt,
      ).toLowerCase();

      return (
        year.includes(keyword) ||
        semester.includes(keyword) ||
        type.includes(keyword) ||
        status.includes(keyword) ||
        createdAt.includes(keyword)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  const handleAdd = () => {
    navigate("/annual-budget-summary");
  };

  const handleView = (item: AnnualBudgetSummaryItem) => {
    navigate(`/annual-budget-management/detail/${item.id}`, {
      state: {
        summary: item,
      },
    });
  };

  const handleEdit = (item: AnnualBudgetSummaryItem) => {
    setEditingItem(item);
  };

  const handleCreateRevision = () => {
    if (!editingItem) return;

    navigate("/annual-budget-summary", {
      state: {
        mode: "revision",
        sourceSummaryId: editingItem.id,
        yearId: editingItem.yearId,
        selectedYearId: editingItem.yearId,
        selectedYear: editingItem.year,
        summaryType: editingItem.summaryType || "yearly",
        selectedSemesterId: editingItem.semesterId ?? null,
        selectedSemesterName: getSemesterLabel(editingItem),
      },
    });
  };

  const handleToggleStatus = async (item: AnnualBudgetSummaryItem) => {
    const oldStatus = isActiveStatus(item.status) ? "1" : "0";
    const nextStatus = oldStatus === "1" ? "0" : "1";

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${nextStatus === "1" ? "เปิด" : "ปิด"}สรุปงบประมาณปี ${getYearLabel(
        item,
      )} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#94a3b8",
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingStatusId(item.id);

      await UpdateStatusAnnualBudgetSummary(item.id, nextStatus);

      setData((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                status: nextStatus,
              }
            : row,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "อัปเดตสถานะสำเร็จ",
        text: `เปลี่ยนสถานะเป็น${nextStatus === "1" ? "เปิด" : "ปิด"}แล้ว`,
        confirmButtonColor: "#22c55e",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถอัปเดตสถานะได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (item: AnnualBudgetSummaryItem) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบข้อมูล",
      text: `ต้องการลบสรุปข้อมูลงบประมาณปี ${getYearLabel(item)} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(item.id);

      await DeleteDataAnnualBudgetSummary(item.id);

      await Swal.fire({
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: "ลบข้อมูลสรุปงบประมาณเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });

      await loadData();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถลบข้อมูลได้",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (item: AnnualBudgetSummaryItem) => {
    const payload = {
      id: item.id,
      yearId: item.yearId,
      year: getYearLabel(item),
      semesterId: item.semesterId,
      semester: getSemesterLabel(item),
      summaryType: item.summaryType,
      status: item.status,
      statusText: getStatusText(item.status),
      createdAt: item.created_at || item.createdAt,
      totalUniversityWorkAmount: item.totalUniversityWorkAmount,
      totalCurriculumAmount: item.totalCurriculumAmount,
      courses: item.courses || [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `annual-budget-summary-${getYearLabel(item)}-${item.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleGoToSubmit = () => {
    const nextPage = Math.min(totalPages, Math.max(1, Number(goTo || 1)));
    setPage(nextPage);
    setGoTo("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-5">
        <nav className="mb-4 text-sm text-gray-400">
          <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-700">
            สรุปข้อมูลงบประมาณ
          </span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            สรุปข้อมูลงบประมาณ
          </h1>

          <button
            type="button"
            onClick={handleAdd}
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
            เพิ่มสรุปข้อมูล
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาปี / เทอม / วันที่ / สถานะ..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-sm">
              <colgroup>
                <col className="w-[7%]" />
                <col className="w-[13%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ปี
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    เทอม
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ประเภท
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    วันที่บันทึก
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    สถานะ
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    บันทึกไฟล์
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, index) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-6 py-5 text-center font-medium text-gray-800">
                        {getYearLabel(row)}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {getSemesterLabel(row)}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {getSummaryTypeLabel(row)}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-500">
                        {formatDateTime(row.created_at || row.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <StatusToggle
                          checked={isActiveStatus(row.status)}
                          disabled={updatingStatusId === row.id}
                          onClick={() => handleToggleStatus(row)}
                        />
                      </td>

                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDownload(row)}
                          className="text-slate-500 transition-colors hover:text-blue-500"
                        >
                          <ArrowDownTrayIcon className="mx-auto h-5 w-5" />
                        </button>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleView(row)}
                            className="text-blue-500 transition-colors hover:text-blue-700"
                            title="ดูรายละเอียด"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            className="text-slate-500 transition-colors hover:text-slate-700"
                            title="แก้ไข"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === row.id}
                            className="text-red-500 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="ลบ"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filtered.length}
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            goTo={goTo}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onGoToChange={setGoTo}
            onGoToSubmit={handleGoToSubmit}
          />
        </div>
      </div>

      {editingItem && (
        <EditInfoModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onCreateRevision={handleCreateRevision}
        />
      )}
    </div>
  );
}