/* ================================================================
 * 畫面 Screens：內容模板管理
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：內容模板管理 ---- */
function TemplatesScreen() {
  const [templates, setTemplates] = React.useState(DemoData.templates),
    [editing, setEditing] = React.useState(null),
    [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    [filterDraft, setFilterDraft] = React.useState({ name: "", type: "全部" }),
    [filterCriteria, setFilterCriteria] = React.useState(null),
    filteredTemplates = React.useMemo(() => {
      if (!filterCriteria) return templates;
      const name = (filterCriteria.name || "").trim();
      return templates.filter((template) => {
        if (name && !template.name.includes(name)) return false;
        if (filterCriteria.type && filterCriteria.type !== "全部" && template.type !== filterCriteria.type) return false;
        return true;
      });
    }, [templates, filterCriteria]),
    totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pagedTemplates = filteredTemplates
      .map((template) => ({ template: template, index: templates.indexOf(template) }))
      .slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx(PageHeader, {
        title: "內容模板管理",
        action: jsx.jsx(Button, {
          icon: Wn,
          onClick: () =>
            setEditing({ name: "", type: "電子通知", content: "", active: true }),
          children: "新增模板",
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "filters",
            children: [
              jsx.jsx(Field, {
                label: "名稱",
                children: jsx.jsx("input", {
                  value: filterDraft.name,
                  onChange: (event) => setFilterDraft({ ...filterDraft, name: event.target.value }),
                }),
              }),
              jsx.jsx(Field, {
                label: "類別",
                children: jsx.jsxs(Select, {
                  value: filterDraft.type,
                  onChange: (event) => setFilterDraft({ ...filterDraft, type: event.target.value }),
                  children: [
                    jsx.jsx("option", { children: "全部" }),
                    jsx.jsx("option", { children: "電子通知" }),
                    jsx.jsx("option", { children: "短信" }),
                  ],
                }),
              }),
              jsx.jsx(Button, {
                icon: Na,
                onClick: () => (setFilterCriteria(filterDraft), setPage(1)),
                children: "查詢",
              }),
            ],
          }),
          jsx.jsxs("table", {
            children: [
              jsx.jsx("thead", {
                children: jsx.jsxs("tr", {
                  children: [
                    jsx.jsx("th", { children: "名稱" }),
                    jsx.jsx("th", { children: "類別" }),
                    jsx.jsx("th", { children: "內容" }),
                    jsx.jsx("th", { children: "狀態" }),
                    jsx.jsx("th", { children: "更新時間" }),
                    jsx.jsx("th", { children: "操作" }),
                  ],
                }),
              }),
              jsx.jsx("tbody", {
                children: pagedTemplates.map(({ template: template, index: index }) =>
                  jsx.jsxs(
                    "tr",
                    {
                      children: [
                        jsx.jsx("td", { className: "strong", children: template.name }),
                        jsx.jsx("td", { children: template.type }),
                        jsx.jsx("td", {
                          className: "truncate",
                          children: template.content,
                        }),
                        jsx.jsx("td", {
                          children: jsx.jsx(Badge, {
                            children: template.active ? "啟用" : "停用",
                          }),
                        }),
                        jsx.jsx("td", { children: "2026-08-27 09:40" }),
                        jsx.jsx("td", {
                          children: jsx.jsxs("div", {
                            className: "icon-actions",
                            children: [
                              jsx.jsx("button", {
                                onClick: () => setEditing({ ...template, index: index }),
                                children: jsx.jsx(T0, {}),
                              }),
                              jsx.jsx("button", {
                                className: "danger-icon",
                                onClick: () => setTemplates(templates.filter((item, i) => i !== index)),
                                children: jsx.jsx(Ec, {}),
                              }),
                            ],
                          }),
                        }),
                      ],
                    },
                    template.name,
                  ),
                ),
              }),
            ],
          }),
          jsx.jsx(Pager, {
            total: filteredTemplates.length,
            page: page,
            pageSize: pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => (setPageSize(size), setPage(1)),
          }),
        ],
      }),
      editing &&
        jsx.jsxs(Modal, {
          title: editing.index === undefined ? "新增模板" : "編輯模板",
          onClose: () => setEditing(null),
          children: [
            jsx.jsxs("div", {
              className: "form-grid",
              children: [
                jsx.jsx(Field, {
                  label: "名稱",
                  children: jsx.jsx("input", {
                    value: editing.name,
                    onChange: (event) => setEditing({ ...editing, name: event.target.value }),
                  }),
                }),
                jsx.jsx(Field, {
                  label: "類別",
                  children: jsx.jsxs(Select, {
                    value: editing.type,
                    onChange: (event) => setEditing({ ...editing, type: event.target.value }),
                    children: [
                      jsx.jsx("option", { children: "電子通知" }),
                      jsx.jsx("option", { children: "短信" }),
                    ],
                  }),
                }),
                jsx.jsx(Field, {
                  label: "狀態",
                  children: jsx.jsxs(Select, {
                    value: editing.active ? "啟用" : "停用",
                    onChange: (event) =>
                      setEditing({ ...editing, active: event.target.value === "啟用" }),
                    children: [
                      jsx.jsx("option", { children: "啟用" }),
                      jsx.jsx("option", { children: "停用" }),
                    ],
                  }),
                }),
                jsx.jsx(Field, {
                  label: "內容",
                  wide: true,
                  children: jsx.jsx("textarea", {
                    value: editing.content,
                    onChange: (event) => setEditing({ ...editing, content: event.target.value }),
                  }),
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "helper",
              children: [
                "可用變數：",
                "{{申請人姓名}}、{{禁入編號}}、{{到期日}}",
              ],
            }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx("span", {}),
                jsx.jsx(Button, {
                  onClick: () => {
                    (editing.index === undefined
                      ? setTemplates([...templates, { ...editing, name: editing.name || "新通知模板" }])
                      : setTemplates(templates.map((template, index) => (index === editing.index ? editing : template))),
                      setEditing(null));
                  },
                  children: "儲存",
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
