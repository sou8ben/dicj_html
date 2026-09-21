/* ================================================================
 * 畫面 Screens：報表及查詢
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：報表及查詢 ---- */
function ReportsScreen() {
  const reports = DemoData.reports,
    [dateFrom, setDateFrom] = React.useState("2026-08-01"),
    [dateTo, setDateTo] = React.useState("2026-08-27"),
    [toast, setToast] = React.useState(""),
    applyDateRange = () => {
      (setToast(`已套用日期範圍：${dateFrom} 至 ${dateTo}`), setTimeout(() => setToast(""), 2200));
    },
    downloadReport = (reportName) => {
      const csvContent = `報表名稱,涵蓋期間,建立時間
${reportName},${dateFrom} 至 ${dateTo},2026-08-27 10:30`,
        blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv" }),
        link = document.createElement("a");
      ((link.href = URL.createObjectURL(blob)),
        (link.download = `${reportName}.csv`),
        link.click(),
        URL.revokeObjectURL(link.href));
    };
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx("div", {
        className: "page-heading",
        children: jsx.jsxs("div", {
          children: [
            jsx.jsx("h1", { children: "報表及查詢" }),
          ],
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "filters",
            children: [
              jsx.jsx(Field, {
                label: "日期範圍",
                children: jsx.jsx("input", {
                  type: "date",
                  value: dateFrom,
                  onChange: (event) => setDateFrom(event.target.value),
                }),
              }),
              jsx.jsx(Field, {
                label: "至",
                children: jsx.jsx("input", {
                  type: "date",
                  value: dateTo,
                  onChange: (event) => setDateTo(event.target.value),
                }),
              }),
              jsx.jsx(Button, { icon: Na, onClick: applyDateRange, children: "查詢" }),
            ],
          }),
          jsx.jsxs("table", {
            children: [
              jsx.jsx("thead", {
                children: jsx.jsxs("tr", {
                  children: [
                    jsx.jsx("th", { children: "名稱" }),
                    jsx.jsx("th", { children: "建立時間" }),
                    jsx.jsx("th", { children: "格式" }),
                    jsx.jsx("th", { children: "操作" }),
                  ],
                }),
              }),
              jsx.jsx("tbody", {
                children: reports.map((reportName) =>
                  jsx.jsxs(
                    "tr",
                    {
                      children: [
                        jsx.jsx("td", { className: "strong", children: reportName }),
                        jsx.jsx("td", { children: "2026-08-27 10:30" }),
                        jsx.jsx("td", { children: "CSV / Excel" }),
                        jsx.jsx("td", {
                          children: jsx.jsx(Button, {
                            variant: "outline",
                            icon: bd,
                            onClick: () => downloadReport(reportName),
                            children: "下載",
                          }),
                        }),
                      ],
                    },
                    reportName,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
      toast && jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
    ],
  });
}
