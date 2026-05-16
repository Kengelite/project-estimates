import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetDataSemester } from "../../../fetchapi/fetch_api_admin";

type SummaryType = "yearly" | "semester";

type SemesterItem = {
  id: number;
  name: string;
  status?: string;
};

function mapSemesterOption(item: any): SemesterItem {
  return {
    id: Number(item?.id ?? item?.semesterId ?? 0),
    name: String(item?.name ?? item?.semester ?? item?.semester_name ?? ""),
    status: String(item?.status ?? "1"),
  };
}

function getSemesterNo(value: string) {
  const text = String(value ?? "").trim();
  const matched = text.match(/\d+/);
  return matched?.[0] || text;
}

function getSemesterThaiName(value: string) {
  const text = String(value ?? "").toLowerCase().trim();

  if (text === "1" || text.includes("ต้น")) return "ภาคต้น";
  if (text === "2" || text.includes("ปลาย")) return "ภาคปลาย";
  if (text === "3" || text.includes("ฤดูร้อน") || text.includes("summer")) {
    return "ภาคฤดูร้อน";
  }

  const no = getSemesterNo(value);
  if (no === "1") return "ภาคต้น";
  if (no === "2") return "ภาคปลาย";
  if (no === "3") return "ภาคฤดูร้อน";

  return value || "-";
}

export default function BudgetSummarySelection() {
  const navigate = useNavigate();

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const semesterList = await GetDataSemester();

        const mappedSemesters = (semesterList || [])
          .map((item: any) => mapSemesterOption(item))
          .filter(
            (item: SemesterItem) =>
              item.id && String(item.status ?? "1") === "1",
          );

        setSemesters(mappedSemesters);

        if (mappedSemesters.length > 0) {
          setSelectedSemesterId(String(mappedSemesters[0].id));
        }
      } catch (error) {
        console.error("Error loading budget summary options:", error);
      }
    };

    loadInitialData();
  }, []);

  const selectedSemester = useMemo(() => {
    return semesters.find((item) => String(item.id) === selectedSemesterId);
  }, [semesters, selectedSemesterId]);

  const handleYearlyNext = () => {
    navigate("/annual-budget-summary/step1", {
      state: {
        summaryType: "yearly" as SummaryType,
        selectedSemesterId: null,
        selectedSemester: null,
        selectedSemesterName: null,
      },
    });
  };

  const openSemesterModal = () => {
    if (!selectedSemesterId && semesters.length > 0) {
      setSelectedSemesterId(String(semesters[0].id));
    }

    setShowSemesterModal(true);
  };

  const handleSemesterNext = () => {
    if (!selectedSemesterId) return;

    setShowSemesterModal(false);

    navigate("/annual-budget-summary/step1", {
      state: {
        summaryType: "semester" as SummaryType,
        selectedSemesterId: Number(selectedSemesterId),
        selectedSemester: getSemesterNo(selectedSemester?.name || ""),
        selectedSemesterName: getSemesterThaiName(selectedSemester?.name || ""),
      },
    });
  };

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
      desc: "ดูภาพรวมงบประมาณแบบรายปี วิเคราะห์การใช้จ่ายงบประมาณรวมทุกภาคการศึกษา",
      btn: "สรุปรายปี",
      onClick: handleYearlyNext,
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
      desc: "เลือกภาคการศึกษาเพื่อวิเคราะห์การใช้จ่ายงบประมาณเฉพาะภาคเรียนนั้น",
      btn: "สรุปแยกตามภาคการศึกษา",
      onClick: openSemesterModal,
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen relative">
      <div className="mx-auto space-y-5">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">สรุปงบประมาณประจำปี</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            สรุปงบประมาณประจำปี
          </h1>
          <p className="text-sm text-gray-400">
            เลือกรูปแบบการสรุปงบประมาณที่ต้องการ
          </p>
        </div>

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
                  type="button"
                  onClick={card.onClick}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {card.btn}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowSemesterModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[450px] p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">
                เลือกภาคการศึกษา
              </h2>

              <button
                type="button"
                onClick={() => setShowSemesterModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 mb-10">
              <div>
                <label className="block text-[15px] font-medium text-gray-800 mb-3">
                  ภาคการศึกษา :
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  {semesters.map((item) => {
                    const semesterNo = getSemesterNo(item.name);
                    const semesterName = getSemesterThaiName(item.name);

                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="semester"
                          value={item.id}
                          checked={selectedSemesterId === String(item.id)}
                          onChange={(e) => setSelectedSemesterId(e.target.value)}
                          className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">
                          {semesterNo} ({semesterName})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSemesterModal(false)}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors text-[15px]"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSemesterNext}
                disabled={!selectedSemesterId}
                className="flex-1 bg-[#4C6EF5] hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}