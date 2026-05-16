import React from "react";

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  setPage,
  setPageSize,
}: PaginationProps) {
  const [goTo, setGoTo] = React.useState("");

  const range = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (page > 3) pages.push("...");

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  const handleGoToPage = () => {
    const next = Number(goTo);
    if (Number.isNaN(next)) return;
    const clamped = Math.min(Math.max(next, 1), Math.max(totalPages, 1));
    setPage(clamped);
    setGoTo("");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
      <span className="text-xs text-gray-400">ทั้งหมด {totalItems} รายการ</span>

      <div className="ml-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white  px-3 py-1.5 text-xs text-gray-600 outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / หน้า
              </option>
            ))}
          </select>

          <span>ไปที่หน้า</span>

          <input
            type="number"
            value={goTo}
            min={1}
            max={totalPages}
            onChange={(e) => setGoTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const nextPage = Math.min(
                  totalPages,
                  Math.max(1, Number(goTo || 1)),
                );
                setPage(nextPage);
                setGoTo("");
              }
            }}
            className="w-14 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-gray-700 outline-none focus:border-blue-400"
          />
          <span>หน้า</span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ‹
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Number(p) - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>

              {range().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${page === p
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={safePage === totalPages || totalPages === 0}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}