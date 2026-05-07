import { CloseBtn, ModalBase } from "./ModalBase";

export interface SemesterFormData {
  semester: string;
}

interface SemesterFormModalProps {
  title: string;
  formData: SemesterFormData;
  onChange: (field: keyof SemesterFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function SemesterAvatar() {
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
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
      </svg>
    </div>
  );
}

export default function SemesterFormModal({
  title,
  formData,
  onChange,
  onClose,
  onSubmit,
}: SemesterFormModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <SemesterAvatar />
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
            ภาคการศึกษา <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.semester}
            onChange={(e) => onChange("semester", e.target.value.slice(0, 100))}
            placeholder="เช่น 1 (ภาคต้น)"
            maxLength={100}
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