/* ================================================================
 * 畫面 Screens：申請管理（列表與詳情）
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：申請管理（列表與詳情）---- */
function EscapeDocumentHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function BuildDocumentPageHtml(application, documentType, language = "中文") {
  const isPortugueseStatement = documentType === "聲明書" && language === "葡文",
    copy = isPortugueseStatement
      ? {
          title: "Declaração",
          office: "Direcção de Inspecção e Coordenação de Jogos",
          labels: ["N.º do processo", "Requerente", "Tipo de requerimento", "Origem", "Data do requerimento"],
          description:
            "Este documento é gerado automaticamente pelo sistema e prevalece a versão final aprovada. O documento inclui os dados do requerente, o objecto do requerimento, o parecer de aprovação e as instruções relacionadas.",
          footer: "Pré-visualização · Sistema interno da DICJ",
        }
      : {
          title: documentType,
          office: "博彩監察協調局",
          labels: ["案件編號", "申請人", "申請類型", "來源", "申請時間"],
          description: "本文件由系統自動生成，內容以最終批核版本為準。文件內容包括申請人資料、申請事項、審批意見及相關批示。",
          footer: "文件預覽 · DICJ 內部系統",
        };
  return `<section class="document-page"><header><h1>${EscapeDocumentHtml(copy.title)}</h1><div class="sub">${EscapeDocumentHtml(copy.office)}</div></header><table><tr><td>${EscapeDocumentHtml(copy.labels[0])}</td><td>${EscapeDocumentHtml(application.id)}</td></tr><tr><td>${EscapeDocumentHtml(copy.labels[1])}</td><td>${EscapeDocumentHtml(application.name)}</td></tr><tr><td>${EscapeDocumentHtml(copy.labels[2])}</td><td>${EscapeDocumentHtml(application.type)}</td></tr><tr><td>${EscapeDocumentHtml(copy.labels[3])}</td><td>${EscapeDocumentHtml(application.source)}</td></tr><tr><td>${EscapeDocumentHtml(copy.labels[4])}</td><td>${EscapeDocumentHtml(application.time)}</td></tr></table><p>${EscapeDocumentHtml(copy.description)}</p><footer>${EscapeDocumentHtml(copy.footer)}</footer></section>`;
}
function BuildDocumentHtml(title, pageHtml, language = "中文") {
  const htmlLanguage = language === "葡文" ? "pt" : "zh-Hant";
  return `<!DOCTYPE html><html lang="${htmlLanguage}"><head><meta charset="utf-8"><title>${EscapeDocumentHtml(title)}</title><style>body{margin:0;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;color:#17324d;background:#eef3f6}.document-page{box-sizing:border-box;max-width:900px;min-height:1120px;margin:24px auto;padding:40px;background:#fff;box-shadow:0 2px 10px #17324d18}.document-page+.document-page{break-before:page;page-break-before:always}header{text-align:center;border-bottom:2px solid #123a63;padding-bottom:12px;margin-bottom:24px}h1{font-size:24px;color:#123a63;margin:0 0 4px}.sub{font-size:12px;color:#64748b}table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14px}td{border:1px solid #cbd5e1;padding:8px 10px}td:first-child{width:160px;background:#f1f5f9}p{font-size:14px;line-height:1.8;color:#475569}footer{margin-top:48px;text-align:right;font-size:12px;color:#94a3b8}@media print{body{background:#fff}.document-page{max-width:none;min-height:0;margin:0;padding:40px;box-shadow:none}}</style></head><body>${pageHtml}</body></html>`;
}
function BuildCaseDocumentHtml(application, documentType, language = "中文") {
  const title = documentType === "聲明書" && language === "葡文" ? "Declaração" : documentType,
    htmlLanguage = documentType === "聲明書" && language === "葡文" ? "葡文" : "中文";
  return BuildDocumentHtml(title, BuildDocumentPageHtml(application, documentType, language), htmlLanguage);
}
function BuildBatchCorrespondenceHtml(applications) {
  return BuildDocumentHtml(
    "批次公函",
    applications.map((application) => BuildDocumentPageHtml(application, "公函")).join(""),
  );
}
function BuildBatchCorrespondenceFilename() {
  const now = new Date(),
    pad = (value) => String(value).padStart(2, "0"),
    timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `公函_批次_${timestamp}.html`;
}
function DownloadHtmlDocument(html, filename) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" }),
    link = document.createElement("a");
  ((link.href = URL.createObjectURL(blob)),
    (link.download = filename),
    link.click(),
    URL.revokeObjectURL(link.href));
}
function PrintHtmlDocument(html) {
  const frame = document.createElement("iframe");
  ((frame.style.position = "absolute"),
    (frame.style.width = "0"),
    (frame.style.height = "0"),
    (frame.style.border = "0"),
    document.body.appendChild(frame));
  const frameDocument = frame.contentDocument || frame.contentWindow.document;
  (frameDocument.open(), frameDocument.write(html), frameDocument.close());
  (frame.contentWindow.focus(), frame.contentWindow.print());
  setTimeout(() => document.body.removeChild(frame), 1000);
}
function ApplicationsListScreen({ rows: rows, onOpen: onOpen }) {
  const [page, setPage] = React.useState(1),
    [pageSize, setPageSize] = React.useState(10),
    [filterCriteria, setFilterCriteria] = React.useState(null),
    [isSelectionMode, setIsSelectionMode] = React.useState(false),
    [selectedIds, setSelectedIds] = React.useState([]),
    [batchPreview, setBatchPreview] = React.useState(null),
    [batchSigners, setBatchSigners] = React.useState({ director: false, actingDirector: false }),
    filteredRows = React.useMemo(() => filterApplicationRows(rows, filterCriteria), [rows, filterCriteria]),
    applicationsById = React.useMemo(() => new Map(rows.map((application) => [application.id, application])), [rows]),
    selectedApplications = selectedIds
      .map((id) => applicationsById.get(id))
      .filter((application) => application && application.status === "完成"),
    batchDocumentHtml = batchPreview ? BuildBatchCorrespondenceHtml(batchPreview) : "",
    handleBatchCorrespondence = () => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        return;
      }
      if (selectedApplications.length === 0) return;
      setBatchSigners({ director: false, actingDirector: false });
      setBatchPreview(selectedApplications);
    };
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx(PageHeader, {
        title: "申請管理",
        action: jsx.jsxs("div", {
          className: "button-row",
          children: [
            isSelectionMode &&
              jsx.jsx(Button, {
                variant: "ghost",
                onClick: () => (setIsSelectionMode(false), setSelectedIds([])),
                children: "取消選取",
              }),
            jsx.jsx(Button, {
              icon: W8,
              disabled: isSelectionMode && selectedApplications.length === 0,
              onClick: handleBatchCorrespondence,
              children: isSelectionMode ? `公函生成（${selectedApplications.length}）` : "公函生成",
            }),
          ],
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsx(SearchFilters, {
            onSearch: (criteria) =>
              (setFilterCriteria(criteria),
              setPage(1),
              setIsSelectionMode(false),
              setSelectedIds([]),
              setBatchPreview(null)),
          }),
          jsx.jsx(ApplicationsTable, {
            rows: filteredRows,
            onOpen: onOpen,
            actionLabel: "查看",
            page: page,
            pageSize: pageSize,
            selectable: isSelectionMode,
            selectedIds: selectedIds,
            onSelectionChange: setSelectedIds,
            isRowSelectable: (application) => application.status === "完成",
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
      batchPreview &&
        jsx.jsx(Modal, {
          title: "公函生成",
          className: "batch-correspondence-modal",
          onClose: () => setBatchPreview(null),
          children: jsx.jsxs(jsx.Fragment, {
            children: [
              jsx.jsxs("div", {
                className: "batch-correspondence-preview",
                children: [
                  jsx.jsx("div", {
                    className: "batch-correspondence-icon",
                    children: jsx.jsx(W8, { size: 30, weight: "duotone" }),
                  }),
                  jsx.jsxs("div", {
                    children: [
                      jsx.jsx("b", { children: "合併公函已準備生成" }),
                    ],
                  }),
                ],
              }),
              jsx.jsx("div", {
                className: "table-wrap batch-correspondence-table",
                children: jsx.jsxs("table", {
                  children: [
                    jsx.jsx("thead", {
                      children: jsx.jsxs("tr", {
                        children: [
                          jsx.jsx("th", { children: "申請編號" }),
                          jsx.jsx("th", { children: "申請人" }),
                          jsx.jsx("th", { children: "類型" }),
                          jsx.jsx("th", { children: "來源" }),
                        ],
                      }),
                    }),
                    jsx.jsx("tbody", {
                      children: batchPreview.map((application) =>
                        jsx.jsxs(
                          "tr",
                          {
                            children: [
                              jsx.jsx("td", { className: "strong", children: application.id }),
                              jsx.jsx("td", { children: application.name }),
                              jsx.jsx("td", { children: application.type }),
                              jsx.jsx("td", { children: application.source }),
                            ],
                          },
                          application.id,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
              jsx.jsxs("div", {
                className: "form-actions document-preview-actions",
                children: [
                  jsx.jsxs("div", {
                    className: "document-signature-options",
                    children: [
                      jsx.jsx("span", { className: "document-signature-label", children: "簽署：" }),
                      jsx.jsxs("label", {
                        children: [
                          jsx.jsx("input", {
                            type: "checkbox",
                            checked: batchSigners.director,
                            onChange: (event) =>
                              setBatchSigners({ ...batchSigners, director: event.target.checked }),
                          }),
                          "局長",
                        ],
                      }),
                      jsx.jsxs("label", {
                        children: [
                          jsx.jsx("input", {
                            type: "checkbox",
                            checked: batchSigners.actingDirector,
                            onChange: (event) =>
                              setBatchSigners({ ...batchSigners, actingDirector: event.target.checked }),
                          }),
                          "代局長",
                        ],
                      }),
                    ],
                  }),
                  jsx.jsx(Button, {
                    variant: "outline",
                    icon: Hd,
                    onClick: () => PrintHtmlDocument(batchDocumentHtml),
                    children: "打印",
                  }),
                  jsx.jsx(Button, {
                    icon: bd,
                    onClick: () => DownloadHtmlDocument(batchDocumentHtml, BuildBatchCorrespondenceFilename()),
                    children: "下載",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function BuildApplicantDetails(application) {
  return {
    name: application.name || "",
    foreignName: "",
    gender: "",
    birthDate: "",
    docType: "",
    docNo: "",
    phone: "",
    email: "",
    address: "",
    ...(application.applicantDetails || {}),
  };
}
function BuildTermsDetails(application) {
  return {
    effectiveDate: "2026-07-08",
    endDate: "2027-07-08",
    scope: "全部",
    pickupMethod: "親臨",
    counsel: "同意",
    referralChannels: "",
    ...(application.termsDetails || {}),
  };
}
function BuildScopeEditorDetails(scope) {
  const normalizedScope = String(scope || "").trim();
  return {
    mode: normalizedScope === "全部" || !normalizedScope ? "全部" : "指定承批公司",
    companies: normalizedScope === "全部" ? [] : normalizedScope.split("、").map((item) => item.trim()).filter(Boolean),
  };
}
function BuildFilerDetails(application) {
  return {
    name: "",
    foreignName: "",
    relation: "",
    gender: "",
    birthDate: "",
    docType: "",
    docNo: "",
    phone: "",
    email: "",
    address: "",
    ...(application.filerDetails || {}),
  };
}
function BuildOperatorName(actorRole, application) {
  const account = DemoAccounts.find((demoAccount) => demoAccount.role === actorRole);
  if (account) return account.name;
  if (actorRole === "申請人") return application.name || "";
  return "";
}
function ApplicationDetailScreen({ application: application, onBack: onBack, onTransition: onTransition, onUpdateApplicant: onUpdateApplicant, onUpdateTerms: onUpdateTerms, role: role }) {
  const [note, setNote] = React.useState(""),
    [toast, setToast] = React.useState(""),
    [isEditingApplicant, setIsEditingApplicant] = React.useState(false),
    [applicantDraft, setApplicantDraft] = React.useState(() => BuildApplicantDetails(application)),
    [isEditingTerms, setIsEditingTerms] = React.useState(false),
    [termsDraft, setTermsDraft] = React.useState(() => BuildTermsDetails(application)),
    [termsScopeMode, setTermsScopeMode] = React.useState(() => BuildScopeEditorDetails(BuildTermsDetails(application).scope).mode),
    [termsScopeCompanies, setTermsScopeCompanies] = React.useState(() => BuildScopeEditorDetails(BuildTermsDetails(application).scope).companies),
    [confirmAction, setConfirmAction] = React.useState(null),
    [previewDoc, setPreviewDoc] = React.useState(null),
    [documentLanguage, setDocumentLanguage] = React.useState("中文"),
    supervisorAccounts = DemoAccounts.filter(
      (account) => account.role === WorkflowRoles.SUPERVISOR && account.status === "啟用",
    ),
    [actingSigners, setActingSigners] = React.useState({ deputyDivisionHead: false, deputyDepartmentHead: false }),
    [reviewSignerChecked, setReviewSignerChecked] = React.useState(false),
    [supervisorSelection, setSupervisorSelection] = React.useState(null),
    [supervisorDraftId, setSupervisorDraftId] = React.useState(() => supervisorAccounts[0]?.id || ""),
    [attachments, setAttachments] = React.useState([
      { name: "身份證.pdf", time: "2026-07-05 13:59" },
      { name: "近照.jpg", time: "2026-07-05 13:59" },
    ]),
    attachmentsInputRef = React.useRef(null),
    [viewAttachment, setViewAttachment] = React.useState(null),
    actions = getAvailableActions(application, role).filter(
      (action) =>
        !(application.source === "親臨" && ["counter_return_case", "counter_request_return"].includes(action.id)),
    ),
    mainActions = actions.filter((item) => item.section === "main"),
    notificationActions = actions.filter((item) => item.section === "notification"),
    simulationActions = actions.filter((item) => item.section === "simulation"),
    // 文件清單與狀態由 utils.js 的 getCaseDocuments 決定；已簽署或已作廢的文件不可再選代任簽署
    caseDocuments = getCaseDocuments(application),
    approvalAssignment = application.approvalAssignment || null,
    canChooseActingSigners = !isDocumentSignedStatus(application.status) && application.status !== "作廢",
    applicantDetails = BuildApplicantDetails(application),
    termsDetails = BuildTermsDetails(application),
    filerDetails = BuildFilerDetails(application),
    canEditApplicant =
      (role === WorkflowRoles.COUNTER || role === WorkflowRoles.ADMIN) &&
      (["待處理", "已通知補件", "退回"].includes(application.status) ||
        (application.source === "一戶通" && ["待複核", "待審批"].includes(application.status))),
    canEditTerms = canEditApplicant,
    canShowDetailEditors = application.source === "一戶通" && canEditApplicant,
    updateApplicantDraft = (field, value) =>
      setApplicantDraft({ ...applicantDraft, [field]: value }),
    cancelApplicantEdit = () => {
      (setApplicantDraft(BuildApplicantDetails(application)), setIsEditingApplicant(false));
    },
    saveApplicantDetails = () => {
      if (!applicantDraft.name.trim() || !applicantDraft.docType || !applicantDraft.docNo.trim()) {
        (setToast("請填寫姓名、證件類型及證件號碼"), setTimeout(() => setToast(""), 2600));
        return;
      }
      const savedDetails = {
        ...applicantDraft,
        name: applicantDraft.name.trim(),
        foreignName: applicantDraft.foreignName.trim(),
        docNo: applicantDraft.docNo.trim(),
        phone: applicantDraft.phone.trim(),
        email: applicantDraft.email.trim(),
        address: applicantDraft.address.trim(),
      };
      (onUpdateApplicant(savedDetails),
        setApplicantDraft(savedDetails),
        setIsEditingApplicant(false),
        setToast("申請人資料已更新"),
        setTimeout(() => setToast(""), 2600));
    },
    updateTermsDraft = (field, value) => setTermsDraft({ ...termsDraft, [field]: value }),
    cancelTermsEdit = () => {
      const details = BuildTermsDetails(application),
        scopeDetails = BuildScopeEditorDetails(details.scope);
      (setTermsDraft(details),
        setTermsScopeMode(scopeDetails.mode),
        setTermsScopeCompanies(scopeDetails.companies),
        setIsEditingTerms(false));
    },
    saveTermsDetails = () => {
      if (!termsDraft.effectiveDate || !termsDraft.endDate) {
        (setToast("請填寫生效日及廢止日"), setTimeout(() => setToast(""), 2600));
        return;
      }
      if (termsDraft.endDate < termsDraft.effectiveDate) {
        (setToast("廢止日不可早於生效日"), setTimeout(() => setToast(""), 2600));
        return;
      }
      if (!termsScopeMode || (termsScopeMode === "指定承批公司" && termsScopeCompanies.length === 0)) {
        (setToast("請選擇博彩承批公司範圍；選擇「禁入除外的承批公司」時，須至少勾選一間"), setTimeout(() => setToast(""), 2600));
        return;
      }
      const savedDetails = {
        ...termsDraft,
        scope: termsScopeMode === "全部" ? "全部" : termsScopeCompanies.join("、"),
      };
      (onUpdateTerms(savedDetails),
        setTermsDraft(savedDetails),
        setIsEditingTerms(false),
        setToast("期限、通知與聲明已更新"),
        setTimeout(() => setToast(""), 2600));
    },
    runAction = (action, transitionOptions = {}) => {
      try {
        const result = onTransition(action.id, note, transitionOptions);
        (setToast(result.message), setNote(""), setTimeout(() => setToast(""), 2600));
        return true;
      } catch (result) {
        (setToast(result.message || "操作未能完成"), setTimeout(() => setToast(""), 2600));
        return false;
      }
    },
    openSupervisorSelection = (action) => {
      const firstSupervisor = supervisorAccounts[0];
      if (!firstSupervisor) {
        setToast("目前沒有可選擇的啟用主管");
        setTimeout(() => setToast(""), 2600);
        return;
      }
      (setReviewSignerChecked(true), setSupervisorDraftId(firstSupervisor.id), setSupervisorSelection(action));
    },
    cancelSupervisorSelection = () => (setReviewSignerChecked(false), setSupervisorSelection(null)),
    confirmSupervisorSelection = () => {
      const selectedSupervisor = supervisorAccounts.find((account) => account.id === supervisorDraftId);
      if (!selectedSupervisor || !supervisorSelection) return;
      const completed = runAction(supervisorSelection, {
        approvalAssignment: {
          signer: "代廳長",
          supervisorId: selectedSupervisor.id,
          supervisorName: selectedSupervisor.name,
        },
      });
      completed && setSupervisorSelection(null);
    },
    history = application.history || [],
    buildPdfPlaceholder = (docType, language = "中文") =>
      jsx.jsxs("div", {
        className: "pdf-placeholder",
        children: [
          jsx.jsx("div", { className: "pdf-badge", children: "PDF" }),
          jsx.jsx("b", { children: docType === "聲明書" ? `${docType}（${language}）` : docType }),
          jsx.jsx("small", { children: "模擬文件預覽 · 博彩監察協調局" }),
        ],
      }),
    handleAttachmentsUpload = (event) => {
      const files = Array.from(event.target.files || []),
        now = new Date(),
        pad = (num) => String(num).padStart(2, "0"),
        time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setAttachments((prev) => {
        const next = [...prev];
        files.forEach((file) => {
          !next.some((item) => item.name === file.name) && next.push({ name: file.name, time });
        });
        return next;
      });
      event.target.value = "";
    };
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsxs("button", {
        className: "back-link",
        onClick: onBack,
        children: [jsx.jsx(G8, {}), " 返回申請列表"],
      }),
      jsx.jsxs("div", {
        className: "detail-grid",
        children: [
          jsx.jsxs("div", {
            className: "detail-main",
            children: [
              jsx.jsxs("section", {
                className: "panel",
                children: [
                  jsx.jsxs("div", {
                    className: "section-title",
                    children: [
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("p", {
                            className: "eyebrow",
                            children: "申請概況",
                          }),
                          jsx.jsx("h1", { className: "case-id", children: application.id }),
                        ],
                      }),
                      jsx.jsx(Badge, { children: application.status }),
                    ],
                  }),
                  jsx.jsxs("div", {
                    className: "summary-grid",
                    children: [
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("span", { children: "申請類型" }),
                          jsx.jsx("b", { children: application.type }),
                        ],
                      }),
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("span", { children: "來源" }),
                          jsx.jsx("b", { children: application.source }),
                        ],
                      }),
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("span", { children: "方式" }),
                          jsx.jsxs("b", { children: [application.party, "申請"] }),
                        ],
                      }),
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("span", { children: "申請時間" }),
                          jsx.jsx("b", { children: application.time }),
                        ],
                      }),
                    ],
                  }),
                  jsx.jsx(ProcessTimeline, { application: application }),
                ],
              }),
              jsx.jsxs("section", {
                className: "panel",
                children: [
                  jsx.jsxs("div", {
                    className: "section-title",
                    children: [
                      jsx.jsx("h2", { children: application.party === "親屬" ? "被申請人資料" : "申請人資料" }),
                      canShowDetailEditors &&
                        !isEditingApplicant &&
                        jsx.jsx(Button, {
                          variant: "outline",
                          icon: T0,
                          onClick: () => {
                            (setApplicantDraft(BuildApplicantDetails(application)), setIsEditingApplicant(true));
                          },
                          children: "編輯",
                        }),
                    ],
                  }),
                  isEditingApplicant
                    ? jsx.jsxs(jsx.Fragment, {
                        children: [
                          jsx.jsxs("div", {
                            className: "form-grid cols-3 applicant-edit-grid",
                            children: [
                              jsx.jsx(Field, {
                                label: "姓名（中文）",
                                required: true,
                                children: jsx.jsx("input", {
                                  value: applicantDraft.name,
                                  onChange: (event) => updateApplicantDraft("name", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "姓名（外文）",
                                children: jsx.jsx("input", {
                                  value: applicantDraft.foreignName,
                                  onChange: (event) => updateApplicantDraft("foreignName", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "性別",
                                children: jsx.jsxs(Select, {
                                  value: applicantDraft.gender,
                                  onChange: (event) => updateApplicantDraft("gender", event.target.value),
                                  children: ["男", "女"].map((option) =>
                                    jsx.jsx("option", { value: option, children: option }, option),
                                  ),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "出生日期",
                                children: jsx.jsx("input", {
                                  type: "date",
                                  value: applicantDraft.birthDate,
                                  onChange: (event) => updateApplicantDraft("birthDate", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "證件類型",
                                required: true,
                                children: jsx.jsxs(Select, {
                                  value: applicantDraft.docType,
                                  onChange: (event) => updateApplicantDraft("docType", event.target.value),
                                  children: ["澳門居民身份證", "香港居民身份證", "護照"].map((option) =>
                                    jsx.jsx("option", { value: option, children: option }, option),
                                  ),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "證件號碼",
                                required: true,
                                children: jsx.jsx("input", {
                                  value: applicantDraft.docNo,
                                  onChange: (event) => updateApplicantDraft("docNo", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "聯絡電話",
                                children: jsx.jsx("input", {
                                  type: "tel",
                                  value: applicantDraft.phone,
                                  onChange: (event) => updateApplicantDraft("phone", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "電子郵件",
                                children: jsx.jsx("input", {
                                  type: "email",
                                  value: applicantDraft.email,
                                  onChange: (event) => updateApplicantDraft("email", event.target.value),
                                }),
                              }),
                              jsx.jsx(Field, {
                                label: "地址",
                                wide: true,
                                children: jsx.jsx("input", {
                                  value: applicantDraft.address,
                                  onChange: (event) => updateApplicantDraft("address", event.target.value),
                                }),
                              }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            className: "form-actions applicant-edit-actions",
                            children: [
                              jsx.jsx(Button, { variant: "ghost", onClick: cancelApplicantEdit, children: "取消" }),
                              jsx.jsx(Button, { onClick: saveApplicantDetails, children: "儲存" }),
                            ],
                          }),
                        ],
                      })
                    : jsx.jsxs("div", {
                        className: "summary-grid",
                        children: [
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "姓名（中文）" }),
                              jsx.jsx("b", { children: applicantDetails.name }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "姓名（外文）" }),
                              jsx.jsx("b", { children: applicantDetails.foreignName || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "性別" }),
                              jsx.jsx("b", { children: applicantDetails.gender || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "出生日期" }),
                              jsx.jsx("b", { children: applicantDetails.birthDate || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "證件類型" }),
                              jsx.jsx("b", { children: applicantDetails.docType || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "證件號碼" }),
                              jsx.jsx("b", { children: applicantDetails.docNo || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "聯絡電話" }),
                              jsx.jsx("b", { children: applicantDetails.phone || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("span", { children: "電子郵件" }),
                              jsx.jsx("b", { children: applicantDetails.email || "—" }),
                            ],
                          }),
                          jsx.jsxs("div", {
                            className: "span-2",
                            children: [
                              jsx.jsx("span", { children: "地址" }),
                              jsx.jsx("b", { children: applicantDetails.address || "—" }),
                            ],
                          }),
                        ],
                      }),
                  jsx.jsxs("div", {
                    className: "panel-subsection",
                    children: [
                      jsx.jsxs("div", {
                        className: "section-title",
                        children: [
                          jsx.jsx("h2", { children: "期限、通知與聲明" }),
                          canShowDetailEditors &&
                            !isEditingTerms &&
                            jsx.jsx(Button, {
                              variant: "outline",
                              icon: T0,
                              onClick: () => {
                                const details = BuildTermsDetails(application),
                                  scopeDetails = BuildScopeEditorDetails(details.scope);
                                (setTermsDraft(details),
                                  setTermsScopeMode(scopeDetails.mode),
                                  setTermsScopeCompanies(scopeDetails.companies),
                                  setIsEditingTerms(true));
                              },
                              children: "編輯",
                            }),
                        ],
                      }),
                      isEditingTerms
                        ? jsx.jsxs(jsx.Fragment, {
                            children: [
                              jsx.jsxs("div", {
                                className: "form-grid cols-3 applicant-edit-grid",
                                children: [
                                  jsx.jsx(Field, {
                                    label: "生效日",
                                    required: true,
                                    children: jsx.jsx("input", {
                                      type: "date",
                                      value: termsDraft.effectiveDate,
                                      onChange: (event) => updateTermsDraft("effectiveDate", event.target.value),
                                    }),
                                  }),
                                  jsx.jsx(Field, {
                                    label: "廢止日",
                                    required: true,
                                    children: jsx.jsx("input", {
                                      type: "date",
                                      value: termsDraft.endDate,
                                      min: termsDraft.effectiveDate || undefined,
                                      onChange: (event) => updateTermsDraft("endDate", event.target.value),
                                    }),
                                  }),
                                  jsx.jsx(Field, {
                                    label: "取件方式",
                                    children: jsx.jsxs(Select, {
                                      value: termsDraft.pickupMethod,
                                      onChange: (event) => updateTermsDraft("pickupMethod", event.target.value),
                                      children: Object.values(WorkflowPickupMethods).map((option) =>
                                        jsx.jsx("option", { value: option, children: option }, option),
                                      ),
                                    }),
                                  }),
                                  jsx.jsx(Field, {
                                    label: "輔導服務",
                                    required: true,
                                    children: jsx.jsxs(Select, {
                                      value: termsDraft.counsel,
                                      onChange: (event) => updateTermsDraft("counsel", event.target.value),
                                      children: ["同意", "不同意"].map((option) =>
                                        jsx.jsx("option", { value: option, children: option }, option),
                                      ),
                                    }),
                                  }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                className: "form-section terms-scope-edit",
                                children: [
                                  jsx.jsx("h3", { children: "申請禁入之博彩承批公司" }),
                                  jsx.jsxs("div", {
                                    className: "radio-row",
                                    children: [
                                      jsx.jsxs("b", {
                                        children: [
                                          "博彩承批公司",
                                          jsx.jsx("span", { className: "required-mark", children: "*" }),
                                        ],
                                      }),
                                      jsx.jsxs("label", {
                                        children: [
                                          jsx.jsx("input", {
                                            type: "radio",
                                            name: "detail-scope",
                                            checked: termsScopeMode === "全部",
                                            onChange: () => setTermsScopeMode("全部"),
                                          }),
                                          " 全部",
                                        ],
                                      }),
                                      jsx.jsxs("label", {
                                        children: [
                                          jsx.jsx("input", {
                                            type: "radio",
                                            name: "detail-scope",
                                            checked: termsScopeMode === "指定承批公司",
                                            onChange: () => setTermsScopeMode("指定承批公司"),
                                          }),
                                          " 禁入除外的承批公司（可複選）",
                                        ],
                                      }),
                                    ],
                                  }),
                                  termsScopeMode === "指定承批公司" &&
                                    jsx.jsx("div", {
                                      className: "check-grid",
                                      children: EXCLUSION_COMPANIES.map((option) =>
                                        jsx.jsxs(
                                          "label",
                                          {
                                            children: [
                                              jsx.jsx("input", {
                                                type: "checkbox",
                                                checked: termsScopeCompanies.includes(option),
                                                onChange: () =>
                                                  setTermsScopeCompanies(
                                                    termsScopeCompanies.includes(option)
                                                      ? termsScopeCompanies.filter((item) => item !== option)
                                                      : [...termsScopeCompanies, option],
                                                  ),
                                              }),
                                              option,
                                            ],
                                          },
                                          option,
                                        ),
                                      ),
                                    }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                className: "form-actions applicant-edit-actions",
                                children: [
                                  jsx.jsx(Button, { variant: "ghost", onClick: cancelTermsEdit, children: "取消" }),
                                  jsx.jsx(Button, { onClick: saveTermsDetails, children: "儲存" }),
                                ],
                              }),
                            ],
                          })
                        : jsx.jsxs("div", {
                            className: "summary-grid",
                            children: [
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "生效日" }),
                                  jsx.jsx("b", { children: termsDetails.effectiveDate || "—" }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "廢止日" }),
                                  jsx.jsx("b", { children: termsDetails.endDate || "—" }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "申請禁入之博彩承批公司" }),
                                  jsx.jsx("b", {
                                    children: jsx.jsx(InlineSeparatedList, { items: termsDetails.scope }),
                                  }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "取件方式" }),
                                  jsx.jsx("b", { children: termsDetails.pickupMethod || "—" }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "輔導服務" }),
                                  jsx.jsx("b", { children: termsDetails.counsel || "—" }),
                                ],
                              }),
                              jsx.jsxs("div", {
                                children: [
                                  jsx.jsx("span", { children: "知悉禁入申請服務途徑" }),
                                  jsx.jsx("b", {
                                    children: jsx.jsx(InlineSeparatedList, { items: termsDetails.referralChannels }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                    ],
                  }),
                ],
              }),
              application.party === "親屬" &&
                jsx.jsxs("section", {
                  className: "panel",
                  children: [
                    jsx.jsx("div", {
                      className: "section-title",
                      children: jsx.jsx("h2", { children: "親屬資料" }),
                    }),
                    jsx.jsxs("div", {
                      className: "summary-grid",
                      children: [
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "姓名（中文）" }),
                            jsx.jsx("b", { children: filerDetails.name || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "姓名（外文）" }),
                            jsx.jsx("b", { children: filerDetails.foreignName || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "性別" }),
                            jsx.jsx("b", { children: filerDetails.gender || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "出生日期" }),
                            jsx.jsx("b", { children: filerDetails.birthDate || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "證件類型" }),
                            jsx.jsx("b", { children: filerDetails.docType || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "證件號碼" }),
                            jsx.jsx("b", { children: filerDetails.docNo || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "聯絡電話" }),
                            jsx.jsx("b", { children: filerDetails.phone || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "電子郵件" }),
                            jsx.jsx("b", { children: filerDetails.email || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "與被申請人關係" }),
                            jsx.jsx("b", { children: filerDetails.relation || "—" }),
                          ],
                        }),
                        jsx.jsxs("div", {
                          children: [
                            jsx.jsx("span", { children: "地址" }),
                            jsx.jsx("b", { children: filerDetails.address || "—" }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              jsx.jsxs("section", {
                className: "panel",
                children: [
                  jsx.jsxs("div", {
                    className: "section-title",
                    children: [
                      jsx.jsx("h2", { children: "附件" }),
                      jsx.jsx(Button, {
                        variant: "outline",
                        icon: F8,
                        onClick: () => attachmentsInputRef.current && attachmentsInputRef.current.click(),
                        children: "上傳",
                      }),
                      jsx.jsx("input", {
                        ref: attachmentsInputRef,
                        type: "file",
                        multiple: true,
                        style: { display: "none" },
                        onChange: handleAttachmentsUpload,
                      }),
                    ],
                  }),
                  jsx.jsxs("table", {
                    children: [
                      jsx.jsx("thead", {
                        children: jsx.jsxs("tr", {
                          children: [
                            jsx.jsx("th", { children: "文件" }),
                            jsx.jsx("th", { children: "建立時間" }),
                            jsx.jsx("th", { children: "操作" }),
                          ],
                        }),
                      }),
                      jsx.jsx("tbody", {
                        children: attachments.map((item) =>
                          jsx.jsxs(
                            "tr",
                            {
                              children: [
                                jsx.jsx("td", {
                                  className: "strong",
                                  children: item.name,
                                }),
                                jsx.jsx("td", { children: item.time }),
                                jsx.jsx("td", {
                                  children: jsx.jsx(Button, {
                                    variant: "outline",
                                    onClick: () => setViewAttachment(item),
                                    children: "查看",
                                  }),
                                }),
                              ],
                            },
                            item.name,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
              jsx.jsxs("section", {
                className: "panel action-panel",
                children: [
                  jsx.jsx("h2", { children: "案件處理" }),
                  actions.length > 0
                    ? jsx.jsxs(jsx.Fragment, {
                        children: [
                          jsx.jsx("textarea", {
                            value: note,
                            onChange: (event) => setNote(event.target.value),
                            // 一戶通退回案件的意見會隨修正通知於一戶通顯示予申請人
                            placeholder:
                              application.status === "退回" && application.source === "一戶通"
                                ? "請輸入補件意見，提交後會寫入紀錄並於一戶通顯示"
                                : "請輸入處理意見，提交後會寫入紀錄",
                          }),
                          mainActions.length > 0
                            ? jsx.jsx("div", {
                                className: "form-actions approval-actions",
                                children: jsx.jsx("div", {
                                  className: "button-row",
                                  children: mainActions.flatMap((item) => [
                                    ["complete_review", "counter_complete_review"].includes(item.id) &&
                                      jsx.jsxs(
                                        "div",
                                        {
                                          className: "document-signature-options",
                                          children: [
                                            jsx.jsx("span", {
                                              className: "document-signature-label",
                                              children: "代任簽署：",
                                            }),
                                            jsx.jsxs("label", {
                                              children: [
                                                jsx.jsx("input", {
                                                  type: "checkbox",
                                                  checked: reviewSignerChecked,
                                                  onChange: (event) =>
                                                    event.target.checked
                                                      ? openSupervisorSelection(item)
                                                      : cancelSupervisorSelection(),
                                                }),
                                                "代廳長",
                                              ],
                                            }),
                                          ],
                                        },
                                        `${item.id}-signer`,
                                      ),
                                    jsx.jsx(
                                      Button,
                                      {
                                        variant: item.variant || "primary",
                                        onClick: () => (item.id === "void_case" ? setConfirmAction(item) : runAction(item)),
                                        children: item.label,
                                      },
                                      item.id,
                                    ),
                                    ["approve_sign", "counter_approve_sign"].includes(item.id) &&
                                      approvalAssignment &&
                                      approvalAssignment.signer === "代廳長" &&
                                      jsx.jsx(
                                        "div",
                                        {
                                          className: "document-signature-options",
                                          children: jsx.jsx("span", {
                                            className: "document-signature-label",
                                            children: "由代廳長簽署",
                                          }),
                                        },
                                        `${item.id}-assigned-signer`,
                                      ),
                                  ]),
                                }),
                              })
                            : jsx.jsx("div", {
                                className: "readonly-note",
                                children: "此階段的可用操作位於右側通知或外部事件模擬區。",
                              }),
                        ],
                      })
                    : jsx.jsx("div", {
                        className: "readonly-note",
                        children:
                          role === WorkflowRoles.ADMIN
                            ? "案件已結束，沒有可執行的操作。"
                            : `目前沒有屬於${role}的可執行操作。`,
                      }),
                ],
              }),
            ],
          }),
          jsx.jsxs("aside", {
            className: "detail-side",
            children: [
              jsx.jsxs("section", {
                className: "panel",
                children: [
                  jsx.jsx("h2", { children: "操作紀錄" }),
                  jsx.jsx("div", {
                    className: "timeline",
                    children: history.map((item, index) =>
                      jsx.jsxs(
                        "div",
                        {
                          children: [
                            jsx.jsx("i", {}),
                            jsx.jsx("b", {
                              children: item.actorRole
                                ? `${item.actorRole}${
                                    BuildOperatorName(item.actorRole, application) ? ` ${BuildOperatorName(item.actorRole, application)}` : ""
                                  } · ${item.action}`
                                : item.title || item.action,
                            }),
                            jsx.jsx("span", { children: item.time }),
                            item.fromStatus &&
                              jsx.jsx("em", {
                                children:
                                  item.fromStatus === item.toStatus
                                    ? `狀態維持：${item.toStatus}`
                                    : `${item.fromStatus} → ${item.toStatus}`,
                              }),
                            item.note && jsx.jsx("em", { children: item.note }),
                          ],
                        },
                        index,
                      ),
                    ),
                  }),
                ],
              }),
              jsx.jsxs("section", {
                className: "panel",
                children: [
                  jsx.jsx("h2", { children: "列印文件" }),
                  caseDocuments.length === 0 &&
                    jsx.jsx("div", { className: "readonly-note", children: "案件已作廢，不提供列印文件。" }),
                  caseDocuments.filter((caseDocument) => caseDocument.name !== "公函").map((caseDocument) =>
                    jsx.jsxs(
                      "div",
                      {
                        className: "document-row",
                        children: [
                          jsx.jsxs("div", {
                            children: [
                              jsx.jsx("b", { children: caseDocument.name }),
                              jsx.jsx("small", { children: caseDocument.statusText }),
                            ],
                          }),
                          jsx.jsx(Button, {
                            variant: "outline",
                            icon: Na,
                            onClick: () => {
                              (setActingSigners({ deputyDivisionHead: false, deputyDepartmentHead: false }),
                                setDocumentLanguage("中文"),
                                setPreviewDoc(caseDocument.name));
                            },
                            children: "預覽",
                          }),
                        ],
                      },
                      caseDocument.name,
                    ),
                  ),
                ],
              }),
              jsx.jsxs("section", {
                className: "panel notification-panel",
                children: [
                  jsx.jsx("h2", { children: "通知及簽收" }),
                  notificationActions.length > 0
                    ? notificationActions.map((item) =>
                        jsx.jsx(
                          Button,
                          {
                            variant: item.variant || "primary",
                            icon: item.id.includes("notice") ? B8 : z0,
                            onClick: () => runAction(item),
                            children: item.label,
                          },
                          item.id,
                        ),
                      )
                    : jsx.jsx("div", {
                        className: "readonly-note",
                        children: "目前沒有可執行的通知或簽收操作。",
                      }),
                ],
              }),
              // 演示用：代替智取易／一戶通系統回傳的外部事件，僅在有可模擬事件時顯示
              simulationActions.length > 0 &&
                jsx.jsxs("section", {
                  className: "panel simulation-panel",
                  children: [
                    jsx.jsx("h2", { children: "外部事件模擬" }),
                    jsx.jsx("p", {
                      className: "readonly-note",
                      children: "演示用按鈕，代替智取易或一戶通系統回傳的事件。",
                    }),
                    simulationActions.map((item) =>
                      jsx.jsx(
                        Button,
                        {
                          variant: "outline",
                          onClick: () => runAction(item),
                          children: item.label,
                        },
                        item.id,
                      ),
                    ),
                  ],
                }),
            ],
          }),
        ],
      }),
      toast && jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
      confirmAction &&
        jsx.jsx(Modal, {
          title: "作廢案件",
          onClose: () => setConfirmAction(null),
          children: jsx.jsxs(jsx.Fragment, {
            children: [
              jsx.jsx("p", {
                className: "confirm-text",
                children: "此操作不可撤銷，作廢後案件流程將終止。確定要作廢此案件嗎？",
              }),
              jsx.jsxs("div", {
                className: "form-actions",
                children: [
                  jsx.jsx(Button, { variant: "ghost", onClick: () => setConfirmAction(null), children: "取消" }),
                  jsx.jsx(Button, {
                    variant: "danger",
                    onClick: () => {
                      (runAction(confirmAction), setConfirmAction(null));
                    },
                    children: "確認作廢",
                  }),
                ],
              }),
            ],
          }),
        }),
      supervisorSelection &&
        jsx.jsx(Modal, {
          title: "選擇審批主管",
          className: "approval-supervisor-modal",
          onClose: cancelSupervisorSelection,
          children: jsx.jsxs(jsx.Fragment, {
            children: [
              jsx.jsx("p", {
                className: "readonly-note",
                children: "已選擇代廳長簽署，請選擇負責此案件的主管後上呈審批。",
              }),
              jsx.jsx(Field, {
                label: "審批主管",
                children: jsx.jsxs(Select, {
                  value: supervisorDraftId,
                  onChange: (event) => setSupervisorDraftId(event.target.value),
                  children: supervisorAccounts.map((account) =>
                    jsx.jsx(
                      "option",
                      { value: account.id, children: `${account.name}（${account.role}）` },
                      account.id,
                    ),
                  ),
                }),
              }),
              jsx.jsxs("div", {
                className: "form-actions",
                children: [
                  jsx.jsx(Button, {
                    variant: "ghost",
                    onClick: cancelSupervisorSelection,
                    children: "取消",
                  }),
                  jsx.jsx(Button, {
                    onClick: confirmSupervisorSelection,
                    children: "確認並上呈審批",
                  }),
                ],
              }),
            ],
          }),
        }),
      previewDoc &&
        jsx.jsx(Modal, {
          title: `預覽 ${previewDoc}`,
          onClose: () => setPreviewDoc(null),
          children: [
            buildPdfPlaceholder(previewDoc, previewDoc === "聲明書" ? documentLanguage : "中文"),
            jsx.jsxs("div", {
              className: "form-actions document-preview-actions",
              children: [
                previewDoc === "聲明書" &&
                  jsx.jsxs("div", {
                    className: "document-language-options",
                    children: [
                      jsx.jsx("span", { className: "document-signature-label", children: "語言：" }),
                      jsx.jsx(Button, {
                        variant: documentLanguage === "中文" ? "primary" : "outline",
                        onClick: () => setDocumentLanguage("中文"),
                        children: "中文",
                      }),
                      jsx.jsx(Button, {
                        variant: documentLanguage === "葡文" ? "primary" : "outline",
                        onClick: () => setDocumentLanguage("葡文"),
                        children: "葡文",
                      }),
                    ],
                  }),
                canChooseActingSigners &&
                  previewDoc !== "聲明書" &&
                  jsx.jsxs("div", {
                    className: "document-signature-options",
                    children: [
                      jsx.jsx("span", { className: "document-signature-label", children: "代任簽署：" }),
                      previewDoc === "申請表" &&
                        jsx.jsxs("label", {
                          children: [
                            jsx.jsx("input", {
                              type: "checkbox",
                              checked: actingSigners.deputyDivisionHead,
                              onChange: (event) =>
                                setActingSigners({ ...actingSigners, deputyDivisionHead: event.target.checked }),
                            }),
                            "代處長",
                          ],
                        }),
                      jsx.jsxs("label", {
                        children: [
                          jsx.jsx("input", {
                            type: "checkbox",
                            checked: actingSigners.deputyDepartmentHead,
                            onChange: (event) =>
                              setActingSigners({ ...actingSigners, deputyDepartmentHead: event.target.checked }),
                          }),
                          "代廳長",
                        ],
                      }),
                    ],
                  }),
                jsx.jsx(Button, {
                  variant: "outline",
                  icon: Hd,
                  onClick: () => PrintHtmlDocument(BuildCaseDocumentHtml(application, previewDoc, documentLanguage)),
                  children: "打印",
                }),
                jsx.jsx(Button, {
                  icon: bd,
                  onClick: () =>
                    DownloadHtmlDocument(
                      BuildCaseDocumentHtml(application, previewDoc, documentLanguage),
                      `${previewDoc}${previewDoc === "聲明書" ? `_${documentLanguage}` : ""}_${application.id.replace(/\//g, "-")}.html`,
                    ),
                  children: "下載",
                }),
              ],
            }),
          ],
        }),
      viewAttachment &&
        jsx.jsx(Modal, {
          title: `預覽 ${viewAttachment.name}`,
          onClose: () => setViewAttachment(null),
          children: [
            jsx.jsxs("div", {
              style: { textAlign: "center", padding: "32px 0" },
              children: [
                /\.(jpg|jpeg|png|gif|webp)$/i.test(viewAttachment.name)
                  ? jsx.jsx(Nd, { size: 120, style: { color: "var(--text-muted)", opacity: 0.4 } })
                  : jsx.jsx(W8, { size: 120, style: { color: "var(--text-muted)", opacity: 0.4 } }),
                jsx.jsx("p", {
                  style: { marginTop: 16, fontSize: 14, color: "var(--text-secondary)" },
                  children: viewAttachment.name,
                }),
                jsx.jsx("p", {
                  style: { marginTop: 8, fontSize: 12, color: "var(--text-muted)" },
                  children: "（演示預覽）",
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx(Button, {
                  variant: "danger",
                  icon: Ec,
                  onClick: () => {
                    setAttachments((prev) => prev.filter((item) => item.name !== viewAttachment.name));
                    setViewAttachment(null);
                  },
                  children: "刪除",
                }),
                jsx.jsx("span", {}),
              ],
            }),
          ],
        }),
    ],
  });
}
