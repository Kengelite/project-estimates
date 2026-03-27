import { useState } from "react";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate

export default function BudgetSummarySelection() {
  const navigate = useNavigate(); // ประกาศใช้งาน navigate

  // State สำหรับควบคุม Modal และค่าที่เลือก
  const [showModal, setShowModal] = useState(false);
  const [semester, setSemester] = useState("1"); // ค่าเริ่มต้นเป็น 1

  const cards = [
    {
      icon: (
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B8DD6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="7" y="14" width="2" height="2" />
          <rect x="11" y="14" width="2" height="2" />
          <rect x="15" y="14" width="2" height="2" />
        </svg>
      ),
      title: "สรุปงบประมาณประจำปี แบบรายปี",
      desc: "ดูภาพรวมงบประมาณแบบรายปี วิเคราะห์การใช้จ่ายงบประมาณในแต่ละปี",
      btn: "สรุปรายปี",
      onClick: () => {
        // ถ้ารายปีมีหน้าแยก ก็ใส่ path ที่นี่ครับ
        // navigate("/annual-budget-summary/yearly");
        console.log("ไปหน้า สรุปรายปี");
      },
    },
    {
      icon: (
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B8DD6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
      title: "สรุปงบประมาณประจำปี แบบแยกตามภาคการศึกษา",
      desc: "แยกตามภาคการศึกษา วิเคราะห์การใช้จ่ายงบประมาณในแต่ละภาคเรียน",
      btn: "สรุปแยกตามภาคการศึกษา",
      onClick: () => {
        setShowModal(true);
      },
    },
  ];

  const handleNext = () => {
    // ปิด Modal (เผื่อกดย้อนกลับมาจะได้ปิดอยู่)
    setShowModal(false);
    
    // เปลี่ยนหน้าไปที่ /annual-budget-summary/step1
    // และแนบ state (ข้อมูลภาคการศึกษาที่เลือก) ไปด้วย
    navigate("/annual-budget-summary/step1", { 
      state: { selectedSemester: semester } 
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen relative">
      <div className="mx-auto space-y-5">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            สรุปงบประมาณประจำปี
          </h1>
          <p className="text-sm text-gray-400">
            เลือกรูปแบบการสรุปงบประมาณที่ต้องการ
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="h-2 bg-blue-600 w-full" />
              <div className="flex-1 flex flex-col items-center text-center px-8 pt-10 pb-8 gap-6">
                <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <button 
                  onClick={card.onClick}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {card.btn}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal เลือกภาคการศึกษา */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[450px] p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">เลือกภาคการศึกษา</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-5 mb-10">
              <span className="text-[15px] font-medium text-gray-800">ภาคการศึกษา :</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="semester" 
                    value="1" 
                    checked={semester === "1"} 
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">1 (ภาคต้น)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="semester" 
                    value="2" 
                    checked={semester === "2"} 
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">2 (ภาคปลาย)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors text-[15px]">
                ยกเลิก
              </button>
              <button onClick={handleNext} className="flex-1 bg-[#4C6EF5] hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors text-[15px]">
                ถัดไป
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}