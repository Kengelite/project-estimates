import { CloseBtn, ModalBase } from "./ModalBase";

export interface AcademicYearItem {
  id: number;
  year: string;
  isActive: boolean;
}

interface DeleteAcademicYearModalProps {
  item: AcademicYearItem;
  onClose: () => void;
  onConfirm: () => void;
}

function AcademicYearAvatar() {
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "#3b82f622" }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  );
}

export default function DeleteAcademicYearModal({
  item,
  onClose,
  onConfirm,
}: DeleteAcademicYearModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <AcademicYearAvatar />

        <h2 className="flex-1 text-base font-bold text-gray-900">
          ยืนยันการลบข้อมูล
        </h2>

        <CloseBtn onClick={onClose} />
      </div>

      <p className="mb-4 text-sm text-gray-500">
        คุณต้องการลบข้อมูลปีการศึกษานี้ใช่หรือไม่?
      </p>

      <div className="mb-3 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3 text-sm">
        <p>
          <span className="text-gray-400">ปีการศึกษา : </span>
          <span className="text-gray-700">{item.year}</span>
        </p>
        <p>
          <span className="text-gray-400">สถานะ : </span>
          <span className="text-gray-700">
            {item.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          ลบข้อมูล
        </button>
      </div>
    </ModalBase>
  );
}