import { useState } from "react";
import type { Dept } from "@/types/central";

import Pagination from "./components/Pagination";
import CentralDeptFormModal from "./components/CentralDeptFormModal";
import type { DeptFormData } from "./components/CentralDeptFormModal";
import DeleteDeptModal from "./components/DeleteDeptModal";

// ── Mock Data ────────────────────────────────────────────────────────
const INITIAL_DATA: Dept[] = [
  { id: 1,  name: "งบบุคลากร",        bachelorNormal: "15%", bachelorSpecial: "15%", master: "0",  active: true  },
  { id: 2,  name: "กองทุนวิจัย",       bachelorNormal: "10%", bachelorSpecial: "10%", master: "5%", active: true  },
  { id: 3,  name: "กองทุนส่งเสริมฯ",   bachelorNormal: "12%", bachelorSpecial: "12%", master: "5%", active: true  },
  { id: 4,  name: "ค่าสาธารณูปโภค",     bachelorNormal: "8%",  bachelorSpecial: "8%",  master: "3%", active: false },
  { id: 5,  name: "กองทุนพัฒนา",      bachelorNormal: "5%",  bachelorSpecial: "5%",  master: "2%", active: true  },
  { id: 6,  name: "ค่าบำรุงรักษา",      bachelorNormal: "3%",  bachelorSpecial: "3%",  master: "1%", active: true  },
];

const INITIAL_FORM_STATE: DeptFormData = {
  name: "",
  bachelorNormal: "0%",
  bachelorSpecial: "0%",
  master: "0%"
};

// ── Toggle ───────────────────────────────────────────────────────────
function Toggle({ active, onChange }: { active: boolean; onChange: () => void; }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${active ? "bg-green-400" : "bg-gray-300"}`} >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-7" : "translate-x-1"}`} />
      {active && <span className="absolute left-1.5 text-[9px] font-bold text-white">เปิด</span>}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function CentralDeptManagement() {
  const [data, setData] = useState<Dept[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Dept | null>(null);
  const [deleteItem, setDeleteItem] = useState<Dept | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<DeptFormData>(INITIAL_FORM_STATE);

  const filtered = data.filter((d) => d.name.includes(search));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleActive = (id: number) =>
    setData((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));

  const handleFormChange = (field: keyof DeptFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add Handlers
  const openAdd = () => {
    setFormData(INITIAL_FORM_STATE);
    setShowAdd(true);
  };
  const saveAdd = () => {
    if(!formData.name.trim()) return; // เช็คชื่อว่าง
    const newItem: Dept = { id: Date.now(), ...formData, active: true };
    setData(prev => [...prev, newItem]);
    setShowAdd(false);
  };

  // Edit Handlers
  const openEdit = (item: Dept) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      bachelorNormal: item.bachelorNormal,
      bachelorSpecial: item.bachelorSpecial,
      master: item.master
    });
  };
  const saveEdit = () => {
    if (!editItem || !formData.name.trim()) return;
    setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d));
    setEditItem(null);
  };

  // Delete Handlers
  const confirmDelete = () => {
    if (!deleteItem) return;
    setData(prev => prev.filter(d => d.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">จัดการบริหารส่วนกลางวิทยาลัย</span>
        </nav>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">บริหารส่วนกลางวิทยาลัย</h1>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + เพิ่มส่วนกลาง
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="ค้นหาชื่อส่วนกลางวิทยาลัย..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors placeholder-gray-400" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {["ลำดับ", "ชื่อส่วนกลางวิทยาลัย", "ป.ตรี (ปกติ)", "ป.ตรี (พิเศษ)", "บัณฑิต", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap ${h === "ชื่อส่วนกลางวิทยาลัย" ? "text-left" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-center text-gray-500">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-4 text-gray-800 font-medium">{row.name}</td>
                      <td className="px-5 py-4 text-center text-gray-700">{row.bachelorNormal}</td>
                      <td className="px-5 py-4 text-center text-gray-700">{row.bachelorSpecial}</td>
                      <td className="px-5 py-4 text-center text-gray-700">{row.master}</td>
                      <td className="px-5 py-4 text-center">
                        <Toggle active={row.active} onChange={() => toggleActive(row.id)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => openEdit(row)} className="text-gray-400 hover:text-gray-700 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteItem(row)} className="text-red-400 hover:text-red-600 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6 M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length} setPage={setPage} setPageSize={setPageSize} />
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <CentralDeptFormModal title="เพิ่มส่วนกลางวิทยาลัย" iconColor="#3b82f6"
          formData={formData} onChange={handleFormChange}
          onClose={() => setShowAdd(false)} onSubmit={saveAdd} />
      )}
      
      {editItem && (
        <CentralDeptFormModal title="แก้ไขส่วนกลางวิทยาลัย" iconColor="#6366f1"
          formData={formData} onChange={handleFormChange}
          onClose={() => setEditItem(null)} onSubmit={saveEdit} />
      )}
      
      {deleteItem && (
        <DeleteDeptModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}