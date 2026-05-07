import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface OpenMajorItem {
  id: number;
  name: string;
}

const inputCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const selectCls =
  "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:bg-white";

const sectionCls =
  "rounded-[24px] border border-gray-300 bg-white px-5 py-5 shadow-sm";

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6 M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function EmptyAddBox({
  title,
  description,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-gray-300 bg-white px-4 py-10 text-center transition hover:bg-gray-50"
      >
        <PlusIcon className="h-16 w-16 text-gray-400" />
        <p className="mt-5 text-[18px] font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </button>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-400 transition hover:bg-gray-50"
      >
        <PlusIcon />
        <span className="text-base">{buttonText}</span>
      </button>
    </>
  );
}

function ModalBase({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 transition-colors hover:text-gray-700"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

export default function SubjectAdd() {
  const navigate = useNavigate();

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("1 (ภาคต้น)");
  const [yearLevel, setYearLevel] = useState("1");

  const [openMajors, setOpenMajors] = useState<OpenMajorItem[]>([]);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [majorName, setMajorName] = useState("");

  const totalMajors = useMemo(() => openMajors.length, [openMajors]);

  const handleAddMajor = () => {
    const trimmed = majorName.trim();
    if (!trimmed) return;

    const newItem: OpenMajorItem = {
      id: Date.now(),
      name: trimmed,
    };

    setOpenMajors((prev) => [...prev, newItem]);
    setMajorName("");
    setShowMajorModal(false);
  };

  const handleCreateSubject = () => {
    const payload = {
      subject_code: subjectCode,
      subject_name: subjectName,
      academic_year: academicYear,
      semester,
      year_level: yearLevel,
      open_majors: openMajors,
    };

    console.log("create subject payload:", payload);
    // TODO: ยิง API create subject ตรงนี้
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <h1 className="text-[20px] font-bold text-black sm:text-[22px]">
          เพิ่มรายวิชาใหม่
        </h1>

        <section className={sectionCls}>
          <h2 className="text-[18px] font-semibold text-gray-900">
            ข้อมูลพื้นฐาน <span className="text-red-500">*</span>
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                รหัสวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="เช่น LI 102 003"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ชื่อวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="เช่น ภาษาอังกฤษ 3"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="เช่น 2569"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ภาคการศึกษา <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={selectCls}
              >
                <option>1 (ภาคต้น)</option>
                <option>2 (ภาคปลาย)</option>
                <option>3 (ภาคฤดูร้อน)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ชั้นปี <span className="text-red-500">*</span>
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className={selectCls}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </section>

        <section className={sectionCls}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[18px] font-semibold text-gray-900">
              สาขาที่เปิดสอน
            </h2>

            <button
              type="button"
              onClick={() => setShowMajorModal(true)}
              className="flex items-center gap-2 rounded-full bg-[#155EEF] px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <PlusIcon />
              เพิ่มสาขา
            </button>
          </div>

          <div className="mt-5">
            {openMajors.length === 0 ? (
              <EmptyAddBox
                title="ยังไม่มีสาขา"
                description='กดปุ่ม "เพิ่มสาขา" เพื่อเพิ่มสาขาที่เปิดสอนวิชานี้'
                buttonText="เพิ่มสาขา"
                onClick={() => setShowMajorModal(true)}
              />
            ) : (
              <>
                <div className="space-y-4">
                  {openMajors.map((major, index) => (
                    <div
                      key={major.id}
                      className="flex items-center justify-between gap-4 rounded-[14px] border border-gray-200 bg-white p-4"
                    >
                      <div>
                        <p className="text-xs text-gray-400">
                          สาขา {index + 1}
                        </p>
                        <p className="mt-1 text-base font-medium text-gray-800">
                          {major.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMajors((prev) =>
                            prev.filter((item) => item.id !== major.id),
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMajorModal(true)}
                  className="mt-4 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                >
                  <PlusIcon />
                  <span className="text-base">เพิ่มสาขา</span>
                </button>
              </>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[50px] rounded-full border border-gray-500 bg-white px-10 text-[16px] font-medium text-gray-800 transition hover:bg-gray-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleCreateSubject}
            className="flex h-[50px] items-center gap-2 rounded-full bg-[#155EEF] px-8 text-[16px] font-medium text-white transition hover:bg-blue-700"
          >
            <SaveIcon />
            สร้างรายวิชา
          </button>
        </div>
      </div>

      {showMajorModal && (
        <ModalBase onClose={() => setShowMajorModal(false)}>
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "#155EEF22" }}
            >
              <PlusIcon className="text-[#155EEF]" />
            </div>

            <h2 className="flex-1 text-base font-bold text-gray-900">
              เพิ่มสาขา
            </h2>

            <CloseBtn onClick={() => setShowMajorModal(false)} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                ชื่อสาขา <span className="text-red-500">*</span>
              </label>
              <input
                value={majorName}
                onChange={(e) => setMajorName(e.target.value)}
                placeholder="เช่น วิทยาการคอมพิวเตอร์"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder-gray-300 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setShowMajorModal(false)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleAddMajor}
              className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              บันทึก
            </button>
          </div>
        </ModalBase>
      )}
    </div>
  );
}