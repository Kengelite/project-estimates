
import { ModalBase, CloseBtn } from "./ModalBase";

function DeptAvatar({ color }: { color: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

export interface DeptFormData {
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  master: string;
}

interface CentralDeptFormModalProps {
  title: string;
  iconColor: string;
  formData: DeptFormData;
  onChange: (field: keyof DeptFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CentralDeptFormModal({
  title, iconColor, formData, onChange, onClose, onSubmit
}: CentralDeptFormModalProps) {
  
  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <DeptAvatar color={iconColor} />
        <h2 className="text-base font-bold text-gray-900 flex-1">{title}</h2>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="space-y-4">
        {/* ชื่อส่วนกลาง */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ชื่อส่วนกลางวิทยาลัย <span className="text-red-500">*</span>
          </label>
          <input 
            value={formData.name} 
            onChange={e => onChange("name", e.target.value)}
            placeholder="เช่น งบบุคลากร, กองทุนวิจัย..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors placeholder-gray-300" 
          />
        </div>

        {/* จัดกลุ่ม 3 คอลัมน์สำหรับเปอร์เซ็นต์ */}
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