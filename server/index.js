import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, redirect } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useNavigate as useNavigate$1 } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState } from "react";
import DatePicker from "react-datepicker";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const mockEmployees = [
  {
    id: "EMP001",
    name: "Somchai Prasert",
    department: "IT",
    workDays: 22,
    leaveBalances: { sick: 0, vacation: 6 },
    email: "somchai@example.com"
  },
  {
    id: "EMP002",
    name: "Suda Raksamee",
    department: "HR",
    workDays: 22,
    leaveBalances: { sick: 5, vacation: 6 },
    email: "suda@example.com"
  },
  {
    id: "EMP003",
    name: "Nattapong Jinda",
    department: "Finance",
    workDays: 22,
    leaveBalances: { sick: 2, vacation: 4 },
    email: "suda@example.com"
  },
  {
    id: "EMP004",
    name: "Siamai Thana",
    department: "Maketing",
    workDays: 22,
    leaveBalances: { sick: 3, vacation: 0 },
    email: "suda@example.com"
  }
];
function AddNewRecord() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("");
  const [leaveType, setLeaveType] = useState("sick");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [managerEmail, setManagerEmail] = useState("");
  const [daysOff, setDaysOff] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const selectedEmployee = mockEmployees.find((e) => e.id === selectedId);
  const calculateDays = (start, end) => {
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
    setDaysOff(diff);
  };
  const handleSubmit = (e) => {
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
    setErrorMessage("");
    const isConfirmed = window.confirm("Are you sure you want to submit the leave request?");
    if (isConfirmed) {
      emailjs.send(
        "service_08keyjb",
        "template_nqyxmsn",
        {
          to_email: managerEmail,
          employee_name: selectedEmployee.name,
          leave_type: leaveType,
          start_date: startDate.toLocaleDateString(),
          end_date: endDate.toLocaleDateString(),
          total_days: daysOff
        },
        "zxwM_sOLHgFj1AOuS"
      ).then(() => {
        alert("Email sent successfully!");
        navigate("/leaveHome");
      }).catch((error) => setErrorMessage("Email failed: " + error));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative p-6 bg-gray min-h-screen", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => navigate("/leaveHome"),
        className: "absolute top-4 left-4 bg-[#27548A] text-white px-4 py-2 rounded-2xl hover:bg-[#183B4E]",
        children: "← Back"
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 text-center text-[#27548A]", children: "Leave Work" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "Select Employee" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black",
          onChange: (e) => setSelectedId(e.target.value),
          value: selectedId,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Select Employee --" }),
            mockEmployees.map((emp) => /* @__PURE__ */ jsxs("option", { value: emp.id, children: [
              emp.id,
              " - ",
              emp.name
            ] }, emp.id))
          ]
        }
      )
    ] }),
    selectedEmployee && /* @__PURE__ */ jsxs("div", { className: "bg-[#dcdcc5] p-4 rounded-2xl shadow mb-4", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Employee ID:" }),
        " ",
        selectedEmployee.id
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Name:" }),
        " ",
        selectedEmployee.name
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Department:" }),
        " ",
        selectedEmployee.department
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Work Days/Month:" }),
        " ",
        selectedEmployee.workDays
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Sick Leave Remaining:" }),
        " ",
        selectedEmployee.leaveBalances.sick
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Vacation Leave Remaining:" }),
        " ",
        selectedEmployee.leaveBalances.vacation
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "Leave Type" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black",
            value: leaveType,
            onChange: (e) => setLeaveType(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "sick", children: "Sick Leave" }),
              /* @__PURE__ */ jsx("option", { value: "vacation", children: "Vacation Leave" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "Start Date" }),
          /* @__PURE__ */ jsx(
            DatePicker,
            {
              selected: startDate,
              onChange: (date) => {
                setStartDate(date);
                if (date && endDate) calculateDays(date, endDate);
              },
              className: "border px-3 py-2 rounded bg-[#F3F3E0] text-black",
              dateFormat: "yyyy-MM-dd"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "End Date" }),
          /* @__PURE__ */ jsx(
            DatePicker,
            {
              selected: endDate,
              onChange: (date) => {
                setEndDate(date);
                if (startDate && date) calculateDays(startDate, date);
              },
              className: "border px-3 py-2 rounded bg-[#F3F3E0] text-black",
              dateFormat: "yyyy-MM-dd",
              minDate: startDate || /* @__PURE__ */ new Date()
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "Total Days" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: daysOff,
              readOnly: true,
              className: "border px-3 py-2 rounded w-24 bg-[#F3F3E0] text-black"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-1 font-medium text-[#27548A]", children: "Manager's Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            className: "border px-3 py-2 rounded w-full bg-[#F3F3E0] text-black",
            value: managerEmail,
            onChange: (e) => setManagerEmail(e.target.value),
            required: true
          }
        )
      ] }),
      errorMessage && /* @__PURE__ */ jsx("p", { className: "text-red-600 mb-4", children: errorMessage }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "absolute bottom-10 left-4 bg-[#27548A] text-white px-4 py-2 rounded-2xl hover:bg-[#183B4E]",
          children: "Submit"
        }
      )
    ] })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AddNewRecord
}, Symbol.toStringTag, { value: "Module" }));
const mockLeaveDetails = {
  EMP002: { workDays: 22, leaveDates: ["2025-05-12", "2025-05-13", "2025-05-14"] },
  EMP003: { workDays: 22, leaveDates: ["2025-05-12"] },
  EMP004: { workDays: 22, leaveDates: ["2025-05-09", "2025-05-10", "2025-05-11"] }
};
const mockLeaveRecords = [
  {
    employeeId: "EMP002",
    name: "Suda Raksamee",
    department: "HR",
    startDate: "2025-05-12",
    endDate: "2025-05-14",
    startDate2: "2025-05-02",
    endDate2: "2025-05-02"
  },
  {
    employeeId: "EMP003",
    name: "Nattapong Jinda",
    department: "Finance",
    startDate: "2025-05-12",
    endDate: "2025-05-12",
    startDate2: "2025-05-09",
    endDate2: "2025-05-09"
  }
];
function LeaveListView() {
  const navigate = useNavigate$1();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const handleAddRecord = () => {
    navigate("/addNewRecord");
  };
  const formatLeaveRanges = (leaveDates) => {
    const ranges = [];
    let rangeStart = leaveDates[0];
    let rangeEnd = leaveDates[0];
    for (let i = 1; i < leaveDates.length; i++) {
      const current = new Date(leaveDates[i]);
      const previous = new Date(leaveDates[i - 1]);
      if (current.getDate() === previous.getDate() + 1) {
        rangeEnd = leaveDates[i];
      } else {
        ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart} - ${rangeEnd}`);
        rangeStart = leaveDates[i];
        rangeEnd = leaveDates[i];
      }
    }
    ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart} - ${rangeEnd}`);
    return ranges;
  };
  const detail = selectedRecord ? mockLeaveDetails[selectedRecord.employeeId] : void 0;
  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setOverlayVisible(true);
  };
  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedRecord(null);
  };
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay-container")) {
      closeOverlay();
    }
  };
  const combinedLeaveDates = [
    ...(detail == null ? void 0 : detail.leaveDates) || [],
    // ตรวจสอบว่า detail?.leaveDates ไม่เป็น undefined
    (selectedRecord == null ? void 0 : selectedRecord.startDate2) && (selectedRecord == null ? void 0 : selectedRecord.endDate2)
  ].filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-gray min-h-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-[#27548A]", children: "Today Leave Work" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "bg-[#27548A] text-white px-10 py-2 rounded-2xl hover:bg-[#183B4E]",
          onClick: handleAddRecord,
          children: "+ Add New Record"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full bg-[#F3F3E0] shadow rounded-xl", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-[#27548A] shadow rounded-xl", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-sm font-medium text-white", children: "Employee ID" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-sm font-medium text-white", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-sm font-medium text-white", children: "Department" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-sm font-medium text-white", children: "Start Date" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-sm font-medium text-white", children: "End Date" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: mockLeaveRecords.map((record) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "border-t hover:bg-[#DDA853]",
          onClick: () => handleRowClick(record),
          children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-800", children: record.employeeId }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-800", children: record.name }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-800", children: record.department }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-800", children: record.startDate }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-800", children: record.endDate })
          ]
        },
        record.employeeId
      )) })
    ] }) }),
    isOverlayVisible && selectedRecord && detail && /* @__PURE__ */ jsx(
      "div",
      {
        className: "overlay-container fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50",
        onClick: handleOverlayClick,
        children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl max-w-lg w-full", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: closeOverlay,
              className: "absolute top-4 right-4 text-xl text-gray-600",
              children: "×"
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: "Employee Leave Details" }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Name:" }),
            " ",
            selectedRecord.name
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Department:" }),
            " ",
            selectedRecord.department
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Work Days This Month:" }),
            " ",
            detail.workDays
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Total Leave Days:" }),
            " ",
            detail.leaveDates.length + ((selectedRecord == null ? void 0 : selectedRecord.startDate2) && (selectedRecord == null ? void 0 : selectedRecord.endDate2) ? (new Date(selectedRecord.endDate2).getTime() - new Date(selectedRecord.startDate2).getTime()) / (1e3 * 60 * 60 * 24) + 1 : 0)
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold mt-2", children: "Leave Dates:" }),
          /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside text-sm text-gray-700", children: formatLeaveRanges(combinedLeaveDates).map((range, idx) => /* @__PURE__ */ jsx("li", { children: range }, idx)) })
        ] })
      }
    )
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LeaveListView
}, Symbol.toStringTag, { value: "Module" }));
let loader = async () => {
  return redirect("/leaveHome");
};
function Index() {
  return null;
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-luVDeLrU.js", "imports": ["/assets/index-Bt_DO1gT.js", "/assets/index-tmdh21br.js", "/assets/components-gZWm00xh.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DQWYB15K.js", "imports": ["/assets/index-Bt_DO1gT.js", "/assets/index-tmdh21br.js", "/assets/components-gZWm00xh.js"], "css": ["/assets/root-51zv42CC.css"] }, "routes/AddNewRecord": { "id": "routes/AddNewRecord", "parentId": "root", "path": "AddNewRecord", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/AddNewRecord-s1ZWcRRL.js", "imports": ["/assets/index-Bt_DO1gT.js", "/assets/index-tmdh21br.js"], "css": ["/assets/AddNewRecord-DdjxYr1F.css"] }, "routes/leaveHome": { "id": "routes/leaveHome", "parentId": "root", "path": "leaveHome", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/leaveHome-Cpt-vFcv.js", "imports": ["/assets/index-Bt_DO1gT.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-C6d-v1ok.js", "imports": [], "css": [] } }, "url": "/assets/manifest-7d3396b3.js", "version": "7d3396b3" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/AddNewRecord": {
    id: "routes/AddNewRecord",
    parentId: "root",
    path: "AddNewRecord",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/leaveHome": {
    id: "routes/leaveHome",
    parentId: "root",
    path: "leaveHome",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
