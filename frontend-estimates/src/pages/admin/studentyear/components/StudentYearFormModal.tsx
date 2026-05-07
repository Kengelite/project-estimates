import { CloseBtn, ModalBase } from "./ModalBase";

export interface StudentYearFormData {
  studentYear: string;
}

interface StudentYearFormModalProps {
  title: string;
  formData: StudentYearFormData;
  onChange: (field: keyof StudentYearFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function StudentYearAvatar() {
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
        <path d="M12 3v18" />
        <path d="M7 8l5-5 5 5" />
        <path d="M7 16l5 5 5-5" />
      </svg>
    </div>
  );
}

export default function StudentYearFormModal({
  title,
  formData,
  onChange,
  onClose,
  onSubmit,
}: StudentYearFormModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <StudentYearAvatar />
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
            ชั้นปี <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.studentYear}
            onChange={(e) =>
              onChange("studentYear", e.target.value.replace(/\D/g, "").slice(0, 1))
            }
            inputMode="numeric"
            maxLength={1}
            placeholder="เช่น 1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder-gray-300 focus:border-blue-400"
          />
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