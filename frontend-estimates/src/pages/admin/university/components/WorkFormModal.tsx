
import { ModalBase, CloseBtn } from "./ModalBase";
import type { WorkFormData } from "@/types/work";

function WorkAvatar({ color }: { color: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    </div>
  );
}

interface WorkFormModalProps {
  title: string;
  iconColor: string;
  formData: WorkFormData;
  onChange: (field: keyof WorkFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function WorkFormModal({
  title, iconColor, formData, onChange, onClose, onSubmit
}: WorkFormModalProps) {
  
  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <WorkAvatar color={iconColor} />
        <h2 className="text-base font-bold text-gray-900 flex-1">{title}</h2>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="space-y-4">
        {/* ชื่องาน */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ชื่องานวิทยาลัย <span className="text-red-500">*</span>
          </label>
          <input 
            value={formData.name} 
            onChange={e => onChange("name", e.target.value)}
            placeholder="เช่น บริหารงานวิทยาลัย, งานวิชาการ..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors placeholder-gray-300" 
          />
        </div>

        {/* เปอร์เซ็นต์ */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              ป.ตรี (ปกติ) %
            </label>
            <input 
              type="number" value={formData.bachelorNormal.replace('%', '')} 
              onChange={e => onChange("bachelorNormal", e.target.value ? `${e.target.value}%` : "0%")}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              ป.ตรี (พิเศษ) %
            </label>
            <input 
              type="number" value={formData.bachelorSpecial.replace('%', '')} 
              onChange={e => onChange("bachelorSpecial", e.target.value ? `${e.target.value}%` : "0%")}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              บัณฑิต %
            </label>
            <input 
              type="number" value={formData.master.replace('%', '')} 
              onChange={e => onChange("master", e.target.value ? `${e.target.value}%` : "0%")}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors" 
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors">
          ยกเลิก
        </button>
        <button onClick={onSubmit}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
          บันทึก
        </button>
      </div>
    </ModalBase>
  );
}