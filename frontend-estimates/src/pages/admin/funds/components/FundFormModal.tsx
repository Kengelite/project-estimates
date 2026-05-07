import { ModalBase, CloseBtn } from "./ModalBase";

function FundAvatar({ color }: { color: string }) {
  return (
    <div
      className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center"
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
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    </div>
  );
}

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
  title,
  iconColor,
  name,
  percent,
  onNameChange,
  onPercentChange,
  onClose,
  onSubmit,
}: FundFormModalProps) {
  const safePercent = Number.isNaN(Number(percent)) ? 0 : Number(percent);
  const example = 10000 * (safePercent / 100);

  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <FundAvatar color={iconColor} />
        <h2 className="flex-1 text-base font-bold text-gray-900">{title}</h2>
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
          <label className="mb-1 block text-xs font-medium text-gray-600">
            ชื่อกองทุน <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value.slice(0, 255))}
            placeholder="เช่น กองทุนการบริหารและพัฒนามหาวิทยาลัย"
            maxLength={255}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder-gray-300 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            เปอร์เซ็นต์หักแบ่ง (%) <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={String(percent ?? "")}
              inputMode="decimal"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  onPercentChange(0);
                  return;
                }

                if (!/^\d*\.?\d{0,2}$/.test(value)) return;

                const numericValue = Number(value);

                if (numericValue > 100) {
                  onPercentChange(100);
                  return;
                }

                onPercentChange(numericValue);
              }}
              placeholder="เช่น 5"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              %
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-6">
          <p className="mb-1 text-xs text-gray-400">ตัวอย่าง :</p>
          <p className="text-xs text-gray-600">
            หากรายได้ 10,000 บาท จะหักให้กองทุน{" "}
            <span className="font-semibold text-blue-600">
              {example.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              บาท
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          บันทึก
        </button>
      </div>
    </ModalBase>
  );
}