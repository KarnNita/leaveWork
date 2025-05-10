import React, { useState } from "react";
import { useNavigate } from "@remix-run/react";

// เพิ่ม mock data ของ leave details
const mockLeaveDetails = {
  EMP002: { workDays: 22, leaveDates: ["2025-05-12", "2025-05-13", "2025-05-14"] },
  EMP003: { workDays: 22, leaveDates: ["2025-05-12"] },
  EMP004: { workDays: 22, leaveDates: ["2025-05-09", "2025-05-10", "2025-05-11"] },
};

const mockLeaveRecords = [
  {
    employeeId: "EMP002",
    name: "Suda Raksamee",
    department: "HR",
    startDate: "2025-05-12",
    endDate: "2025-05-14",
    startDate2: "2025-05-02",
    endDate2: "2025-05-02",
  },
  {
    employeeId: "EMP003",
    name: "Nattapong Jinda",
    department: "Finance",
    startDate: "2025-05-12",
    endDate: "2025-05-12",
    startDate2: "2025-05-09",
    endDate2: "2025-05-09",
  },
];

type LeaveRecord = {
  employeeId: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  startDate2: string;
  endDate2: string;
};

function LeaveListView() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleAddRecord = () => {
    navigate("/addNewRecord");
  };

const formatLeaveRanges = (leaveDates: string[]) => {
  const ranges: string[] = [];
  let rangeStart = leaveDates[0];
  let rangeEnd = leaveDates[0];

  for (let i = 1; i < leaveDates.length; i++) {
    const current = new Date(leaveDates[i]);
    const previous = new Date(leaveDates[i - 1]);

    // Check if consecutive
    if (current.getDate() === previous.getDate() + 1) {
      rangeEnd = leaveDates[i];
    } else {
      // ถ้า rangeStart และ rangeEnd เป็นวันเดียวกัน ไม่ต้องแสดง -
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart} - ${rangeEnd}`);
      rangeStart = leaveDates[i];
      rangeEnd = leaveDates[i];
    }
  }
  // เช็คกรณีสุดท้าย
  ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart} - ${rangeEnd}`);
  return ranges;
};


  const detail = selectedRecord ? mockLeaveDetails[selectedRecord.employeeId as keyof typeof mockLeaveDetails] : undefined;

  const handleRowClick = (record: LeaveRecord) => {
    setSelectedRecord(record);
    setOverlayVisible(true); // แสดง overlay เมื่อคลิกแถว
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedRecord(null);
  };

  // ฟังก์ชั่นนี้จะปิด overlay เมื่อคลิกข้างนอก
  const handleOverlayClick = (e: React.MouseEvent) => {
    // ตรวจสอบว่า clicked target เป็น overlay container หรือไม่
    if ((e.target as HTMLElement).classList.contains("overlay-container")) {
      closeOverlay();
    }
  };

  // รวมวันที่ลาสองช่วง (startDate2 - endDate2) เข้ากับ Leave Dates
  const combinedLeaveDates = [
    ...(detail?.leaveDates || []), // ตรวจสอบว่า detail?.leaveDates ไม่เป็น undefined
    selectedRecord?.startDate2 && selectedRecord?.endDate2,
  ].filter(Boolean) as string[];

  return (
    <div className="p-6 bg-gray min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#27548A]">Today Leave Work</h2>
        <button
          className="bg-[#27548A] text-white px-10 py-2 rounded-2xl hover:bg-[#183B4E]"
          onClick={handleAddRecord}
        >
          + Add New Record
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#F3F3E0] shadow rounded-xl">
          <thead className="bg-[#27548A] shadow rounded-xl">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">Employee ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">Department</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">End Date</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaveRecords.map((record) => (
              <tr
                key={record.employeeId}
                className="border-t hover:bg-[#DDA853]"
                onClick={() => handleRowClick(record)}
              >
                <td className="px-6 py-4 text-sm text-gray-800">{record.employeeId}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{record.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{record.department}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{record.startDate}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{record.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOverlayVisible && selectedRecord && detail && (
        <div
          className="overlay-container fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-6 rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeOverlay}
              className="absolute top-4 right-4 text-xl text-gray-600"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-2">Employee Leave Details</h3>
            <p><strong>Name:</strong> {selectedRecord.name}</p>
            <p><strong>Department:</strong> {selectedRecord.department}</p>
            <p><strong>Work Days This Month:</strong> {detail.workDays}</p>
            <p><strong>Total Leave Days:</strong> {
              detail.leaveDates.length +
              (selectedRecord?.startDate2 && selectedRecord?.endDate2
                ? (new Date(selectedRecord.endDate2).getTime() - new Date(selectedRecord.startDate2).getTime()) / (1000 * 60 * 60 * 24) + 1
                : 0)
            }</p>
            <p className="font-semibold mt-2">Leave Dates:</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {formatLeaveRanges(combinedLeaveDates).map((range, idx) => (
                <li key={idx}>{range}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveListView;
