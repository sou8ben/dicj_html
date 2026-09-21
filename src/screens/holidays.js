/* ================================================================
 * 畫面 Screens：公眾假期管理
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：公眾假期管理 ---- */
function HolidaysScreen() {
  const [rows, setRows] = React.useState(DemoData.holidays),
    [toast, setToast] = React.useState(""),
    [editing, setEditing] = React.useState(null),
    [sort, setSort] = React.useState({ key: null, direction: "asc" }),
    onSort = (nextSort) => setSort(nextSort),
    fileInputRef = React.useRef(null),
    showToast = (message) => (setToast(message), setTimeout(() => setToast(""), 2600)),
    sortRows = (list) =>
      [...list].sort((a, b) =>
        a.date === b.date ? a.name.localeCompare(b.name, "zh-Hant") : a.date < b.date ? -1 : 1,
      ),
    holidayKey = (row) => `${row.name}|${row.date}`,
    handleImport = (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = parseICS(String(reader.result));
        if (!imported.length) return showToast("匯入失敗：檔案中沒有可匯入的假期事件");
        const existingKeys = new Set(rows.map((row) => holidayKey(row))),
          fresh = imported.filter((item) => !existingKeys.has(holidayKey(item)));
        fresh.length && setRows(sortRows([...rows, ...fresh]));
        showToast(`匯入完成：成功 ${fresh.length} 筆，重複 ${imported.length - fresh.length} 筆`);
      };
      reader.readAsText(file, "UTF-8");
    },
    removeRow = (key) =>
      (setRows((prev) => prev.filter((item) => holidayKey(item) !== key)), showToast("假期資料已刪除"));
  const saveEdit = () => {
    const name = (editing.name || "").trim() || "未命名假期",
      dateStart = editing.date || "",
      savedDate =
        editing.rangeEnd && dateStart && dateStart < editing.rangeEnd
          ? `${dateStart} 至 ${editing.rangeEnd}`
          : dateStart;
    if (!dateStart) return showToast("請填寫假期日期");
    if (rows.some((row) => holidayKey(row) !== editing.key && row.name === name && row.date === savedDate))
      return showToast("已存在名稱與日期相同的假期資料");
    (setRows(
      sortRows(
        rows.map((row) =>
          holidayKey(row) === editing.key ? { name: name, date: savedDate, created: editing.created } : row,
        ),
      ),
    ),
      setEditing(null),
      showToast("假期資料已更新"));
  };
  const sortedRows = React.useMemo(
    () =>
      sortRowsForDisplay(rows, sort, {
        year: (row) => row.date.slice(0, 4),
        name: (row) => row.name,
        date: (row) => row.date,
        created: (row) => row.created,
      }),
    [rows, sort],
  );
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx(PageHeader, {
        title: "公眾假期管理",
        action: jsx.jsx(Button, {
          icon: Sd,
          onClick: () => fileInputRef.current && fileInputRef.current.click(),
          children: "匯入 ICS",
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsx("div", {
            className: "table-wrap",
            children: jsx.jsxs("table", {
              children: [
                jsx.jsx("thead", {
                  children: jsx.jsxs("tr", {
                    children: [
                      jsx.jsx(SortableTh, { label: "年度", sortKey: "year", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "假期名稱", sortKey: "name", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "假期日期", sortKey: "date", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "創建時間", sortKey: "created", sort: sort, onSort: onSort }),
                      jsx.jsx("th", { children: "操作" }),
                    ],
                  }),
                }),
                jsx.jsx("tbody", {
                  children:
                    rows.length === 0
                      ? jsx.jsx(TableEmptyState, { cols: 5 })
                      : sortedRows.map((row) =>
                          jsx.jsxs(
                            "tr",
                            {
                              children: [
                                jsx.jsx("td", { children: row.date.slice(0, 4) }),
                                jsx.jsx("td", { className: "strong", children: row.name }),
                                jsx.jsx("td", { children: row.date }),
                                jsx.jsx("td", { children: row.created }),
                                jsx.jsx("td", {
                                  children: jsx.jsxs("div", {
                                    className: "icon-actions",
                                    children: [
                                      jsx.jsx("button", {
                                        "aria-label": "編輯",
                                        onClick: () =>
                                          setEditing({
                                            name: row.name,
                                            date: row.date.slice(0, 10),
                                            created: row.created,
                                            key: holidayKey(row),
                                            rangeEnd: row.date.includes(" 至 ") ? row.date.slice(row.date.indexOf(" 至 ") + 3) : "",
                                          }),
                                        children: jsx.jsx(T0, {}),
                                      }),
                                      jsx.jsx("button", {
                                        className: "danger-icon",
                                        "aria-label": "刪除",
                                        onClick: () => removeRow(holidayKey(row)),
                                        children: jsx.jsx(Ec, {}),
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            },
                            `${row.name}-${row.date}`,
                          ),
                        ),
                }),
              ],
            }),
          }),
        ],
      }),
      jsx.jsx("input", {
        ref: fileInputRef,
        type: "file",
        accept: ".ics,text/calendar",
        style: { display: "none" },
        onChange: handleImport,
      }),
      editing &&
        jsx.jsxs(Modal, {
          title: "編輯公眾假期",
          onClose: () => setEditing(null),
          children: [
            jsx.jsxs("div", {
              className: "form-grid",
              children: [
                jsx.jsx(Field, {
                  label: "假期名稱",
                  required: true,
                  children: jsx.jsx("input", {
                    value: editing.name,
                    onChange: (event) => setEditing({ ...editing, name: event.target.value }),
                  }),
                }),
                jsx.jsx(Field, {
                  label: "假期日期",
                  required: true,
                  children: jsx.jsx("input", {
                    type: "date",
                    value: editing.date,
                    onChange: (event) => setEditing({ ...editing, date: event.target.value }),
                  }),
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx("span", {}),
                jsx.jsx(Button, {
                  onClick: saveEdit,
                  children: "儲存",
                }),
              ],
            }),
          ],
        }),
      toast && jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
    ],
  });
}
