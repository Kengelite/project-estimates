import { CloseBtn, ModalBase } from "./ModalBase";

export interface SplitGroupFormData {
  name: string;
  description: string;
  status: string;
}

interface SplitGroupFormModalProps {
  mode: "add" | "edit";
  formData: SplitGroupFormData;
  submitting?: boolean;
  onChange: (field: keyof SplitGroupFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SplitGroupFormModal({
  mode,
  formData,
  submitting = false,
  onChange,
  onClose,
  onSubmit,
}: SplitGroupFormModalProps) {
  const title = mode === "add" ? "เพิ่มกลุ่มสัดส่วน" : "แก้ไขกลุ่มสัดส่วน";

  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
            <circle cx="8" cy="7" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="16" cy="17" r="1" />
          </svg>
        </div>

        <h2 className="flex-1 text-base font-bold text-gray-900">{title}</h2>

        <CloseBtn onClick={onClose} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            ชื่อกลุ่มสัดส่วน <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={formData.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="เช่น ป.ตรี (ปกติ)"
            maxLength={255}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            รายละเอียด
          </label>

          <textarea
            value={formData.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="เช่น ปริญญาตรี (โครงการปกติ)"
            maxLength={255}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ยกเลิก
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </ModalBase>
  );
}