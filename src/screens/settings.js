/* ================================================================
 * 畫面 Screens：字典配置／角色權限／帳號管理
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：字典配置／角色權限／帳號管理 ---- */
const SETTINGS_PERMISSIONS = ["臨櫃收件", "申請查看", "上呈主管", "審批申請", "退回補件", "發送通知", "報表匯出", "名單管理", "模板管理", "帳號管理"];
function SettingsScreen({ kind: kind }) {
  const config = DemoData.settings[kind],
    [rows, setRows] = React.useState(config.rows),
    [editing, setEditing] = React.useState(null),
    [editingInvalid, setEditingInvalid] = React.useState(false),
    [toast, setToast] = React.useState(""),
    [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    [filterDraft, setFilterDraft] = React.useState({ name: "", status: "全部" }),
    [filterCriteria, setFilterCriteria] = React.useState(null),
    statusIndex = config.headers.indexOf("狀態"),
    categoryIndex = kind === "dictionary" ? config.headers.indexOf("類別") : -1,
    roleIndex = kind === "accounts" ? config.headers.indexOf("角色") : -1,
    permissionIndex = kind === "roles" ? config.headers.indexOf("權限摘要") : -1,
    updatedIndex = config.headers.length - 1,
    filteredRows = React.useMemo(() => {
      if (!filterCriteria) return rows;
      const name = (filterCriteria.name || "").trim();
      return rows.filter((row) => {
        if (name && !row[0].includes(name)) return false;
        if (
          filterCriteria.status &&
          filterCriteria.status !== "全部" &&
          statusIndex >= 0 &&
          row[statusIndex] !== filterCriteria.status
        )
          return false;
        return true;
      });
    }, [rows, filterCriteria, statusIndex]),
    totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pagedRows = filteredRows
      .map((row) => ({ row: row, rowIndex: rows.indexOf(row) }))
      .slice((currentPage - 1) * pageSize, currentPage * pageSize),
    openAddModal = () =>
      (setEditing({
        rowIndex: undefined,
        values: config.headers.map((header, index) =>
          index === statusIndex
            ? "啟用"
            : index === categoryIndex
              ? "承批公司"
              : index === roleIndex
                ? DemoData.roles[0]
                : "",
        ),
      }),
        setEditingInvalid(false)),
    openEditModal = (row, rowIndex) => (setEditing({ rowIndex: rowIndex, values: [...row] }), setEditingInvalid(false)),
    updateEditingValue = (index, value) => {
      const nextValues = [...editing.values];
      nextValues[index] = value;
      setEditing({ ...editing, values: nextValues });
    },
    togglePermission = (permission) => {
      const current = (editing.values[permissionIndex] || "").split("、").filter(Boolean),
        next = current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission];
      updateEditingValue(permissionIndex, next.join("、"));
    },
    saveRow = () => {
      if (!editing.values[0].trim()) return setEditingInvalid(true);
      const finalValues = [...editing.values];
      (finalValues[0] = finalValues[0].trim(), (finalValues[updatedIndex] = formatNow()));
      (editing.rowIndex === undefined
        ? setRows([finalValues, ...rows])
        : setRows(rows.map((row, index) => (index === editing.rowIndex ? finalValues : row))),
        setEditing(null),
        setToast(editing.rowIndex === undefined ? "已新增" : "已更新"),
        setTimeout(() => setToast(""), 2200));
    };
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx(PageHeader, {
        title: config.title,
        action: jsx.jsxs("div", {
          className: "button-row",
          children: [
            kind === "accounts" &&
              jsx.jsx(Button, {
                variant: "outline",
                icon: rf,
                onClick: () => {
                  (setToast("AD 模擬同步完成：新增 2 個帳號"),
                    setTimeout(() => setToast(""), 2200));
                },
                children: "同步 AD",
              }),
            jsx.jsxs(Button, {
              icon: Wn,
              onClick: openAddModal,
              children: ["新增", kind === "roles" ? "角色" : "資料"],
            }),
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
                label: kind === "accounts" ? "帳號名稱" : "名稱",
                children: jsx.jsx("input", {
                  value: filterDraft.name,
                  onChange: (event) => setFilterDraft({ ...filterDraft, name: event.target.value }),
                }),
              }),
              jsx.jsx(Field, {
                label: "狀態",
                children: jsx.jsxs(Select, {
                  value: filterDraft.status,
                  onChange: (event) => setFilterDraft({ ...filterDraft, status: event.target.value }),
                  children: [
                    jsx.jsx("option", { children: "全部" }),
                    jsx.jsx("option", { children: "啟用" }),
                    jsx.jsx("option", { children: "停用" }),
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
                    config.headers.map((header) => jsx.jsx("th", { children: header }, header)),
                    jsx.jsx("th", { children: "操作" }),
                  ],
                }),
              }),
              jsx.jsx("tbody", {
                children: pagedRows.map(({ row: row, rowIndex: rowIndex }) =>
                  jsx.jsxs(
                    "tr",
                    {
                      children: [
                        row.map((cell, cellIndex) =>
                          jsx.jsx(
                            "td",
                            {
                              className: cellIndex === 0 ? "strong" : "",
                              children:
                                cellIndex === 1 && kind !== "accounts"
                                  ? jsx.jsx(Badge, { children: cell })
                                  : cellIndex === 2 && kind === "accounts"
                                    ? jsx.jsx(Badge, { children: cell })
                                    : cell,
                            },
                            cellIndex,
                          ),
                        ),
                        jsx.jsx("td", {
                          children: jsx.jsxs("div", {
                            className: "icon-actions",
                            children: [
                              jsx.jsx("button", {
                                onClick: () => openEditModal(row, rowIndex),
                                children: jsx.jsx(T0, {}),
                              }),
                              jsx.jsx("button", {
                                className: "danger-icon",
                                onClick: () => setRows(rows.filter((item, i) => i !== rowIndex)),
                                children: jsx.jsx(Ec, {}),
                              }),
                            ],
                          }),
                        }),
                      ],
                    },
                    rowIndex,
                  ),
                ),
              }),
            ],
          }),
          jsx.jsx(Pager, {
            total: filteredRows.length,
            page: page,
            pageSize: pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => (setPageSize(size), setPage(1)),
          }),
        ],
      }),
      editing &&
        jsx.jsxs(Modal, {
          title: `${editing.rowIndex === undefined ? "新增" : "編輯"}${kind === "roles" ? "角色" : "資料"}`,
          onClose: () => setEditing(null),
          children: [
            jsx.jsxs("div", {
              className: "form-grid",
              children: [
                config.headers.map((header, index) => {
                  if (index === updatedIndex || index === permissionIndex) return null;
                  if (index === statusIndex)
                    return jsx.jsx(
                      Field,
                      {
                        label: header,
                        children: jsx.jsxs(Select, {
                          value: editing.values[index],
                          onChange: (event) => updateEditingValue(index, event.target.value),
                          children: [
                            jsx.jsx("option", { children: "啟用" }),
                            jsx.jsx("option", { children: "停用" }),
                          ],
                        }),
                      },
                      header,
                    );
                  if (index === categoryIndex)
                    return jsx.jsx(
                      Field,
                      {
                        label: header,
                        children: jsx.jsxs(Select, {
                          value: editing.values[index],
                          onChange: (event) => updateEditingValue(index, event.target.value),
                          children: ["承批公司", "證件類型", "下拉項字典配置"].map((option) =>
                            jsx.jsx("option", { children: option }, option),
                          ),
                        }),
                      },
                      header,
                    );
                  if (index === roleIndex)
                    return jsx.jsx(
                      Field,
                      {
                        label: header,
                        children: jsx.jsx(Select, {
                          value: editing.values[index],
                          onChange: (event) => updateEditingValue(index, event.target.value),
                          children: DemoData.roles.map((option) =>
                            jsx.jsx("option", { children: option }, option),
                          ),
                        }),
                      },
                      header,
                    );
                  return jsx.jsx(
                    Field,
                    {
                      label: header,
                      required: index === 0,
                      children: jsx.jsx("input", {
                        value: editing.values[index],
                        onChange: (event) => updateEditingValue(index, event.target.value),
                        className: index === 0 && editingInvalid ? "input-error" : "",
                      }),
                    },
                    header,
                  );
                }),
                kind === "roles" &&
                  jsx.jsx(Field, {
                    label: "權限設定",
                    wide: true,
                    children: jsx.jsx("div", {
                      className: "permission-grid",
                      children: SETTINGS_PERMISSIONS.map((permission) =>
                        jsx.jsxs(
                          "label",
                          {
                            children: [
                              jsx.jsx("input", {
                                type: "checkbox",
                                checked: (editing.values[permissionIndex] || "").split("、").includes(permission),
                                onChange: () => togglePermission(permission),
                              }),
                              permission,
                            ],
                          },
                          permission,
                        ),
                      ),
                    }),
                  }),
              ],
            }),
            editingInvalid &&
              jsx.jsx("div", { className: "field-error", children: `請填寫${config.headers[0]}。` }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx("span", {}),
                jsx.jsx(Button, { onClick: saveRow, children: "儲存" }),
              ],
            }),
          ],
        }),
      toast && jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
    ],
  });
}
