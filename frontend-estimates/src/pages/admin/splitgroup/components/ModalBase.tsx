import type { ReactNode } from "react";

interface ModalBaseProps {
  children: ReactNode;
  onClose: () => void;
}

export function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

export function ModalBase({ children, onClose }: ModalBaseProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="close overlay"
        onClick={onClose}
        className="absolute inset-0 -z-10 h-full w-full cursor-default"
      />
    </div>
  );
}