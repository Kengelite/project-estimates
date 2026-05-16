interface PaginationProps {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  goTo: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onGoToChange: (value: string) => void;
  onGoToSubmit: () => void;
}

export default function Pagination({
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  goTo,
  onPageChange,
  onPageSizeChange,
  onGoToChange,
  onGoToSubmit,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  const getPageRange = (): (number | "...")[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    for (
      let page = Math.max(2, currentPage - 1);
      page <= Math.min(safeTotalPages - 1, currentPage + 1);
      page += 1
    ) {
      pages.push(page);
    }

    if (currentPage < safeTotalPages - 2) pages.push("...");

    pages.push(safeTotalPages);

    return pages;
  };

  const handlePrev = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(safeTotalPages, currentPage + 1));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
      <span className="text-xs text-gray-400">
        ทั้งหมด {totalItems} รายการ
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 outline-none"
          >
            {pageSizeOptions.map((size) => (
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
            max={safeTotalPages}
            onChange={(event) => onGoToChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onGoToSubmit();
              }
            }}
            className="w-14 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-gray-700 outline-none focus:border-blue-400"
          />

          <span>หน้า</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ‹
          </button>

          {getPageRange().map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span
                key={`dots-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                ···
              </span>
            ) : (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === pageNumber
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage === safeTotalPages || safeTotalPages === 0}
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}