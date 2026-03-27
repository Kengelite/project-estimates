import { ModalBase, CloseBtn } from "./ModalBase";
import type { FundItem } from "@/types/funds";

// ── Delete Confirm Modal ──────────────────────────────────────────────
interface DeleteModalProps {
  item: FundItem;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ item, onClose, onConfirm }: DeleteModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6 M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900 flex-1">ยืนยันการลบข้อมูล</h2>
        <CloseBtn onClick={onClose} />
      </div>

      <p className="text-sm text-gray-500 mb-4">คุณต้องการลบข้อมูลกองทุน/สาธารณูปโภคนี้ใช่หรือไม่?</p>

      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3 text-sm space-y-1.5">
        <p><span className="text-gray-400">ชื่อกองทุน : </span><span className="text-gray-700">{item.name}</span></p>
        <p><span className="text-gray-400">เปอร์เซ็นต์หักแบ่ง : </span><span className="text-gray-700">{item.percent}%</span></p>
      </div>

      <p className="text-xs text-red-500 mb-5">การลบข้อมูลนี้จะไม่สามารถกู้คืนได้อีก</p>

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors">
          ยกเลิก
        </button>
        <button onClick={onConfirm}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
          ลบข้อมูล
        </button>
      </div>
    </ModalBase>
  );
}