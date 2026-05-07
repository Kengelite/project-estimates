import React from "react";

interface AppHeaderProps {
  onMenuClick?: () => void;
  userName?: string;
}

export default function AppHeader({
  onMenuClick,
  userName = "Admin",
}: AppHeaderProps) {
  const firstLetter = userName?.charAt(0).toUpperCase() || "A";

  return (
    <header className="h-[92px] border-b border-gray-200 bg-white px-5 md:px-8">
      <div className="flex h-full items-center justify-between">
        {/* Left */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="16" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Account */}
          <button
            type="button"
            className="flex items-center gap-4 rounded-full bg-white pr-2 text-gray-800"
          >
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-200 text-[21px] font-medium text-white">
              {firstLetter}
            </div>

            <span className="text-[18px] font-medium text-gray-700">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}