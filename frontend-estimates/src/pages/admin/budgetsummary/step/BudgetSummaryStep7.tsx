import  { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Mock Data ────────────────────────────────────────────────────────
const SIDEBAR_STEPS = [
  "เลือกหลักสูตร",
  "จัดสรรเป็นรายได้ส่วนกลาง",
  "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค",
  "หักบริหารส่วนกลางวิทยาลัย",
  "บริหารงานวิทยาลัย",
  "สรุปผลงบประมาณ",
];

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
              { label: "- อุดหนุน...", deduction: "- xxx,xxx" },
            ],
          },
          {
            id: "it-central",
            label: "หักบริหารส่วนกลางวิทยาลัย",
            deduction: "- 2,309,452",
            balance: "3,932,310",
            subItems: [
              { label: "- งบ...", deduction: "- xxx,xxx" },
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

// ── Main Component ────────────────────────────────────────────────────
export default function BudgetSummaryStep7() {
  const navigate = useNavigate();
  const currentStep = 6; // Step 7 (Index 6)

  // State สำหรับจัดการการกาง/พับ ข้อมูล (เก็บ id ของ section ที่ถูกเปิด)
  // ตั้งค่าเริ่มต้นให้เปิด cs-fund และ cs-central เหมือนในภาพ
  const [expandedItems, setExpandedItems] = useState<string[]>(["cs-fund", "cs-central"]);
  
  // State สำหรับ Modal ยืนยัน
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setShowConfirmModal(false);
    // TODO: ใส่โค้ดบันทึกข้อมูลลง Database / ยิง API ตรงนี้
    alert("บันทึกข้อมูลสำเร็จเรียบร้อย!");
    navigate("/annual-budget-management"); // สมมติว่ากลับไปหน้าแรก
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* ── Top Nav ── */}
      <div className="px-6 py-4">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>
        <h1 className="text-xl font-bold text-gray-900">สรุปงบประมาณประจำปี</h1>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 px-6 pb-24 max-w-[1400px] w-full mx-auto gap-8">
        
        {/* ── Sidebar Stepper ── */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200"></div>
              <div className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all" style={{ height: `100%` }}></div>
              {SIDEBAR_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;
                return (
                  <div key={idx} className="relative flex items-center gap-4 py-3.5">
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                      {isCompleted && <div className="w-4 h-4 rounded-full bg-blue-500" />}
                      {isActive && <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /></div>}
                      {isPending && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <span className={`text-sm font-medium ${isActive || isCompleted ? "text-blue-600" : "text-gray-400"}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
            <h2 className="text-[18px] font-bold text-gray-900">สรุปผลงบประมาณประจำปี ....</h2>

            {SUMMARY_DATA.map((section, sIdx) => (
              <div key={sIdx} className="space-y-6">
                <h3 className="text-[16px] font-bold text-gray-800">{section.degree}</h3>
                
                {section.departments.map((dept, dIdx) => (
                  <div key={dept.id} className={`${dIdx > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                    <h4 className="text-[15px] font-bold text-gray-800 mb-4">{dept.name}</h4>
                    
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 text-xs text-gray-400 mb-3 pb-2 border-b border-gray-100">
                      <div className="col-span-6">รายการ</div>
                      <div className="col-span-3 text-right">ยอดเงินที่ถูกหัก (บาท)</div>
                      <div className="col-span-3 text-right">คงเหลือ (บาท)</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {dept.items.map((item, iIdx) => {
                        const isExpanded = item.id ? expandedItems.includes(item.id) : false;
                        return (
                          <div key={iIdx} className="space-y-2">
                            <div className="grid grid-cols-12 gap-4 text-[14px] items-center">
                              <div className="col-span-6 flex items-center gap-2">
                                <span className="text-gray-800">{item.label}</span>
                                {item.subItems && (
                                  <button 
                                    onClick={() => toggleExpand(item.id!)}
                                    className={`text-[12px] underline transition-colors ${isExpanded ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'}`}
                                  >
                                    {isExpanded ? "ย่อข้อมูล" : "ดูเพิ่มเติม"}
                                  </button>
                                )}
                              </div>
                              <div className="col-span-3 text-right text-red-500">{item.deduction}</div>
                              <div className="col-span-3 text-right text-blue-500">{item.balance}</div>
                            </div>

                            {/* Sub Items (Expandable) */}
                            {isExpanded && item.subItems && (
                              <div className="pl-4 space-y-2 pb-2 animate-in fade-in duration-300">
                                {item.subItems.map((sub, subIdx) => (
                                  <div key={subIdx} className="grid grid-cols-12 gap-4 text-[13px] text-gray-600">
                                    <div className="col-span-6">{sub.label}</div>
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

                    {/* Summary for Department */}
                    <div className="mt-6 space-y-4">
                      {dept.summary.map((sum, sumIdx) => (
                        <div key={sumIdx} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-9 text-[15px] font-bold text-gray-800">{sum.label}</div>
                          <div className="col-span-3 text-right text-[16px] font-bold text-blue-600">{sum.balance}</div>
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

      {/* ── Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-8 flex justify-end gap-3 z-40">
        <button onClick={() => navigate("/annual-budget-summary/step6")} className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
          ย้อนกลับ
        </button>
        <button onClick={() => setShowConfirmModal(true)} className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
          บันทึก
        </button>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 transition-opacity" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">ยืนยันการบันทึก</h2>
              <p className="text-sm text-gray-500">คุณตรวจสอบข้อมูลสรุปงบประมาณครบถ้วน<br/>และต้องการบันทึกข้อมูลใช่หรือไม่?</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}