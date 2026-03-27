import { useState } from "react";
import type { FundItem } from "@/types/funds";

import FundFormModal from "./component/FundFormModal";
import DeleteModal from "./component/DeleteModal";

const INITIAL_DATA: FundItem[] = [
  { id: 1,  name: "อุดหนุนการบริหารและพัฒนามหาวิทยาลัย",                        percent: 3,  active: true  },
  { id: 2,  name: "กองทุนพัฒนาอาจารย์/บุคลากรและการวิจัย ระดับมหาวิทยาลัย",     percent: 1,  active: true  },
  { id: 3,  name: "กองทุนพัฒนาอาจารย์/บุคลากรและการวิจัย ระดับคณะ/หน่วยงาน",   percent: 1,  active: true  },
  { id: 4,  name: "ทุนสำรองของคณะ/หน่วยงาน",                                     percent: 5,  active: true  },
  { id: 5,  name: "สมทบจ่ายค่าสาธารณูปโภคและพัฒนาระบบกายภาพ",                   percent: 5,  active: true  },
  { id: 6,  name: "กองทุนสวัสดิการนักศึกษา",                                      percent: 2,  active: true  },
  { id: 7,  name: "กองทุนวิจัยและนวัตกรรม",                                       percent: 4,  active: false },
  { id: 8,  name: "ค่าบำรุงรักษาอุปกรณ์และสิ่งอำนวยความสะดวก",                  percent: 3,  active: true  },
  { id: 9,  name: "กองทุนพัฒนาคุณภาพการศึกษา",                                    percent: 2,  active: true  },
  { id: 10, name: "ทุนฉุกเฉินและสวัสดิการบุคลากร",                                percent: 1,  active: true  },
  { id: 11, name: "กองทุนส่งเสริมกิจกรรมนักศึกษา",                                percent: 2,  active: false },
  { id: 12, name: "ค่าพัฒนาระบบสารสนเทศมหาวิทยาลัย",                              percent: 1,  active: true  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Toggle ────────────────────────────────────────────────────────────
function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${active ? "bg-green-400" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-7" : "translate-x-1"}`} />
      {active && <span className="absolute left-1.5 text-[9px] font-bold text-white">เปิด</span>}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function FundManagement() {
  const [data, setData] = useState<FundItem[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goTo, setGoTo] = useState("");

  // Modal state
  const [editItem, setEditItem] = useState<FundItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FundItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPercent, setFormPercent] = useState(0);

  const filtered = data.filter(d => d.name.includes(search));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleActive = (id: number) =>
    setData(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));

  // Edit
  const openEdit = (item: FundItem) => {
    setEditItem(item); setFormName(item.name); setFormPercent(item.percent);
  };
  const saveEdit = () => {
    if (!editItem) return;
    setData(prev => prev.map(d => d.id === editItem.id ? { ...d, name: formName, percent: formPercent } : d));
    setEditItem(null);
  };

  // Add
  const openAdd = () => { setFormName(""); setFormPercent(0); setShowAdd(true); };
  const saveAdd = () => {
    setData(prev => [...prev, { id: Date.now(), name: formName, percent: formPercent, active: true }]);
    setShowAdd(false);
  };

  // Delete
  const confirmDelete = () => {
    if (!deleteItem) return;
    setData(prev => prev.filter(d => d.id !== deleteItem.id));
    setDeleteItem(null);
  };

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        <nav className="text-sm text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">จัดการกองทุน/สาธารณูปโภค</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">กองทุน/สาธารณูปโภค</h1>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            + เพิ่มกองทุน
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="ค้นหาชื่อกองทุน/สาธารณูปโภค..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors placeholder-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {["ลำดับ", "ชื่อกองทุน", "เปอร์เซ็นต์หักแบ่ง", "สถานะ", "จัดการ"].map(h => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap ${h === "ชื่อกองทุน" ? "text-left" : "text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">ไม่พบข้อมูล</td></tr>
                ) : paginated.map((row, i) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-500 w-16">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-5 py-4 text-gray-800">{row.name}</td>
                    <td className="px-5 py-4 text-center text-gray-700 w-40">{row.percent}%</td>
                    <td className="px-5 py-4 text-center w-32">
                      <Toggle active={row.active} onChange={() => toggleActive(row.id)} />
                    </td>
                    <td className="px-5 py-4 w-24">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEdit(row)} className="text-gray-400 hover:text-gray-700 transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteItem(row)} className="text-red-400 hover:text-red-600 transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6 M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            {/* Pagination UI */}
            <span className="text-xs text-gray-400">Total {filtered.length} items</span>
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
        </div>
      </div>

      {/* Modals */}
      {editItem && (
        <FundFormModal title="แก้ไขข้อมูลกองทุน" iconColor="#6366f1"
          name={formName} percent={formPercent}
          onNameChange={setFormName} onPercentChange={setFormPercent}
          onClose={() => setEditItem(null)} onSubmit={saveEdit} />
      )}
      {showAdd && (
        <FundFormModal title="เพิ่มกองทุน" iconColor="#3b82f6"
          name={formName} percent={formPercent}
          onNameChange={setFormName} onPercentChange={setFormPercent}
          onClose={() => setShowAdd(false)} onSubmit={saveAdd} />
      )}
      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}