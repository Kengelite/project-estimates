import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "./components/Pagination";
import CurriculumFormModal from "./components/CurriculumFormModal";
import DeleteCurriculumModal from "./components/DeleteCurriculumModal";
import type { CurriculumFormData, CurriculumItem } from "@/types/curriculum";
import {
  GetDataCurriculum,
  AddDataCurriculum,
  EditDataCurriculum,
  EditStatusCurriculum,
  DeleteDataCurriculum,
} from "../../../fetchapi/fetch_api_admin";

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

type CurriculumApiItem = {
  id: string;
  name?: string;
  status?: string;
  bachelorNormal?: number;
  bachelorSpecial?: number;
  graduate?: number;
};

const emptyForm: CurriculumFormData = {
  name: "",
  bachelorNormal: "0",
  bachelorSpecial: "0",
  graduate: "0",
};

export default function CurriculumPage() {
  const [items, setItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CurriculumItem | null>(null);
  const [formData, setFormData] = useState<CurriculumFormData>(emptyForm);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      const list = await GetDataCurriculum();

      setItems(
        (list || []).map((item: CurriculumApiItem) => ({
          id: item.id,
          name: item.name || "",
          bachelorNormal: `${Number(item.bachelorNormal ?? 0).toFixed(2)}%`,
          bachelorSpecial: `${Number(item.bachelorSpecial ?? 0).toFixed(2)}%`,
          graduate: `${Number(item.graduate ?? 0).toFixed(2)}%`,
          isActive: item.status === "1",
        })),
      );
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
    fetchCurriculums();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const resetForm = () => setFormData(emptyForm);

  const sanitizePercent = (value: string) => {
    if (value === "") return "";
    if (!/^\d*\.?\d{0,2}$/.test(value)) return null;
    return value;
  };

  const handleFormChange = (
    field: keyof CurriculumFormData,
    value: string,
  ) => {
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value.slice(0, 150),
      }));
      return;
    }

    const sanitized = sanitizePercent(value);
    if (sanitized === null) return;

    setFormData((prev) => ({
      ...prev,
      [field]: sanitized,
    }));
  };

  const validatePercent = (value: string, label: string) => {
    if (value === "") return `${label} ต้องไม่ว่าง`;

    const num = Number(value);
    if (Number.isNaN(num)) return `${label} ต้องเป็นตัวเลข`;
    if (num < 0) return `${label} ต้องไม่น้อยกว่า 0`;

    return null;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "กรุณากรอกชื่อบริหาร";
    }

    if (formData.name.trim().length > 150) {
      return "ชื่อบริหารต้องไม่เกิน 150 ตัวอักษร";
    }

    const normalError = validatePercent(formData.bachelorNormal, "ตรี (ปกติ)");
    if (normalError) return normalError;

    const specialError = validatePercent(formData.bachelorSpecial, "ตรี (พิเศษ)");
    if (specialError) return specialError;

    const graduateError = validatePercent(formData.graduate, "บัณฑิต");
    if (graduateError) return graduateError;

    return null;
  };

  const buildPayload = (status: string) => ({
    name: formData.name.trim(),
    status,
    splits: [
      {
        splitGroup: "bachelor_normal" as const,
        pctSplit: Number(Number(formData.bachelorNormal || 0).toFixed(2)),
      },
      {
        splitGroup: "bachelor_special" as const,
        pctSplit: Number(Number(formData.bachelorSpecial || 0).toFixed(2)),
      },
      {
        splitGroup: "graduate" as const,
        pctSplit: Number(Number(formData.graduate || 0).toFixed(2)),
      },
    ],
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: CurriculumItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      bachelorNormal: item.bachelorNormal.replace("%", ""),
      bachelorSpecial: item.bachelorSpecial.replace("%", ""),
      graduate: item.graduate.replace("%", ""),
    });
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ถูกต้อง",
        text: errorMessage,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const nameValue = formData.name.trim();

    const confirmResult = await Swal.fire({
      icon: "question",
      title: editingItem ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันการบันทึกข้อมูล",
      html: `
        ต้องการ${editingItem ? "แก้ไข" : "บันทึก"}บริหาร ${nameValue} ใช่หรือไม่<br/>
        ตรี (ปกติ) <b>${Number(formData.bachelorNormal).toFixed(2)}%</b><br/>
        ตรี (พิเศษ) <b>${Number(formData.bachelorSpecial).toFixed(2)}%</b><br/>
        บัณฑิต <b>${Number(formData.graduate).toFixed(2)}%</b>
      `,
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
        await EditDataCurriculum(
          editingItem.id,
          buildPayload(editingItem.isActive ? "1" : "0"),
        );
      } else {
        await AddDataCurriculum(buildPayload("1"));
      }

      setShowFormModal(false);
      setEditingItem(null);
      resetForm();
      await fetchCurriculums();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: editingItem
          ? `แก้ไขข้อมูลบริหาร "${nameValue}" เรียบร้อยแล้ว`
          : `เพิ่มข้อมูลบริหาร "${nameValue}" เรียบร้อยแล้ว`,
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
      text: `ต้องการลบข้อมูลบริหาร "${deletingItem.name}" ใช่หรือไม่`,
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
      await DeleteDataCurriculum(deletingItem.id);
      setDeletingItem(null);
      await fetchCurriculums();

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบข้อมูลบริหารเรียบร้อยแล้ว",
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

  const handleToggleStatus = async (item: CurriculumItem) => {
    const nextStatus = item.isActive ? "0" : "1";
    const nextStatusText = nextStatus === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${nextStatusText}บริหาร "${item.name}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await EditStatusCurriculum(item.id, nextStatus);
      await fetchCurriculums();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: `เปลี่ยนสถานะบริหาร "${item.name}" เรียบร้อยแล้ว`,
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-5">
        <nav className="mb-4 text-sm text-gray-400">
          <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-700">
            จัดการบริหารหลักสูตร
          </span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">บริหารหลักสูตร</h1>

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
            เพิ่มบริหาร
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
                placeholder="ค้นหาชื่อบริหาร..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[30%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">
                    ชื่อบริหาร
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    ตรี (ปกติ)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    ตรี (พิเศษ)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    บัณฑิต
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      ไม่พบข้อมูลบริหารหลักสูตร
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-5 text-center text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-6 py-5 text-left font-medium text-gray-800">
                        {item.name}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {item.bachelorNormal}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {item.bachelorSpecial}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {item.graduate}
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
                        <div className="flex items-center justify-center gap-4">
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
          <CurriculumFormModal
            title={editingItem ? "แก้ไขข้อมูลบริหารหลักสูตร" : "เพิ่มบริหารหลักสูตร"}
            iconColor="#3b82f6"
            formData={formData}
            onChange={handleFormChange}
            onClose={() => {
              if (submitting) return;
              setShowFormModal(false);
              setEditingItem(null);
              resetForm();
            }}
            onSubmit={handleSubmit}
          />
        )}

        {deletingItem && (
          <DeleteCurriculumModal
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