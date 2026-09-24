/* ================================================================
 * 畫面 Screens：臨櫃收件（申請／廢止）
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.4 畫面 Screens：臨櫃收件流程（申請／廢止）---- */
function IntakeReadScreen({ mode: mode, onContinue: onContinue, fillKey: fillKey, fillScenario: fillScenario, onDirty: onDirty }) {
  const [readMethod, setReadMethod] = React.useState(""),
    [docNumber, setDocNumber] = React.useState(""),
    [gender, setGender] = React.useState("男"),
    [birth, setBirth] = React.useState(""),
    [nationality, setNationality] = React.useState(""),
    [docType, setDocType] = React.useState(""),
    [nameZh, setNameZh] = React.useState(""),
    [enName, setEnName] = React.useState(""),
    [invalidFields, setInvalidFields] = React.useState([]),
    selectMethod = (method) => {
      (setReadMethod(method), setNameZh("陳大文"), setEnName("CHAN DAI MAN"), setDocNumber("13888888"), setBirth("1998-08-08"), setNationality("澳門"), setDocType("澳門居民身份證"), setInvalidFields([]));
    },
    clearInvalid = (key) => setInvalidFields(invalidFields.filter((field) => field !== key)),
    validateAndContinue = () => {
      const missing = [];
      if (!enName.trim()) missing.push("en");
      if (!birth) missing.push("birth");
      if (!nationality) missing.push("nationality");
      if (!docType) missing.push("docType");
      if (!docNumber.trim()) missing.push("docNo");
      if (missing.length) return setInvalidFields(missing);
      onContinue({ mode: mode, docNo: docNumber, applicant: { name: nameZh.trim(), en: enName.trim(), gender: gender, birth: birth, nationality: nationality, docType: docType } });
    };
  const intakeDirtyKey = JSON.stringify([readMethod, gender, nameZh, enName, birth, nationality, docType, docNumber]),
    intakeDirtyBaselineRef = React.useRef(null);
  React.useEffect(() => {
    const profile = fillKey > 0 && DemoFillProfiles[fillScenario];
    if (profile) {
      (setGender(profile.gender), setEnName(profile.enName), setBirth(profile.birth), setNationality(profile.nationality || "澳門"), setDocType(profile.docType), setDocNumber(profile.docNo), setInvalidFields([]));
    }
  }, [fillKey]);
  React.useEffect(() => {
    if (intakeDirtyBaselineRef.current === null) intakeDirtyBaselineRef.current = intakeDirtyKey;
    else if (intakeDirtyBaselineRef.current !== intakeDirtyKey) onDirty && onDirty();
  }, [intakeDirtyKey]);
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx("div", {
        className: "page-heading",
        children: jsx.jsxs("div", {
          children: [
            jsx.jsx("h1", {
              children: mode === "terminate" ? "廢止申請" : "申請",
            }),
          ],
        }),
      }),
      jsx.jsxs("section", {
        className: "panel",
        children: [
          jsx.jsxs("div", {
            className: "section-title",
            children: [
              jsx.jsx("h2", { children: "讀取證件方式" }),
            ],
          }),
          jsx.jsx(WizardProgress, { current: 1, steps: mode === "terminate" ? WizardSteps.terminate : WizardSteps.intake }),
          jsx.jsxs("div", {
            className: "read-methods",
            children: [
              jsx.jsxs("button", {
                className: readMethod === "card" ? "selected" : "",
                onClick: () => selectMethod("card"),
                children: [
                  jsx.jsx(Md, { size: 60 }),
                  jsx.jsx("b", { children: "讀取身份證資料" }),
                ],
              }),
              jsx.jsxs("button", {
                className: readMethod === "qr" ? "selected" : "",
                onClick: () => selectMethod("qr"),
                children: [
                  jsx.jsx(Zd, { size: 60 }),
                  jsx.jsx("b", { children: "掃描身份識別二維碼" }),
                ],
              }),
            ],
          }),
          jsx.jsxs("div", {
            className: "form-section",
            children: [
              jsx.jsx("h3", { children: "申請人證件資料" }),
              jsx.jsxs("div", {
                className: "form-grid",
                children: [
                  jsx.jsx(Field, {
                    label: "姓名（中文）",
                    required: false,
                    children: jsx.jsx("input", {
                      value: nameZh,
                      onChange: (event) => setNameZh(event.target.value),
                      placeholder: "請輸入",
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "姓名（外文）",
                    required: true,
                    children: jsx.jsx("input", {
                      value: enName,
                      onChange: (event) => (setEnName(event.target.value), clearInvalid("en")),
                      placeholder: "請輸入",
                      className: invalidFields.includes("en") ? "input-error" : "",
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "性別",
                    required: true,
                    children: jsx.jsxs("div", {
                      className: "radio-row",
                      children: [
                        jsx.jsxs("label", {
                          children: [
                            jsx.jsx("input", {
                              type: "radio",
                              name: "gender",
                              checked: gender === "男",
                              onChange: () => setGender("男"),
                            }),
                            " 男",
                          ],
                        }),
                        jsx.jsxs("label", {
                          children: [
                            jsx.jsx("input", {
                              type: "radio",
                              name: "gender",
                              checked: gender === "女",
                              onChange: () => setGender("女"),
                            }),
                            " 女",
                          ],
                        }),
                      ],
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "出生日期",
                    required: true,
                    children: jsx.jsx("input", {
                      type: "date",
                      value: birth,
                      onChange: (event) => (setBirth(event.target.value), clearInvalid("birth")),
                      className: invalidFields.includes("birth") ? "input-error" : "",
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "證件類型",
                    required: true,
                    children: jsx.jsxs(Select, {
                      value: docType,
                      onChange: (event) => (setDocType(event.target.value), clearInvalid("docType")),
                      className: invalidFields.includes("docType") ? "input-error" : "",
                      children: [
                        jsx.jsx("option", { children: "澳門居民身份證" }),
                        jsx.jsx("option", { children: "外地僱員身份認別證" }),
                        jsx.jsx("option", { children: "護照" }),
                        jsx.jsx("option", { children: "下拉項字典配置" }),
                      ],
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "證件號碼",
                    required: true,
                    children: jsx.jsx("input", {
                      value: docNumber,
                      onChange: (event) => (setDocNumber(event.target.value), clearInvalid("docNo")),
                      className: invalidFields.includes("docNo") ? "input-error" : "",
                    }),
                  }),
                  jsx.jsx(Field, {
                    label: "國籍",
                    required: true,
                    children: jsx.jsx(Select, {
                      value: nationality,
                      onChange: (event) => (setNationality(event.target.value), clearInvalid("nationality")),
                      className: invalidFields.includes("nationality") ? "input-error" : "",
                      children: ["中國",  "澳門", "香港", "台灣","下拉項字典配置"].map((option) =>
                        jsx.jsx("option", { value: option, children: option }, option),
                      ),
                    }),
                  }),
                ],
              }),
            ],
          }),
          jsx.jsxs("div", {
            className: "form-actions",
            children: [
              jsx.jsx("span", {}),
              jsx.jsx(Button, {
                onClick: validateAndContinue,
                children: "下一步",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function RecordCheck({ mode: mode, docNo: docNo, docType: docType, onBack: onBack, onContinue: onContinue, onResumeDraft: onResumeDraft }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recordKey = docType && docNo ? `${docType}:${docNo}` : "",
    records = ((DemoData.exclusionHistory && recordKey && DemoData.exclusionHistory[recordKey]) || []).map(
      (record) => ({
        ...record,
        type: record.type || "申請",
        source: record.source || "親臨",
        status: new Date(record.end) >= today ? "生效中" : "已失效",
      }),
    ),
    activeRecord = records.find((record) => record.status === "生效中"),
    daysLeft = activeRecord ? Math.round((new Date(activeRecord.end) - today) / 864e5) : null,
    resultType =
      mode === "terminate"
        ? activeRecord
          ? "terminate"
          : "no-record-terminate"
        : !activeRecord
          ? "new"
          : daysLeft <= 30
            ? "renew"
            : "blocked",
    draftKeyValue = docType && docNo ? buildDraftKey(docType, docNo) : null;
  const [detectedDraft, setDetectedDraft] = React.useState(() => (draftKeyValue ? loadDraft(draftKeyValue) : null)),
    [recordSort, setRecordSort] = React.useState({ key: null, direction: "asc" }),
    onRecordSort = (nextSort) => setRecordSort(nextSort),
    sortedRecords = sortRowsForDisplay(records, recordSort, {
      id: (record) => record.id,
      type: (record) => record.type,
      source: (record) => record.source,
      status: (record) => record.status,
      scope: (record) => record.scope,
      createdAt: (record) => record.createdAt,
      start: (record) => record.start,
      end: (record) => record.end,
    }),
    draftKind = detectedDraft
      ? detectedDraft.mode === "terminate"
        ? "terminate"
        : detectedDraft.appType === "續期"
          ? "renew"
          : detectedDraft.appType === "新申請"
            ? "new"
            : "unknown"
      : null,
    draftTypeText = draftKind === "terminate" ? "廢止" : draftKind === "renew" ? "續期" : draftKind === "new" ? "新申請" : "未知",
    draftFlowText = draftKind === "terminate" ? "廢止流程" : "申請流程",
    draftEligible =
      draftKind === "new"
        ? !activeRecord
        : draftKind === "renew"
          ? Boolean(activeRecord && daysLeft <= 30)
          : draftKind === "terminate"
            ? Boolean(activeRecord)
            : false,
    draftInvalidReason =
      !detectedDraft || draftEligible
        ? ""
        : draftKind === "new"
          ? "目前查有生效中的禁入紀錄，原有新申請草稿已不符合受理條件。"
          : draftKind === "renew" && !activeRecord
            ? "目前查無生效中的禁入紀錄，原有續期草稿已不符合受理條件。"
            : draftKind === "renew"
              ? "目前未到續期受理時間，原有續期草稿已不符合受理條件。"
              : draftKind === "terminate"
                ? "目前查無可廢止的生效紀錄，原有廢止草稿已不符合受理條件。"
                : "草稿資料不完整，無法恢復。",
    canStartCurrentFlow = resultType === "new" || resultType === "renew" || resultType === "terminate",
    deleteDetectedDraft = () => {
      if (draftKeyValue) removeDraft(draftKeyValue);
      setDetectedDraft(null);
    },
    startFresh = (appType) => {
      deleteDetectedDraft();
      onContinue(appType);
    };
  React.useEffect(() => {
    setDetectedDraft(draftKeyValue ? loadDraft(draftKeyValue) : null);
  }, [draftKeyValue]);
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx("div", {
        className: "page-heading",
        children: jsx.jsxs("div", {
          children: [
            jsx.jsx("h1", { children: mode === "terminate" ? "廢止申請" : "申請" }),
          ],
        }),
      }),
      jsx.jsxs("section", {
        className: "panel wizard-panel",
        children: [
          jsx.jsxs("div", {
            className: "section-title",
            children: [
              jsx.jsx("h2", { children: "核查禁入紀錄" })
            ],
          }),
          jsx.jsx(WizardProgress, { current: 2, steps: mode === "terminate" ? WizardSteps.terminate : WizardSteps.intake }),

          jsx.jsxs("div", {
            className: "section-title",
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("h2", {
                    children: activeRecord ? "此證件查有禁入紀錄" : "此證件查無禁入紀錄",
                  }),
                  jsx.jsx("p", {
                    children: `證件類型：${docType || "—"}　證件號碼：${docNo || "—"}`,
                  }),
                ],
              }),
            ],
          }),
          resultType === "new" &&
            jsx.jsx("div", {
              className: "record-alert",
              children: jsx.jsx("span", {
                children:
                  "系統已將申請人資料與現有記錄進行比對，未發現相符的禁入紀錄，可直接進行新申請。",
              }),
            }),
          records.length > 0 &&
            jsx.jsx("div", {
              className: "table-wrap",
              children: jsx.jsxs("table", {
                children: [
                  jsx.jsx("thead", {
                    children: jsx.jsxs("tr", {
                      children: [
                        jsx.jsx(SortableTh, { label: "申請編號", sortKey: "id", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "類型", sortKey: "type", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "來源", sortKey: "source", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "狀態", sortKey: "status", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "禁入娛樂場範圍", sortKey: "scope", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "創建時間", sortKey: "createdAt", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "生效時間", sortKey: "start", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx(SortableTh, { label: "廢止時間", sortKey: "end", sort: recordSort, onSort: onRecordSort }),
                        jsx.jsx("th", { children: "操作" }),
                      ],
                    }),
                  }),
                  jsx.jsx("tbody", {
                    children: sortedRecords.map((record) =>
                      jsx.jsxs(
                        "tr",
                        {
                          children: [
                            jsx.jsx("td", { className: "strong", children: record.id }),
                            jsx.jsx("td", { children: record.type }),
                            jsx.jsx("td", { children: record.source }),
                            jsx.jsx("td", { children: jsx.jsx(Badge, { children: record.status }) }),
                            jsx.jsx("td", { children: record.scope }),
                            jsx.jsx("td", { children: record.createdAt }),
                            jsx.jsx("td", { children: record.start }),
                            jsx.jsx("td", { children: record.end }),
                            jsx.jsx("td", {
                              children: jsx.jsx(Button, {
                                variant: "outline",
                                children: "查閱",
                              }),
                            }),
                          ],
                        },
                        record.id,
                      ),
                    ),
                  }),
                ],
              }),
            }),
          resultType === "blocked" &&
            jsx.jsx("div", {
              className: "record-alert",
              children: jsx.jsx("span", {
                children: `此禁令將於 ${activeRecord.end} 到期，距今尚餘 ${daysLeft} 天，未到續期受理時間（到期前 30 天內）。`,
              }),
            }),
          resultType === "no-record-terminate" &&
            jsx.jsx("div", {
              className: "record-alert",
              children: jsx.jsx("span", {
                children: "查無可廢止的禁入紀錄，請確認證件類型及證件號碼是否正確。",
              }),
            }),
                    detectedDraft &&
            jsx.jsxs("div", {
              className: `draft-alert${draftEligible ? "" : " is-invalid"}`,
              role: "status",
              children: [
                jsx.jsxs("div", {
                  className: "draft-alert-content",
                  children: [
                    jsx.jsx("h3", { children: draftEligible ? "發現暫存草稿" : "暫存草稿已失效" }),
                    jsx.jsx("p", {
                      children: `草稿類型：${draftTypeText}　暫存時間：${detectedDraft.savedAt || "—"}`,
                    }),
                    draftEligible &&
                      ((mode === "terminate") !== (draftKind === "terminate")) &&
                      jsx.jsx("p", { children: `此草稿屬於${draftFlowText}，恢復後將自動切換流程。` }),
                    draftInvalidReason && jsx.jsx("p", { className: "draft-alert-reason", children: draftInvalidReason }),
                  ],
                }),
                draftEligible
                  ? jsx.jsx(Button, {
                      onClick: () => onResumeDraft(detectedDraft),
                      children: "恢復草稿",
                    })
                  : !canStartCurrentFlow &&
                    jsx.jsx(Button, {
                      variant: "danger",
                      onClick: deleteDetectedDraft,
                      children: "刪除草稿",
                    }),
              ],
            }),
          jsx.jsxs("div", {
            className: "form-actions",
            children: [
              jsx.jsx(Button, { variant: "ghost", onClick: onBack, children: "上一步" }),
              resultType === "new"
                ? jsx.jsx(Button, {
                    onClick: () => detectedDraft ? startFresh("新申請") : onContinue("新申請"),
                    children: detectedDraft ? "重新填寫" : "進行申請",
                  })
                : resultType === "renew"
                  ? jsx.jsx(Button, {
                      onClick: () => detectedDraft ? startFresh("續期") : onContinue("續期"),
                      children: detectedDraft ? "重新填寫" : "進行續期申請",
                    })
                  : resultType === "terminate"
                    ? jsx.jsx(Button, {
                        onClick: () => detectedDraft ? startFresh(true) : onContinue(true),
                        children: detectedDraft ? "重新填寫" : "進行廢止申請",
                      })
                    : jsx.jsx(Button, {
                        disabled: true,
                        children:
                          resultType === "blocked" ? "尚未到續期時間" : "無法廢止",
                      }),
            ],
          }),
        ],
      }),
    ],
  });
}
function ApplicationFormScreen({ mode: mode, onSubmit: onSubmit, onCancel: onCancel, docNo: docNo, appType: appType, applicant: applicant = {}, fillKey: fillKey, resumeDraft: resumeDraft, onSaveRef: onSaveRef, onDirty: onDirty }) {
  const initialDraft = resumeDraft && resumeDraft.v === 1 ? resumeDraft : null,
    [step, setStep] = React.useState(() => (initialDraft && initialDraft.step) || 1),
    [partyType, setPartyType] = React.useState(() => (initialDraft && initialDraft.partyType) || ""),
    [term, setTerm] = React.useState(() => (initialDraft && initialDraft.term) || ""),
    [scope, setScope] = React.useState(() => (initialDraft && initialDraft.scope) || ""),
    [counsel, setCounsel] = React.useState(() => (initialDraft && initialDraft.counsel) || ""),
    [documents, setDocuments] = React.useState(() => (initialDraft && initialDraft.documents) || []),
    [docType, setDocType] = React.useState(() => (initialDraft && initialDraft.docType) || ""),
    [photoName, setPhotoName] = React.useState(() => (initialDraft && initialDraft.photoName) || ""),
    [previewFile, setPreviewFile] = React.useState(null),
    [personal, setPersonal] = React.useState(() => ({
      occupation: "",
      email: "",
      phoneCode: "+853",
      phone: "",
      address: "",
      ...((initialDraft && initialDraft.personal) || {}),
    })),
    [effectiveDate, setEffectiveDate] = React.useState(() => (initialDraft && initialDraft.effectiveDate) || ""),
    [endDate, setEndDate] = React.useState(() => (initialDraft && initialDraft.endDate) || ""),
    [termInvalidFields, setTermInvalidFields] = React.useState([]),
    [companies, setCompanies] = React.useState(() => (initialDraft && initialDraft.companies) || []),
    [referralChannels, setReferralChannels] = React.useState(() => (initialDraft && initialDraft.referralChannels) || ["朋友"]),
    [referralOther, setReferralOther] = React.useState(() => (initialDraft && initialDraft.referralOther) || ""),
    [relativeDocType, setRelativeDocType] = React.useState(() => (initialDraft && initialDraft.relativeDocType) || ""),
    [relativeFiles, setRelativeFiles] = React.useState(() => (initialDraft && initialDraft.relativeFiles) || []),
    [relativeReadMethod, setRelativeReadMethod] = React.useState(() => (initialDraft && initialDraft.relativeReadMethod) || ""),
    [relative, setRelative] = React.useState(() => ({
      relation: "",
      name: "",
      en: "",
      gender: "",
      birth: "",
      docType: "",
      docNo: "",
      occupation: "",
      email: "",
      phoneCode: "+853",
      phone: "",
      address: "",
      ...((initialDraft && initialDraft.relative) || {}),
    })),
    [relativeInvalid, setRelativeInvalid] = React.useState([]),
    termMonths = { "六個月": 6, "一年": 12, "十八個月": 18, "兩年": 24 },
    computeTermEndDate = (termValue, effectiveDateValue) => {
      const months = termMonths[termValue];
      if (!months || !effectiveDateValue) return "";
      const [year, month, day] = effectiveDateValue.split("-").map(Number);
      const totalMonths = month - 1 + months;
      return `${year + Math.floor(totalMonths / 12)}-${String((totalMonths % 12) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    },
    clearTermInvalid = (key) => setTermInvalidFields(termInvalidFields.filter((field) => field !== key)),
    fillDefaults = () => {
      (setPartyType("本人申請"),
        setTerm("一年"),
        setScope("全部"),
        setCounsel("同意"),
        setDocuments([{ type: "澳門居民身份證", name: "澳門身份證partyType.jpg" }]),
        setDocType("澳門居民身份證"),
        setPhotoName("近照.jpg"),
        setPersonal({ occupation: "文員", email: "demo@example.com", phoneCode: "+853", phone: "63886688", address: "澳門慕拉士大馬路222號地下" }),
        setEffectiveDate("2026-08-09"),
        setEndDate("2027-08-09"),
        setTermInvalidFields([]),
        setCompanies([]),
        setReferralChannels(["朋友"]),
        setReferralOther(""),
        setRelativeDocType("澳門居民身份證"),
        setRelativeFiles([{ type: "澳門居民身份證", name: "親屬身份證正面.jpg" }]),
        setRelativeReadMethod(""),
        setRelative({
          relation: "配偶",
          name: "陳小文",
          en: "CHAN MAN",
          gender: "男",
          birth: "2000-08-08",
          docType: "澳門居民身份證",
          docNo: "13888880",
          occupation: "文員",
          email: "demo@example.com",
          phoneCode: "+853",
          phone: "63886688",
          address: "澳門黑沙環新街456號",
        }),
        setRelativeInvalid([]));
    },
    selectRelativeMethod = (method) => {
      (setRelativeReadMethod(method),
        setRelative({
          ...relative,
          name: "陳小文",
          en: "CHAN MAN",
          gender: "男",
          birth: "2000-08-08",
          docType: "澳門居民身份證",
          docNo: "13888880",
        }),
        setRelativeInvalid([]));
    },
    clearRelativeInvalid = (key) => setRelativeInvalid(relativeInvalid.filter((field) => field !== key)),
    validateRelative = () => {
      const missing = [];
      if (!relative.en.trim()) missing.push("en");
      if (!relative.birth) missing.push("birth");
      if (!relative.docType) missing.push("docType");
      if (!relative.docNo.trim()) missing.push("docNo");
      if (missing.length) return setRelativeInvalid(missing);
      setStep(4);
    },
    formData = {
      name: partyType === "親屬申請" ? relative.name.trim() : (applicant.name || "").trim(),
      en: partyType === "親屬申請" ? relative.en.trim() : (applicant.en || "").trim(),
      doc: docNo || "",
      party: partyType,
      term: term,
      scope: scope,
      counsel: counsel,
      mode: mode,
      appType: appType,
      applicant: applicant,
      personal: personal,
      effectiveDate: effectiveDate,
      endDate: endDate,
      companies: companies,
      referralChannels: referralChannels,
      referralOther: referralOther,
      relative: relative,
    };
  const draftKeyValue = applicant.docType && docNo ? buildDraftKey(applicant.docType, docNo) : null,
    draftSnapshot = {
      v: 1,
      savedAt: formatNow(),
      mode: mode,
      appType: appType,
      docNo: docNo || "",
      applicant: applicant,
      step: step,
      partyType: partyType,
      term: term,
      scope: scope,
      counsel: counsel,
      docType: docType,
      documents: documents,
      photoName: photoName,
      personal: personal,
      effectiveDate: effectiveDate,
      endDate: endDate,
      companies: companies,
      referralChannels: referralChannels,
      referralOther: referralOther,
      relativeDocType: relativeDocType,
      relativeFiles: relativeFiles,
      relativeReadMethod: relativeReadMethod,
      relative: relative,
    },
    draftHasContent =
      step > 1 ||
      partyType ||
      term ||
      scope ||
      counsel ||
      documents.length > 0 ||
      photoName ||
      personal.occupation ||
      personal.phone ||
      personal.address ||
      effectiveDate ||
      endDate ||
      companies.length > 0 ||
      referralOther ||
      relative.name ||
      relative.docNo,
    draftBodyKey = JSON.stringify([
      partyType,
      term,
      scope,
      counsel,
      docType,
      documents,
      photoName,
      personal,
      effectiveDate,
      endDate,
      companies,
      referralChannels,
      referralOther,
      relativeDocType,
      relativeFiles,
      relativeReadMethod,
      relative,
    ]),
    draftDirtyBaselineRef = React.useRef(null);
  React.useEffect(() => {
    if (fillKey > 0) fillDefaults();
  }, [fillKey]);
  React.useEffect(() => {
    if (!draftKeyValue || !draftHasContent) return;
    const timer = setTimeout(() => saveDraft(draftKeyValue, draftSnapshot), 400);
    return () => clearTimeout(timer);
  }, [draftKeyValue, draftHasContent, JSON.stringify(draftSnapshot)]);
  React.useEffect(() => {
    if (!onSaveRef) return;
    onSaveRef(() => {
      if (!draftKeyValue || !draftHasContent) return;
      saveDraft(draftKeyValue, draftSnapshot);
    });
    return () => onSaveRef(null);
  }, [draftKeyValue, draftHasContent, JSON.stringify(draftSnapshot)]);
  React.useEffect(() => {
    if (draftDirtyBaselineRef.current === null) draftDirtyBaselineRef.current = draftBodyKey;
    else if (draftDirtyBaselineRef.current !== draftBodyKey) onDirty && onDirty();
  }, [draftBodyKey]);
  const isRelative = partyType === "親屬申請" && mode !== "terminate",
    previewStep = isRelative ? 5 : 3,
    wizardSteps = mode === "terminate" ? WizardSteps.terminate : isRelative ? WizardSteps.relative : WizardSteps.intake,
    wizardCurrent = step === previewStep ? wizardSteps.length : mode === "terminate" ? 3 : step + 2;
  const showPreview = () => {
    setStep(previewStep);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };
  const content =
    step === 1 && mode !== "terminate"
    ? jsx.jsxs("section", {
        className: "panel wizard-panel",
        children: [
          jsx.jsxs("div", {
            className: "section-title",
            children: [
              jsx.jsx("h2", { children: "選擇申請方式" }),
            ],
          }),
          jsx.jsx(WizardProgress, { current: wizardCurrent, steps: wizardSteps }),
          jsx.jsx("div", {
            className: "party-cards",
            children: ["本人申請", "親屬申請"].map((option, index) =>
              jsx.jsxs(
                "button",
                {
                  className: partyType === option ? "selected" : "",
                  onClick: () => setPartyType(option),
                  children: [
                    index === 0
                      ? jsx.jsx(Td, { size: 44 })
                      : jsx.jsx(rf, { size: 44 }),
                    jsx.jsx("b", { children: option }),
                    jsx.jsx("span", {
                      children:
                        index === 0
                          ? "申請人親自到臨櫃辦理"
                          : "配偶、尊親屬、卑親屬或兄弟姊妹",
                    }),
                  ],
                },
                option,
              ),
            ),
          }),
          jsx.jsxs("div", {
            className: "form-actions",
            children: [
              jsx.jsx(Button, { variant: "ghost", onClick: onCancel, children: "上一步" }),
              jsx.jsx(Button, { onClick: () => setStep(2), disabled: !partyType, children: "下一步" }),
            ],
          }),
        ],
      })
    : step === previewStep
      ? jsx.jsx(ApplicationPreviewScreen, {
          data: formData,
          documents: documents,
          photoName: photoName,
          relativeFiles: relativeFiles,
          onBack: () => setStep(previewStep - 1),
          onSubmit: () => onSubmit(formData),
          onPreviewFile: setPreviewFile,
        })
      : step === 3 && isRelative
        ? jsx.jsxs("section", {
            className: "panel wizard-panel",
            children: [
              jsx.jsxs("div", {
                className: "section-title",
                children: [
                  jsx.jsx("h2", { children: "填寫親屬證件資料" }),
                ],
              }),
              jsx.jsx(WizardProgress, { current: wizardCurrent, steps: wizardSteps }),
              jsx.jsxs("div", {
                className: "form-section",
                children: [
                  jsx.jsx("h3", { children: "讀取證件方式" }),
                  jsx.jsxs("div", {
                    className: "read-methods",
                    children: [
                      jsx.jsxs("button", {
                        className: relativeReadMethod === "card" ? "selected" : "",
                        onClick: () => selectRelativeMethod("card"),
                        children: [
                          jsx.jsx(Md, { size: 60 }),
                          jsx.jsx("b", { children: "讀取身份證資料" }),
                          jsx.jsx("small", { children: "模擬晶片讀卡機" }),
                        ],
                      }),
                      jsx.jsxs("button", {
                        className: relativeReadMethod === "qr" ? "selected" : "",
                        onClick: () => selectRelativeMethod("qr"),
                        children: [
                          jsx.jsx(Zd, { size: 60 }),
                          jsx.jsx("b", { children: "掃描身份識別二維碼" }),
                          jsx.jsx("small", { children: "模擬二維碼掃描" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              jsx.jsxs("div", {
                className: "form-section",
                children: [
                  jsx.jsx("h3", { children: "親屬證件資料" }),
                  jsx.jsxs("div", {
                    className: "form-grid",
                    children: [
                      jsx.jsx(Field, {
                        label: "姓名（中文）",
                        required: true,
                        children: jsx.jsx("input", {
                          value: relative.name,
                          onChange: (event) =>
                            setRelative({ ...relative, name: event.target.value }),
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "姓名（外文）",
                        required: true,
                        children: jsx.jsx("input", {
                          value: relative.en,
                          onChange: (event) =>
                            (setRelative({ ...relative, en: event.target.value }), clearRelativeInvalid("en")),
                          className: relativeInvalid.includes("en") ? "input-error" : "",
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "性別",
                        required: true,
                        children: jsx.jsxs("div", {
                          className: "radio-row",
                          children: [
                            jsx.jsxs("label", {
                              children: [
                                jsx.jsx("input", {
                                  type: "radio",
                                  name: "relative-gender",
                                  checked: relative.gender === "男",
                                  onChange: () => setRelative({ ...relative, gender: "男" }),
                                }),
                                " 男",
                              ],
                            }),
                            jsx.jsxs("label", {
                              children: [
                                jsx.jsx("input", {
                                  type: "radio",
                                  name: "relative-gender",
                                  checked: relative.gender === "女",
                                  onChange: () => setRelative({ ...relative, gender: "女" }),
                                }),
                                " 女",
                              ],
                            }),
                          ],
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "出生日期",
                        required: true,
                        children: jsx.jsx("input", {
                          type: "date",
                          value: relative.birth,
                          onChange: (event) =>
                            (setRelative({ ...relative, birth: event.target.value }), clearRelativeInvalid("birth")),
                          className: relativeInvalid.includes("birth") ? "input-error" : "",
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "證件類型",
                        required: true,
                        children: jsx.jsxs(Select, {
                          value: relative.docType,
                          onChange: (event) =>
                            (setRelative({ ...relative, docType: event.target.value }), clearRelativeInvalid("docType")),
                          className: relativeInvalid.includes("docType") ? "input-error" : "",
                          children: [
                            jsx.jsx("option", { children: "澳門居民身份證" }),
                            jsx.jsx("option", { children: "外地僱員身份認別證" }),
                            jsx.jsx("option", { children: "護照" }),
                            jsx.jsx("option", { children: "下拉項字典配置" }),
                          ],
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "證件號碼",
                        required: true,
                        children: jsx.jsx("input", {
                          value: relative.docNo,
                          onChange: (event) =>
                            (setRelative({ ...relative, docNo: event.target.value }), clearRelativeInvalid("docNo")),
                          className: relativeInvalid.includes("docNo") ? "input-error" : "",
                        }),
                      }),
                      jsx.jsx(Field, {
                        label: "親屬關係",
                        required: true,
                        wide: true,
                        children: jsx.jsxs("div", {
                          className: "radio-row",
                          children: ["配偶", "尊親屬", "卑親屬", "兄弟姊妹"].map((option) =>
                            jsx.jsxs(
                              "label",
                              {
                                children: [
                                  jsx.jsx("input", {
                                    type: "radio",
                                    name: "relative-relation",
                                    checked: relative.relation === option,
                                    onChange: () =>
                                      setRelative({ ...relative, relation: option }),
                                  }),
                                  " " + option,
                                ],
                              },
                              option,
                            ),
                          ),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              jsx.jsxs("div", {
                className: "form-actions",
                children: [
                  jsx.jsx(Button, { variant: "ghost", onClick: () => setStep(2), children: "上一步" }),
                  jsx.jsx(Button, { onClick: validateRelative, children: "下一步" }),
                ],
              }),
            ],
          })
        : step === 4 && isRelative
          ? jsx.jsxs("section", {
              className: "panel wizard-panel",
              children: [
                jsx.jsxs("div", {
                  className: "section-title",
                  children: [
                    jsx.jsx("h2", { children: "填寫親屬資料" }),
                  ],
                }),
                jsx.jsx(WizardProgress, { current: wizardCurrent, steps: wizardSteps }),
                jsx.jsxs("div", {
                  className: "form-section",
                  children: [
                    jsx.jsx("h3", { children: "親屬個人資料" }),
                    jsx.jsxs("div", {
                      className: "form-grid cols-3",
                      children: [
                        jsx.jsx(Field, {
                          label: "職業",
                          required: true,
                          children: jsx.jsx("input", {
                            value: relative.occupation,
                            onChange: (event) =>
                              setRelative({ ...relative, occupation: event.target.value }),
                          }),
                        }),
                        jsx.jsx(Field, {
                          label: "電郵",
                          children: jsx.jsx("input", {
                            value: relative.email,
                            onChange: (event) =>
                              setRelative({ ...relative, email: event.target.value }),
                          }),
                        }),
                        jsx.jsx(Field, {
                          label: "聯絡手提電話",
                          required: true,
                          children: jsx.jsxs("div", {
                            className: "phone",
                            children: [
                              jsx.jsx(Select, {
                                value: relative.phoneCode,
                                onChange: (event) =>
                                  setRelative({ ...relative, phoneCode: event.target.value }),
                                children: ["+853", "+86", "+852"].map((phoneCode) =>
                                  jsx.jsx("option", { value: phoneCode, children: phoneCode }, phoneCode),
                                ),
                              }),
                              jsx.jsx("input", {
                                value: relative.phone,
                                onChange: (event) =>
                                  setRelative({ ...relative, phone: event.target.value }),
                              }),
                            ],
                          }),
                        }),
                        jsx.jsx(Field, {
                          label: "地址",
                          required: true,
                          wide: true,
                          children: jsx.jsx("input", {
                            value: relative.address,
                            onChange: (event) =>
                              setRelative({ ...relative, address: event.target.value }),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                jsx.jsxs("div", {
                  className: "form-section",
                  children: [
                    jsx.jsx("h3", { children: "上傳親屬證件" }),
                    jsx.jsx(Field, {
                      label: "證件類型",
                      required: true,
                      children: jsx.jsx(Select, {
                        className: "doc-type",
                        value: relativeDocType,
                        onChange: (event) => setRelativeDocType(event.target.value),
                        children: [
                          "澳門居民身份證",
                          "外地僱員身份認別證",
                          "護照",
                          "下拉項字典配置",
                        ].map((option) => jsx.jsx("option", { children: option }, option)),
                      }),
                    }),
                    jsx.jsxs("div", {
                      className: "upload-box",
                      children: [
                        jsx.jsx(Vd, { size: 26 }),
                        jsx.jsx("b", {
                          children: `拖曳「${relativeDocType}」掃描件至此，或點擊上傳`,
                        }),
                        jsx.jsx("input", {
                          type: "file",
                          onChange: (event) => {
                            event.target.files[0] &&
                              !relativeFiles.some((item) => item.name === event.target.files[0].name) &&
                              setRelativeFiles([
                                ...relativeFiles,
                                { type: relativeDocType, name: event.target.files[0].name },
                              ]);
                            event.target.value = "";
                          },
                        }),
                      ],
                    }),
                    jsx.jsx("div", {
                      className: "file-list",
                      children: relativeFiles.map((doc) =>
                        jsx.jsxs(
                          "span",
                          {
                            onClick: () => setPreviewFile({ name: doc.name, type: doc.type }),
                            children: [
                              jsx.jsx(W8, {}),
                              jsx.jsx("b", {
                                className: "file-type",
                                children: doc.type,
                              }),
                              doc.name,
                              jsx.jsx("button", {
                                onClick: (event) => {
                                  event.stopPropagation();
                                  setRelativeFiles(relativeFiles.filter((item) => item.name !== doc.name));
                                },
                                children: jsx.jsx(mf, {}),
                              }),
                            ],
                          },
                          doc.type + doc.name,
                        ),
                      ),
                    }),
                  ],
                }),
                jsx.jsxs("div", {
                  className: "form-actions",
                  children: [
                    jsx.jsx(Button, { variant: "ghost", onClick: () => setStep(3), children: "上一步" }),
                    jsx.jsx(Button, { onClick: showPreview, children: "預覽" }),
                  ],
                }),
              ],
            })
      : jsx.jsxs("section", {
          className: "panel wizard-panel",
          children: [
            jsx.jsxs("div", {
              className: "section-title",
              children: [
                jsx.jsx("h2", {
                  children: mode === "terminate" ? "填寫廢止資料" : "填寫申請資料",
                }),
              ],
            }),
            jsx.jsx(WizardProgress, { current: wizardCurrent, steps: wizardSteps }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "申請人個人資料" }),
                jsx.jsxs("div", {
                  className: "form-grid cols-3",
                  children: [
                    jsx.jsx(Field, {
                      label: "職業",
                      required: true,
                      children: jsx.jsx("input", {
                        value: personal.occupation,
                        onChange: (event) =>
                          setPersonal({ ...personal, occupation: event.target.value }),
                      }),
                    }),
                    jsx.jsx(Field, {
                      label: "電郵",
                      children: jsx.jsx("input", {
                        value: personal.email,
                        onChange: (event) =>
                          setPersonal({ ...personal, email: event.target.value }),
                      }),
                    }),
                    jsx.jsx(Field, {
                      label: "聯絡手提電話",
                      required: true,
                      children: jsx.jsxs("div", {
                        className: "phone",
                        children: [
                          jsx.jsx(Select, {
                            value: personal.phoneCode,
                            onChange: (event) =>
                              setPersonal({ ...personal, phoneCode: event.target.value }),
                            children: ["+853", "+86", "+852"].map((phoneCode) =>
                                  jsx.jsx("option", { value: phoneCode, children: phoneCode }, phoneCode),
                                ),
                          }),
                          jsx.jsx("input", {
                            value: personal.phone,
                            onChange: (event) =>
                              setPersonal({ ...personal, phone: event.target.value }),
                          }),
                        ],
                      }),
                    }),
                    jsx.jsx(Field, {
                      label: "地址",
                      required: true,
                      wide: true,
                      children: jsx.jsx("input", {
                        value: personal.address,
                        onChange: (event) =>
                          setPersonal({ ...personal, address: event.target.value }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            mode !== "terminate" &&
              jsx.jsxs(jsx.Fragment, {
                children: [
                  jsx.jsxs("div", {
                    className: "form-section",
                    children: [
                      jsx.jsx("h3", { children: "申請禁入之期限" }),
                      jsx.jsxs("div", {
                        className: "form-grid cols-3",
                        children: [
                          jsx.jsx(Field, {
                            label: "生效日",
                            required: true,
                            children: jsx.jsx("input", {
                              type: "date",
                              value: effectiveDate,
                              onChange: (event) => {
                                (setEffectiveDate(event.target.value),
                                  term && term !== "其他" && setEndDate(computeTermEndDate(term, event.target.value)),
                                  clearTermInvalid("effectiveDate"),
                                  clearTermInvalid("dateOrder"));
                              },
                              className: termInvalidFields.includes("effectiveDate") ? "input-error" : "",
                            }),
                          }),
                          jsx.jsx(Field, {
                            label: "期限",
                            children: jsx.jsx(Select, {
                              value: term,
                              onChange: (event) => {
                                (setTerm(event.target.value),
                                  termMonths[event.target.value] &&
                                    setEndDate(computeTermEndDate(event.target.value, effectiveDate)),
                                  clearTermInvalid("term"),
                                  clearTermInvalid("endDate"));
                              },
                              className:
                                termInvalidFields.includes("term")
                                  ? "input-error"
                                  : endDate && !term
                                    ? "term-muted"
                                    : "",
                              children: ["", "六個月", "一年", "十八個月", "兩年"].map((option) =>
                                jsx.jsx("option", { value: option, children: option || "請選擇期限" }, option || "placeholder"),
                              ),
                            }),
                          }),
                          jsx.jsx(Field, {
                            label: jsx.jsxs(jsx.Fragment, {
                              children: [
                                "廢止日",
                                term && term !== "其他" && jsx.jsx("span", { className: "field-tag", children: "自動計算" }),
                              ],
                            }),
                            children: jsx.jsx("input", {
                              type: "date",
                              value: endDate,
                              onChange: (event) => {
                                (setEndDate(event.target.value),
                                  event.target.value && setTerm(""),
                                  clearTermInvalid("endDate"),
                                  clearTermInvalid("term"),
                                  clearTermInvalid("dateOrder"));
                              },
                              className: termInvalidFields.includes("endDate") ? "input-error" : "",
                            }),
                          }),
                        ],
                      }),
                      (termInvalidFields.includes("effectiveDate") ||
                        termInvalidFields.includes("dateOrder") ||
                        termInvalidFields.includes("term") ||
                        termInvalidFields.includes("endDate")) &&
                        jsx.jsx("div", {
                          className: "field-error",
                          children: termInvalidFields.includes("effectiveDate")
                            ? "請填寫生效日。"
                            : termInvalidFields.includes("dateOrder")
                              ? "廢止日不可早於生效日。"
                              : "請選擇期限或填寫廢止日（二選一）。",
                        }),
                    ],
                  }),
                  jsx.jsxs("div", {
                    className: "form-section",
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
                                checked: scope === "全部",
                                onChange: () => (setScope("全部"), clearTermInvalid("scope")),
                              }),
                              " 全部",
                            ],
                          }),
                          jsx.jsxs("label", {
                            children: [
                              jsx.jsx("input", {
                                type: "radio",
                                checked: scope === "指定承批公司",
                                onChange: () => (setScope("指定承批公司"), clearTermInvalid("scope")),
                              }),
                              " 禁入除外的承批公司（可複選）",
                            ],
                          }),
                        ],
                      }),
                      scope === "指定承批公司" &&
                        jsx.jsx("div", {
                          className: "check-grid",
                          children: [
                            "澳娛綜合度假股份有限公司",
                            "永利渡假村（澳門）股份有限公司",
                            "美高梅金殿超濠股份有限公司",
                            "新濠博亞（澳門）股份有限公司",
                            "銀河娛樂場股份有限公司",
                            "威尼斯人澳門股份有限公司",
                          ].map((option) =>
                            jsx.jsxs(
                              "label",
                              {
                                children: [
                                  jsx.jsx("input", {
                                    type: "checkbox",
                                    checked: companies.includes(option),
                                    onChange: () =>
                                      (setCompanies(
                                        companies.includes(option)
                                          ? companies.filter((item) => item !== option)
                                          : [...companies, option],
                                      ),
                                      clearTermInvalid("scope")),
                                  }),
                                  option,
                                ],
                              },
                              option,
                            ),
                          ),
                        }),
                      termInvalidFields.includes("scope") &&
                        jsx.jsx("div", {
                          className: "field-error",
                          children: "請選擇博彩承批公司範圍；選擇「禁入除外的承批公司」時，須至少勾選一間。",
                        }),
                    ],
                  }),
                  jsx.jsxs("div", {
                    className: "form-section",
                    children: [
                      jsx.jsx("h3", { children: "聲明及問卷" }),
                      jsx.jsxs("div", {
                        className: "inline-question",
                        children: [
                          jsx.jsxs("b", {
                            children: [
                              "輔導服務",
                              jsx.jsx("span", { className: "required-mark", children: "*" }),
                            ],
                          }),
                          jsx.jsxs("label", {
                            children: [
                              jsx.jsx("input", {
                                type: "radio",
                                name: "counsel-service",
                                checked: counsel === "同意",
                                onChange: () => (setCounsel("同意"), clearTermInvalid("counsel")),
                              }),
                              " 同意",
                            ],
                          }),
                          jsx.jsxs("label", {
                            children: [
                              jsx.jsx("input", {
                                type: "radio",
                                name: "counsel-service",
                                checked: counsel === "不同意",
                                onChange: () => (setCounsel("不同意"), clearTermInvalid("counsel")),
                              }),
                              " 不同意",
                            ],
                          }),
                        ],
                      }),
                      termInvalidFields.includes("counsel") &&
                        jsx.jsx("div", {
                          className: "field-error",
                          children: "請選擇是否同意輔導服務。",
                        }),
                    ],
                  }),
                ],
              }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "知悉禁入申請服務途徑" }),
                jsx.jsx("div", {
                  className: "check-grid compact",
                  children: [
                    "朋友",
                    "家人",
                    "同事",
                    "博企",
                    "社會工作局",
                    "賭博輔導中心",
                    "宣傳資料",
                    "其他",
                  ].map((option) =>
                    jsx.jsxs(
                      "label",
                      {
                        children: [
                          jsx.jsx("input", {
                            type: "checkbox",
                            checked: referralChannels.includes(option),
                            onChange: () =>
                              setReferralChannels(
                                referralChannels.includes(option)
                                  ? referralChannels.filter((item) => item !== option)
                                  : [...referralChannels, option],
                              ),
                          }),
                          option,
                        ],
                      },
                      option,
                    ),
                  ),
                }),
                referralChannels.includes("其他") &&
                  jsx.jsx("div", {
                    className: "other-referral-field",
                    children: jsx.jsx(Field, {
                      label: "其他途徑",
                      children: jsx.jsx("input", {
                        type: "text",
                        value: referralOther,
                        placeholder: "請輸入其他途徑",
                        maxLength: 100,
                        onChange: (event) => setReferralOther(event.target.value),
                      }),
                    }),
                  }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "上傳證件" }),
                jsx.jsx(Field, {
                  label: "證件類型",
                  children: jsx.jsx(Select, {
                    className: "doc-type",
                    value: docType,
                    onChange: (event) => setDocType(event.target.value),
                    children: [
                      "澳門居民身份證",
                      "外地僱員身份認別證",
                      "護照",
                      "下拉項字典配置", 
                    ].map((option) => jsx.jsx("option", { children: option }, option)),
                  }),
                }),
                jsx.jsxs("div", {
                  className: "upload-box",
                  children: [
                    jsx.jsx(Vd, { size: 26 }),
                    jsx.jsx("b", {
                      children: `拖曳「${docType}」掃描件至此，或點擊上傳`,
                    }),
                    jsx.jsx("input", {
                      type: "file",
                      onChange: (event) => {
                        event.target.files[0] &&
                          !documents.some((item) => item.name === event.target.files[0].name) &&
                          setDocuments([
                            ...documents,
                            { type: docType, name: event.target.files[0].name },
                          ]);
                        event.target.value = "";
                      },
                    }),
                  ],
                }),
                jsx.jsx("div", {
                  className: "file-list",
                  children: documents.map((doc) =>
                    jsx.jsxs(
                      "span",
                      {
                        onClick: () => setPreviewFile({ name: doc.name, type: doc.type }),
                        children: [
                          jsx.jsx(W8, {}),
                          jsx.jsx("b", {
                            className: "file-type",
                            children: doc.type,
                          }),
                          doc.name,
                          jsx.jsx("button", {
                            onClick: (event) => {
                              event.stopPropagation();
                              setDocuments(documents.filter((item) => item.name !== doc.name));
                            },
                            children: jsx.jsx(mf, {}),
                          }),
                        ],
                      },
                      doc.type + doc.name,
                    ),
                  ),
                }),
              ],
            }),
            mode !== "terminate" &&
              jsx.jsxs("div", {
                className: "form-section",
                children: [
                  jsx.jsx("h3", { children: "上傳近照" }),
                  jsx.jsxs("div", {
                    className: "upload-box",
                    children: [
                      jsx.jsx(Nd, { size: 26 }),
                      jsx.jsx("b", { children: "拖曳近照至此，或點擊上傳" }),
                      jsx.jsx("input", {
                        type: "file",
                        accept: "image/*",
                        onChange: (event) => {
                          event.target.files[0] && setPhotoName(event.target.files[0].name);
                          event.target.value = "";
                        },
                      }),
                    ],
                  }),
                  photoName &&
                    jsx.jsx("div", {
                      className: "file-list",
                      children: jsx.jsxs(
                        "span",
                        {
                          onClick: () => setPreviewFile({ name: photoName }),
                          children: [
                            jsx.jsx(W8, {}),
                            photoName,
                            jsx.jsx("button", {
                              onClick: (event) => {
                                event.stopPropagation();
                                setPhotoName("");
                              },
                              children: jsx.jsx(mf, {}),
                            }),
                          ],
                        },
                        photoName,
                      ),
                    }),
                ],
              }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx(Button, {
                  variant: "ghost",
                  onClick: () => (mode === "terminate" ? onCancel() : setStep(1)),
                  children: "上一步",
                }),
                jsx.jsx(Button, {
                  onClick: () => {
                    if (mode !== "terminate") {
                      const missing = [];
                      if (!effectiveDate) missing.push("effectiveDate");
                      if (!term && !endDate) missing.push("term", "endDate");
                      if (effectiveDate && endDate && endDate < effectiveDate) missing.push("dateOrder");
                      if (!scope || (scope === "指定承批公司" && companies.length === 0)) missing.push("scope");
                      if (!counsel) missing.push("counsel");
                      if (missing.length) return setTermInvalidFields(missing);
                    }
                    showPreview();
                  },
                  children: isRelative ? "下一步" : "預覽",
                }),
              ],
            }),
          ],
        });
  return jsx.jsxs(jsx.Fragment, {
    children: [
      jsx.jsx("div", {
        className: "page-heading",
        children: jsx.jsxs("div", {
          children: [
            jsx.jsx("h1", { children: mode === "terminate" ? "廢止申請" : "申請" }),
          ],
        }),
      }),
      content,
      previewFile && jsx.jsx(FilePreview, { file: previewFile, onClose: () => setPreviewFile(null) }),
    ],
  });
}
function ApplicationPreviewScreen({ data: data, documents: documents, photoName: photoName, relativeFiles: relativeFiles, onBack: onBack, onSubmit: onSubmit, onPreviewFile: onPreviewFile }) {
  const steps =
    data.mode === "terminate"
      ? WizardSteps.terminate
      : data.party === "親屬申請"
        ? WizardSteps.relative
        : WizardSteps.intake;
  return jsx.jsxs("section", {
    className: "panel preview",
    children: [
      jsx.jsxs("div", {
        className: "section-title",
        children: [
          jsx.jsxs("div", {
            children: [
              jsx.jsx("h2", { children: "確認提交" }),
              jsx.jsx("p", { children: "請核對以下申請資料，確認無誤後提交。" }),
            ],
          }),
          jsx.jsx(Badge, { children: "待提交" }),
        ],
      }),
      jsx.jsx(WizardProgress, { current: steps.length, steps: steps }),
      jsx.jsxs("div", {
        className: "form-section",
        children: [
          jsx.jsx("h3", {
            children: data.party === "親屬申請" ? "被申請人證件資料" : "申請人證件資料",
          }),
          jsx.jsxs("div", {
            className: "summary-grid",
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "姓名（中文）" }),
                  jsx.jsx("b", { children: data.name }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "姓名（外文）" }),
                  jsx.jsx("b", { children: data.en }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "性別" }),
                  jsx.jsx("b", { children: data.party === "親屬申請" ? data.relative.gender : data.applicant.gender }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "出生日期" }),
                  jsx.jsx("b", { children: data.party === "親屬申請" ? data.relative.birth : data.applicant.birth }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "證件類型" }),
                  jsx.jsx("b", { children: (data.party === "親屬申請" ? data.relative.docType : data.applicant.docType) || "—" }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "證件號碼" }),
                  jsx.jsx("b", { children: (data.party === "親屬申請" ? data.relative.docNo : data.doc) || "—" }),
                ],
              }),
            ],
          }),
        ],
      }),
      jsx.jsxs("div", {
        className: "form-section",
        children: [
          jsx.jsx("h3", { children: "申請人個人資料" }),
          jsx.jsxs("div", {
            className: "summary-grid",
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "職業" }),
                  jsx.jsx("b", { children: data.personal.occupation }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "電郵" }),
                  jsx.jsx("b", { children: data.personal.email }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "聯絡手提電話" }),
                  jsx.jsx("b", {
                    children: `${data.personal.phoneCode} ${data.personal.phone}`,
                  }),
                ],
              }),
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("span", { children: "地址" }),
                  jsx.jsx("b", { children: data.personal.address }),
                ],
              }),
            ],
          }),
        ],
      }),
      data.mode !== "terminate" &&
        jsx.jsxs(jsx.Fragment, {
          children: [
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "申請禁入之期限" }),
                jsx.jsxs("div", {
                  className: "summary-grid",
                  children: [
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "生效日" }),
                        jsx.jsx("b", { children: data.effectiveDate }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "期限" }),
                        jsx.jsx("b", { children: data.term || "—" }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "廢止日" }),
                        jsx.jsx("b", { children: data.endDate || "—" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "申請禁入之博彩承批公司" }),
                jsx.jsxs("div", {
                  className: "summary-grid",
                  children: [
                    jsx.jsxs("div", {
                      className: "span-full",
                      children: [
                        jsx.jsx("span", { children: "禁入範圍" }),
                        jsx.jsx("b", {
                          children: jsx.jsx(InlineSeparatedList, {
                            items:
                              data.scope === "全部"
                                ? ["全部承批公司"]
                                : data.companies.length
                                  ? data.companies
                                  : ["未指定承批公司"],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "聲明及問卷" }),
                jsx.jsxs("div", {
                  className: "summary-grid",
                  children: [
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "輔導服務" }),

                        jsx.jsx("b", { children: data.counsel }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      className: "span-after-first",
                      children: [
                        jsx.jsx("span", { children: "知悉禁入申請服務途徑" }),
                        jsx.jsx("b", {
                          children: jsx.jsx(InlineSeparatedList, {
                            items: data.referralChannels.map((channel) =>
                              channel === "其他" && data.referralOther ? `其他：${data.referralOther}` : channel,
                            ),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      jsx.jsxs("div", {
        className: "form-section",
        children: [
          jsx.jsx("h3", { children: "上傳證件" }),
          jsx.jsx("div", {
            className: "file-list",
            children: documents.map((doc) =>
              jsx.jsxs(
                "span",
                {
                  onClick: () => onPreviewFile({ name: doc.name, type: doc.type }),
                  children: [
                    jsx.jsx(W8, {}),
                    jsx.jsx("b", { className: "file-type", children: doc.type }),
                    doc.name,
                  ],
                },
                doc.type + doc.name,
              ),
            ),
          }),
        ],
      }),
      data.mode !== "terminate" &&
        photoName &&
        jsx.jsxs("div", {
          className: "form-section",
          children: [
            jsx.jsx("h3", { children: "上傳近照" }),
            jsx.jsx("div", {
              className: "file-list",
              children: jsx.jsxs(
                "span",
                {
                  onClick: () => onPreviewFile({ name: photoName }),
                  children: [jsx.jsx(W8, {}), photoName],
                },
                photoName,
              ),
            }),
          ],
        }),
      data.party === "親屬申請" &&
        jsx.jsxs(jsx.Fragment, {
          children: [
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "親屬證件資料" }),
                jsx.jsxs("div", {
                  className: "summary-grid",
                  children: [
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "姓名（中文）" }),
                        jsx.jsx("b", { children: data.relative.name }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "姓名（外文）" }),
                        jsx.jsx("b", { children: data.relative.en }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "證件類型" }),
                        jsx.jsx("b", { children: data.relative.docType }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "證件號碼" }),
                        jsx.jsx("b", { children: data.relative.docNo }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "親屬個人資料" }),
                jsx.jsxs("div", {
                  className: "summary-grid",
                  children: [
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "親屬關係" }),
                        jsx.jsx("b", { children: data.relative.relation }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "親屬姓名" }),
                        jsx.jsx("b", { children: data.relative.name }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "性別" }),
                        jsx.jsx("b", { children: data.relative.gender }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "出生日期" }),
                        jsx.jsx("b", { children: data.relative.birth }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "職業" }),
                        jsx.jsx("b", { children: data.relative.occupation }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "電郵" }),
                        jsx.jsx("b", { children: data.relative.email }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "聯絡手提電話" }),
                        jsx.jsx("b", {
                          children: `${data.relative.phoneCode} ${data.relative.phone}`,
                        }),
                      ],
                    }),
                    jsx.jsxs("div", {
                      children: [
                        jsx.jsx("span", { children: "地址" }),
                        jsx.jsx("b", { children: data.relative.address }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            jsx.jsxs("div", {
              className: "form-section",
              children: [
                jsx.jsx("h3", { children: "上傳親屬證件" }),
                jsx.jsx("div", {
                  className: "file-list",
                  children: relativeFiles.map((doc) =>
                    jsx.jsxs(
                      "span",
                      {
                        onClick: () => onPreviewFile({ name: doc.name, type: doc.type }),
                        children: [
                          jsx.jsx(W8, {}),
                          jsx.jsx("b", { className: "file-type", children: doc.type }),
                          doc.name,
                        ],
                      },
                      doc.type + doc.name,
                    ),
                  ),
                }),
              ],
            }),
          ],
        }),
      jsx.jsxs("div", {
        className: "form-actions",
        children: [
          jsx.jsx(Button, { variant: "ghost", onClick: onBack, children: "上一步" }),
          jsx.jsx(Button, { icon: Ed, onClick: onSubmit, children: "提交並列印申請表" }),
        ],
      }),
    ],
  });
}
