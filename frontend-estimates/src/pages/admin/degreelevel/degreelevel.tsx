import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "./components/Pagination";
import DegreeLevelFormModal, {
  type DegreeLevelFormData,
  type DegreeLevelSectionOption,
} from "./components/DegreeLevelFormModal";
import DeleteDegreeLevelModal, {
  type DegreeLevelItem,
} from "./components/DeleteDegreeLevelModal";
import {
  GetDataDegreeLevel,
  AddDataDegreeLevel,
  EditDataDegreeLevel,
  EditStatusDegreeLevel,
  DeleteDataDegreeLevel,
  GetDataSection,
} from "../../../fetchapi/fetch_api_admin";

const emptyForm: DegreeLevelFormData = {
  sectionId: "",
  name: "",
  shortName: "",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type SortKey = "name" | "sectionName" | "shortName" | "isActive";
type SortOrder = "asc" | "desc";

type SortConfig = {
  key: SortKey;
  order: SortOrder;
};

function SearchIcon() {
  return (
    <svg
      className="text-gray-400"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
  align?: "left" | "center";
}) {
  const isActive = sortConfig.key === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-600 transition-colors hover:text-blue-600 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <span className="text-[10px] text-gray-400">
          {sortConfig.order === "asc" ? "▲" : "▼"}
        </span>
      )}
    </button>
  );
}

function EditIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400 transition-colors hover:text-blue-500"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 1 1 3 3L12 15l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-400 transition-colors hover:text-red-500"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6 M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function StatusSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-8 w-[64px] items-center rounded-full px-1 transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      }`}
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

type DegreeLevelApiItem = {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  short_name?: string;
  shortName?: string;
  ShortName?: string;
  status?: string | number | boolean;
  Status?: string | number | boolean;
  section_id?: number | string;
  sectionId?: number | string;
  SectionID?: number | string;
  section?: {
    id?: number | string;
    ID?: number | string;
    section_name?: string;
    sectionName?: string;
    SectionName?: string;
    name?: string;
    Name?: string;
  };
  Section?: {
    id?: number | string;
    ID?: number | string;
    section_name?: string;
    sectionName?: string;
    SectionName?: string;
    name?: string;
    Name?: string;
  };
};

type SectionApiItem = {
  id?: number;
  ID?: number;
  section_name?: string;
  sectionName?: string;
  SectionName?: string;
  name?: string;
  Name?: string;
};

function pickArrayFromResponse<T>(response: any): T[] {
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

function getStatusBoolean(status: any) {
  return String(status ?? "1") === "1" || status === true;
}

function compareText(a: string, b: string) {
  return String(a || "").localeCompare(String(b || ""), "th", {
    numeric: true,
    sensitivity: "base",
  });
}

function compareBoolean(a: boolean, b: boolean) {
  return Number(a) - Number(b);
}

export default function DegreeLevelManagement() {
  const [items, setItems] = useState<DegreeLevelItem[]>([]);
  const [sections, setSections] = useState<DegreeLevelSectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    order: "asc",
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DegreeLevelItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DegreeLevelItem | null>(
    null,
  );
  const [formData, setFormData] = useState<DegreeLevelFormData>(emptyForm);

  const mapDegreeLevelToItem = (
    item: DegreeLevelApiItem,
  ): DegreeLevelItem => ({
    id: String(item.id ?? item.ID ?? ""),
    sectionId: String(
      item.section_id ||
        item.sectionId ||
        item.SectionID ||
        item.section?.id ||
        item.section?.ID ||
        item.Section?.id ||
        item.Section?.ID ||
        "",
    ),
    sectionName:
      item.section?.section_name ||
      item.section?.sectionName ||
      item.section?.SectionName ||
      item.section?.name ||
      item.section?.Name ||
      item.Section?.section_name ||
      item.Section?.sectionName ||
      item.Section?.SectionName ||
      item.Section?.name ||
      item.Section?.Name ||
      "",
    name: item.name || item.Name || "",
    shortName: item.short_name || item.shortName || item.ShortName || "",
    isActive: getStatusBoolean(item.status ?? item.Status),
  });

  const fetchSections = async () => {
    try {
      const response = await GetDataSection();
      const list = pickArrayFromResponse<SectionApiItem>(response);

      setSections(
        list
          .map((item) => ({
            id: Number(item.id ?? item.ID ?? 0),
            section_name:
              item.section_name ||
              item.sectionName ||
              item.SectionName ||
              item.name ||
              item.Name ||
              "",
          }))
          .filter((item) => item.id && item.section_name),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลโครงการระดับปริญญาได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const fetchDegreeLevels = async () => {
    try {
      setLoading(true);

      const response = await GetDataDegreeLevel();
      const list = pickArrayFromResponse<DegreeLevelApiItem>(response);

      setItems(
        list
          .map((item) => mapDegreeLevelToItem(item))
          .filter((item) => item.id),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลระดับปริญญาได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchDegreeLevels();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.shortName.toLowerCase().includes(keyword) ||
        item.sectionName.toLowerCase().includes(keyword),
    );
  }, [items, search]);

  const sortedItems = useMemo(() => {
    const rows = [...filteredItems];

    rows.sort((a, b) => {
      let result = 0;

      if (sortConfig.key === "name") {
        result = compareText(a.name, b.name);
      }

      if (sortConfig.key === "sectionName") {
        result = compareText(a.sectionName, b.sectionName);
      }

      if (sortConfig.key === "shortName") {
        result = compareText(a.shortName, b.shortName);
      }

      if (sortConfig.key === "isActive") {
        result = compareBoolean(a.isActive, b.isActive);
      }

      return sortConfig.order === "asc" ? result : -result;
    });

    return rows;
  }, [filteredItems, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));

  const paginatedItems = useMemo(() => {
    return sortedItems.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedItems, page, pageSize]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingItem(null);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return {
          key,
          order: "asc",
        };
      }

      return {
        key,
        order: prev.order === "asc" ? "desc" : "asc",
      };
    });

    setPage(1);
  };

  const handleFormChange = (
    field: keyof DegreeLevelFormData,
    value: string,
  ) => {
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value.slice(0, 150),
      }));
      return;
    }

    if (field === "shortName") {
      setFormData((prev) => ({
        ...prev,
        shortName: value.slice(0, 10),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (item: DegreeLevelItem) => {
    setEditingItem(item);

    setFormData({
      sectionId: item.sectionId || "",
      name: item.name || "",
      shortName: item.shortName || "",
    });

    setShowFormModal(true);
  };

  const validateForm = () => {
    if (!formData.sectionId) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกโครงการระดับปริญญา",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อระดับปริญญา",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!formData.shortName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อย่อ",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const section = sections.find(
      (item) => String(item.id) === String(formData.sectionId),
    );

    const confirmResult = await Swal.fire({
      icon: "question",
      title: editingItem ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันการบันทึกข้อมูล",
      text: editingItem
        ? `ต้องการแก้ไขระดับปริญญา ${formData.name.trim()} ใช่หรือไม่`
        : `ต้องการบันทึกระดับปริญญา ${formData.name.trim()} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);

      const payload = {
        sectionId: Number(formData.sectionId),
        section_id: Number(formData.sectionId),
        name: formData.name.trim(),
        shortName: formData.shortName.trim(),
        short_name: formData.shortName.trim(),
        status: "1",
      };

      if (editingItem) {
        await EditDataDegreeLevel(editingItem.id, payload);
      } else {
        await AddDataDegreeLevel(payload);
      }

      setShowFormModal(false);
      resetForm();

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: editingItem
          ? "แก้ไขข้อมูลระดับปริญญาเรียบร้อยแล้ว"
          : `เพิ่มข้อมูลระดับปริญญาใน${section?.section_name || "ระบบ"}เรียบร้อยแล้ว`,
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });

      await fetchDegreeLevels();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text:
          error?.message || error || "ไม่สามารถบันทึกข้อมูลระดับปริญญาได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: DegreeLevelItem) => {
    const nextStatus = item.isActive ? "0" : "1";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      html: `ต้องการ${nextStatus === "1" ? "เปิด" : "ปิด"}ใช้งานระดับปริญญา <b>${item.name}</b> ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await EditStatusDegreeLevel(item.id, nextStatus);

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                isActive: nextStatus === "1",
              }
            : row,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "เปลี่ยนสถานะสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถเปลี่ยนสถานะได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      setSubmitting(true);

      await DeleteDataDegreeLevel(deletingItem.id);

      setDeletingItem(null);

      await Swal.fire({
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: "ลบข้อมูลระดับปริญญาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });

      await fetchDegreeLevels();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถลบข้อมูลระดับปริญญาได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
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
          <span className="font-medium text-gray-700">จัดการระดับปริญญา</span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            จัดการระดับปริญญา
          </h1>

          <button
            type="button"
            onClick={openAddModal}
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
            เพิ่มระดับปริญญา
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <SearchIcon />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาระดับปริญญา / ชื่อย่อ / โครงการ..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[28%]" />
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="ชื่อระดับปริญญา"
                      sortKey="name"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="โครงการระดับปริญญา"
                      sortKey="sectionName"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="ชื่อย่อ"
                      sortKey="shortName"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-center">
                    <SortableHeader
                      label="สถานะ"
                      sortKey="isActive"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      align="center"
                    />
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
                      colSpan={6}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((row, index) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-6 py-5 text-left font-bold text-gray-900">
                        {row.name || "-"}
                      </td>

                      <td className="px-6 py-5 text-left font-medium text-gray-700">
                        {row.sectionName || "-"}
                      </td>

                      <td className="px-6 py-5 text-left text-gray-700">
                        {row.shortName || "-"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <StatusSwitch
                          checked={row.isActive}
                          onChange={() => handleToggleStatus(row)}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="แก้ไข"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingItem(row)}
                            title="ลบ"
                          >
                            <DeleteIcon />
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
            totalItems={sortedItems.length}
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

      {showFormModal && (
        <DegreeLevelFormModal
          title={editingItem ? "แก้ไขระดับปริญญา" : "เพิ่มระดับปริญญา"}
          formData={formData}
          sections={sections}
          onChange={handleFormChange}
          onClose={() => {
            if (submitting) return;
            setShowFormModal(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deletingItem && (
        <DeleteDegreeLevelModal
          item={deletingItem}
          onClose={() => {
            if (submitting) return;
            setDeletingItem(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}