import  { useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  setPageSize: (size: number) => void;
}

export default function Pagination({
  page, totalPages, pageSize, totalItems, setPage, setPageSize
}: PaginationProps) {
  const [goTo, setGoTo] = useState("");

  const range = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
      <span className="text-xs text-gray-400">Total {totalItems} items</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">‹</button>
        {range().map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">···</span>
          ) : (
            <button key={p} onClick={() => setPage(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-blue-500 text-white border border-blue-500" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {p}
            </button>
          )
        )}
        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">›</button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 bg-white outline-none cursor-pointer">
          {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
        <span>Go to</span>
        <input type="number" value={goTo} min={1} max={totalPages}
          onChange={e => setGoTo(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { setPage(Math.min(totalPages, Math.max(1, Number(goTo)))); setGoTo(""); } }}
          className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-center text-gray-700 bg-white outline-none focus:border-blue-400" />
        <span>Page</span>
      </div>
    </div>
  );
}