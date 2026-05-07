import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface BudgetSummaryItem {
  id: number;
  year: string;
  semester: string;
}

const INITIAL_DATA: BudgetSummaryItem[] = [
  { id: 1, year: "2569", semester: "1 (ภาคต้น)" },
  { id: 2, year: "2568", semester: "-" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function BudgetSummaryManagement() {
  const navigate = useNavigate();

  const [data, setData] = useState<BudgetSummaryItem[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");

  const filtered = data.filter(
    (d) => d.year.includes(search) || d.semester.includes(search),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: number) => {
    if (!confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) return;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const handleView = (year: string) => {
    navigate("/annual-budget-management/view", {
      state: { selectedYear: year },
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto space-y-5">
        <nav className="mb-4 text-sm text-gray-400">
          <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-700">สรุปข้อมูลงบประมาณ</span>
        </nav>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">สรุปข้อมูลงบประมาณ</h1>

          <button className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            เพิ่มสรุปข้อมูล
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาปี / เทอม..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[20%]" />
                <col className="w-[28%]" />
                <col className="w-[16%]" />
                <col className="w-[26%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    ปี
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    เทอม
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    บันทึกไฟล์
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide text-gray-600">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                        {(page - 1) * pageSize + i + 1}
                      </td>

                      <td className="px-6 py-5 text-center font-medium text-gray-800">
                        {row.year}
                      </td>

                      <td className="px-6 py-5 text-center text-gray-700">
                        {row.semester}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <button className="text-slate-500 transition-colors hover:text-blue-500">
                          <ArrowDownTrayIcon className="mx-auto h-5 w-5" />
                        </button>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleView(row.year)}
                            className="text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button className="text-slate-500 transition-colors hover:text-slate-700">
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <span className="text-xs text-gray-400">
              ทั้งหมด {filtered.length} รายการ
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} / หน้า
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
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>

                {range().map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`d${i}`}
                      className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                    >
                      ···
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                        page === p
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
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}