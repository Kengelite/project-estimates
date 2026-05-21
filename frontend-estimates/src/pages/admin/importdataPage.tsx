import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { GetDataAnnualBudgetSummary } from "../../fetchapi/fetch_api_admin";

interface AnnualBudgetSummaryItem {
  id: string;
  yearId?: string | number;
  year_id?: string | number;
  year?: {
    id?: string | number;
    year?: string | number;
    name?: string;
  } | null;
  Year?: {
    id?: string | number;
    year?: string | number;
    name?: string;
  } | null;
  summaryType?: string;
  summary_type?: string;
  semesterId?: string | number | null;
  semester_id?: string | number | null;
  semester?: {
    id?: string | number;
    name?: string;
    semester?: string | number;
  } | null;
  Semester?: {
    id?: string | number;
    name?: string;
    semester?: string | number;
  } | null;
  totalUniversityWorkAmount?: number;
  total_university_work_amount?: number;
  totalCurriculumAmount?: number;
  total_curriculum_amount?: number;
  status?: string | number;
  created_at?: string;
  createdAt?: string;
}

const ACCEPTED_FILE_TYPES =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

function pickArrayFromResponse(response: any): AnnualBudgetSummaryItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.Items)) return response.Items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function toNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: any) {
  return toNumber(value).toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function getYearLabel(item: AnnualBudgetSummaryItem | any) {
  return String(
    item.year?.year ??
      item.Year?.year ??
      item.year?.name ??
      item.Year?.name ??
      item.yearId ??
      item.year_id ??
      "-",
  );
}

function getSemesterLabel(item: AnnualBudgetSummaryItem | any) {
  const summaryType = item.summaryType ?? item.summary_type;

  if (summaryType === "yearly") return "-";

  const semesterValue = String(
    item.semester?.name ??
      item.Semester?.name ??
      item.semester?.semester ??
      item.Semester?.semester ??
      item.semesterId ??
      item.semester_id ??
      "-",
  );

  if (semesterValue === "1") return "ภาคต้น";
  if (semesterValue === "2") return "ภาคปลาย";
  if (semesterValue === "3") return "ภาคฤดูร้อน";

  return semesterValue;
}

function getSummaryTypeLabel(item: AnnualBudgetSummaryItem | any) {
  const summaryType = item.summaryType ?? item.summary_type;

  if (summaryType === "semester") return "แบบแยกภาคการศึกษา";
  return "แบบรายปี";
}

function getSummaryOptionLabel(item: AnnualBudgetSummaryItem | any) {
  const year = getYearLabel(item);
  const type = getSummaryTypeLabel(item);
  const semester = getSemesterLabel(item);

  if (semester === "-") return `ข้อมูลงบประมาณ ปี ${year} / ${type}`;

  return `ข้อมูลงบประมาณ ปี ${year} / ${semester} / ${type}`;
}

function getTotalUniversityWork(item: AnnualBudgetSummaryItem | any) {
  return toNumber(
    item.totalUniversityWorkAmount ?? item.total_university_work_amount,
  );
}

function getTotalCurriculum(item: AnnualBudgetSummaryItem | any) {
  return toNumber(item.totalCurriculumAmount ?? item.total_curriculum_amount);
}

function getStatusText(status?: string | number) {
  return String(status ?? "1") === "1" ? "เปิด" : "ปิด";
}

function getCreatedAt(item: AnnualBudgetSummaryItem) {
  return item.created_at || item.createdAt;
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExcelFile(file: File) {
  const name = file.name.toLowerCase();

  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    name.endsWith(".csv") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "text/csv"
  );
}

export default function ImportDataPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryItems, setSummaryItems] = useState<AnnualBudgetSummaryItem[]>(
    [],
  );
  const [selectedSummaryId, setSelectedSummaryId] = useState("");
  const [search, setSearch] = useState("");
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedSummary = useMemo(() => {
    return summaryItems.find((item) => String(item.id) === selectedSummaryId);
  }, [summaryItems, selectedSummaryId]);

  const filteredSummaries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return summaryItems;

    return summaryItems.filter((item) => {
      const year = getYearLabel(item).toLowerCase();
      const semester = getSemesterLabel(item).toLowerCase();
      const type = getSummaryTypeLabel(item).toLowerCase();
      const status = getStatusText(item.status).toLowerCase();

      return (
        year.includes(keyword) ||
        semester.includes(keyword) ||
        type.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [summaryItems, search]);

  const loadSummaries = async () => {
    try {
      setLoadingSummaries(true);

      const response = await GetDataAnnualBudgetSummary();
      const list = pickArrayFromResponse(response);

      setSummaryItems(list);

      if (list.length > 0) {
        setSelectedSummaryId(String(list[0].id));
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text:
          error?.message ||
          error ||
          "ไม่สามารถดึงข้อมูลสรุปงบประมาณได้",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!isExcelFile(file)) {
      event.target.value = "";

      await Swal.fire({
        icon: "warning",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกไฟล์ Excel เฉพาะ .xlsx, .xls หรือ .csv เท่านั้น",
        confirmButtonColor: "#3b82f6",
      });

      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitImport = async () => {
    if (!selectedFile) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกไฟล์",
        text: "กรุณาเลือกไฟล์ Excel ก่อนนำข้อมูลเข้าระบบ",
        confirmButtonColor: "#3b82f6",
      });

      return;
    }

    if (!selectedSummaryId) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกข้อมูลเปรียบเทียบ",
        text: "กรุณาเลือกสรุปข้อมูลงบประมาณที่ต้องการเปรียบเทียบ",
        confirmButtonColor: "#3b82f6",
      });

      return;
    }

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการนำข้อมูลเข้า",
      html: `
        ต้องการนำไฟล์ <b>${selectedFile.name}</b><br/>
        เข้าเปรียบเทียบกับ <b>${selectedSummary ? getSummaryOptionLabel(selectedSummary) : "-"}</b>
        ใช่หรือไม่
      `,
      showCancelButton: true,
      confirmButtonText: "นำข้อมูลเข้า",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);

      /**
       * ตรงนี้ถ้ามี API import แล้ว ให้เรียก backend ด้วย FormData เช่น:
       *
       * const formData = new FormData();
       * formData.append("file", selectedFile);
       * formData.append("summaryId", selectedSummaryId);
       *
       * await ImportAnnualBudgetExcel(formData);
       *
       * ตอนนี้ใส่ alert สำเร็จไว้ก่อน เพื่อให้หน้า UI ทำงานครบ
       */

      await Swal.fire({
        icon: "success",
        title: "เลือกไฟล์สำเร็จ",
        html: `
          เลือกไฟล์ <b>${selectedFile.name}</b><br/>
          และเลือกข้อมูลเปรียบเทียบเรียบร้อยแล้ว
        `,
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "นำข้อมูลเข้าไม่สำเร็จ",
        text:
          error?.message ||
          error ||
          "ไม่สามารถนำข้อมูลเข้าระบบได้ กรุณาตรวจสอบไฟล์อีกครั้ง",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <nav className="mb-4 text-sm text-gray-400">
            <span className="cursor-pointer hover:text-gray-600">หน้าแรก</span>
            <span className="mx-2">›</span>
            <span className="font-medium text-gray-700">นำข้อมูลเข้าระบบ</span>
          </nav>

          <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
            อัพโหลดไฟล์ Excel
          </h1>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 p-6">
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-10">
                <ArrowDownTrayIcon
                  className="mb-6 h-20 w-20 text-gray-400"
                  strokeWidth={1.5}
                />

                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="w-full max-w-[220px] rounded-lg bg-blue-600 px-8 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  เลือกไฟล์ Excel
                </button>

                <p className="mt-4 text-center text-sm text-gray-400">
                  รองรับไฟล์ .xlsx, .xls และ .csv
                </p>
              </div>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <DocumentArrowUpIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mb-6 max-w-lg">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              เลือกสรุปข้อมูลงบประมาณที่ต้องการเปรียบเทียบ{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                value={selectedSummaryId}
                disabled={loadingSummaries}
                onChange={(event) => setSelectedSummaryId(event.target.value)}
                className="block w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-base text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              >
                {loadingSummaries ? (
                  <option value="">กำลังโหลดข้อมูล...</option>
                ) : summaryItems.length === 0 ? (
                  <option value="">ไม่พบข้อมูลสรุปงบประมาณ</option>
                ) : (
                  summaryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getSummaryOptionLabel(item)}
                    </option>
                  ))
                )}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDownIcon className="h-5 w-5" />
              </div>
            </div>

            {selectedSummary && (
              <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                <div className="flex justify-between gap-4">
                  <span>รวมบริหารงานวิทยาลัย</span>
                  <span className="font-bold text-gray-800">
                    {formatMoney(getTotalUniversityWork(selectedSummary))} บาท
                  </span>
                </div>

                <div className="mt-1 flex justify-between gap-4">
                  <span>รวมบริหารหลักสูตร</span>
                  <span className="font-bold text-blue-600">
                    {formatMoney(getTotalCurriculum(selectedSummary))} บาท
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={submitting || loadingSummaries}
              onClick={handleSubmitImport}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircleIcon className="h-5 w-5" />
              นำข้อมูลเข้าระบบ
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาปี / รูปแบบ / ภาคการศึกษา / สถานะ..."
              className="block w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500">
                  <tr>
                    <th className="w-[80px] px-5 py-4 text-center">ลำดับ</th>
                    <th className="px-5 py-4">ปีการศึกษา</th>
                    <th className="px-5 py-4">รูปแบบ</th>
                    <th className="px-5 py-4">ภาคการศึกษา</th>
                    <th className="px-5 py-4 text-right">
                      รวมบริหารงานวิทยาลัย
                    </th>
                    <th className="px-5 py-4 text-right">
                      รวมบริหารหลักสูตร
                    </th>
                    <th className="px-5 py-4 text-center">สถานะ</th>
                    <th className="px-5 py-4 text-center">เลือก</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loadingSummaries ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : filteredSummaries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        ยังไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map((item, index) => {
                      const isSelected = String(item.id) === selectedSummaryId;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isSelected ? "bg-blue-50/70" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-5 py-4 text-center text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4 font-bold text-gray-900">
                            {getYearLabel(item)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                              {getSummaryTypeLabel(item)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            {getSemesterLabel(item)}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-gray-900">
                            {formatMoney(getTotalUniversityWork(item))} บาท
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-blue-600">
                            {formatMoney(getTotalCurriculum(item))} บาท
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                getStatusText(item.status) === "เปิด"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedSummaryId(String(item.id))}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                            >
                              {isSelected ? "เลือกแล้ว" : "เลือก"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            รายการด้านบนดึงจากข้อมูลสรุปงบประมาณที่บันทึกไว้ในระบบ
          </p>
        </div>
      </div>
    </div>
  );
}