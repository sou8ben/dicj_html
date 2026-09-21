/* ================================================================
 * 畫面 Screens：操作日誌
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：操作日誌 ---- */
function OperationLogsScreen() {
  const logs = DemoData.logs,
    [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    totalPages = Math.max(1, Math.ceil(logs.length / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pagedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx(PageHeader, {
        title: "操作日誌",
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "filters",
            children: [
              jsx.jsx(Field, { label: "帳號名稱", children: jsx.jsx("input", {}) }),
              jsx.jsx(Field, {
                label: "操作類型",
                children: jsx.jsxs(Select, {
                  value: "全部",
                  children: [
                    jsx.jsx("option", { children: "全部" }),
                    jsx.jsx("option", { children: "建立" }),
                    jsx.jsx("option", { children: "更新" }),
                    jsx.jsx("option", { children: "刪除" }),
                    jsx.jsx("option", { children: "審批" }),
                  ],
                }),
              }),
              jsx.jsx(Field, {
                label: "開始日期",
                children: jsx.jsx("input", { type: "date" }),
              }),
              jsx.jsx(Field, {
                label: "結束日期",
                children: jsx.jsx("input", { type: "date" }),
              }),
              jsx.jsx(Button, { icon: Na, children: "查詢" }),
            ],
          }),
          jsx.jsxs("table", {
            children: [
              jsx.jsx("thead", {
                children: jsx.jsxs("tr", {
                  children: [
                    jsx.jsx("th", { children: "帳號" }),
                    jsx.jsx("th", { children: "操作類型" }),
                    jsx.jsx("th", { children: "操作時間" }),
                    jsx.jsx("th", { children: "操作" }),
                    jsx.jsx("th", { children: "結果" }),
                  ],
                }),
              }),
              jsx.jsx("tbody", {
                children: pagedLogs.map((row, rowIndex) =>
                  jsx.jsx(
                    "tr",
                    {
                      children: row.map((cell, cellIndex) =>
                        jsx.jsx(
                          "td",
                          {
                            className: cellIndex === 0 ? "strong" : "",
                            children: cellIndex === 4 ? jsx.jsx(Badge, { children: cell }) : cell,
                          },
                          cellIndex,
                        ),
                      ),
                    },
                    rowIndex,
                  ),
                ),
              }),
            ],
          }),
          jsx.jsx(Pager, {
            total: logs.length,
            page: page,
            pageSize: pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => (setPageSize(size), setPage(1)),
          }),
        ],
      }),
    ],
  });
}
