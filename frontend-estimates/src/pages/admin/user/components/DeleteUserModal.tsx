import { CloseBtn, ModalBase } from "./ModalBase";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  roleName?: string;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
}

interface DeleteUserModalProps {
  item: UserItem;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563eb"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function isActiveStatus(status?: string | number) {
  return String(status ?? "1") === "1";
}

export default function DeleteUserModal({
  item,
  submitting = false,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <UserIcon />
        </div>

        <h2 className="flex-1 text-base font-bold text-gray-900">
          ยืนยันการลบข้อมูล
        </h2>

        <CloseBtn onClick={onClose} />
      </div>

      <p className="mb-4 text-sm font-medium text-gray-600">
        คุณต้องการลบข้อมูลผู้ใช้งานนี้ใช่หรือไม่?
      </p>

      <div className="mb-3 space-y-2 rounded-xl bg-gray-50 px-4 py-3 text-sm">
        <p>
          <span className="text-gray-400">ชื่อผู้ใช้งาน : </span>
          <span className="font-semibold text-gray-700">{item.name}</span>
        </p>

        <p>
          <span className="text-gray-400">อีเมล : </span>
          <span className="font-medium text-gray-700">{item.email}</span>
        </p>

        <p>
          <span className="text-gray-400">บทบาท : </span>
          <span className="font-medium text-gray-700">
            {item.roleName || "-"}
          </span>
        </p>

        <p>
          <span className="text-gray-400">สถานะ : </span>
          <span className="font-medium text-gray-700">
            {isActiveStatus(item.status) ? "เปิดใช้งาน" : "ปิดใช้งาน"}
          </span>
        </p>
      </div>

      <p className="mb-5 text-xs text-red-500">
        การลบข้อมูลนี้จะไม่สามารถกู้คืนได้อีก
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ยกเลิก
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "กำลังลบ..." : "ลบข้อมูล"}
        </button>
      </div>
    </ModalBase>
  );
}