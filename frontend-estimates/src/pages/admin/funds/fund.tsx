import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "./components/Pagination";
import FundFormModal from "./components/FundFormModal";
import DeleteModal, { type FundItem } from "./components/DeleteModal";
import {
  GetDataFund,
  AddDataFund,
  EditDataFund,
  EditStatusFund,
  DeleteDataFund,
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
      className={`relative inline-flex h-8 w-[64px] items-center rounded-full px-1 transition-colors ${checked ? "bg-emerald-500" : "bg-gray-300"
        }`}
    >
      <span
        className={`absolute text-[11px] font-bold text-white transition-all ${checked ? "left-2" : "right-2"
          }`}
      >
        {checked ? "เปิด" : "ปิด"}
      </span>

      <span
        className={`relative z-10 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[32px]" : "translate-x-0"
          }`}
      />
    </button>
  );
}

type FundApiItem = {
  id: string;
  name?: string;
  pctSplit?: number;
  pct_split?: number;
  status?: string;
};

const emptyForm = {
  name: "",
  percent: 0,
};

export default function FundsManagement() {
  const [items, setItems] = useState<FundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FundItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FundItem | null>(null);

  const [name, setName] = useState("");
  const [percent, setPercent] = useState<number>(0);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const list = await GetDataFund();

      setItems(
        (list || []).map((item: FundApiItem) => ({
          id: item.id,
          name: item.name || "",
          percent: Number(item.pctSplit ?? item.pct_split ?? 0),
          isActive: item.status === "1",
        })),
      );
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error || "ไม่สามารถดึงข้อมูลกองทุนได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
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

  const resetForm = () => {
    setName(emptyForm.name);
    setPercent(emptyForm.percent);
  };

  const validateForm = () => {
    if (!name.trim()) {
      return "กรุณากรอกชื่อกองทุน";
    }

    if (name.trim().length > 255) {
      return "ชื่อกองทุนต้องไม่เกิน 255 ตัวอักษร";
    }

    if (Number.isNaN(Number(percent))) {
      return "กรุณากรอกเปอร์เซ็นต์หักแบ่งให้ถูกต้อง";
    }

    if (Number(percent) < 0) {
      return "เปอร์เซ็นต์หักแบ่งต้องไม่น้อยกว่า 0";
    }

    return null;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: FundItem) => {
    setEditingItem(item);
    setName(item.name);
    setPercent(item.percent);
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    const nameValue = name.trim();
    const percentValue = Number(percent);
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

    const confirmResult = await Swal.fire({
      icon: "question",
      title: editingItem ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันการบันทึกข้อมูล",
      html: editingItem
        ? `ต้องการแก้ไขกองทุน <b>${nameValue}</b> เปอร์เซ็นต์หักแบ่ง <b>${percentValue}%</b> ใช่หรือไม่`
        : `ต้องการบันทึกกองทุน <b>${nameValue}</b> เปอร์เซ็นต์หักแบ่ง <b>${percentValue}%</b> ใช่หรือไม่`,
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
        await EditDataFund(editingItem.id, {
          name: nameValue,
          pctSplit: Number(percentValue.toFixed(2)),
          status: editingItem.isActive ? "1" : "0",
        });
      } else {
        await AddDataFund({
          name: nameValue,
          pctSplit: Number(percentValue.toFixed(2)),
          status: "1",
        });
      }

      setShowFormModal(false);
      setEditingItem(null);
      resetForm();
      await fetchFunds();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: editingItem
          ? `แก้ไขกองทุน "${nameValue}" เรียบร้อยแล้ว`
          : `เพิ่มกองทุน "${nameValue}" เรียบร้อยแล้ว`,
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
      text: `ต้องการลบกองทุน "${deletingItem.name}" ใช่หรือไม่`,
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
      await DeleteDataFund(deletingItem.id);
      setDeletingItem(null);
      await fetchFunds();

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบข้อมูลกองทุนเรียบร้อยแล้ว",
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

  const handleToggleStatus = async (item: FundItem) => {
    const nextStatus = item.isActive ? "0" : "1";
    const nextStatusText = nextStatus === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน";

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `ต้องการ${nextStatusText}กองทุน "${item.name}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await EditStatusFund(item.id, nextStatus);
      await fetchFunds();

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: `เปลี่ยนสถานะกองทุน "${item.name}" เรียบร้อยแล้ว`,
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
          <span className="font-medium text-gray-700">จัดการกองทุน</span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">จัดการกองทุน</h1>

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
            เพิ่มกองทุน
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
                placeholder="ค้นหาชื่อกองทุน..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[40%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-gray-600">
                    ชื่อกองทุน
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    เปอร์เซ็นต์หักแบ่ง
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
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      ไม่พบข้อมูลกองทุน
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
                        {Number(item.percent).toFixed(2)}%
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
          <FundFormModal
            title={editingItem ? "แก้ไขข้อมูลกองทุน" : "เพิ่มกองทุน"}
            iconColor="#3b82f6"
            name={name}
            percent={percent}
            onNameChange={(v) => setName(v.slice(0, 150))}
            onPercentChange={(v) => setPercent(v)}
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
          <DeleteModal
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