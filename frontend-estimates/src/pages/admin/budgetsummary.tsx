export default function BudgetSummarySelection() {
  const cards = [
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6B8DD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="2" height="2"/><rect x="11" y="14" width="2" height="2"/>
          <rect x="15" y="14" width="2" height="2"/>
        </svg>
      ),
      title: "สรุปงบประมาณประจำปี แบบรายปี",
      desc: "ดูภาพรวมงบประมาณแบบรายปี วิเคราะห์การใช้จ่ายงบประมาณในแต่ละปี",
      btn: "สรุปรายปี",
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6B8DD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
      ),
      title: "สรุปงบประมาณประจำปี แบบแยกตามภาคการศึกษา",
      desc: "แยกตามภาคการศึกษา วิเคราะห์การใช้จ่ายงบประมาณในแต่ละภาคเรียน",
      btn: "สรุปแยกตามภาคการศึกษา",
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-3">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-1">สรุปงบประมาณประจำปี</h1>
        <p className="text-sm text-gray-400 mb-6">เลือกรูปแบบการสรุปงบประมาณที่ต้องการ</p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Blue top bar */}
              <div className="h-2 bg-blue-600 w-full" />

              {/* Body */}
              <div className="flex-1 flex flex-col items-center text-center px-8 pt-10 pb-8 gap-6">
                {/* Icon box */}
                <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center">
                  {card.icon}
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">{card.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                </div>

                {/* Button */}
                <button className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {card.btn}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}