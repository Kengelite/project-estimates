
import { useNavigate } from "react-router-dom";

const SIDEBAR_STEPS = [
  "เลือกหลักสูตร", "จัดสรรเป็นรายได้ส่วนกลาง", "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค", "หักบริหารส่วนกลางวิทยาลัย", "บริหารงานวิทยาลัย", "สรุปผลงบประมาณ",
];

export default function BudgetSummaryStep4() {
  const navigate = useNavigate();
  const currentStep = 3; // Step 4 (Index 3)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-6 py-4">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>
        <h1 className="text-xl font-bold text-gray-900">สรุปงบประมาณประจำปี</h1>
      </div>

      <div className="flex flex-1 px-6 pb-24 max-w-[1400px] w-full mx-auto gap-8">
        {/* ── Sidebar ── */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200"></div>
              <div className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all" style={{ height: `${(currentStep / (SIDEBAR_STEPS.length - 1)) * 100}%` }}></div>
              {SIDEBAR_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;
                return (
                  <div key={idx} className="relative flex items-center gap-4 py-3.5">
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                      {isCompleted && <div className="w-4 h-4 rounded-full bg-blue-500" />}
                      {isActive && (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /></div>
                      )}
                      {isPending && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <span className={`text-sm font-medium ${isActive || isCompleted ? "text-blue-600" : "text-gray-400"}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
            <h2 className="text-[17px] font-bold text-gray-900">รายละเอียดการหักเข้ากองทุน/สาธารณูปโภค</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-2 text-left font-semibold">หลักสูตร</th>
                    <th className="py-4 px-2 text-right font-semibold">คงเหลือล่าสุด</th>
                    <th className="py-4 px-2 text-right font-semibold">หักเข้ากองทุน</th>
                    <th className="py-4 px-2 text-right font-semibold">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={4} className="py-4 px-2 text-gray-500">ปริญญาตรี (ปกติ)</td></tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium">IT (ปกติ)</td>
                    <td className="py-4 px-2 text-right">7,343,250</td>
                    <td className="py-4 px-2 text-right text-red-500">-1,101,487</td>
                    <td className="py-4 px-2 text-right text-blue-600">6,241,763</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-2 font-medium">CS (ปกติ)</td>
                    <td className="py-4 px-2 text-right">8,119,865</td>
                    <td className="py-4 px-2 text-right text-red-500">-1,217,980</td>
                    <td className="py-4 px-2 text-right text-blue-600">6,901,885</td>
                  </tr>
                  <tr className="font-bold bg-gray-50/50">
                    <td className="py-4 px-2">รวม</td>
                    <td className="py-4 px-2 text-right">15,463,115</td>
                    <td className="py-4 px-2 text-right text-red-500">-2,319,467</td>
                    <td className="py-4 px-2 text-right text-blue-600">13,143,648</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-5">
                <span className="font-semibold text-gray-800">รวมเงินหักเข้ากองทุน</span>
                <span className="text-lg font-bold text-red-500">-2,319,467 บาท</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-5">
                <span className="font-semibold text-gray-800">คงเหลือทั้งหมด</span>
                <span className="text-lg font-bold text-blue-600">13,143,648 บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-8 flex justify-end gap-3 z-40">
        <button onClick={() => navigate("/annual-budget-summary/step3")} className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">ย้อนกลับ</button>
        <button onClick={() => navigate("/annual-budget-summary/step5")} className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">ถัดไป</button>
      </div>
    </div>
  );
}