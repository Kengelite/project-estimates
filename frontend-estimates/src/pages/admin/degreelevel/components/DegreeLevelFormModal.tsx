import { CloseBtn, ModalBase } from "./ModalBase";

export interface DegreeLevelFormData {
  sectionId: string;
  name: string;
  shortName: string;
}

export interface DegreeLevelSectionOption {
  id: number;
  section_name: string;
}

interface DegreeLevelFormModalProps {
  title: string;
  formData: DegreeLevelFormData;
  sections: DegreeLevelSectionOption[];
  onChange: (field: keyof DegreeLevelFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function DegreeLevelAvatar() {
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
        <path d="M12 3 2 9l10 6 10-6-10-6Z" />
        <path d="M6 12v5c0 1.5 3 4 6 4s6-2.5 6-4v-5" />
      </svg>
    </div>
  );
}

function DropdownIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7.5L10 12.5L15 7.5" />
    </svg>
  );
}

export default function DegreeLevelFormModal({
  title,
  formData,
  sections,
  onChange,
  onClose,
  onSubmit,
}: DegreeLevelFormModalProps) {
  return (
    <ModalBase onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <DegreeLevelAvatar />

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
            โครงการระดับปริญญา <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={formData.sectionId}
              onChange={(e) => onChange("sectionId", e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
            >
              <option value="">เลือกโครงการระดับปริญญา</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.section_name}
                </option>
              ))}
            </select>

            <DropdownIcon />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            ชื่อระดับปริญญา <span className="text-red-500">*</span>
          </label>

          <input
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="เช่น ปริญญาตรี"
            maxLength={150}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder-gray-300 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            ชื่อย่อ <span className="text-red-500">*</span>
          </label>

          <input
            value={formData.shortName}
            onChange={(e) => onChange("shortName", e.target.value.slice(0, 10))}
            placeholder="เช่น ป.ตรี"
            maxLength={10}
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