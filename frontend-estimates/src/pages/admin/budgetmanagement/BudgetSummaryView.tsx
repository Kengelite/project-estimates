import  { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Mock Data ────────────────────────────────────────────────────────
const SUMMARY_DATA = [
  {
    degree: "ปริญญาตรี (ภาคปกติ)",
    departments: [
      {
        id: "cs",
        name: "สาขาวิทยาการคอมพิวเตอร์",
        items: [
          { label: "จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย", deduction: "- 1,750,000", balance: "8,750,000" },
          { label: "จ่ายให้เจ้าของรายวิชานอกคณะ", deduction: "- 630,135", balance: "8,119,865" },
          {
            id: "cs-fund",
            label: "หักเข้ากองทุน/สาธารณูปโภค",
            deduction: "- 1,217,980",
            balance: "6,901,885",
            subItems: [
              { label: "- อุดหนุนการบริหารและพัฒนามหาวิทยาลัย", deduction: "- 243,596" },
              { label: "- กองทุนพัฒนาอาจารย์/บุคลากรและการวิจัย ระดับมหาวิทยาลัย", deduction: "- 81,199" },
              { label: "- กองทุนพัฒนาอาจารย์/บุคลากรและการวิจัย ระดับคณะ/หน่วยงาน", deduction: "- 81,199" },
              { label: "- ทุนสำรองของคณะ/หน่วยงาน", deduction: "- 405,993" },
              { label: "- สมทบจ่ายค่าสาธารณูปโภคและพัฒนาระบบกายภาพ", deduction: "- 405,993" },
            ],
          },
          {
            id: "cs-central",
            label: "หักบริหารส่วนกลางวิทยาลัย",
            deduction: "- 2,553,698",
            balance: "4,348,188",
            subItems: [
              { label: "- งบบุคลากร", deduction: "- 1,035,283" },
              { label: "- กองทุนวิจัย", deduction: "- 690,189" },
              { label: "- กองทุนส่งเสริมฯ", deduction: "- 828,226" },
            ],
          },
        ],
        summary: [
          { label: "รวมเงินบริหารงานวิทยาลัย", balance: "2,826,322" },
          { label: "รวมเงินบริหารหลักสูตร", balance: "1,521,900" },
        ],
      },
      {
        id: "it",
        name: "สาขาเทคโนโลยีสารสนเทศ",
        items: [
          { label: "จัดสรรเป็นรายได้ส่วนกลางมหาวิทยาลัย", deduction: "- 1,582,500", balance: "7,912,500" },
          { label: "จ่ายให้เจ้าของรายวิชานอกคณะ", deduction: "- 569,250", balance: "7,343,250" },
          {
            id: "it-fund",
            label: "หักเข้ากองทุน/สาธารณูปโภค",
            deduction: "- 1,101,488",
            balance: "6,241,763",
            subItems: [
              { label: "- อุดหนุนการบริหารและพัฒนามหาวิทยาลัย", deduction: "- 220,297" },
            ],
          },
          {
            id: "it-central",
            label: "หักบริหารส่วนกลางวิทยาลัย",
            deduction: "- 2,309,452",
            balance: "3,932,310",
            subItems: [
              { label: "- งบบุคลากร", deduction: "- 936,264" },
            ],
          },
        ],
        summary: [
          { label: "รวมเงินบริหารงานวิทยาลัย", balance: "2,556,002" },
          { label: "รวมเงินบริหารหลักสูตร", balance: "1,376,400" },
        ],
      },
    ],
  },
];

export default function BudgetSummaryView() {
  const navigate = useNavigate();

  // State สำหรับจัดการการกาง/พับ ข้อมูล (ค่าเริ่มต้นให้เปิดเหมือนในภาพ)
  const [expandedItems, setExpandedItems] = useState<string[]>(["cs-fund", "cs-central"]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto space-y-5 max-w-[1200px]">
        {/* ── Breadcrumb ── */}
        <nav className="text-sm text-gray-400 mb-4 flex items-center">
          <span onClick={() => navigate("/")} className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span onClick={() => navigate("/budget-summary")} className="hover:text-gray-600 cursor-pointer">สรุปข้อมูลงบประมาณ</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">ปี 2568</span>
        </nav>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            สรุปข้อมูลงบประมาณ ปี 2568
          </h1>
          <div className="flex gap-3">
             {/* ปุ่มย้อนกลับ */}
            <button 
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ย้อนกลับ
            </button>
            {/* ปุ่มดาวน์โหลด PDF / Print */}
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              ดาวน์โหลด PDF
            </button>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-10">
          
          {SUMMARY_DATA.map((section, sIdx) => (
            <div key={sIdx} className="space-y-8">
              {/* หัวข้อระดับปริญญา */}
              <h2 className="text-[17px] font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                {section.degree}
              </h2>
              
              {section.departments.map((dept, dIdx) => (
                <div key={dept.id} className={`${dIdx > 0 ? 'pt-8 border-t border-gray-200' : 'pt-2'}`}>
                  {/* ชื่อสาขา */}
                  <h3 className="text-[15px] font-bold text-gray-800 mb-5">{dept.name}</h3>
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400 mb-3 pb-2 border-b border-gray-100 px-2">
                    <div className="col-span-6">รายการ</div>
                    <div className="col-span-3 text-right">ยอดเงินที่ถูกหัก (บาท)</div>
                    <div className="col-span-3 text-right">คงเหลือ (บาท)</div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-4 px-2">
                    {dept.items.map((item, iIdx) => {
                      const isExpanded = item.id ? expandedItems.includes(item.id) : false;
                      return (
                        <div key={iIdx} className="space-y-2">
                          {/* Main Row */}
                          <div className="grid grid-cols-12 gap-4 text-[13px] items-center">
                            <div className="col-span-6 flex items-center gap-2">
                              <span className="text-gray-700">{item.label}</span>
                              {item.subItems && (
                                <button 
                                  onClick={() => toggleExpand(item.id!)}
                                  className={`text-[12px] underline transition-colors ${isExpanded ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'}`}
                                >
                                  {isExpanded ? "ย่อข้อมูล" : "ดูเพิ่มเติม"}
                                </button>
                              )}
                            </div>
                            <div className="col-span-3 text-right text-red-500 font-medium">{item.deduction}</div>
                            <div className="col-span-3 text-right text-blue-500 font-medium">{item.balance}</div>
                          </div>

                          {/* Sub Items Row (Expandable) */}
                          {isExpanded && item.subItems && (
                            <div className="pl-6 space-y-2 pb-2 pt-1 animate-in fade-in duration-300">
                              {item.subItems.map((sub, subIdx) => (
                                <div key={subIdx} className="grid grid-cols-12 gap-4 text-[12px] text-gray-500">
                                  <div className="col-span-6 leading-relaxed">{sub.label}</div>
                                  <div className="col-span-3 text-right text-red-400">{sub.deduction}</div>
                                  <div className="col-span-3"></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Box for Department */}
                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-4 px-2">
                    {dept.summary.map((sum, sumIdx) => (
                      <div key={sumIdx} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-9 text-[14px] font-bold text-gray-800">{sum.label}</div>
                        <div className="col-span-3 text-right text-[15px] font-bold text-blue-600">{sum.balance}</div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}