import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "./components/Pagination";
import UserFormModal, {
  type RoleItem,
  type UserFormData,
} from "./components/UserFormModal";
import DeleteUserModal from "./components/DeleteUserModal";
import {
  AddDataUser,
  DeleteDataUser,
  EditDataUser,
  GetDataRole,
  GetDataUser,
} from "../../../fetchapi/fetch_api_admin";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface UserRow {
  id: string;
  fname: string;
  lname: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  created_at?: string;
  updated_at?: string;
}

type SortKey = "name" | "email" | "roleName";
type SortOrder = "asc" | "desc";

type SortConfig = {
  key: SortKey;
  order: SortOrder;
};

const initialForm: UserFormData = {
  fname: "",
  lname: "",
  email: "",
  pwd: "",
  confirmPwd: "",
  roleId: "",
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
          {sortConfig.order === "desc" ? "▼" : "▲"}
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

function getFname(row: any) {
  return String(row.fname ?? row.Fname ?? "").trim();
}

function getLname(row: any) {
  return String(row.lname ?? row.Lname ?? "").trim();
}

function getFullName(row: any) {
  const fname = getFname(row);
  const lname = getLname(row);
  const fullName = `${fname} ${lname}`.trim();

  if (fullName) return fullName;

  return String(
    row.name ?? row.Name ?? row.username ?? row.fullName ?? "-",
  ).trim();
}

function getRoleId(row: any) {
  return String(
    row.roleId ??
      row.role_id ??
      row.roleID ??
      row.RoleID ??
      row.role?.id ??
      row.role?.ID ??
      row.Role?.id ??
      row.Role?.ID ??
      "",
  );
}

function getRoleName(row: any) {
  return String(
    row.roleName ??
      row.role_name ??
      row.role?.description ??
      row.role?.des ??
      row.role?.name ??
      row.role?.Description ??
      row.role?.Des ??
      row.role?.Name ??
      row.Role?.description ??
      row.Role?.des ??
      row.Role?.name ??
      row.Role?.Description ??
      row.Role?.Des ??
      row.Role?.Name ??
      "-",
  );
}

function normalizeUser(row: any): UserRow {
  const fname = getFname(row);
  const lname = getLname(row);

  return {
    id: String(row.id ?? row.ID ?? ""),
    fname,
    lname,
    name: getFullName(row),
    email: String(row.email ?? row.Email ?? ""),
    roleId: getRoleId(row),
    roleName: getRoleName(row),
    created_at: row.created_at ?? row.createdAt ?? row.CreatedAt,
    updated_at: row.updated_at ?? row.updatedAt ?? row.UpdatedAt,
  };
}

function normalizeRole(row: any): RoleItem {
  return {
    id: String(row.id ?? row.ID ?? ""),
    name: String(row.name ?? row.Name ?? ""),
    description:
      row.description ??
      row.des ??
      row.Description ??
      row.Des ??
      row.name ??
      row.Name ??
      "",
  };
}

function validatePasswordRule(password: string) {
  if (password.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  if (!/[A-Z]/.test(password)) {
    return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวใหญ่อย่างน้อย 1 ตัว";
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    return "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว";
  }

  return "";
}

function compareText(a: string, b: string) {
  return String(a || "").localeCompare(String(b || ""), "th", {
    numeric: true,
    sensitivity: "base",
  });
}

export default function UserManagement() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
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

  const [formData, setFormData] = useState<UserFormData>(initialForm);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<UserRow | null>(null);

  const loadRoles = async () => {
    try {
      const response = await GetDataRole();

      const data = pickArrayFromResponse<any>(response)
        .map(normalizeRole)
        .filter((role) => role.id);

      setRoles(data);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงข้อมูลบทบาทได้",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);

      const response = await GetDataUser();

      const data = pickArrayFromResponse<any>(response)
        .map(normalizeUser)
        .filter((user) => user.id);

      setItems(data);
      setPage(1);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถดึงข้อมูลผู้ใช้งานได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadItems();
  }, []);

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

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const fname = String(item.fname || "").toLowerCase();
      const lname = String(item.lname || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const roleName = String(item.roleName || "").toLowerCase();

      return (
        name.includes(keyword) ||
        fname.includes(keyword) ||
        lname.includes(keyword) ||
        email.includes(keyword) ||
        roleName.includes(keyword)
      );
    });
  }, [items, search]);

  const sortedItems = useMemo(() => {
    const rows = [...filteredItems];

    rows.sort((a, b) => {
      let result = 0;

      if (sortConfig.key === "name") {
        result = compareText(a.name, b.name);
      }

      if (sortConfig.key === "email") {
        result = compareText(a.email, b.email);
      }

      if (sortConfig.key === "roleName") {
        result = compareText(a.roleName, b.roleName);
      }

      return sortConfig.order === "asc" ? result : -result;
    });

    return rows;
  }, [filteredItems, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));

  const paginated = useMemo(() => {
    return sortedItems.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedItems, page, pageSize]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: UserRow) => {
    setEditingItem(item);

    setFormData({
      fname: item.fname || "",
      lname: item.lname || "",
      email: item.email || "",
      pwd: "",
      confirmPwd: "",
      roleId: item.roleId || "",
    });

    setShowFormModal(true);
  };

  const handleChangeForm = (field: keyof UserFormData, value: string) => {
    if (field === "fname" || field === "lname") {
      setFormData((prev) => ({
        ...prev,
        [field]: value.slice(0, 100),
      }));
      return;
    }

    if (field === "email") {
      setFormData((prev) => ({
        ...prev,
        email: value.slice(0, 150),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validateForm = () => {
    const fname = formData.fname.trim();
    const lname = formData.lname.trim();
    const email = formData.email.trim();
    const pwd = formData.pwd;
    const confirmPwd = formData.confirmPwd;

    if (!fname) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อ",
        text: "ชื่อเป็นข้อมูลที่จำเป็น",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!lname) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกนามสกุล",
        text: "นามสกุลเป็นข้อมูลที่จำเป็น",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกอีเมล",
        text: "อีเมลเป็นข้อมูลที่จำเป็น",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "รูปแบบอีเมลไม่ถูกต้อง",
        text: "กรุณากรอกอีเมลให้ถูกต้อง",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!formData.roleId) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกบทบาท",
        text: "บทบาทผู้ใช้งานเป็นข้อมูลที่จำเป็น",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (!editingItem && !pwd.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกรหัสผ่าน",
        text: "รหัสผ่านเป็นข้อมูลที่จำเป็น",
        confirmButtonColor: "#3b82f6",
      });
      return false;
    }

    if (pwd.trim()) {
      const passwordError = validatePasswordRule(pwd.trim());

      if (passwordError) {
        Swal.fire({
          icon: "warning",
          title: "รหัสผ่านไม่ถูกต้อง",
          text: passwordError,
          confirmButtonColor: "#3b82f6",
        });
        return false;
      }

      if (!confirmPwd.trim()) {
        Swal.fire({
          icon: "warning",
          title: "กรุณายืนยันรหัสผ่าน",
          text: "กรุณากรอกรหัสผ่านอีกครั้งเพื่อยืนยัน",
          confirmButtonColor: "#3b82f6",
        });
        return false;
      }

      if (pwd.trim() !== confirmPwd.trim()) {
        Swal.fire({
          icon: "warning",
          title: "รหัสผ่านไม่ตรงกัน",
          text: "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน",
          confirmButtonColor: "#3b82f6",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const fnameValue = formData.fname.trim();
    const lnameValue = formData.lname.trim();
    const emailValue = formData.email.trim();
    const pwdValue = formData.pwd.trim();
    const fullName = `${fnameValue} ${lnameValue}`.trim();

    const confirmResult = await Swal.fire({
      icon: "question",
      title: editingItem ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันการบันทึกข้อมูล",
      html: editingItem
        ? `ต้องการแก้ไขผู้ใช้งาน <b>${fullName}</b> ใช่หรือไม่`
        : `ต้องการบันทึกผู้ใช้งาน <b>${fullName}</b> ใช่หรือไม่`,
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
        const payload: {
          fname: string;
          lname: string;
          email: string;
          roleId: string;
          pwd?: string;
        } = {
          fname: fnameValue,
          lname: lnameValue,
          email: emailValue,
          roleId: formData.roleId,
        };

        if (pwdValue) {
          payload.pwd = pwdValue;
        }

        await EditDataUser(editingItem.id, payload);
      } else {
        await AddDataUser({
          fname: fnameValue,
          lname: lnameValue,
          email: emailValue,
          pwd: pwdValue,
          roleId: formData.roleId,
        });
      }

      setShowFormModal(false);
      resetForm();

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: editingItem
          ? "แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว"
          : "เพิ่มข้อมูลผู้ใช้งานเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });

      await loadItems();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถบันทึกข้อมูลผู้ใช้งานได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      setSubmitting(true);

      await DeleteDataUser(deletingItem.id);

      setDeletingItem(null);

      await Swal.fire({
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: "ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว",
        confirmButtonColor: "#22c55e",
        timer: 1400,
        showConfirmButton: false,
      });

      await loadItems();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.message || error || "ไม่สามารถลบข้อมูลผู้ใช้งานได้",
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
          <span className="font-medium text-gray-700">จัดการผู้ใช้งาน</span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>

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
            เพิ่มผู้ใช้งาน
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
                placeholder="ค้นหาชื่อ / นามสกุล / อีเมล / บทบาท..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[27%]" />
                <col className="w-[35%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="ชื่อ - นามสกุล"
                      sortKey="name"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="อีเมล"
                      sortKey="email"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left">
                    <SortableHeader
                      label="บทบาท"
                      sortKey="roleName"
                      sortConfig={sortConfig}
                      onSort={handleSort}
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
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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

                      <td className="px-6 py-5 text-left font-bold text-gray-900">
                        {row.name || "-"}
                      </td>

                      <td className="px-6 py-5 text-left text-gray-600">
                        {row.email || "-"}
                      </td>

                      <td className="px-6 py-5 text-left text-gray-600">
                        {row.roleName || "-"}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(row)}
                            title="แก้ไข"
                            disabled={submitting}
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingItem(row)}
                            title="ลบ"
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
        <UserFormModal
          mode={editingItem ? "edit" : "add"}
          formData={formData}
          roles={roles}
          submitting={submitting}
          onChange={handleChangeForm}
          onClose={() => {
            if (submitting) return;
            setShowFormModal(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deletingItem && (
        <DeleteUserModal
          item={deletingItem}
          submitting={submitting}
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