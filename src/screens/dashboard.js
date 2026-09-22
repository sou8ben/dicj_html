/* ================================================================
 * 畫面 Screens：工作台 Dashboard
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：工作台 ---- */
function DashboardScreen({ applications: applications, onOpen: onOpen, role: role }) {
  const [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    [filterCriteria, setFilterCriteria] = React.useState(null),
    today = new Date("2026-08-29"),
    actionable = getActionableApplications(applications, role),
    filteredActionable = React.useMemo(
      () => filterApplicationRows(actionable, filterCriteria),
      [actionable, filterCriteria],
    ),
    overdue = actionable.filter(
      (app) =>
        today.getTime() - new Date(app.time.replace(" ", "T")).getTime() >
        DemoData.slaDays * 864e5,
    ),
    countsByStatus = actionable.reduce((app, count) => ({ ...app, [count.status]: (app[count.status] || 0) + 1 }), {}),
    statusSummary = Object.entries(countsByStatus)
      .map(([app, count]) => `${app} ${count}`)
      .join(" · ") || "目前沒有待辦案件",
    overdueSummary =
      overdue.length > 0
        ? `最久 ${Math.floor(
            (today.getTime() -
              Math.min(
                ...overdue.map((app) =>
                  new Date(app.time.replace(" ", "T")).getTime(),
                ),
              )) /
              864e5,
          )} 天未處理`
        : "目前沒有逾期案件";
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx("div", {
        className: "page-heading",
        children: jsx.jsx("div", {
          children: jsx.jsx("h1", { children: "工作台" }),
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "panel-head",
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("h2", { children: "待辦申請" }),
                  jsx.jsx("p", { children: "按優先次序顯示需要處理的案件" }),
                ],
              }),
              jsx.jsxs("div", {
                className: "heading-metrics",
                children: [
                  jsx.jsxs("article", {
                    className: "heading-metric",
                    children: [
                      jsx.jsx("span", {
                        className: "heading-metric-icon",
                        children: jsx.jsx(V0, { size: 20, weight: "duotone" }),
                      }),
                      jsx.jsxs("div", {
                        className: "heading-metric-body",
                        children: [
                          jsx.jsxs("div", {
                            className: "heading-metric-top",
                            children: [
                              jsx.jsx("strong", { className: "heading-metric-value", children: actionable.length }),
                              jsx.jsx("span", { className: "heading-metric-label", children: "項待辦" }),
                            ],
                          }),
                          jsx.jsx("small", { className: "heading-metric-sub", children: statusSummary }),
                        ],
                      }),
                    ],
                  }),
                  jsx.jsx("span", { className: "heading-metric-divider" }),
                  jsx.jsxs("article", {
                    className: "heading-metric heading-metric-danger",
                    children: [
                      jsx.jsx("span", {
                        className: "heading-metric-icon",
                        children: jsx.jsx(B8, { size: 20, weight: "duotone" }),
                      }),
                      jsx.jsxs("div", {
                        className: "heading-metric-body",
                        children: [
                          jsx.jsxs("div", {
                            className: "heading-metric-top",
                            children: [
                              jsx.jsx("strong", { className: "heading-metric-value", children: overdue.length }),
                              jsx.jsx("span", { className: "heading-metric-label", children: "項超時" }),
                            ],
                          }),
                          jsx.jsx("small", { className: "heading-metric-sub", children: overdueSummary }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          jsx.jsx(SearchFilters, { onSearch: (criteria) => (setFilterCriteria(criteria), setPage(1)) }),
          jsx.jsx(ApplicationsTable, {
            rows: filteredActionable,
            onOpen: onOpen,
            actionLabel: "查看處理",
            page: page,
            pageSize: pageSize,
          }),
          jsx.jsx(Pager, {
            total: filteredActionable.length,
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
