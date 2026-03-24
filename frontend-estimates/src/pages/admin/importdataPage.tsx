// import React from "react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function ImportDataPage() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* กล่องที่ 1: ส่วนอัพโหลดไฟล์ */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6 sm:p-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-8 flex items-center gap-2 font-medium">
            <span className="hover:text-gray-900 cursor-pointer">หน้าแรก</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-900">นำข้อมูลเข้าระบบ</span>
          </nav>

          {/* หัวข้อ */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            อัพโหลดไฟล์ Excel
          </h1>

          {/* กล่องอัพโหลด */}
          <div className="flex justify-center mb-10">
            {/* กรอบนอก (เส้นทึบ) */}
            <div className="border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
              {/* กรอบใน (เส้นประ) */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-12 px-6 flex flex-col items-center justify-center bg-white">
                <ArrowDownTrayIcon
                  className="w-20 h-20 text-gray-400 mb-6"
                  strokeWidth={1.5}
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors w-full max-w-[200px]">
                  เลือกไฟล์ Excel
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown เลือกงบประมาณ */}
          <div className="max-w-lg mx-auto mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              เลือกสรุปข้อมูลงบประมาณที่ต้องการเปรียบเทียบ{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="block w-full appearance-none bg-white border border-gray-300 text-gray-800 py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base cursor-pointer">
                <option>ข้อมูลงบประมาณ ปี 2568</option>
                <option>ข้อมูลงบประมาณ ปี 2569</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* กล่องที่ 2: ส่วนค้นหาและแสดงข้อมูล */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          {/* ช่องค้นหา */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาปี..."
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* พื้นที่แสดงข้อมูล (สถานะว่างเปล่า) */}
          <div className="border border-gray-300 rounded-lg min-h-[250px] flex items-center justify-center">
            <p className="text-gray-400 text-lg">ยังไม่มีข้อมูล</p>
          </div>
        </div>
      </div>
    </div>
  );
}
