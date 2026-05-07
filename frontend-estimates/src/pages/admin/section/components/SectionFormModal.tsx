import { CloseBtn, ModalBase } from "./ModalBase";

export interface SectionFormData {
  sectionName: string;
}

interface SectionFormModalProps {
  title: string;
  formData: SectionFormData;
  onChange: (field: keyof SectionFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function SectionAvatar() {
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
        <path d="M3 7h18" />
        <path d="M6 3h12l3 4H3l3-4z" />
        <path d="M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
      </svg>
    </div>
  );
}

export default function SectionFormModal({
  title,
  formData,
  onChange,
  onClose,
  onSubmit,
}: SectionFormModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <SectionAvatar />
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
            ชื่อโครงการ <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.sectionName}
            onChange={(e) =>
              onChange("sectionName", e.target.value.slice(0, 100))
            }
            placeholder="เช่น โครงการปกติ"
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