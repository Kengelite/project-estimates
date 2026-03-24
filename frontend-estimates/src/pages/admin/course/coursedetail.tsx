import { useState } from "react";
import { useParams } from "react-router-dom";
const structureCards = [
  { label: "หมวดวิชาศึกษาทั่วไป", value: 30, highlight: false },
  { label: "หมวดวิชาเฉพาะ", value: 92, highlight: false },
  { label: "หมวดวิชาเลือกเสรี", value: 6, highlight: false },
  { label: "รวมหน่วยกิตตลอดหลักสูตร", value: 128, highlight: true },
];

const deductionRows = [
  { code: "LI", name: "ภาษาอังกฤษ", total: 495 },
  { code: "GE", name: "วิชาศึกษาทั่วไป", total: 495 },
  { code: "SC", name: "วิทยาศาสตร์", total: 495 },
];

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<"structure" | "students">(
    "structure",
  );
  const { id } = useParams();

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-sm p-5">
          {/* Breadcrumb + Edit */}
          <div className="flex items-start justify-between mb-4">
            <nav className="text-xs text-gray-400">
              <span className="hover:text-gray-600 cursor-pointer">
                หน้าแรก {id}
              </span>
              <span className="mx-1.5">›</span>
              <span className="hover:text-gray-600 cursor-pointer">
                จัดการหลักสูตร
              </span>
              <span className="mx-1.5">›</span>
              <span className="text-gray-700 font-medium">
                หลักสูตร วก.บ สาขาวิชาวิทยาการคอมพิวเตอร์
              </span>
            </nav>
            <button className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors flex-shrink-0 ml-4">
              <svg
                width="13"
                height="13"
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

          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-gray-900">
                  วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  B.SC.CS
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500 text-white">
                  ปกติ
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Bachelor of Science Program in Computer Science
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: "ระยะเวลาการศึกษา", value: "4 ปี" },
              { label: "จำนวนหน่วยกิต", value: "128 หน่วยกิต" },
              {
                label: "ค่าธรรมเนียมการศึกษา",
                value: "15,000 บาท/ภาคการศึกษา",
              },
              { label: "จำนวนนักศึกษาทั้งหมด", value: "350 คน" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-sm font-semibold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "structure", label: "โครงสร้างหลักสูตร" },
            { key: "students", label: "จำนวนนักศึกษา" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "structure" | "students")}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeTab === tab.key
                  ? "bg-white border-gray-300 text-gray-800 shadow-sm"
                  : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "structure" ? (
          <div className="space-y-5">
            {/* Structure card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                โครงสร้างและรายละเอียดของหลักสูตร
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {structureCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-xl p-4 text-center ${card.highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-100"}`}
                  >
                    <p className="text-xs text-gray-500 mb-3 leading-snug">
                      {card.label}
                    </p>
                    <p
                      className={`text-3xl font-bold mb-1 ${card.highlight ? "text-blue-600" : "text-blue-500"}`}
                    >
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-400">หน่วยกิต</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deduction summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                สรุปยอดเงินหักให้ภายนอกคณะ
              </h2>

              {/* University deduction */}
              <div className="bg-gray-100 rounded-xl px-5 py-4 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700">
                  ยอดเงินที่หักให้มหาวิทยาลัย
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-blue-600">
                    2,500
                  </span>
                  <span className="text-sm text-gray-500">บาท</span>
                </div>
              </div>

              {/* Outside-faculty breakdown */}
              <p className="text-xs text-gray-500 mb-3">
                ยอดเงินที่หักให้รายวิชานอกคณะ
              </p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["รหัสวิชา", "รายวิชา", "ยอดรวม"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-center text-xs font-semibold text-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deductionRows.map((row) => (
                      <tr
                        key={row.code}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-center text-gray-700">
                          {row.code}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-700">
                          {row.name}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-700">
                          ฿ {row.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-400 text-sm">
            ข้อมูลจำนวนนักศึกษา
          </div>
        )}
      </div>
    </div>
  );
}
