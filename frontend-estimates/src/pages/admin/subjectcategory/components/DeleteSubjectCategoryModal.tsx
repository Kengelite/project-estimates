import { CloseBtn, ModalBase } from "./ModalBase";

export interface SubjectCategoryItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface DeleteSubjectCategoryModalProps {
  item: SubjectCategoryItem;
  onClose: () => void;
  onConfirm: () => void;
}

function SubjectCategoryAvatar() {
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
        <path d="M4 7h16" />
        <path d="M4 12h10" />
        <path d="M4 17h16" />
      </svg>
    </div>
  );
}

export default function DeleteSubjectCategoryModal({
  item,
  onClose,
  onConfirm,
}: DeleteSubjectCategoryModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <SubjectCategoryAvatar />

        <h2 className="flex-1 text-base font-bold text-gray-900">
          ยืนยันการลบข้อมูล
        </h2>

        <CloseBtn onClick={onClose} />
      </div>

      <p className="mb-4 text-sm text-gray-500">
        คุณต้องการลบข้อมูลหมวดวิชานี้ใช่หรือไม่?
      </p>

      <div className="mb-3 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3 text-sm">
        <p>
          <span className="text-gray-400">ชื่อหมวดวิชา : </span>
          <span className="text-gray-700">{item.name}</span>
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