import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// 1. ปรับ Interface ให้ตรงกับข้อมูลใหม่
interface BudgetSummaryItem {
  id: number;
  year: string;
  semester: string;
}

// 2. ข้อมูลจำลองตามภาพ
const INITIAL_DATA: BudgetSummaryItem[] = [
  { id: 1, year: "2569", semester: "1 (ภาคต้น)" },
  { id: 2, year: "2568", semester: "-" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function BudgetSummaryManagement() {
  const [data, setData] = useState<BudgetSummaryItem[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");

  const filtered = data.filter((d) => d.year.includes(search));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: number) => {
    if (!confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) return;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const range = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        {/* Breadcrumb */}
   
        
          <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปข้อมูลงบประมาณ</span>
        </nav>


        {/* Header & Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            สรุปข้อมูลงบประมาณ
          </h1>
          <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
            + เพิ่มสรุปข้อมูล
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาปี..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="border border-gray-300 rounded-t-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300 text-gray-700">
                <th className="px-6 py-4 font-medium text-center w-24">
                  ลำดับ
                </th>
                <th className="px-6 py-4 font-medium text-center">ปี</th>
                <th className="px-6 py-4 font-medium text-center">เทอม</th>
                <th className="px-6 py-4 font-medium text-center w-32">
                  บันทึกไฟล์
                </th>
                <th className="px-6 py-4 font-medium text-center w-48">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-base">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-gray-800">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800">
                      {row.year}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800">
                      {row.semester}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-600 hover:text-gray-900 transition-colors inline-flex justify-center items-center">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button className="text-blue-500 hover:text-blue-700 transition-colors">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-end gap-4 mt-6">
          <span className="text-sm text-gray-600">
            Total {filtered.length > 0 ? filtered.length : 85} items
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            >
              ‹
            </button>
            {range().map((p, i) =>
              p === "..." ? (
                <span
                  key={`d${i}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                    page === p
                      ? "bg-blue-50 border border-blue-500 text-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1.5 bg-white outline-none cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Go to</span>
            <input
              type="number"
              value={goTo}
              min={1}
              max={totalPages}
              onChange={(e) => setGoTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(Math.min(totalPages, Math.max(1, Number(goTo))));
                  setGoTo("");
                }
              }}
              className="w-12 border border-gray-300 rounded px-2 py-1.5 text-center bg-white outline-none focus:border-blue-500"
            />
            <span>Page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
