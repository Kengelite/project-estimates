import { ModalBase, CloseBtn } from "./ModalBase";

function DeptAvatar({ color }: { color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color + "22" }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
  graduate: string;
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
  title,
  iconColor,
  formData,
  onChange,
  onClose,
  onSubmit,
}: CentralDeptFormModalProps) {
  const safeNormal = Number(formData.bachelorNormal || 0);
  const safeSpecial = Number(formData.bachelorSpecial || 0);
  const safeGraduate = Number(formData.graduate || 0);

  const exampleNormal = 10000 * (safeNormal / 100);
  const exampleSpecial = 10000 * (safeSpecial / 100);
  const exampleGraduate = 10000 * (safeGraduate / 100);

  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <DeptAvatar color={iconColor} />
        <h2 className="text-base font-bold text-gray-900 flex-1">{title}</h2>
        <CloseBtn onClick={onClose} />
      </div>

      <div
        className="space-y-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ชื่อส่วนกลางวิทยาลัย <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="เช่น งบบุคลากร, กองทุนวิจัย..."
            maxLength={150}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors placeholder-gray-300"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              ตรี (ปกติ) %
            </label>
            <input
              type="text"
              value={formData.bachelorNormal}
              inputMode="decimal"
              onChange={(e) => onChange("bachelorNormal", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              ตรี (พิเศษ) %
            </label>
            <input
              type="text"
              value={formData.bachelorSpecial}
              inputMode="decimal"
              onChange={(e) => onChange("bachelorSpecial", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1 leading-tight">
              บัณฑิต %
            </label>
            <input
              type="text"
              value={formData.graduate}
              inputMode="decimal"
              onChange={(e) => onChange("graduate", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-800 outline-none focus:border-blue-400 transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="mb-2 text-sm font-medium leading-6 text-gray-800 break-words">
            ตัวอย่างการคำนวณ (รายได้ 10,000 บาท):
          </p>

          <ul className="space-y-1 text-sm leading-6 text-gray-600">
            <li>
              • ตรี (ปกติ) :{" "}
              <span className="font-semibold text-blue-600">
                {exampleNormal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                บาท
              </span>
            </li>

            <li>
              • ตรี (พิเศษ) :{" "}
              <span className="font-semibold text-blue-600">
                {exampleSpecial.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                บาท
              </span>
            </li>

            <li>
              • บัณฑิต :{" "}
              <span className="font-semibold text-blue-600">
                {exampleGraduate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                บาท
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          ยกเลิก
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          บันทึก
        </button>
      </div>
    </ModalBase>
  );
}