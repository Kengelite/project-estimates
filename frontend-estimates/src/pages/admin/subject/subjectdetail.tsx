type Branch = "CS" | "ITII" | "GIS" | "AI" | "CY";

const BRANCH_COLOR: Record<
  Branch,
  { bg: string; text: string; border: string; avatar: string }
> = {
  CS: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    avatar: "bg-green-400",
  },
  ITII: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    avatar: "bg-yellow-400",
  },
  GIS: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-300",
    avatar: "bg-cyan-400",
  },
  AI: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-300",
    avatar: "bg-pink-400",
  },
  CY: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-300",
    avatar: "bg-orange-400",
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

const data: BranchData[] = [
  {
    branch: "CS",
    normal: { pricePerPerson: 495, enrolled: 80 },
    special: { pricePerPerson: 1500, enrolled: 60 },
  },
  { branch: "ITII", normal: { pricePerPerson: 495, enrolled: 80 } },
  { branch: "GIS", normal: { pricePerPerson: 495, enrolled: 80 } },
  {
    branch: "AI",
    normal: { pricePerPerson: 990, enrolled: 80 },
    special: { pricePerPerson: 1500, enrolled: 60 },
  },
  { branch: "CY", normal: { pricePerPerson: 495, enrolled: 80 } },
];

function BranchBadge({ branch }: { branch: Branch }) {
  const c = BRANCH_COLOR[branch];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {branch}
    </span>
  );
}

function ProgramSection({ label, row }: { label: string; row: ProgramRow }) {
  const total = row.pricePerPerson * row.enrolled;
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">ราคาต่อคน</p>
          <p className="text-sm font-semibold text-gray-800">
            ฿ {row.pricePerPerson.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">จำนวนคนที่ลงทะเบียน</p>
          <p className="text-sm font-semibold text-gray-800">
            {row.enrolled} คน
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">ราคารวม</p>
          <p className="text-sm font-semibold text-gray-800">
            ฿ {total.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function BranchCard({ item }: { item: BranchData }) {
  const c = BRANCH_COLOR[item.branch];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${c.avatar} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {item.branch}
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          {BRANCH_NAME[item.branch]}
        </h2>
      </div>
      {item.normal && <ProgramSection label="โครงการปกติ" row={item.normal} />}
      {item.special && (
        <ProgramSection label="โครงการพิเศษ" row={item.special} />
      )}
    </div>
  );
}

export default function SubjectDetail() {
  const branches: Branch[] = ["CS", "ITII", "GIS", "AI", "CY"];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          {/* Breadcrumb + edit */}
          <div className="flex items-start justify-between mb-4">
            <nav className="text-xs text-gray-400">
              <span className="hover:text-gray-600 cursor-pointer">
                หน้าแรก
              </span>
              <span className="mx-1.5">›</span>
              <span className="hover:text-gray-600 cursor-pointer">
                จัดการรายวิชานอกคณะ
              </span>
              <span className="mx-1.5">›</span>
              <span className="text-gray-700 font-medium">LI 102 003</span>
            </nav>
            <button className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-4">
              <svg
                width="12"
                height="12"
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
              แก้ไขข้อมูล
            </button>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                LI 102 003 - ภาษาอังกฤษ 3
              </h1>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {branches.map((b) => (
                  <BranchBadge key={b} branch={b} />
                ))}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: "ปีการศึกษา", value: "2569" },
              { label: "ภาคการศึกษา", value: "1 (ภาคต้น)" },
              { label: "ชั้นปี", value: "2" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                <p className="text-sm font-semibold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Branch cards */}
        {data.map((item) => (
          <BranchCard key={item.branch} item={item} />
        ))}
      </div>
    </div>
  );
}
