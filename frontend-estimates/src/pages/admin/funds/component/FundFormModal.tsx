import { ModalBase, CloseBtn } from "./ModalBase";

// ── Fund Icon ─────────────────────────────────────────────────────────
function FundAvatar({ color }: { color: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    </div>
  );
}

// ── Form Modal (Edit & Add) ───────────────────────────────────────────
interface FundFormModalProps {
  title: string;
  iconColor: string;
  name: string;
  percent: number;
  onNameChange: (v: string) => void;
  onPercentChange: (v: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FundFormModal({
  title, iconColor, name, percent, onNameChange, onPercentChange, onClose, onSubmit
}: FundFormModalProps) {
  const example = 10000 * (percent / 100);
  
  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <FundAvatar color={iconColor} />
        <h2 className="text-base font-bold text-gray-900 flex-1">{title}</h2>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ชื่อกองทุน <span className="text-red-500">*</span>
          </label>
          <input value={name} onChange={e => onNameChange(e.target.value)}
            placeholder="เช่น กองทุนการบริหารและพัฒนามหาวิทยาลัย"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors placeholder-gray-300" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            เปอร์เซ็นต์หักแบ่ง (%) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input type="number" value={percent} min={0} max={100}
              onChange={e => onPercentChange(Number(e.target.value))}
              placeholder="เช่น 5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 mb-1">ตัวอย่าง :</p>
          <p className="text-sm text-gray-600">
            หากรายได้ 10,000 บาท จะหักให้กองทุน{" "}
            <span className="text-blue-600 font-semibold">{example.toLocaleString()} บาท</span>
          </p>
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