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
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span className="absolute left-2 text-[10px] font-medium text-white">
        {checked ? "เปิด" : ""}
      </span>
    </button>
  );
}

type DegreeLevelApiItem = {
  id: string;
  name?: string;
  short_name?: string;
  shortName?: string;
  status?: string;
  section_id?: number;
  sectionId?: number;
  SectionID?: number;
  section?: {
    id?: number;
    section_name?: string;
    sectionName?: string;
  };
  Section?: {
    id?: number;
    section_name?: string;
    sectionName?: string;
  };
};

type SectionApiItem = {
  id: number;
  section_name?: string;
  sectionName?: string;
};

export default function DegreeLevelManagement() {
  const [items, setItems] = useState<DegreeLevelItem[]>([]);
  const [sections, setSections] = useState<DegreeLevelSectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DegreeLevelItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DegreeLevelItem | null>(null);
  const [formData, setFormData] = useState<DegreeLevelFormData>(emptyForm);

  const mapDegreeLevelToItem = (item: DegreeLevelApiItem): DegreeLevelItem => ({
    id: item.id,
    sectionId: String(item.section_id || item.sectionId || item.SectionID || item.section?.id || item.Section?.id || ""),
    sectionName:
      item.section?.section_name ||
      item.section?.sectionName ||
      item.Section?.section_name ||
      item.Section?.sectionName ||
      "",
    name: item.name || "",
    shortName: item.short_name || item.shortName || "",
    isActive: item.status === "1",
  });

  const fetchSections = async () => {
    try {
      const list = await GetDataSection();
      setSections(
        (list || []).map((item: SectionApiItem) => ({
          id: item.id,
          section_name: item.section_name || item.sectionName || "",
        })),
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
      const list = await GetDataDegreeLevel();

      setItems((list || []).map((item: DegreeLevelApiItem) => mapDegreeLevelToItem(item)));
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const resetForm = () => setFormData(emptyForm);

  const handleFormChange = (
    field: keyof DegreeLevelFormData,
    value: string,
  ) => {
    if (field === "name") {
      setFormData((prev) => ({ ...prev, name: value.slice(0, 150) }));
      return;
    }

    if (field === "shortName") {
      setFormData((prev) => ({ ...prev, shortName: value.slice(0, 10) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.sectionId) {
      return "กรุณาเลือกโครงการระดับปริญญา";
    }

    if (!formData.name.trim()) {
      return "กรุณากรอกชื่อระดับปริญญา";
    }

    if (!formData.shortName.trim()) {
      return "กรุณากรอกชื่อย่อ";
    }

    return null;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: DegreeLevelItem) => {
    setEditingItem(item);
    setFormData({
      sectionId: item.sectionId,
      name: item.name,
      shortName: item.shortName,
    });
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    const errorMessage = validateForm();

    if (errorMessage) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: errorMessage,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const selectedSectionName =
      sections.find((section) => String(section.id) === formData.sectionId)?.section_name || "";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: editingItem ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันการบันทึกข้อมูล",
      html: editingItem
        ? `ต้องการแก้ไขระดับปริญญา <b>${formData.name}</b><br/> <b>${selectedSectionName}</b> ใช่หรือไม่`
        : `ต้องการบันทึกระดับปริญญา <b>${formData.name}</b><br/> <b>${selectedSectionName}</b> ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);

      if (editingItem) {
        await EditDataDegreeLevel(editingItem.id, {
          section_id: Number(formData.sectionId),
          name: formData.name.trim(),
          short_name: formData.shortName.trim(),
          status: editingItem.isActive ? "1" : "0",
        });
      } else {
        await AddDataDegreeLevel({
          section_id: Number(formData.sectionId),
          name: formData.name.trim(),
          short_name: formData.shortName.trim(),
          status: "1",
        });
      }

      setShowFormModal(false);
      setEditingItem(null);
      resetForm();
      await fetchDegreeLevels();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: editingItem
          ? `แก้ไขระดับปริญญา "${formData.name}" เรียบร้อยแล้ว`
          : `เพิ่มระดับปริญญา "${formData.name}" เรียบร้อยแล้ว`,
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "บันทึกข้อมูลไม่สำเร็จ",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบข้อมูล",
      text: `ต้องการลบระดับปริญญา "${deletingItem.name}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      await DeleteDataDegreeLevel(deletingItem.id);
      setDeletingItem(null);
      await fetchDegreeLevels();

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบข้อมูลระดับปริญญาเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ลบข้อมูลไม่สำเร็จ",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: DegreeLevelItem) => {
    const nextStatus = item.isActive ? "0" : "1";
    const nextStatusText = nextStatus === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${nextStatusText}ระดับปริญญา "${item.name}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await EditStatusDegreeLevel(item.id, nextStatus);
      await fetchDegreeLevels();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: `เปลี่ยนสถานะระดับปริญญา "${item.name}" เรียบร้อยแล้ว`,
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "อัปเดตสถานะไม่สำเร็จ",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleFormKeyDown = async (
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!submitting) {
        await handleSubmit();
      }
    }
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
          <h1 className="text-xl font-bold text-gray-900">จัดการระดับปริญญา</h1>

          <button
            type="button"
            onClick={handleOpenAdd}
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
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาระดับปริญญา / ชื่อย่อ / โครงการ..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[28%]" />
                <col className="w-[24%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-600">
                    ชื่อระดับปริญญา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-600">
                    โครงการระดับปริญญา
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ชื่อย่อ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    สถานะ
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
                      ไม่พบข้อมูลระดับปริญญา
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-6 py-5 text-left">
                        <p className="font-medium text-gray-800">{item.name}</p>
                      </td>

                      <td className="px-6 py-5 text-left text-gray-700">
                        {item.sectionName || "-"}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {item.shortName}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center">
                          <StatusSwitch
                            checked={item.isActive}
                            onChange={() => handleToggleStatus(item)}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={submitting}
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            disabled={submitting}
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
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredItems.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </div>

        {showFormModal && (
          <div onKeyDown={handleFormKeyDown}>
            <DegreeLevelFormModal
              title={editingItem ? "แก้ไขข้อมูลระดับปริญญา" : "เพิ่มระดับปริญญา"}
              formData={formData}
              sections={sections}
              onChange={handleFormChange}
              onClose={() => {
                if (submitting) return;
                setShowFormModal(false);
                setEditingItem(null);
                resetForm();
              }}
              onSubmit={handleSubmit}
            />
          </div>
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
    </div>
  );
}