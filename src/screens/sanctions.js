/* ================================================================
 * 畫面 Screens：行政處罰名單
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：行政處罰名單 ---- */
const EMPTY_SANCTION_FILTER = { name: "", docType: "全部", docNo: "", scope: "" };
function filterSanctionRows(rows, criteria) {
  if (!criteria) return rows;
  const name = (criteria.name || "").trim(),
    docNo = (criteria.docNo || "").trim(),
    scope = (criteria.scope || "").trim();
  return rows.filter((record) => {
    if (name && !`${record.zh || ""}${record.en || ""}`.includes(name)) return false;
    if (criteria.docType && criteria.docType !== "全部" && record.doc !== criteria.docType) return false;
    if (docNo && !(record.no || "").includes(docNo)) return false;
    if (scope && !(record.scope || "").includes(scope)) return false;
    return true;
  });
}
function SanctionsScreen() {
  const [rows, setRows] = React.useState(DemoData.sanctions),
    [editing, setEditing] = React.useState(null),
    [editingInvalid, setEditingInvalid] = React.useState([]),
    [toast, setToast] = React.useState(""),
    [sort, setSort] = React.useState({ key: null, direction: "asc" }),
    [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    [filterDraft, setFilterDraft] = React.useState(EMPTY_SANCTION_FILTER),
    [filterCriteria, setFilterCriteria] = React.useState(null),
    onSort = (nextSort) => setSort(nextSort),
    filteredRows = React.useMemo(() => filterSanctionRows(rows, filterCriteria), [rows, filterCriteria]),
    sortedRows = React.useMemo(
      () =>
        sortRowsForDisplay(filteredRows, sort, {
          zh: (record) => record.zh,
          en: (record) => record.en,
          doc: (record) => record.doc,
          no: (record) => record.no,
          scope: (record) => record.scope,
          start: (record) => record.start,
          end: (record) => record.end,
        }),
      [filteredRows, sort],
    ),
    totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pagedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    openAddModal = () =>
      (setEditing({ zh: "", en: "", doc: "澳門居民身份證", no: "", scope: "全部", start: "", end: "" }),
        setEditingInvalid([])),
    openEditModal = (record, index) => (setEditing({ ...record, index: index }), setEditingInvalid([])),
    updateEditing = (field, value) => setEditing({ ...editing, [field]: value }),
    saveRecord = () => {
      const missing = [];
      if (!editing.zh.trim()) missing.push("zh");
      if (!editing.en.trim()) missing.push("en");
      if (!editing.doc) missing.push("doc");
      if (!editing.no.trim()) missing.push("no");
      if (!editing.start) missing.push("start");
      if (!editing.end) missing.push("end");
      if (missing.length) return setEditingInvalid(missing);
      const savedRecord = {
        zh: editing.zh.trim(),
        en: editing.en.trim(),
        doc: editing.doc,
        no: editing.no.trim(),
        scope: editing.scope.trim() || "全部",
        start: editing.start,
        end: editing.end,
      };
      (editing.index === undefined
        ? setRows([savedRecord, ...rows])
        : setRows(rows.map((item, index) => (index === editing.index ? savedRecord : item))),
        setEditing(null),
        setToast(editing.index === undefined ? "行政處罰紀錄已新增" : "行政處罰紀錄已更新"),
        setTimeout(() => setToast(""), 2200));
    };
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsxs("div", {
        className: "page-heading",
        children: [
          jsx.jsxs("div", {
            children: [
              jsx.jsx("h1", { children: "行政處罰名單" }),
            ],
          }),
          jsx.jsxs("div", {
            className: "button-row",
            children: [
              jsx.jsx(Button, {
                variant: "outline",
                icon: Sd,
                onClick: () => setToast("模擬匯入完成：成功 8 筆，重複 1 筆"),
                children: "匯入資料",
              }),
              jsx.jsx(Button, {
                icon: Wn,
                onClick: openAddModal,
                children: "新增資料",
              }),
            ],
          }),
        ],
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "filters",
            children: [
              jsx.jsx(Field, {
                label: "姓名",
                children: jsx.jsx("input", {
                  value: filterDraft.name,
                  onChange: (event) => setFilterDraft({ ...filterDraft, name: event.target.value }),
                }),
              }),
              jsx.jsx(Field, {
                label: "證件類型",
                children: jsx.jsxs(Select, {
                  value: filterDraft.docType,
                  onChange: (event) => setFilterDraft({ ...filterDraft, docType: event.target.value }),
                  children: [
                    jsx.jsx("option", { children: "全部" }),
                    jsx.jsx("option", { children: "澳門居民身份證" }),
                    jsx.jsx("option", { children: "外地僱員身份認別證" }),
                    jsx.jsx("option", { children: "護照" }),
                  ],
                }),
              }),
              jsx.jsx(Field, {
                label: "證件號碼",
                children: jsx.jsx("input", {
                  value: filterDraft.docNo,
                  onChange: (event) => setFilterDraft({ ...filterDraft, docNo: event.target.value }),
                }),
              }),
              jsx.jsx(Field, {
                label: "範圍",
                children: jsx.jsx("input", {
                  value: filterDraft.scope,
                  onChange: (event) => setFilterDraft({ ...filterDraft, scope: event.target.value }),
                }),
              }),
              jsx.jsx(Button, {
                icon: Na,
                onClick: () => (setFilterCriteria(filterDraft), setPage(1)),
                children: "查詢",
              }),
            ],
          }),
          jsx.jsx("div", {
            className: "table-wrap",
            children: jsx.jsxs("table", {
              children: [
                jsx.jsx("thead", {
                  children: jsx.jsxs("tr", {
                    children: [
                      jsx.jsx(SortableTh, { label: "姓名（中文）", sortKey: "zh", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "姓名（外文）", sortKey: "en", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "證件類型", sortKey: "doc", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "證件編號", sortKey: "no", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "禁入範圍", sortKey: "scope", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "生效時間", sortKey: "start", sort: sort, onSort: onSort }),
                      jsx.jsx(SortableTh, { label: "廢止時間", sortKey: "end", sort: sort, onSort: onSort }),
                      jsx.jsx("th", { children: "操作" }),
                    ],
                  }),
                }),
                jsx.jsx("tbody", {
                  children: pagedRows.map((record) =>
                    jsx.jsxs(
                      "tr",
                      {
                        children: [
                          jsx.jsx("td", { className: "strong", children: record.zh }),
                          jsx.jsx("td", { children: record.en }),
                          jsx.jsx("td", { children: record.doc }),
                          jsx.jsx("td", { children: record.no }),
                          jsx.jsx("td", { children: record.scope }),
                          jsx.jsx("td", { children: record.start }),
                          jsx.jsx("td", { children: record.end }),
                          jsx.jsx("td", {
                            children: jsx.jsxs("div", {
                              className: "icon-actions",
                              children: [
                                jsx.jsx("button", {
                                  "aria-label": "編輯",
                                  onClick: () => openEditModal(record, rows.findIndex((item) => item.no === record.no)),
                                  children: jsx.jsx(T0, {}),
                                }),
                                jsx.jsx("button", {
                                  className: "danger-icon",
                                  "aria-label": "刪除",
                                  onClick: () => setRows(rows.filter((item) => item.no !== record.no)),
                                  children: jsx.jsx(Ec, {}),
                                }),
                              ],
                            }),
                          }),
                        ],
                      },
                      record.no,
                    ),
                  ),
                }),
              ],
            }),
          }),
          jsx.jsx(Pager, {
            total: sortedRows.length,
            page: page,
            pageSize: pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => (setPageSize(size), setPage(1)),
          }),
        ],
      }),
      editing &&
        jsx.jsxs(Modal, {
          title: editing.index === undefined ? "新增行政處罰資料" : "編輯行政處罰資料",
          onClose: () => setEditing(null),
          children: [
            jsx.jsxs("div", {
              className: "form-grid",
              children: [
                jsx.jsx(Field, {
                  label: "姓名（中文）",
                  required: true,
                  children: jsx.jsx("input", {
                    value: editing.zh,
                    onChange: (event) => updateEditing("zh", event.target.value),
                    className: editingInvalid.includes("zh") ? "input-error" : "",
                  }),
                }),
                jsx.jsx(Field, {
                  label: "姓名（外文）",
                  required: true,
                  children: jsx.jsx("input", {
                    value: editing.en,
                    onChange: (event) => updateEditing("en", event.target.value),
                    className: editingInvalid.includes("en") ? "input-error" : "",
                  }),
                }),
                jsx.jsx(Field, {
                  label: "證件類型",
                  required: true,
                  children: jsx.jsxs(Select, {
                    value: editing.doc,
                    onChange: (event) => updateEditing("doc", event.target.value),
                    children: [
                      jsx.jsx("option", { children: "澳門居民身份證" }),
                      jsx.jsx("option", { children: "外地僱員身份認別證" }),
                      jsx.jsx("option", { children: "護照" }),
                    ],
                  }),
                }),
                jsx.jsx(Field, {
                  label: "證件號碼",
                  required: true,
                  children: jsx.jsx("input", {
                    value: editing.no,
                    onChange: (event) => updateEditing("no", event.target.value),
                    className: editingInvalid.includes("no") ? "input-error" : "",
                  }),
                }),
                jsx.jsx(Field, {
                  label: "禁入範圍",
                  children: jsx.jsx("input", {
                    value: editing.scope,
                    onChange: (event) => updateEditing("scope", event.target.value),
                    placeholder: "全部",
                  }),
                }),
                jsx.jsx(Field, {
                  label: "起訖日期",
                  required: true,
                  children: jsx.jsx("input", {
                    type: "date",
                    value: editing.start,
                    onChange: (event) => updateEditing("start", event.target.value),
                    className: editingInvalid.includes("start") ? "input-error" : "",
                  }),
                }),
                jsx.jsx(Field, {
                  label: "到期日",
                  required: true,
                  children: jsx.jsx("input", {
                    type: "date",
                    value: editing.end,
                    onChange: (event) => updateEditing("end", event.target.value),
                    className: editingInvalid.includes("end") ? "input-error" : "",
                  }),
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx("span", {}),
                jsx.jsx(Button, { onClick: saveRecord, children: "儲存" }),
              ],
            }),
          ],
        }),
      toast && jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
    ],
  });
}
