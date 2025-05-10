import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";

const mockEmployees = [
  {
    id: "EMP001",
    name: "Somchai Prasert",
    department: "IT",
    workDays: 22,
    leaveBalances: { sick: 0, vacation: 6 },
    email: "somchai@example.com",
  },
  {
    id: "EMP002",
    name: "Suda Raksamee",
    department: "HR",
    workDays: 22,
    leaveBalances: { sick: 5, vacation: 6 },
    email: "suda@example.com",
  },
  {
    id: "EMP003",
    name: "Nattapong Jinda",
    department: "Finance",
    workDays: 22,
    leaveBalances: { sick: 2, vacation: 4 },
    email: "suda@example.com",
  },
  {
    id: "EMP004",
    name: "Siamai Thana",
    department: "Maketing",
    workDays: 22,
    leaveBalances: { sick: 3, vacation: 0 },
    email: "suda@example.com",
  },
];

type LeaveType = "sick" | "vacation";

function AddNewRecord() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("sick");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [managerEmail, setManagerEmail] = useState("");
  const [daysOff, setDaysOff] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectedEmployee = mockEmployees.find((e) => e.id === selectedId);

  const calculateDays = (start: Date, end: Date) => {
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setDaysOff(diff);
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedEmployee || !startDate || !endDate || !managerEmail) return;

  if (endDate < startDate) {
    setErrorMessage("End date cannot be before start date.");
    return;
  }

  const leaveBalance = selectedEmployee.leaveBalances[leaveType];
  if (daysOff > leaveBalance) {
    setErrorMessage(`You don't have enough ${leaveType} leave days available.`);
    return;
  }

  setErrorMessage(""); // ✅ ล้าง error message ตรงนี้ ก่อนเปิด confirm box

  const isConfirmed = window.confirm("Are you sure you want to submit the leave request?");
  if (isConfirmed) {
    emailjs
      .send(
        "service_08keyjb",
        "template_nqyxmsn",
        {
          to_email: managerEmail,
          employee_name: selectedEmployee.name,
          leave_type: leaveType,
          start_date: startDate.toLocaleDateString(),
          end_date: endDate.toLocaleDateString(),
          total_days: daysOff,
        },
        "zxwM_sOLHgFj1AOuS"
      )
      .then(() => {
        alert("Email sent successfully!");
        navigate("/leaveHome");
      })
      .catch((error) => setErrorMessage("Email failed: " + error));
  }
};



  return (
    <div className="relative p-6 bg-gray min-h-screen">
      {/* Back Button on Top-Left */}
      <button
        type="button"
        onClick={() => navigate("/leaveHome")}
        className="absolute top-4 left-4 bg-[#27548A] text-white px-4 py-2 rounded-2xl hover:bg-[#183B4E]"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center text-[#27548A]">Leave Work</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-[#27548A]">Select Employee</label>
        <select
          className="border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black"
          onChange={(e) => setSelectedId(e.target.value)}
          value={selectedId}
        >
          <option value="">-- Select Employee --</option>
          {mockEmployees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.id} - {emp.name}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <div className="bg-[#dcdcc5] p-4 rounded-2xl shadow mb-4">
          <p><strong>Employee ID:</strong> {selectedEmployee.id}</p>
          <p><strong>Name:</strong> {selectedEmployee.name}</p>
          <p><strong>Department:</strong> {selectedEmployee.department}</p>
          <p><strong>Work Days/Month:</strong> {selectedEmployee.workDays}</p>
          <p><strong>Sick Leave Remaining:</strong> {selectedEmployee.leaveBalances.sick}</p>
          <p><strong>Vacation Leave Remaining:</strong> {selectedEmployee.leaveBalances.vacation}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-[#27548A]">Leave Type</label>
          <select
            className="border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
          >
            <option value="sick">Sick Leave</option>
            <option value="vacation">Vacation Leave</option>
          </select>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium text-[#27548A]">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                if (date && endDate) calculateDays(date, endDate);
              }}
              className="border px-3 py-2 rounded bg-[#F3F3E0] text-black"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#27548A]">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                if (startDate && date) calculateDays(startDate, date);
              }}
              className="border px-3 py-2 rounded bg-[#F3F3E0] text-black"
              dateFormat="yyyy-MM-dd"
              minDate={startDate || new Date()}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#27548A]">Total Days</label>
            <input
              type="number"
              value={daysOff}
              readOnly
              className="border px-3 py-2 rounded w-24 bg-[#F3F3E0] text-black"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-[#27548A]">Manager's Email</label>
          <input
            type="email"
            className="border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            required
          />
        </div>

        {errorMessage && (
          <p className="text-red-600 mb-4">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="absolute bottom-10 left-4 bg-[#27548A] text-white px-4 py-2 rounded-2xl hover:bg-[#183B4E]"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddNewRecord;
