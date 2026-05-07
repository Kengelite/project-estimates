import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface SubjectGroup {
    id: number;
    name: string;
    credits: number;
}

interface OutsideSubject {
    id: number;
    code: string;
    name: string;
    amount: number;
}

interface StudentYear {
    id: number;
    year: number;
    count: number;
}

const inputCls =
    "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const numberInputCls =
    "w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white";

const sectionCls =
    "rounded-[24px] border border-gray-300 bg-white px-5 py-5 shadow-sm";

const AddBigIcon = () => (
    <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const PlusIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
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

function SectionTitle({
    title,
    required = false,
}: {
    title: string;
    required?: boolean;
}) {
    return (
        <h2 className="text-[18px] font-semibold text-gray-900">
            {title} {required && <span className="text-red-500">*</span>}
        </h2>
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
                className="flex min-h-[182px] w-full flex-col items-center justify-center rounded-[14px] border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:bg-gray-50"
            >
                <AddBigIcon />
                <p className="mt-3 text-[18px] font-medium text-gray-500">{title}</p>
                <p className="mt-1 text-sm text-gray-400">{description}</p>
            </button>

            <button
                type="button"
                onClick={onClick}
                className="mt-4 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-400 transition hover:bg-gray-50"
            >
                <PlusIcon />
                <span className="text-base">{buttonText}</span>
            </button>
        </>
    );
}

export default function AddCourse() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const levelId = Number(searchParams.get("level_id") || 0);

    const getDefaultLevel = (id: number) => {
        switch (id) {
            case 1:
                return "ปริญญาตรี (ปกติ)";
            case 2:
                return "ปริญญาตรี (ภาคพิเศษ)";
            case 3:
                return "ปริญญาโท";
            case 4:
                return "ปริญญาเอก";
            default:
                return "ปริญญาตรี (ปกติ)";
        }
    };

    const [level, setLevel] = useState(getDefaultLevel(levelId));
    const [code, setCode] = useState("B.SC.");
    const [nameTh, setNameTh] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [duration, setDuration] = useState<string>("");
    const [fee, setFee] = useState<string>("");
    const [uniDeduct, setUniDeduct] = useState<string>("");

    const [groups, setGroups] = useState<SubjectGroup[]>([]);
    const [outsideSubjects, setOutsideSubjects] = useState<OutsideSubject[]>([]);
    const [students, setStudents] = useState<StudentYear[]>([]);

    const totalCredits = useMemo(
        () => groups.reduce((sum, item) => sum + (Number(item.credits) || 0), 0),
        [groups],
    );

    const totalStudents = useMemo(
        () => students.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
        [students],
    );

    const addGroup = () => {
        setGroups((prev) => [
            ...prev,
            { id: Date.now(), name: "", credits: 0 },
        ]);
    };

    const addOutsideSubject = () => {
        setOutsideSubjects((prev) => [
            ...prev,
            { id: Date.now(), code: "", name: "", amount: 0 },
        ]);
    };

    const addStudent = () => {
        setStudents((prev) => [
            ...prev,
            { id: Date.now(), year: new Date().getFullYear() + 543, count: 0 },
        ]);
    };

    const handleCreateCourse = () => {
        const payload = {
            level_id: levelId,
            level,
            code,
            nameTh,
            nameEn,
            duration,
            fee,
            groups,
            uniDeduct,
            outsideSubjects,
            students,
        };

        console.log("create course payload:", payload);
        // TODO: เรียก API create course ตรงนี้
    };

    return (
        <div className="min-h-screen bg-[#f7f7f7] p-4 sm:p-6">
            <div className="mx-auto max-w-[1280px] space-y-6">
                <h1 className="text-[20px] font-bold text-black sm:text-[22px]">
                    เพิ่มหลักสูตร
                </h1>

                {/* ข้อมูลพื้นฐาน */}
                <section className={sectionCls}>
                    <SectionTitle title="ข้อมูลพื้นฐาน" required />

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                ระดับปริญญา <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className={inputCls}
                                disabled={levelId > 0}
                            >
                                <option>ปริญญาตรี (ปกติ)</option>
                                <option>ปริญญาตรี (ภาคพิเศษ)</option>
                                <option>ปริญญาโท</option>
                                <option>ปริญญาเอก</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                รหัสหลักสูตร <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={inputCls}
                            />
                            <p className="mt-2 text-xs text-gray-400">
                                กรุณากรอกตัวย่อสาขาด้านหลังชื่อปริญญา
                            </p>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                ชื่อหลักสูตร (ภาษาไทย) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nameTh}
                                onChange={(e) => setNameTh(e.target.value)}
                                placeholder="เช่น หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์"
                                className={inputCls}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                ชื่อหลักสูตร (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                placeholder="เช่น Bachelor of Science Program in Computer Science"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                ระยะเวลาการศึกษา <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="เช่น 4"
                                className={numberInputCls}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                ค่าธรรมเนียมการศึกษา (บาท/ภาคการศึกษา){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                placeholder="เช่น 15,000"
                                className={numberInputCls}
                            />
                        </div>
                    </div>
                </section>

                {/* โครงสร้างและรายละเอียดหลักสูตร */}
                <section className={sectionCls}>
                    <SectionTitle title="โครงสร้างและรายละเอียดหลักสูตร" />

                    <div className="mt-5">
                        {groups.length === 0 ? (
                            <EmptyAddBox
                                title="ยังไม่มีโครงสร้างและรายละเอียดหลักสูตร"
                                description='กดปุ่ม "เพิ่มหมวดวิชา" เพื่อเพิ่มรายละเอียดของหลักสูตร'
                                buttonText="เพิ่มหมวดวิชา"
                                onClick={addGroup}
                            />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {groups.map((group, index) => (
                                        <div
                                            key={group.id}
                                            className="grid grid-cols-1 gap-3 rounded-[14px] border border-gray-200 p-4 lg:grid-cols-[1fr_180px_56px]"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    หมวดวิชา {index + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={group.name}
                                                    onChange={(e) =>
                                                        setGroups((prev) =>
                                                            prev.map((item) =>
                                                                item.id === group.id
                                                                    ? { ...item, name: e.target.value }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="กรอกชื่อหมวดวิชา"
                                                    className={inputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    หน่วยกิต
                                                </label>
                                                <input
                                                    type="number"
                                                    value={group.credits}
                                                    onChange={(e) =>
                                                        setGroups((prev) =>
                                                            prev.map((item) =>
                                                                item.id === group.id
                                                                    ? {
                                                                        ...item,
                                                                        credits: Number(e.target.value || 0),
                                                                    }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    className={numberInputCls}
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setGroups((prev) =>
                                                            prev.filter((item) => item.id !== group.id),
                                                        )
                                                    }
                                                    className="flex h-10 w-full items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addGroup}
                                    className="mt-4 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                                >
                                    <PlusIcon />
                                    <span className="text-base">เพิ่มหมวดวิชา</span>
                                </button>
                            </>
                        )}

                        <div className="mt-5 flex items-center justify-between rounded-[14px] bg-gray-100 px-8 py-5">
                            <span className="text-[16px] font-medium text-gray-800">
                                หน่วยกิตรวมตลอดหลักสูตร
                            </span>
                            <div className="flex items-end gap-3">
                                <span className="text-[48px] font-medium leading-none text-[#155EEF]">
                                    {totalCredits}
                                </span>
                                <span className="pb-1 text-[16px] text-gray-500">หน่วยกิต</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ยอดเงินหักให้ภายนอกคณะ */}
                <section className={sectionCls}>
                    <SectionTitle title="ยอดเงินหักให้ภายนอกคณะ" />

                    <div className="mt-5 rounded-[14px] bg-gray-50 px-5 py-6">
                        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_1fr]">
                            <div className="text-[16px] font-medium text-gray-800">
                                ยอดเงินที่หักให้มหาวิทยาลัย
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                    จำนวน (บาท)
                                </label>
                                <input
                                    type="number"
                                    value={uniDeduct}
                                    onChange={(e) => setUniDeduct(e.target.value)}
                                    placeholder="เช่น 2,500"
                                    className={numberInputCls}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-6 h-px bg-gray-200" />

                    <div>
                        <h3 className="mb-4 text-[16px] font-medium text-gray-900">
                            ยอดเงินที่หักให้รายวิชานอกคณะ
                        </h3>

                        {outsideSubjects.length === 0 ? (
                            <EmptyAddBox
                                title="ยังไม่มีรายวิชานอกคณะ"
                                description='กดปุ่ม "เพิ่มรายวิชานอกคณะ" เพื่อเพิ่มยอดเงินที่หักให้รายวิชานอกคณะ'
                                buttonText="เพิ่มรายวิชานอกคณะ"
                                onClick={addOutsideSubject}
                            />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {outsideSubjects.map((subject, index) => (
                                        <div
                                            key={subject.id}
                                            className="grid grid-cols-1 gap-3 rounded-[14px] border border-gray-200 p-4 lg:grid-cols-[120px_1fr_180px_56px]"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    รหัสวิชา {index + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={subject.code}
                                                    onChange={(e) =>
                                                        setOutsideSubjects((prev) =>
                                                            prev.map((item) =>
                                                                item.id === subject.id
                                                                    ? { ...item, code: e.target.value }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="เช่น SC"
                                                    className={inputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    รายวิชา
                                                </label>
                                                <input
                                                    type="text"
                                                    value={subject.name}
                                                    onChange={(e) =>
                                                        setOutsideSubjects((prev) =>
                                                            prev.map((item) =>
                                                                item.id === subject.id
                                                                    ? { ...item, name: e.target.value }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="กรอกรายวิชา"
                                                    className={inputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    จำนวน (บาท)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={subject.amount}
                                                    onChange={(e) =>
                                                        setOutsideSubjects((prev) =>
                                                            prev.map((item) =>
                                                                item.id === subject.id
                                                                    ? {
                                                                        ...item,
                                                                        amount: Number(e.target.value || 0),
                                                                    }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    className={numberInputCls}
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOutsideSubjects((prev) =>
                                                            prev.filter((item) => item.id !== subject.id),
                                                        )
                                                    }
                                                    className="flex h-10 w-full items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addOutsideSubject}
                                    className="mt-4 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                                >
                                    <PlusIcon />
                                    <span className="text-base">เพิ่มรายวิชานอกคณะ</span>
                                </button>
                            </>
                        )}
                    </div>
                </section>

                {/* ข้อมูลนักศึกษา */}
                <section className={sectionCls}>
                    <SectionTitle title="ข้อมูลนักศึกษา" />

                    <div className="mt-5">
                        {students.length === 0 ? (
                            <EmptyAddBox
                                title="ยังไม่มีข้อมูลนักศึกษา"
                                description='กดปุ่ม "เพิ่มปีการศึกษา" เพื่อเพิ่มข้อมูลของนักศึกษา'
                                buttonText="เพิ่มปีการศึกษา"
                                onClick={addStudent}
                            />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {students.map((student, index) => (
                                        <div
                                            key={student.id}
                                            className="grid grid-cols-1 gap-3 rounded-[14px] border border-gray-200 p-4 lg:grid-cols-[1fr_1fr_56px]"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    ปีการศึกษา {index + 1}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={student.year}
                                                    onChange={(e) =>
                                                        setStudents((prev) =>
                                                            prev.map((item) =>
                                                                item.id === student.id
                                                                    ? {
                                                                        ...item,
                                                                        year: Number(e.target.value || 0),
                                                                    }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    className={numberInputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-800">
                                                    จำนวนนักศึกษา
                                                </label>
                                                <input
                                                    type="number"
                                                    value={student.count}
                                                    onChange={(e) =>
                                                        setStudents((prev) =>
                                                            prev.map((item) =>
                                                                item.id === student.id
                                                                    ? {
                                                                        ...item,
                                                                        count: Number(e.target.value || 0),
                                                                    }
                                                                    : item,
                                                            ),
                                                        )
                                                    }
                                                    className={numberInputCls}
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStudents((prev) =>
                                                            prev.filter((item) => item.id !== student.id),
                                                        )
                                                    }
                                                    className="flex h-10 w-full items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addStudent}
                                    className="mt-4 flex h-[82px] w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                                >
                                    <PlusIcon />
                                    <span className="text-base">เพิ่มปีการศึกษา</span>
                                </button>
                            </>
                        )}

                        <div className="mt-5 flex items-center justify-between rounded-[14px] bg-gray-100 px-8 py-5">
                            <span className="text-[16px] font-medium text-gray-800">
                                จำนวนนักศึกษาทั้งหมด
                            </span>
                            <div className="flex items-end gap-3">
                                <span className="text-[48px] font-medium leading-none text-[#155EEF]">
                                    {totalStudents}
                                </span>
                                <span className="pb-1 text-[16px] text-gray-500">คน</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* actions */}
                <div className="flex items-center justify-end gap-4 pb-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 border border-gray-400 hover:bg-gray-50 text-gray-800 text-xs font-medium px-10 py-3 rounded-lg transition-colors"
                    >
                        ยกเลิก
                    </button>

                    <button
                        type="button"
                        onClick={handleCreateCourse}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors"
                    >
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
                        สร้างหลักสูตร
                    </button>
                </div>
            </div>
        </div>
    );
}