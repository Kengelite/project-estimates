import { useState } from "react";
import { CloseBtn, ModalBase } from "./ModalBase";

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
}

export interface UserFormData {
  fname: string;
  lname: string;
  email: string;
  pwd: string;
  confirmPwd: string;
  roleId: string;
}

interface UserFormModalProps {
  mode: "add" | "edit";
  formData: UserFormData;
  roles: RoleItem[];
  submitting?: boolean;
  onChange: (field: keyof UserFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a20.29 20.29 0 0 1 5.06-6.94" />
        <path d="M9.9 4.24A10.78 10.78 0 0 1 12 4c5 0 9.27 3.11 11 8a20.28 20.28 0 0 1-3.23 4.62" />
        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({
  label,
  required,
  value,
  placeholder,
  visible,
  onToggleVisible,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
        />

        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-blue-600"
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </div>
    </div>
  );
}

export default function UserFormModal({
  mode,
  formData,
  roles,
  submitting = false,
  onChange,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const title = mode === "add" ? "เพิ่มผู้ใช้งาน" : "แก้ไขผู้ใช้งาน";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const shouldShowConfirmPassword = formData.pwd.length > 0;

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
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h2 className="flex-1 text-base font-bold text-gray-900">{title}</h2>

        <CloseBtn onClick={onClose} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              ชื่อ <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.fname}
              onChange={(event) => onChange("fname", event.target.value)}
              placeholder="เช่น สมชาย"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              นามสกุล <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.lname}
              onChange={(event) => onChange("lname", event.target.value)}
              placeholder="เช่น ใจดี"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            อีเมล <span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="เช่น admin@example.com"
            maxLength={150}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            บทบาท <span className="text-red-500">*</span>
          </label>

          <select
            value={formData.roleId}
            onChange={(event) => onChange("roleId", event.target.value)}
            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400"
          >
            <option value="">เลือกบทบาท</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.description || role.name}
              </option>
            ))}
          </select>
        </div>

        <PasswordInput
          label="รหัสผ่าน"
          required={mode === "add"}
          value={formData.pwd}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((prev) => !prev)}
          onChange={(value) => {
            onChange("pwd", value);

            if (!value) {
              onChange("confirmPwd", "");
              setShowConfirmPassword(false);
            }
          }}
          placeholder={
            mode === "add"
              ? "อย่างน้อย 8 ตัว มี A-Z และอักขระพิเศษ"
              : "เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน"
          }
        />

        <p className="-mt-2 text-xs leading-5 text-gray-400">
          รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร มีตัวอักษรภาษาอังกฤษตัวใหญ่
          และอักขระพิเศษอย่างน้อย 1 ตัว
        </p>

        {shouldShowConfirmPassword && (
          <PasswordInput
            label="ยืนยันรหัสผ่าน"
            required={mode === "add" || formData.pwd.length > 0}
            value={formData.confirmPwd}
            visible={showConfirmPassword}
            onToggleVisible={() => setShowConfirmPassword((prev) => !prev)}
            onChange={(value) => onChange("confirmPwd", value)}
            placeholder="ยืนยันรหัสผ่าน"
          />
        )}
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