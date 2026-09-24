/* ================================================================
 * 共用元件 Components（按鈕／表格／表單控制／頁首／彈窗等，供各 screens/*.js 使用）
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.3 共用元件 Components（按鈕、徽章、欄位、選單等）---- */
function Button({
  children: children,
  variant: variant = "primary",
  icon: icon,
  onClick: onClick,
  type: type = "button",
  disabled: disabled = false,
}) {
  return jsx.jsxs("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: `btn btn-${variant}`,
    children: [icon && jsx.jsx(icon, { size: 17, weight: "bold" }), children],
  });
}
function Badge({ children: children }) {
  return jsx.jsx("span", {
    className: `status status-${statusColor(String(children))}`,
    children: children,
  });
}
function InlineSeparatedList({ items: items, empty: empty = "—" }) {
  const values = (Array.isArray(items) ? items : String(items || "").split("、"))
    .map((item) => String(item).trim())
    .filter(Boolean);
  if (!values.length) return empty;
  return jsx.jsx("span", {
    className: "inline-separated-list",
    children: values.map((item, index) =>
      jsx.jsxs(
        "span",
        {
          className: "inline-separated-item",
          children: [item, index < values.length - 1 ? "、" : ""],
        },
        `${item}-${index}`,
      ),
    ),
  });
}
const containsSelect = (node) => {
  if (!node || typeof node !== "object") return false;
  if (Array.isArray(node)) return node.some(containsSelect);
  if (node.type === Select) return true;
  const kids = node.props && node.props.children;
  return kids ? (Array.isArray(kids) ? kids : [kids]).some(containsSelect) : false;
};
function Field({ label: label, required: required, children: children, wide: wide }) {
  const className = wide ? "field wide" : "field",
    content = [
      jsx.jsxs("span", { children: [label, required && jsx.jsx("b", { children: "*" })] }),
      children,
    ];
  // 自訂 Select 非原生表單控件，label 會把空白處點擊轉發到其按鈕而意外展開選單，改用 div 包裝
  return containsSelect(children)
    ? jsx.jsxs("div", { className: className, children: content })
    : jsx.jsxs("label", { className: className, children: content });
}
function Select({ children: children, value: value, onChange: onChange, className: className = "" }) {
  const [isOpen, setIsOpen] = React.useState(false),
    [localValue, setLocalValue] = React.useState(value),
    wrapRef = React.useRef(null),
    options = (Array.isArray(children) ? children : [children]).map((opt) => ({
      value: opt.props.value ?? opt.props.children,
      label: opt.props.children,
    })),
    current = options.find((opt) => opt.value === (onChange ? value : localValue)) || (onChange && !value ? null : options[0]);
  React.useEffect(() => {
    if (!isOpen) return;
    const opt = (event) => {
        event.target && !wrapRef.current.contains(event.target) && setIsOpen(false);
      },
      handleEscape = (event) => event.key === "Escape" && setIsOpen(false);
    return (
      window.addEventListener("click", opt),
      window.addEventListener("keydown", handleEscape),
      () => (
        window.removeEventListener("click", opt),
        window.removeEventListener("keydown", handleEscape)
      )
    );
  }, [isOpen]);
  return jsx.jsxs("div", {
    ref: wrapRef,
    className: "select-wrap" + (className ? ` ${className}` : ""),
    children: [
      jsx.jsxs("button", {
        type: "button",
        className: "select-btn" + (isOpen ? " open" : ""),
        onClick: () => setIsOpen(!isOpen),
        children: [
          jsx.jsx("span", { className: "select-text", children: current ? current.label : "" }),
          jsx.jsx(Ad, { className: "select-caret", size: 14, weight: "bold" }),
        ],
      }),
      isOpen &&
        jsx.jsx("div", {
          className: "dropdown-panel",
          children: options.map((opt) =>
            jsx.jsx(
              "button",
              {
                type: "button",
                className: opt.value === (onChange ? value : localValue) ? "selected" : "",
                onClick: () => {
                  (onChange ? onChange({ target: { value: opt.value } }) : setLocalValue(opt.value), setIsOpen(false));
                },
                children: opt.label,
              },
              opt.value,
            ),
          ),
        }),
    ],
  });
}
function TableEmptyState({ cols: cols }) {
  return jsx.jsx("tr", {
    className: "empty-state",
    children: jsx.jsx("td", {
      colSpan: cols,
      children: jsx.jsxs("div", {
        children: [
          jsx.jsx("strong", { children: "目前沒有符合條件的案件" }),
          jsx.jsx("span", { children: "調整篩選條件後再試一次。" }),
        ],
      }),
    }),
  });
}

/* ---- 可點擊排序的表頭（table-wrap 通用）---- */
function compareSortValues(a, b) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "zh-Hant", { numeric: true });
}
function toggleSortKey(sort, key) {
  return sort.key === key
    ? { key: key, direction: sort.direction === "asc" ? "desc" : "asc" }
    : { key: key, direction: "asc" };
}
function sortRowsForDisplay(rows, sort, accessors) {
  const accessor = sort && sort.key && accessors[sort.key];
  if (!accessor) return rows;
  const factor = sort.direction === "desc" ? -1 : 1;
  return rows
    .map((row, index) => ({ row: row, index: index }))
    .sort((a, b) => {
      const result = compareSortValues(accessor(a.row), accessor(b.row));
      return result !== 0 ? result * factor : a.index - b.index;
    })
    .map((entry) => entry.row);
}
function SortableTh({ label: label, sortKey: sortKey, sort: sort, onSort: onSort }) {
  const active = sort.key === sortKey;
  return jsx.jsx("th", {
    className: "th-sortable" + (active ? " is-active" : ""),
    onClick: () => onSort(toggleSortKey(sort, sortKey)),
    children: jsx.jsxs("span", {
      className: "th-sort-label",
      children: [
        label,
        jsx.jsx("span", {
          className: "sort-icon",
          "aria-hidden": "true",
          children: active ? (sort.direction === "asc" ? "▲" : "▼") : "⇅",
        }),
      ],
    }),
  });
}

const WizardSteps = {
  // 非廢止流程在選擇申請方式前尚不知為本人或親屬，先用最短的本人流程顯示
  intake: ["身份驗證", "核查紀錄", "選擇申請方式", "填寫申請資料", "確認並提交"],
  relative: [
    "身份驗證",
    "核查紀錄",
    "選擇申請方式",
    "填寫申請資料",
    "填寫親屬證件資料",
    "填寫親屬資料",
    "確認並提交",
  ],
  terminate: ["身份驗證", "核查紀錄", "填寫廢止資料", "確認並提交"],
};

function WizardProgress({ current: current, steps: steps }) {
  const stepLabels = steps || ["身份驗證", "核查紀錄", "填寫申請資料", "確認並提交"];
  return jsx.jsx("ol", {
    className: "wizard-progress",
    "aria-label": "申請進度",
    children: stepLabels.map((stepLabel, stepIndex) => {
      const stepNumber = stepIndex + 1;
      return jsx.jsxs(
        "li",
        {
          className: stepNumber < current ? "done" : stepNumber === current ? "current" : "",
          "aria-current": stepNumber === current ? "step" : undefined,
          children: stepLabel,
        },
        stepLabel,
      );
    }),
  });
}

function ProcessTimeline({ application: application }) {
  const stepLabels = application.source === "一戶通"
      ? ["待處理", "補件處理", "待複核", "待審批", "已審批", "通知取件", "完成"]
      : ["待處理", "待審批", "已審批", "完成"],
    stepIndexByStatus = application.source === "一戶通"
      ? {
          待處理: 0,
          已通知補件: 1,
          退回: 1,
          待複核: 2,
          待審批: 3,
          已審批: 4,
          已通知取件: 5,
          完成: 6,
        }
      : { 待處理: 0, 待審批: 1, 退回: 1, 已審批: 2, 完成: 3, 作廢: 3 },
    currentStepIndex = stepIndexByStatus[application.status] ?? 0,
    isCancelled = application.status === "作廢",
    isReturned = application.status === "退回";
  return jsx.jsxs("div", {
    className: "process-block",
    children: [
      jsx.jsxs("div", {
        className: "process-block-head",
        children: [
          jsx.jsx("b", { children: "案件流程" })
        ],
      }),
      jsx.jsx("ol", {
        className: `process-progress${isCancelled ? " cancelled" : ""}`,
        "aria-label": "案件流程進度",
        children: stepLabels.map((label, stepIndex) =>
          jsx.jsx(
            "li",
            {
              className: stepIndex < currentStepIndex ? "done" : stepIndex === currentStepIndex ? "current" : "",
              "aria-current": stepIndex === currentStepIndex ? "step" : undefined,
              children:
                stepIndex === currentStepIndex && isCancelled
                  ? "作廢"
                  : stepIndex === currentStepIndex && isReturned
                    ? "退回"
                    : label,
            },
            label,
          ),
        ),
      }),
    ],
  });
}
function buildPagerPageList(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]),
    sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b),
    list = [];
  let prev = null;
  for (const page of sorted) {
    prev !== null && page - prev > 1 && list.push("…");
    (list.push(page), (prev = page));
  }
  return list;
}
function Pager({
  total: total = 0,
  page: page = 1,
  pageSize: pageSize = 10,
  onPageChange: onPageChange,
  onPageSizeChange: onPageSizeChange,
  pageSizeOptions: pageSizeOptions = [10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pageList = buildPagerPageList(currentPage, totalPages);
  return jsx.jsxs("div", {
    className: "pager",
    children: [
      jsx.jsx("span", { children: `共 ${total} 條` }),
      jsx.jsx(Select, {
        value: pageSize,
        onChange: (event) => onPageSizeChange && onPageSizeChange(Number(event.target.value)),
        children: pageSizeOptions.map((size) => jsx.jsx("option", { value: size, children: `${size} 條/頁` }, size)),
      }),
      jsx.jsx("button", {
        disabled: currentPage <= 1,
        onClick: () => onPageChange && onPageChange(currentPage - 1),
        children: jsx.jsx(G8, {}),
      }),
      pageList.map((item, index) =>
        item === "…"
          ? jsx.jsx("span", { children: "…" }, `ellipsis-${index}`)
          : jsx.jsx(
              "button",
              {
                className: item === currentPage ? "active" : "",
                onClick: () => onPageChange && onPageChange(item),
                children: `${item}`,
              },
              item,
            ),
      ),
      jsx.jsx("button", {
        disabled: currentPage >= totalPages,
        onClick: () => onPageChange && onPageChange(currentPage + 1),
        children: jsx.jsx(Q8, {}),
      }),
    ],
  });
}
/* ---- 7.4 畫面 Screens：申請列表共用（搜尋／表格／卡片）---- */
const EMPTY_APPLICATION_FILTER = { keyword: "", type: "全部", source: "全部", party: "全部", status: "全部" };
function filterApplicationRows(rows, criteria) {
  if (!criteria) return rows;
  const keyword = (criteria.keyword || "").trim();
  return rows.filter((row) => {
    if (keyword && !`${row.name || ""}${row.id || ""}`.includes(keyword)) return false;
    if (criteria.type && criteria.type !== "全部" && row.type !== criteria.type) return false;
    if (criteria.source && criteria.source !== "全部" && row.source !== criteria.source) return false;
    if (criteria.party && criteria.party !== "全部" && row.party !== criteria.party) return false;
    if (criteria.status && criteria.status !== "全部" && row.status !== criteria.status) return false;
    return true;
  });
}
function SearchFilters({ showParty: showParty = true, onSearch: onSearch }) {
  const [draft, setDraft] = React.useState(EMPTY_APPLICATION_FILTER),
    updateDraft = (field, value) => setDraft({ ...draft, [field]: value }),
    runSearch = () => onSearch && onSearch(draft);
  return jsx.jsxs("div", {
    className: "filters",
    children: [
      jsx.jsx(Field, {
        label: "關鍵字",
        children: jsx.jsx("input", {
          placeholder: "姓名或申請編號",
          value: draft.keyword,
          onChange: (event) => updateDraft("keyword", event.target.value),
          onKeyDown: (event) => event.key === "Enter" && runSearch(),
        }),
      }),
      jsx.jsx(Field, {
        label: "申請類型",
        children: jsx.jsxs(Select, {
          value: draft.type,
          onChange: (event) => updateDraft("type", event.target.value),
          children: [
            jsx.jsx("option", { children: "全部" }),
            jsx.jsx("option", { children: "申請" }),
            jsx.jsx("option", { children: "續期" }),
            jsx.jsx("option", { children: "廢止" }),
          ],
        }),
      }),
      jsx.jsx(Field, {
        label: "來源",
        children: jsx.jsxs(Select, {
          value: draft.source,
          onChange: (event) => updateDraft("source", event.target.value),
          children: [
            jsx.jsx("option", { children: "全部" }),
            jsx.jsx("option", { children: "一戶通" }),
            jsx.jsx("option", { children: "親臨" }),
          ],
        }),
      }),
      showParty &&
        jsx.jsx(Field, {
          label: "申請方",
          children: jsx.jsxs(Select, {
            value: draft.party,
            onChange: (event) => updateDraft("party", event.target.value),
            children: [
              jsx.jsx("option", { children: "全部" }),
              jsx.jsx("option", { children: "本人" }),
              jsx.jsx("option", { children: "親屬" }),
            ],
          }),
        }),
      jsx.jsx(Field, {
        label: "狀態",
        children: jsx.jsxs(Select, {
          value: draft.status,
          onChange: (event) => updateDraft("status", event.target.value),
          children: [
            jsx.jsx("option", { children: "全部" }),
            jsx.jsx("option", { children: "待處理" }),
            jsx.jsx("option", { children: "已通知補件" }),
            jsx.jsx("option", { children: "退回" }),
            jsx.jsx("option", { children: "待複核" }),
            jsx.jsx("option", { children: "待審批" }),
            jsx.jsx("option", { children: "已審批" }),
            jsx.jsx("option", { children: "已通知取件" }),
            jsx.jsx("option", { children: "完成" }),
            jsx.jsx("option", { children: "作廢" }),
          ],
        }),
      }),
      jsx.jsx(Button, { onClick: runSearch, icon: Na, children: "查詢" }),
    ],
  });
}
function ApplicationsTable({ rows: rows, onOpen: onOpen, actionLabel: actionLabel = "查看", page: page = 1, pageSize: pageSize = 10 }) {
  const [sort, setSort] = React.useState({ key: null, direction: "asc" }),
    onSort = (nextSort) => setSort(nextSort),
    sortedRows = React.useMemo(
      () =>
        sortRowsForDisplay(rows, sort, {
          id: (row) => row.id,
          name: (row) => row.name,
          type: (row) => row.type,
          source: (row) => row.source,
          party: (row) => row.party,
          status: (row) => row.status,
          pickupMethod: (row) => (row.termsDetails && row.termsDetails.pickupMethod) || "親臨",
          time: (row) => row.time,
        }),
      [rows, sort],
    ),
    totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize)),
    currentPage = Math.min(Math.max(1, page), totalPages),
    pagedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return jsx.jsx("div", {
    className: "table-wrap",
    children: jsx.jsxs("table", {
      children: [
        jsx.jsx("thead", {
          children: jsx.jsxs("tr", {
            children: [
              jsx.jsx(SortableTh, { label: "申請編號", sortKey: "id", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "申請人", sortKey: "name", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "類型", sortKey: "type", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "來源", sortKey: "source", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "申請方", sortKey: "party", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "狀態", sortKey: "status", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "取件方式", sortKey: "pickupMethod", sort: sort, onSort: onSort }),
              jsx.jsx(SortableTh, { label: "申請時間", sortKey: "time", sort: sort, onSort: onSort }),
              jsx.jsx("th", { children: "操作" }),
            ],
          }),
        }),
        jsx.jsxs("tbody", {
          children: [
            pagedRows.map((row) =>
              jsx.jsxs(
                "tr",
                {
                  children: [
                    jsx.jsx("td", { className: "strong", children: row.id }),
                    jsx.jsxs("td", {
                      className: "cell-name",
                      children: [
                        jsx.jsx("div", { children: row.name }, "name"),
                        row.applicantDetails &&
                          row.applicantDetails.foreignName &&
                          jsx.jsx("small", { children: row.applicantDetails.foreignName }, "foreignName"),
                      ],
                    }),
                    jsx.jsx("td", { children: row.type }),
                    jsx.jsx("td", { children: row.source }),
                    jsx.jsx("td", { children: row.party }),
                    jsx.jsx("td", {
                      children: jsx.jsx(Badge, { children: row.status }),
                    }),
                    jsx.jsx("td", { children: (row.termsDetails && row.termsDetails.pickupMethod) || "親臨" }),
                    jsx.jsx("td", { children: row.time }),
                    jsx.jsx("td", {
                      children: jsx.jsx(Button, {
                        variant: "outline",
                        onClick: () => onOpen(row),
                        children: actionLabel,
                      }),
                    }),
                  ],
                },
                row.id,
              ),
            ),
            rows.length === 0 && jsx.jsx(TableEmptyState, { cols: 9 }),
          ],
        }),
      ],
    }),
  });
}

/* ---- 7.3 共用元件 Components：頁面標題 PageHeader ---- */
function PageHeader({ title: title, action: action }) {
  return jsx.jsxs("div", {
    className: "page-heading",
    children: [
      jsx.jsx("div", {
        children: jsx.jsx("h1", { children: title }),
      }),
      action,
    ],
  });
}

/* ---- 7.3 共用元件 Components：模態視窗 Modal ---- */
function Modal({ title: title, onClose: onClose, children: children, bodyClassName: bodyClassName = "" }) {
  return jsx.jsx("div", {
    className: "modal-backdrop",
    onMouseDown: onClose,
    children: jsx.jsxs("div", {
      className: "modal",
      onMouseDown: (event) => event.stopPropagation(),
      children: [
        jsx.jsxs("div", {
          className: "modal-head",
          children: [
            jsx.jsx("h2", { children: title }),
            jsx.jsx("button", {
              "aria-label": "關閉",
              onClick: onClose,
              children: jsx.jsx(mf, {}),
            }),
          ],
        }),
        jsx.jsx("div", { className: `modal-body${bodyClassName ? ` ${bodyClassName}` : ""}`, children: children }),
      ],
    }),
  });
}
function FilePreview({ file, onClose }) {
  if (!file) return null;
  const isImage = file.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  return jsx.jsx(Modal, {
    title: file.name || "預覽",
    onClose: onClose,
    children: jsx.jsxs("div", {
      style: { textAlign: "center", padding: "32px 0" },
      children: [
        isImage
          ? jsx.jsx(Nd, { size: 120, style: { color: "var(--text-muted)", opacity: 0.4 } })
          : jsx.jsx(W8, { size: 120, style: { color: "var(--text-muted)", opacity: 0.4 } }),
        jsx.jsx("p", {
          style: { marginTop: 16, fontSize: 14, color: "var(--text-secondary)" },
          children: file.type ? file.type + "：" + file.name : file.name,
        }),
        jsx.jsx("p", {
          style: { marginTop: 8, fontSize: 12, color: "var(--text-muted)" },
          children: "（演示預覽）",
        }),
      ],
    }),
  });
}
