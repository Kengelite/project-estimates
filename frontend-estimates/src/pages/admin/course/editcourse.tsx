import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────
interface SubjectGroup {
  id: number;
  name: string;
  credits: number;
}
interface OutsideSubject {
  id: number;
  code: string;
  name: string;
  amount: number;
}
interface StudentYear {
  id: number;
  year: number;
  count: number;
}

// ── Icons ────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg
    width="14"
    height="14"
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
    width="14"
    height="14"
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
    width="14"
    height="14"
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
const PlusIcon = () => (
  <svg
    width="13"
    height="13"
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
);

// ── Shared input styles ──────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white";
const numInputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white text-right";

// ── Section Card ─────────────────────────────────────────────────────
function SectionCard({
  title,
  action,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function EditCourse() {
  // Basic info
  const [level, setLevel] = useState("ปริญญาตรี (ปกติ)");
  const [code, setCode] = useState("B.SC.CS");
  const [nameTh, setNameTh] = useState(
    "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
  );
  const [nameEn, setNameEn] = useState(
    "Bachelor of Science Program in Computer Science",
  );
  const [duration, setDuration] = useState(4);
  const [fee, setFee] = useState(15000);

  // Subject groups
  const [groups, setGroups] = useState<SubjectGroup[]>([
    { id: 1, name: "หมวดวิชาศึกษาทั่วไป", credits: 30 },
    { id: 2, name: "หมวดวิชาเฉพาะ", credits: 92 },
    { id: 3, name: "หมวดวิชาเลือกเสรี", credits: 6 },
  ]);
  const totalCredits = groups.reduce((s, g) => s + g.credits, 0);

  // University deduction
  const [uniDeduct, setUniDeduct] = useState(2500);

  // Outside subjects
  const [outside, setOutside] = useState<OutsideSubject[]>([
    { id: 1, code: "LI", name: "ภาษาอังกฤษ", amount: 495 },
    { id: 2, code: "GE", name: "วิชาศึกษาทั่วไป", amount: 495 },
    { id: 3, code: "SC", name: "วิทยาศาสตร์", amount: 495 },
  ]);

  // Student data
  const [students, setStudents] = useState<StudentYear[]>([
    { id: 1, year: 2563, count: 3 },
    { id: 2, year: 2564, count: 19 },
    { id: 3, year: 2565, count: 59 },
    { id: 4, year: 2566, count: 78 },
    { id: 5, year: 2567, count: 97 },
    { id: 6, year: 2568, count: 94 },
  ]);
  const totalStudents = students.reduce((s, r) => s + r.count, 0);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลหลักสูตร</h1>

        {/* ── Basic Info ── */}
        <SectionCard
          title={
            <>
              <span className="text-red-500">*</span> ข้อมูลพื้นฐาน
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ระดับปริญญา <span className="text-red-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={inputCls}
              >
                <option>ปริญญาตรี (ปกติ)</option>
                <option>ปริญญาตรี (พิเศษ)</option>
                <option>ปริญญาโท (ปกติ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                รหัสหลักสูตร <span className="text-red-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              ชื่อหลักสูตร (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <input
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              ชื่อหลักสูตร (ภาษาอังกฤษ) <span className="text-red-500">*</span>
            </label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ระยะเวลาการศึกษา <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ค่าธรรมเนียมการศึกษา (บาท/ภาคการศึกษา){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              <SaveIcon /> บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </SectionCard>

        {/* ── Subject Groups ── */}
        <SectionCard
          title="โครงสร้างและรายละเอียดหลักสูตร"
          action={
            <button
              onClick={() =>
                setGroups((p) => [
                  ...p,
                  { id: Date.now(), name: "หมวดวิชาใหม่", credits: 0 },
                ])
              }
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusIcon /> + เพิ่มหมวดวิชา
            </button>
          }
        >
          <div>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_120px_60px] gap-3 pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">
                หมวดวิชา
              </span>
              <span className="text-xs font-medium text-gray-500 text-right">
                หน่วยกิต
              </span>
              <span />
            </div>

            {/* List */}
            {groups.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-[1fr_120px_60px] gap-3 items-center py-3 border-b border-gray-100 last:border-0"
              >
                <input
                  value={g.name}
                  onChange={(e) =>
                    setGroups((p) =>
                      p.map((x) =>
                        x.id === g.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                  className={inputCls}
                />
                <input
                  type="number"
                  value={g.credits}
                  onChange={(e) =>
                    setGroups((p) =>
                      p.map((x) =>
                        x.id === g.id
                          ? { ...x, credits: Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                  className={numInputCls}
                />
                <div className="flex items-center gap-1 justify-end">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                    <EditIcon />
                  </button>
                  <button
                    onClick={() =>
                      setGroups((p) => p.filter((x) => x.id !== g.id))
                    }
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between pt-3 mt-1">
              <span className="text-sm text-gray-700 font-medium">
                หน่วยกิตรวมตลอดหลักสูตร
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-blue-600">
                  {totalCredits}
                </span>
                <span className="text-sm text-gray-500">หน่วยกิต</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── University Deduction ── */}
        <SectionCard title="ยอดเงินหักรายได้ส่วนกลาง มข.">
          <div>
            <div className="grid grid-cols-[1fr_180px_40px] gap-3 pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500" />
              <span className="text-xs font-medium text-gray-500 text-right">
                จำนวน (บาท)
              </span>
              <span />
            </div>
            <div className="grid grid-cols-[1fr_180px_40px] gap-3 items-center py-3">
              <span className="text-sm text-gray-700">
                ยอดเงินที่หักให้มหาวิทยาลัย
              </span>
              <input
                type="number"
                value={uniDeduct}
                onChange={(e) => setUniDeduct(Number(e.target.value))}
                className={numInputCls}
              />
              <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 justify-self-end">
                <EditIcon />
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Outside Faculty Subjects ── */}
        <SectionCard
          title="ยอดเงินที่หักให้รายวิชานอกคณะ"
          action={
            <button
              onClick={() =>
                setOutside((p) => [
                  ...p,
                  { id: Date.now(), code: "", name: "", amount: 0 },
                ])
              }
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusIcon /> + เพิ่มรหัสวิชา
            </button>
          }
        >
          <div>
            <div className="grid grid-cols-[80px_1fr_140px_60px] gap-3 pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">
                รหัสวิชา
              </span>
              <span className="text-xs font-medium text-gray-500">รายวิชา</span>
              <span className="text-xs font-medium text-gray-500 text-right">
                จำนวน (บาท)
              </span>
              <span />
            </div>

            {/* List */}
            {outside.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[80px_1fr_140px_60px] gap-3 items-center py-3 border-b border-gray-100 last:border-0"
              >
                <input
                  value={row.code}
                  onChange={(e) =>
                    setOutside((p) =>
                      p.map((x) =>
                        x.id === row.id ? { ...x, code: e.target.value } : x,
                      ),
                    )
                  }
                  className={inputCls}
                />
                <input
                  value={row.name}
                  onChange={(e) =>
                    setOutside((p) =>
                      p.map((x) =>
                        x.id === row.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                  className={inputCls}
                />
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    setOutside((p) =>
                      p.map((x) =>
                        x.id === row.id
                          ? { ...x, amount: Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                  className={numInputCls}
                />
                <div className="flex items-center gap-1 justify-end">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                    <EditIcon />
                  </button>
                  <button
                    onClick={() =>
                      setOutside((p) => p.filter((x) => x.id !== row.id))
                    }
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Student Data ── */}
        <SectionCard
          title="ข้อมูลนักศึกษา"
          action={
            <button
              onClick={() =>
                setStudents((p) => [
                  ...p,
                  {
                    id: Date.now(),
                    year: new Date().getFullYear() + 543,
                    count: 0,
                  },
                ])
              }
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusIcon /> + เพิ่มปีการศึกษา
            </button>
          }
        >
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {["ลำดับ", "ปีการศึกษา", "จำนวนนักศึกษา", "จัดการ"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((row, i) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      <input
                        type="number"
                        value={row.year}
                        onChange={(e) =>
                          setStudents((p) =>
                            p.map((x) =>
                              x.id === row.id
                                ? { ...x, year: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                        className={`${numInputCls} text-center w-24 mx-auto`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      <input
                        type="number"
                        value={row.count}
                        onChange={(e) =>
                          setStudents((p) =>
                            p.map((x) =>
                              x.id === row.id
                                ? { ...x, count: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                        className={`${numInputCls} text-center w-24 mx-auto`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                          <EditIcon />
                        </button>
                        <button
                          onClick={() =>
                            setStudents((p) => p.filter((x) => x.id !== row.id))
                          }
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total students */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-700 font-medium">
              จำนวนนักศึกษาทั้งหมด
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-600">
                {totalStudents}
              </span>
              <span className="text-sm text-gray-500">คน</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
