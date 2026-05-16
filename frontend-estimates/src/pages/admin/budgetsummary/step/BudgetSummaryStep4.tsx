import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { GetDataFund } from "../../../../fetchapi/fetch_api_admin";

const SIDEBAR_STEPS = [
  "เลือกหลักสูตร",
  "จัดสรรเป็นรายได้ส่วนกลาง",
  "จ่ายให้เจ้าของรายวิชานอกคณะ",
  "หักเข้ากองทุน/สาธารณูปโภค",
  "หักบริหารส่วนกลางวิทยาลัย",
  "บริหารงานวิทยาลัย",
  "สรุปผลงบประมาณ",
];

type SummaryType = "yearly" | "semester";

type FundItem = {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  pct_split?: number | string;
  pctSplit?: number | string;
  PctSplit?: number | string;
  percent?: number | string;
  Percent?: number | string;
  status?: string | number;
  Status?: string | number;
  deletedAt?: string | null;
  deleted_at?: string | null;
  DeletedAt?: string | null;
};

type Step3Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  latestRemainingAmount?: number;
  outsideSubjectPaymentAmount?: number;
  remainingAmount: number;
};

type Step4Deduct = {
  fundId: string;
  fundName: string;
  label: string;
  percent: number;
  amount: number;
};

type CalculatedStep4Course = {
  courseId: string;
  courseName: string;
  shortName: string;
  sectionTitle: string;
  latestRemainingAmount: number;
  fundDeductions: Step4Deduct[];
  totalFundDeductAmount: number;
  remainingAmount: number;
};

type SectionGroup = {
  sectionTitle: string;
  rows: CalculatedStep4Course[];
  totalLatestRemainingAmount: number;
  totalFundColumns: number[];
  totalFundDeductAmount: number;
  totalRemainingAmount: number;
};

type LocationState = {
  summaryType?: SummaryType;
  selectedSemesterId?: number | null;
  selectedSemester?: string | null;
  selectedSemesterName?: string | null;
  selectedCourses?: any[];

  step2?: any;

  step3?: {
    courses?: Step3Course[];
    totalOutsideSubjectPaymentAmount?: number;
    totalRemainingAmount?: number;
  };
};

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatMinusMoney(value: number) {
  const amount = Number(value || 0);

  if (amount <= 0) return "0";

  return `-${formatMoney(amount)}`;
}

function pickArrayFromResponse(response: any): FundItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.funds)) return response.funds;
  if (Array.isArray(response?.Funds)) return response.Funds;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.funds)) return response.data.funds;

  return [];
}

function isActiveFund(fund: FundItem) {
  const deletedAt = fund.deletedAt ?? fund.deleted_at ?? fund.DeletedAt ?? null;
  if (deletedAt) return false;

  const status = String(fund.status ?? fund.Status ?? "1");

  return status !== "0" && status !== "false";
}

function getFundName(fund: FundItem) {
  return String(fund.name ?? fund.Name ?? "-");
}

function getFundPercent(fund: FundItem) {
  return toNumber(
    fund.pct_split ??
    fund.pctSplit ??
    fund.PctSplit ??
    fund.percent ??
    fund.Percent,
  );
}

function getFundId(fund: FundItem, index: number) {
  return String(fund.id ?? fund.ID ?? `fund-${index + 1}`);
}

function normalizeFunds(funds: FundItem[]) {
  return (funds || [])
    .filter(isActiveFund)
    .slice(0, 5)
    .map((fund, index) => ({
      id: getFundId(fund, index),
      name: getFundName(fund),
      percent: getFundPercent(fund),
      label: `ส่วนกลาง ${index + 1}`,
    }));
}

function calculateStep4Courses(
  courses: Step3Course[],
  funds: ReturnType<typeof normalizeFunds>,
): CalculatedStep4Course[] {
  return (courses || []).map((course) => {
    const latestRemainingAmount = toNumber(course.remainingAmount);

    const fundDeductions: Step4Deduct[] = funds.map((fund) => {
      const amount = (latestRemainingAmount * fund.percent) / 100;

      return {
        fundId: fund.id,
        fundName: fund.name,
        label: fund.label,
        percent: fund.percent,
        amount,
      };
    });

    const totalFundDeductAmount = fundDeductions.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const remainingAmount = latestRemainingAmount - totalFundDeductAmount;

    return {
      courseId: course.courseId,
      courseName: course.courseName,
      shortName: course.shortName,
      sectionTitle: course.sectionTitle || "-",
      latestRemainingAmount,
      fundDeductions,
      totalFundDeductAmount,
      remainingAmount,
    };
  });
}

function groupCalculatedCourses(
  rows: CalculatedStep4Course[],
  fundLength: number,
): SectionGroup[] {
  const map = new Map<string, CalculatedStep4Course[]>();

  rows.forEach((row) => {
    const key = row.sectionTitle || "-";
    const old = map.get(key) || [];
    map.set(key, [...old, row]);
  });

  return Array.from(map.entries()).map(([sectionTitle, sectionRows]) => {
    const totalLatestRemainingAmount = sectionRows.reduce(
      (sum, row) => sum + row.latestRemainingAmount,
      0,
    );

    const totalFundColumns = Array.from({ length: fundLength }).map(
      (_, fundIndex) => {
        return sectionRows.reduce((sum, row) => {
          return sum + toNumber(row.fundDeductions[fundIndex]?.amount);
        }, 0);
      },
    );

    const totalFundDeductAmount = sectionRows.reduce(
      (sum, row) => sum + row.totalFundDeductAmount,
      0,
    );

    const totalRemainingAmount = sectionRows.reduce(
      (sum, row) => sum + row.remainingAmount,
      0,
    );

    return {
      sectionTitle,
      rows: sectionRows,
      totalLatestRemainingAmount,
      totalFundColumns,
      totalFundDeductAmount,
      totalRemainingAmount,
    };
  });
}

export default function BudgetSummaryStep4() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const currentStep = 3;

  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState<FundItem[]>([]);

  const summaryType: SummaryType = locationState.summaryType || "yearly";

  const step3Courses = useMemo(() => {
    return locationState.step3?.courses || [];
  }, [locationState.step3?.courses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await GetDataFund();
        const fundList = pickArrayFromResponse(response);

        console.log("STEP4 GetDataFund response:", response);
        console.log("STEP4 normalized fundList:", fundList);

        setFunds(fundList);
      } catch (error: any) {
        console.error("Error loading funds for step4:", error);

        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error?.message || "ไม่สามารถดึงข้อมูลกองทุน/สาธารณูปโภคได้",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedFunds = useMemo(() => {
    return normalizeFunds(funds);
  }, [funds]);

  const calculatedCourses = useMemo(() => {
    return calculateStep4Courses(step3Courses, normalizedFunds);
  }, [step3Courses, normalizedFunds]);

  const groups = useMemo(() => {
    return groupCalculatedCourses(calculatedCourses, normalizedFunds.length);
  }, [calculatedCourses, normalizedFunds.length]);

  const totalFundDeductAmount = useMemo(() => {
    return calculatedCourses.reduce(
      (sum, row) => sum + row.totalFundDeductAmount,
      0,
    );
  }, [calculatedCourses]);

  const totalRemainingAmount = useMemo(() => {
    return calculatedCourses.reduce((sum, row) => sum + row.remainingAmount, 0);
  }, [calculatedCourses]);

  const handleBack = () => {
    navigate("/annual-budget-summary/step3", {
      state: locationState,
    });
  };

  const handleNext = () => {
    navigate("/annual-budget-summary/step5", {
      state: {
        ...locationState,
        summaryType,
        step4: {
          funds: normalizedFunds,
          courses: calculatedCourses,
          totalFundDeductAmount,
          totalRemainingAmount,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="px-6 py-4">
        <nav className="text-sm text-gray-400 mb-4">
          <span className="hover:text-gray-600 cursor-pointer">หน้าแรก</span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">
            สรุปงบประมาณประจำปี
          </span>
        </nav>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900">
            สรุปงบประมาณประจำปี
          </h1>

          <p className="text-sm text-gray-400">
            {summaryType === "semester"
              ? `แบบแยกภาคการศึกษา / ${locationState.selectedSemesterName || "-"
              }`
              : "แบบรายปี"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-8 px-6 pb-8">
        <div className="w-[280px]">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200" />

              <div
                className="absolute left-[11px] top-4 w-[2px] bg-blue-500 transition-all"
                style={{
                  height: `${(currentStep / (SIDEBAR_STEPS.length - 1)) * 100
                    }%`,
                }}
              />

              {SIDEBAR_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <div
                    key={step}
                    className="relative flex items-center gap-4 py-3.5"
                  >
                    <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                      {isCompleted && (
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                      )}

                      {isActive && (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        </div>
                      )}

                      {isPending && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>

                    <span
                      className={`text-sm font-medium ${isActive || isCompleted
                        ? "text-blue-600"
                        : "text-gray-400"
                        }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full">
          <div className="w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                รายละเอียดการหักเข้ากองทุน/สาธารณูปโภค
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                กำลังโหลดข้อมูล...
              </div>
            ) : calculatedCourses.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลจากขั้นตอนก่อนหน้า
              </div>
            ) : normalizedFunds.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                ยังไม่มีข้อมูลกองทุน/สาธารณูปโภค
              </div>
            ) : (
              <div className="p-7 space-y-8 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-full">
                  {normalizedFunds.map((fund, index) => (
                    <div
                      key={fund.id}
                      className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-400">
                            ส่วนกลาง {index + 1}
                          </div>

                          <div className="mt-1 text-sm font-semibold leading-5 text-gray-900 break-words">
                            {fund.name}
                          </div>
                        </div>

                        <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-base font-bold text-blue-600">
                          {formatMoney(fund.percent)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {groups.map((group) => (
                  <div key={group.sectionTitle} className="space-y-3 min-w-0">
                    <div className="text-sm font-semibold text-gray-500">
                      {group.sectionTitle}
                    </div>

                    <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
                      <table className="min-w-[1230px] w-full table-fixed text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600">
                            <th className="w-[230px] px-3 py-4 text-left font-semibold whitespace-nowrap">
                              หลักสูตร
                            </th>

                            <th className="w-[150px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือล่าสุด
                            </th>

                            {normalizedFunds.map((fund, index) => (
                              <th
                                key={fund.id}
                                className="w-[135px] px-3 py-4 text-right font-semibold whitespace-nowrap"
                              >
                                <div>ส่วนกลาง {index + 1}</div>
                                <div className="text-xs font-medium text-gray-400">
                                  ({formatMoney(fund.percent)}%)
                                </div>
                              </th>
                            ))}

                            <th className="w-[145px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              รวมทั้งหมด
                            </th>

                            <th className="w-[145px] px-3 py-4 text-right font-semibold whitespace-nowrap">
                              คงเหลือ
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.rows.map((row) => (
                            <tr
                              key={row.courseId}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="w-[230px] max-w-[230px] px-3 py-4 text-gray-800 align-top">
                                <div className="font-semibold text-gray-900">
                                  {row.shortName || "-"}
                                </div>

                                <div className="mt-1 text-xs font-normal leading-5 text-gray-400 whitespace-normal break-words">
                                  {row.courseName || "-"}
                                </div>
                              </td>

                              <td className="px-3 py-4 text-right text-gray-800 font-semibold whitespace-nowrap">
                                {formatMoney(row.latestRemainingAmount)}
                              </td>

                              {row.fundDeductions.map((deduct) => (
                                <td
                                  key={deduct.fundId}
                                  className="px-3 py-4 text-right text-red-500 font-semibold whitespace-nowrap"
                                >
                                  {formatMinusMoney(deduct.amount)}
                                </td>
                              ))}

                              <td className="px-3 py-4 text-right text-red-500 font-bold whitespace-nowrap">
                                {formatMinusMoney(row.totalFundDeductAmount)}
                              </td>

                              <td className="px-3 py-4 text-right text-blue-600 font-bold whitespace-nowrap">
                                {formatMoney(row.remainingAmount)}
                              </td>
                            </tr>
                          ))}

                          <tr className="border-t border-gray-200">
                            <td className="px-3 py-4 font-bold text-gray-900 whitespace-nowrap">
                              รวม
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                              {formatMoney(group.totalLatestRemainingAmount)}
                            </td>

                            {group.totalFundColumns.map((amount, index) => (
                              <td
                                key={`total-fund-${index}`}
                                className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap"
                              >
                                {formatMinusMoney(amount)}
                              </td>
                            ))}

                            <td className="px-3 py-4 text-right font-bold text-red-500 whitespace-nowrap">
                              {formatMinusMoney(group.totalFundDeductAmount)}
                            </td>

                            <td className="px-3 py-4 text-right font-bold text-blue-600 whitespace-nowrap">
                              {formatMoney(group.totalRemainingAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="space-y-4 pt-2">
                  <div className="rounded-2xl bg-gray-50 px-6 py-5 flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      รวมเงินหักเข้ากองทุน/สาธารณูปโภค
                    </span>

                    <span className="text-xl font-bold text-red-500 whitespace-nowrap">
                      {formatMinusMoney(totalFundDeductAmount)} บาท
                    </span>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-6 py-5 flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      คงเหลือทั้งหมด
                    </span>

                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      {formatMoney(totalRemainingAmount)} บาท
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 pb-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              ถัดไป
              <svg
                width="17"
                height="17"
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
      </div>
    </div>
  );
}