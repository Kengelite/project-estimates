import React, { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────
type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

const BRANCH_COLOR: Record<
  Branch,
  { bg: string; text: string; border: string; avatar: string }
> = {
  CS: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    avatar: "bg-green-300",
  },
  ITII: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    avatar: "bg-yellow-300",
  },
  GIS: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-300",
    avatar: "bg-cyan-300",
  },
  AI: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-300",
    avatar: "bg-pink-300",
  },
  CY: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-300",
    avatar: "bg-orange-300",
  },
};

const BRANCH_NAME: Record<Branch, string> = {
  CS: "วิทยาการคอมพิวเตอร์",
  ITII: "เทคโนโลยีสารสนเทศและนวัตกรรมอัจฉริยะ",
  GIS: "ภูมิสารสนเทศศาสตร์",
  AI: "ปัญญาประดิษฐ์",
  CY: "ความมั่นคงปลอดภัยไซเบอร์",
};

interface ProgramRow {
  pricePerPerson: number;
  enrolled: number;
}
interface BranchData {
  branch: Branch;
  normal?: ProgramRow;
  special?: ProgramRow;
}

const initialData: BranchData[] = [
  {
    branch: "CS",
    normal: { pricePerPerson: 495, enrolled: 80 },
    special: { pricePerPerson: 1500, enrolled: 60 },
  },
  { branch: "ITII", normal: { pricePerPerson: 495, enrolled: 80 } },
  { branch: "GIS", normal: { pricePerPerson: 495, enrolled: 80 } },
];

// ── Icons ────────────────────────────────────────────────────────────
const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6 M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const SaveIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ── Shared Input Class ───────────────────────────────────────────────
const inputClass =
  "w-full bg-gray-100 border border-transparent focus:border-gray-300 focus:bg-white rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition-colors";

export default function EditSubjectDetail() {
  const [data, setData] = useState<BranchData[]>(initialData);

  // ฟังก์ชันอัปเดตข้อมูลในฟอร์ม
  const handleUpdate = (
    branch: Branch,
    type: "normal" | "special",
    field: keyof ProgramRow,
    value: number,
  ) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.branch === branch && item[type]) {
          return { ...item, [type]: { ...item[type]!, [field]: value } };
        }
        return item;
      }),
    );
  };

  // เพิ่มโครงการพิเศษ
  const handleAddSpecial = (branch: Branch) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.branch === branch) {
          return { ...item, special: { pricePerPerson: 0, enrolled: 0 } };
        }
        return item;
      }),
    );
  };

  // ลบโครงการพิเศษ
  const handleRemoveSpecial = (branch: Branch) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.branch === branch) {
          const { special, ...rest } = item;
          return rest;
        }
        return item;
      }),
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลรายวิชา</h1>

        {/* ── Section 1: ข้อมูลพื้นฐาน ── */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            ข้อมูลพื้นฐาน <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                รหัสวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value="LI 102 003"
                readOnly
                className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ชื่อวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value="ภาษาอังกฤษ 3"
                readOnly
                className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400">
                <option>2569</option>
                <option>2568</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ภาคการศึกษา <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400">
                <option>1 (ภาคต้น)</option>
                <option>2 (ภาคปลาย)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ชั้นปี <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400">
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              <SaveIcon /> บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>

        {/* ── Section 2: จัดการสาขาและโครงการ ── */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-6">
            จัดการสาขาและโครงการ
          </h2>

          <div className="space-y-6">
            {data.map((item) => {
              const c = BRANCH_COLOR[item.branch];
              return (
                <div
                  key={item.branch}
                  className="border border-gray-300 rounded-xl p-5 relative"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${c.avatar} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                      >
                        {item.branch}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {BRANCH_NAME[item.branch]}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <button className="hover:text-gray-700 transition-colors">
                        <EditIcon />
                      </button>
                      <button className="hover:text-red-500 transition-colors text-red-400">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* โครงการปกติ */}
                  {item.normal && (
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-800 mb-3">
                        โครงการปกติ
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            ราคาต่อคน (บาท)
                          </label>
                          <input
                            type="number"
                            value={item.normal.pricePerPerson}
                            onChange={(e) =>
                              handleUpdate(
                                item.branch,
                                "normal",
                                "pricePerPerson",
                                Number(e.target.value),
                              )
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            จำนวนคนที่ลงทะเบียน
                          </label>
                          <input
                            type="number"
                            value={item.normal.enrolled}
                            onChange={(e) =>
                              handleUpdate(
                                item.branch,
                                "normal",
                                "enrolled",
                                Number(e.target.value),
                              )
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        ราคารวม :{" "}
                        <span className="text-blue-600 font-medium ml-1">
                          ฿{" "}
                          {(
                            item.normal.pricePerPerson * item.normal.enrolled
                          ).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Divider for Special Program */}
                  {item.special && (
                    <div className="border-t border-gray-100 my-4" />
                  )}

                  {/* โครงการพิเศษ */}
                  {item.special ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-gray-800">
                          โครงการพิเศษ
                        </p>
                        <button
                          onClick={() => handleRemoveSpecial(item.branch)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon /> ลบโครงการ
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            ราคาต่อคน (บาท)
                          </label>
                          <input
                            type="number"
                            value={item.special.pricePerPerson}
                            onChange={(e) =>
                              handleUpdate(
                                item.branch,
                                "special",
                                "pricePerPerson",
                                Number(e.target.value),
                              )
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            จำนวนคนที่ลงทะเบียน
                          </label>
                          <input
                            type="number"
                            value={item.special.enrolled}
                            onChange={(e) =>
                              handleUpdate(
                                item.branch,
                                "special",
                                "enrolled",
                                Number(e.target.value),
                              )
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        ราคารวม :{" "}
                        <span className="text-blue-600 font-medium ml-1">
                          ฿{" "}
                          {(
                            item.special.pricePerPerson * item.special.enrolled
                          ).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddSpecial(item.branch)}
                      className="w-full mt-2 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      + เพิ่มโครงการพิเศษ
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
