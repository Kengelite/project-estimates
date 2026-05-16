import { ModalBase, CloseBtn } from "./ModalBase";

type WorkFormData = {
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  graduate: string;
};

function WorkAvatar({ color }: { color: string }) {
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
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

function toNumber(value: string) {
  const number = Number(String(value || "0").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function WorkFormModal({
  title,
  iconColor,
  formData,
  onChange,
  onClose,
  onSubmit,
}: WorkFormModalProps) {
  const safeNormal = toNumber(formData.bachelorNormal);
  const safeSpecial = toNumber(formData.bachelorSpecial);
  const safeGraduate = toNumber(formData.graduate);

  const exampleNormal = 10000 * (safeNormal / 100);
  const exampleSpecial = 10000 * (safeSpecial / 100);
  const exampleGraduate = 10000 * (safeGraduate / 100);

  return (
    <ModalBase onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <WorkAvatar color={iconColor} />
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
            ชื่องานวิทยาลัย <span className="text-red-500">*</span>
          </label>

          <input
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="เช่น บริหารงานวิทยาลัย, งานวิชาการ..."
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
              • ป.ตรี (ปกติ) :{" "}
              <span className="font-semibold text-blue-600">
                {formatMoney(exampleNormal)} บาท
              </span>
            </li>

            <li>
              • ป.ตรี (พิเศษ) :{" "}
              <span className="font-semibold text-blue-600">
                {formatMoney(exampleSpecial)} บาท
              </span>
            </li>

            <li>
              • บัณฑิต :{" "}
              <span className="font-semibold text-blue-600">
                {formatMoney(exampleGraduate)} บาท
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          ยกเลิก
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          บันทึก
        </button>
      </div>
    </ModalBase>
  );
}