/* ================================================================
 * App 主程式（導航配置 + 版本改動記錄 + 登入畫面 + 主應用程式殼層 + 進入點）
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → 本檔
 * ================================================================ */

/* ----------------------------------------------------------------
 * 導航配置 Navigation（側邊欄主選單，配合 7.4 的畫面切換）
 * ---------------------------------------------------------------- */
const NAV_ITEMS = [
  { label: "工作台", id: "dashboard", icon: z0 },
  {
    label: "臨櫃收件",
    id: "intake",
    icon: Md,
    children: [
      { label: "申請", id: "intake" },
      { label: "廢止", id: "terminate" },
    ],
  },
  { label: "申請管理", id: "applications", icon: W8 },
  { label: "報表及查詢", id: "reports", icon: Na },
  { label: "行政處罰名單", id: "sanctions", icon: rf },
  { label: "內容模板管理", id: "templates", icon: T0 },
  { label: "公眾假期管理", id: "holidays", icon: Kc },
  { label: "字典配置", id: "dictionary", icon: W8 },
  { label: "角色權限管理", id: "roles", icon: V0 },
  { label: "帳號管理", id: "accounts", icon: Nd },
  { label: "操作日誌", id: "logs", icon: W8 },
];
const APP_VERSION = "2026.09.24 12:44PM";
const FRONTEND_CHANGELOG = [
  {
    title: "2026.09.24 更新內容",
    items: [
      "確認提交頁的禁入範圍及知悉禁入申請服務途徑摘要改為橫跨整列，避免長內容被三欄網格折成多行。",
      "確認提交頁的「知悉禁入申請服務途徑」顯示於第一列第 2、3 欄；案件詳情維持獨立的三欄摘要排列。",
      "申請禁入之博彩承批公司及知悉禁入申請服務途徑的長列表，改以「項目＋頓號」為換行單位並盡量填滿每列。",
      "填寫申請資料時勾選「其他」可顯示手動輸入欄位，並將輸入內容保存至草稿及確認提交頁。",
      "複核完成後的操作按鈕由「完成複核並送審」調整為「完成複核並上呈主管審批」。",
    ],
  },
    {
title: "2026.09.22 更新內容",
items: [
  "工作台數據標籤由「我的待辦／超時未處理」改為「項待辦／項超時」",
  "核查禁入紀錄畫面的草稿提示移至核查結果及紀錄列表之下方",
  "親屬資料的「與被申請人關係」移至電子郵件之後",
  "左側導覽文字、圖示及子選單文字改為較深色；「帳號管理」導覽圖示亦已更換。",
  "全站表格最小寬度由 820px 增至 1000px、文字顏色加深，操作欄改為窄欄且不換行，操作按鈕亦不換行。",
"申請及廢止流程的 wizard 進度指示改為與案件流程一致的連線圓點風格。",
"列印文件預覽彈窗的底部操作區新增「代任簽署」說明，以及「代處長」、「代廳長」勾選項；只有「已簽署」或「已簽署，待列印」的文件不顯示這組選項。",
"帳號管理的新增按鈕改為「新建本地帳號」，新建彈窗改為單欄並新增必填的初始密碼欄位。",
"點擊「預覽」後，畫面會自動移到頁面最上方",
],
},
  {
title: "2026.09.21 下午更新內容",
items: [
"在detail-main中移除了兩個「編輯」按鈕",
"修改案件「操作紀錄」顯示，操作人員除角色外現會同時顯示姓名",
"列印文件panel 新增「聲明書」欄",
"「待辦申請」及「申請管理」列表，「申請人」欄位現同時顯示中文姓名及外文姓名，外文姓名以次要文字顯示於中文姓名下方",
"強化案件詳情頁「可執行操作」區域的視覺提示，加入淺藍色背景及更明顯的藍色陰影，並將標題改為深藍色"
],
},
{
title: "2026.09.21 上午更新內容",
items: [
"優化案件詳情側邊欄導覽，從「工作台」、「申請管理」或「臨櫃收件」進入案件詳情時，保留原功能選項的高亮狀態。",
"簡化各功能頁面的標題區域，移除標題上方的 eyebrow 輔助標籤及標題下方的說明文字，套用於工作台、臨櫃收件、申請管理、報表、行政處罰名單、模板、公眾假期、系統設定及操作日誌等頁面。",
"重整工作台統計資訊，將「我的待辦」及「超時未處理」移至「待辦申請」面板標題右側，兩項數據整合為同一統計區塊並以分隔線區隔，同時改為隨內容自適應寬度及縮小圖示與數字尺寸。",
"調整整體介面密度，縮小主要內容區內距，頁面標題由 28px 調整為 24px，並縮短頁面標題與內容之間的距離。",
"優化身份資料讀取方式的選擇介面，卡片最大寬度由 760px 調整為 560px，最低高度由 164px 調整為 120px，使畫面更緊湊。"
],
},
  {
    title: "2026.09.20 更新內容",
    items: [
      "博彩承批公司及輔導服務改為必填欄位，並修正「指定承批公司」錯誤預選的顯示問題。",
      "新增日期驗證，廢止日不得早於生效日。",
      "工作台及申請管理列表新增「申請方」欄位，可顯示並排序「本人／親屬」申請類型。",
      "優化親屬申請案件詳情顯示：清楚區分被申請人與提出申請的親屬資料，並新增顯示親屬身份、與被申請人關係及聯絡資料；本人申請的顯示方式維持不變。",
      "一戶通案件確認缺件後，系統自動發送補件通知並直接進入「已通知補件」，移除「待通知補件」狀態及手動發送通知的操作。",
      "工作台及申請管理列表欄位以「取件方式」取代「通知方式」",
      "表格新增排序功能，點擊欄位標題可依該欄位排序，並顯示排序方向",
      "美化案件流程進度條",
      "移除「待通知補件」狀態；確認缺件後系統會自動發送補件通知並直接進入「已通知補件」，收到補交資料後則返回「待處理」",
      ],
    },
  {
    title: "2026.09.16 更新內容",
    items: [
      "申請人證件資料新增國籍欄位。", 
    ],
  },
  {
    title: "2026.09.15 更新內容",
    items: [
      "移除申請概況中的當前負責角色欄位。",
      "案件詳情的期限、通知與聲明資料支援編輯、儲存及取消。",
    ],
  },
  {
    title: "2026.09.14 更新內容",
    items: [
      "移除工作台的暫存 Panel，草稿改於核查禁入紀錄步驟偵測。",
      "支援按最新禁入紀錄判斷草稿能否恢復，並顯示不相容原因。",
      "恢復草稿時可自動切換申請或廢止流程；重新填寫會先刪除舊草稿。",
      "保留自動暫存、離開流程時儲存，以及提交成功後刪除草稿。",
      "列表欄位調整為申請編號、類型、來源、狀態、禁入娛樂場範圍、創建時間、生效時間及廢止時間。",
      "保留操作／查閱欄，並新增類型、來源及狀態排序。",
      "移除核查結果標題右側的生效中狀態標籤。",
      "移除表單頁的草稿恢復彈窗及自動暫存提示 popup。",
      "移除流程頁 section-title 右側的輔助說明文字。",
      "版本號移至左側導覽列底部，點擊可查看本次前端改動。",
    ],
  },
  
];

/* ---- 7.4 畫面 Screens：登入畫面 ---- */
function LoginScreen({ onLogin: onLogin }) {
  const [selectedRole, setSelectedRole] = React.useState("系統管理員");
  return jsx.jsxs("div", {
    className: "login-screen",
    children: [
      jsx.jsxs("div", {
        className: "login-brand",
        children: [
          jsx.jsx(V0, { size: 42, weight: "duotone" }),
          jsx.jsxs("div", {
            children: [
              jsx.jsx("h1", { children: "娛樂場禁入申請管理系統" }),
            
            ],
          }),
        ],
      }),
      jsx.jsxs("form", {
        className: "login-card",
        onSubmit: (event) => {
          (event.preventDefault(), onLogin(selectedRole));
        },
        children: [
          jsx.jsx("p", { className: "eyebrow", children: "登入" }),
          jsx.jsx("h2", { children: "歡迎回來" }),
          jsx.jsx("p", { children: "請使用模擬 AD 帳號登入系統。" }),
          jsx.jsx(Field, {
            label: "帳號名稱",
            required: true,
            children: jsx.jsx("input", { defaultValue: "DICJ-001" }),
          }),
          jsx.jsx(Field, {
            label: "密碼",
            required: true,
            children: jsx.jsx("input", {
              type: "password",
              defaultValue: "prototype",
            }),
          }),
          jsx.jsx(Field, {
            label: "模擬角色",
            children: jsx.jsxs(Select, {
              value: selectedRole,
              onChange: (event) => setSelectedRole(event.target.value),
              children: DemoData.roles.map((role) =>
                jsx.jsx("option", { children: role }, role),
              ),
            }),
          }),
          jsx.jsx(Button, { type: "submit", children: "登入系統" })
        ],
      }),
    ],
  });
}
/* ---- 7.4 畫面 Screens：主應用程式（導航／狀態／重置演示）---- */
function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true),
    [role, setRole] = React.useState("系統管理員"),
    [route, setRoute] = React.useState(() => window.location.hash.slice(1) || "dashboard"),
    [applications, setApplications] = React.useState(DemoData.applications),
    [currentApplication, setCurrentApplication] = React.useState(null),
    [detailOrigin, setDetailOrigin] = React.useState("applications"),
    [intake, setIntake] = React.useState(null),
    [checkResult, setCheckResult] = React.useState(null),
    [resumeDraft, setResumeDraft] = React.useState(null),
    [toast, setToast] = React.useState(""),
    [contextMenu, setContextMenu] = React.useState(null),
    [fillKey, setFillKey] = React.useState(0),
    [fillScenario, setFillScenario] = React.useState(""),
    [pendingLeaveAction, setPendingLeaveAction] = React.useState(null),
    [showFrontendChanges, setShowFrontendChanges] = React.useState(false),
    [flowDirty, setFlowDirty] = React.useState(false),
        contextMenuRef = React.useRef(null),
        draftSaveRef = React.useRef(null),
    roleAccess = {
      櫃枱人員: ["dashboard", "intake", "applications"],
      處理人員: [
        "dashboard",
        "applications",
        "reports",
        "sanctions",
      ],
      主管: [
        "dashboard",
        "applications",
        "reports",
        "sanctions",
        "templates",
        "logs",
      ],
      系統管理員: NAV_ITEMS.map((navItem) => navItem.id),
    },
    canAccessRoute = (targetRole, targetRoute) =>
      targetRoute === "detail" ||
      (roleAccess[targetRole] || []).includes(targetRoute === "terminate" ? "intake" : targetRoute),
    isFlowActive = isLoggedIn && (route === "intake" || route === "terminate"),
    requestLeaveFlow = (action) => {
      if (isFlowActive && flowDirty) {
        setContextMenu(null);
        setPendingLeaveAction(() => action);
      } else {
        action();
      }
    },
    openDetail = (application) => {
      (setDetailOrigin(route === "approvals" ? "dashboard" : route), setCurrentApplication(application), setRoute("detail"));
    },
    navigate = (routeId) => {
      if (routeId === route || !canAccessRoute(role, routeId)) return;
      requestLeaveFlow(() => {
        (window.history.pushState(null, "", `#${routeId}`), setRoute(routeId), setCurrentApplication(null), setIntake(null), setCheckResult(null), setResumeDraft(null), setFlowDirty(false));
      });
    },
    resumeCheckedDraft = (saved) => {
      const targetRoute = saved.mode === "terminate" ? "terminate" : "intake";
      (setCurrentApplication(null),
        setIntake({
          mode: targetRoute,
          docNo: saved.docNo || (intake && intake.docNo) || "",
          applicant: { ...((intake && intake.applicant) || {}), ...(saved.applicant || {}) },
        }),
        setCheckResult(targetRoute === "terminate" ? true : saved.appType),
        setResumeDraft(saved),
        setFlowDirty(false),
        setRoute(targetRoute),
        window.history.replaceState(null, "", `#${targetRoute}`),
        setToast("已恢復暫存草稿"),
        setTimeout(() => setToast(""), 2200));
    },
    resetDemo = () => requestLeaveFlow(() => {
      ((clearAllDrafts(), seedDemoDrafts()),
        setApplications(
        DemoData.applications.map((app) => ({
          ...app,
          flags: { ...(app.flags || {}) },
          history: [...(app.history || [])],
        })),
      ),
        setCurrentApplication(null),
        setIntake(null),
        setCheckResult(null),
        setResumeDraft(null),
        setFillKey(0),
        setFillScenario(""),
        setFlowDirty(false),
        setRoute("dashboard"),
        (window.history.pushState(null, "", "#dashboard")),
        setToast("演示資料已重置"),
        setTimeout(() => setToast(""), 2200));
    }),
    createApplication = (formData) => {
      var partyText;
      const caseId = `${111 + applications.length}/DICJ/2026`,
        isRelativeCase = formData.party === "親屬申請",
        newApplication = makeDemoApplication({
          id: caseId,
          name: formData.name,
          type:
            formData.mode === "terminate"
              ? "廢止"
              : formData.appType === "續期"
                ? "續期"
                : "申請",
          source: "親臨",
          party:
            ((partyText = formData.party) == null ? undefined : partyText.replace("申請", "")) ||
            "本人",
          status: "待處理",
          notify: "電子通知",
          time: "2026-08-27 10:30",
          applicantDetails: isRelativeCase
            ? {
                foreignName: formData.en,
                gender: formData.relative.gender || "",
                birthDate: formData.relative.birth || "",
                docType: formData.relative.docType || "",
                docNo: formData.relative.docNo || "",
                phone: `${formData.relative.phoneCode || ""} ${formData.relative.phone || ""}`.trim(),
                email: formData.relative.email,
                address: formData.relative.address,
              }
            : {
                foreignName: formData.en,
                gender: formData.applicant.gender || "",
                birthDate: formData.applicant.birth || "",
                docType: formData.applicant.docType || "",
                docNo: formData.doc,
                phone: `${formData.personal.phoneCode || ""} ${formData.personal.phone || ""}`.trim(),
                email: formData.personal.email,
                address: formData.personal.address,
              },
          filerDetails: isRelativeCase
            ? {
                name: formData.applicant.name || "",
                foreignName: formData.applicant.en || "",
                relation: formData.relative.relation || "",
                gender: formData.applicant.gender || "",
                birthDate: formData.applicant.birth || "",
                docType: formData.applicant.docType || "",
                docNo: formData.doc,
                phone: `${formData.personal.phoneCode || ""} ${formData.personal.phone || ""}`.trim(),
                email: formData.personal.email,
                address: formData.personal.address,
              }
            : null,
          termsDetails: {
            effectiveDate: formData.effectiveDate,
            endDate: formData.endDate,
            scope:
              formData.scope === "全部"
                ? "全部"
                : formData.companies.join("、") || formData.scope,
            pickupMethod: "親臨",
            counsel: formData.counsel,
            referralChannels: (formData.referralChannels || []).join("、"),
          },
        });
      (formData.applicant &&
        formData.applicant.docType &&
        formData.doc &&
        removeDraft(buildDraftKey(formData.applicant.docType, formData.doc)),
        setApplications([newApplication, ...applications]),
        setCurrentApplication(newApplication),
        setDetailOrigin(formData.mode === "terminate" ? "terminate" : "intake"),
        setRoute("detail"),
        setIntake(null),
        setCheckResult(null),
        setResumeDraft(null),
        setFlowDirty(false),
        window.history.replaceState(null, "", "#detail"),
        setToast(`申請 ${caseId} 已建立，申請表已準備列印`),
        setTimeout(() => setToast(""), 3e3));
    },
    handleTransition = (action, note) => {
      if (!currentApplication) throw new Error("找不到目前案件");
      const result = transitionApplication(currentApplication, action, role, { note: note });
      return (
        setApplications((list) => list.map((app) => (app.id === currentApplication.id ? result.application : app))),
        setCurrentApplication(result.application),
        result
      );
    },
    handleApplicantUpdate = (details) => {
      if (!currentApplication) return;
      const updatedApplication = {
        ...currentApplication,
        name: details.name,
        applicantDetails: details,
      };
      (setApplications((list) =>
        list.map((app) => (app.id === currentApplication.id ? updatedApplication : app)),
      ), setCurrentApplication(updatedApplication));
    },
    handleTermsUpdate = (details) => {
      if (!currentApplication) return;
      const updatedApplication = {
        ...currentApplication,
        termsDetails: details,
      };
      (setApplications((list) =>
        list.map((app) => (app.id === currentApplication.id ? updatedApplication : app)),
      ), setCurrentApplication(updatedApplication));
    },
    renderScreen = () => {
      if (route === "dashboard" || route === "approvals")
        return jsx.jsx(DashboardScreen, {
          applications: applications,
          onOpen: openDetail,
          role: role,
        });
      if (route === "intake" || route === "terminate")
        return !intake
          ? jsx.jsx(IntakeReadScreen, { mode: route, onContinue: (nextIntake) => (setResumeDraft(null), setIntake(nextIntake)), fillKey: fillKey, fillScenario: fillScenario, onDirty: () => setFlowDirty(true) })
          : !checkResult
            ? jsx.jsx(RecordCheck, {
                mode: route,
                docNo: intake.docNo,
                docType: intake.applicant && intake.applicant.docType,
                onBack: () => setIntake(null),
                onContinue: (appType) => (setResumeDraft(null), setCheckResult(appType || true)),
                onResumeDraft: resumeCheckedDraft,
              })
            : jsx.jsx(ApplicationFormScreen, {
                mode: route === "terminate" ? "terminate" : "new",
                docNo: intake.docNo,
                appType: checkResult,
                applicant: intake.applicant,
                fillKey: fillKey,
                resumeDraft: resumeDraft,
                onSaveRef: (saveFn) => (draftSaveRef.current = saveFn),
                onDirty: () => setFlowDirty(true),
                onSubmit: createApplication,
                onCancel: () => (setResumeDraft(null), setCheckResult(null)),
              });
      if (route === "applications")
        return jsx.jsx(ApplicationsListScreen, { rows: applications, onOpen: openDetail });
      if (route === "detail")
        return jsx.jsx(ApplicationDetailScreen, {
          application: currentApplication,
          onBack: () => navigate("applications"),
          onTransition: handleTransition,
          onUpdateApplicant: handleApplicantUpdate,
          onUpdateTerms: handleTermsUpdate,
          role: role,
        });
      if (route === "reports") return jsx.jsx(ReportsScreen, {});
      if (route === "sanctions") return jsx.jsx(SanctionsScreen, {});
      if (route === "templates") return jsx.jsx(TemplatesScreen, {});
      if (route === "holidays") return jsx.jsx(HolidaysScreen, {});
      if (["dictionary", "roles", "accounts"].includes(route))
        return jsx.jsx(SettingsScreen, { kind: route });
      if (route === "logs") return jsx.jsx(OperationLogsScreen, {});
    };
  React.useEffect(() => {
    const handleHashChange = () => {
      const id = window.location.hash.slice(1) || "dashboard";
      if (id === route) return;
      if (isFlowActive) window.history.replaceState(null, "", `#${route}`);
      requestLeaveFlow(() => {
        const rawTarget = id === "detail" && !currentApplication ? "applications" : id,
          target = canAccessRoute(role, rawTarget) ? rawTarget : "dashboard";
        window.history.replaceState(null, "", `#${target}`);
        (setRoute(target), setIntake(null), setCheckResult(null), setResumeDraft(null), setFlowDirty(false));
        if (target !== "detail") setCurrentApplication(null);
      });
    };
    const handleBeforeUnload = (event) => {
      if (!isFlowActive || !flowDirty) return;
      draftSaveRef.current && draftSaveRef.current();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [route, isLoggedIn, currentApplication, flowDirty, role]);
  React.useEffect(() => {
    /* 啟動時寫入示範草稿，確保「澳門居民身份證 12345678 已暫存」可演示 */
    seedDemoDrafts();
  }, []);
  React.useEffect(() => {
    const handleGlobalClick = (event) => {
      if (event.target && contextMenuRef.current && contextMenuRef.current.contains(event.target)) return;
      setContextMenu(null);
    };
    return (
      window.addEventListener("click", handleGlobalClick),
      () => window.removeEventListener("click", handleGlobalClick)
    );
  }, []);
  if (!isLoggedIn)
    return jsx.jsx(LoginScreen, {
      onLogin: (selectedRole) => {
        (setRole(selectedRole),
          setIsLoggedIn(true),
          setRoute(selectedRole === "櫃枱人員" ? "intake" : "dashboard"),
          setFlowDirty(false),
          (window.location.hash = selectedRole === "櫃枱人員" ? "intake" : "dashboard"));
      },
    });
  const visibleNavItems = NAV_ITEMS.filter((navItem) => roleAccess[role].includes(navItem.id)),
    activeNavRoute = route === "detail" ? detailOrigin : route,
    approvalCount = getActionableApplications(applications, role).length,
    account = DemoAccounts.find((account) => account.role === role) || DemoAccounts[3];
  return jsx.jsxs("div", {
    className: "app-shell",
    onContextMenu: (contextEvent) => {
      (contextEvent.preventDefault(), setContextMenu({ x: contextEvent.clientX, y: contextEvent.clientY }));
    },
    children: [
      jsx.jsxs("header", {
        children: [
          jsx.jsxs("div", {
            className: "brand",
            children: [
              
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("b", { children: "娛樂場禁入申請管理系統" }),
                ],
              }),
            ],
          }),
          jsx.jsxs("div", {
            className: "user-menu",
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsx("b", { children: account.name }),
                  jsx.jsx("span", { children: role }),
                ],
              }),
              jsx.jsx(Nd, { size: 32 }),
              jsx.jsxs("button", {
                className: "logout",
                onClick: () => requestLeaveFlow(() => {
                  (setIntake(null), setCheckResult(null), setFlowDirty(false), setIsLoggedIn(false));
                }),
                children: [jsx.jsx(zd, { size: 19 }), "登出"],
              }),
            ],
          }),
        ],
      }),
      jsx.jsxs("aside", {
        className: "sidebar",
        children: [
          jsx.jsx("nav", {
            children: visibleNavItems.map((navItem) =>
              jsx.jsxs(
                "div",
                {
                  className: "nav-group",
                  children: [
                    jsx.jsxs("button", {
                      className:
                        activeNavRoute === navItem.id ||
                        (navItem.children && navItem.children.some((child) => child.id === activeNavRoute))
                          ? "active"
                          : "",
                      onClick: () => navigate(navItem.id),
                      children: [
                        navItem.icon &&
                          jsx.jsx("span", {
                            className: "nav-icon",
                            children: jsx.jsx(navItem.icon, { size: 19, weight: "duotone" }),
                          }),
                        jsx.jsx("span", { children: navItem.label }),
                        ((navItem.id === "dashboard" ? approvalCount : navItem.badge) > 0) &&
                          jsx.jsx("i", {
                            children: navItem.id === "dashboard" ? approvalCount : navItem.badge,
                          }),
                        navItem.children && jsx.jsx(Ad, { size: 15 }),
                      ],
                    }),
                    navItem.children &&
                      jsx.jsx("div", {
                        className: "subnav",
                        children: navItem.children.map((child) =>
                          jsx.jsx(
                            "button",
                            {
                              className: activeNavRoute === child.id ? "active" : "",
                              onClick: () => navigate(child.id),
                              children: child.label,
                            },
                            child.id,
                          ),
                        ),
                      }),
                  ],
                },
                navItem.id,
              ),
            ),
          }),
          jsx.jsx("button", {
            type: "button",
            className: "sidebar-foot",
            onClick: () => setShowFrontendChanges(true),
            "aria-haspopup": "dialog",
            children: jsx.jsx("span", { children: `版本 ${APP_VERSION}` }),
          }),
        ],
      }),
      jsx.jsx("main", { className: "content", children: renderScreen() }),
      showFrontendChanges &&
        jsx.jsx(Modal, {
          title: `版本 ${APP_VERSION} 前端改動`,
          onClose: () => setShowFrontendChanges(false),
          bodyClassName: "frontend-changelog-scroll",
          children: jsx.jsx("div", {
            className: "frontend-changelog",
            children: FRONTEND_CHANGELOG.map((section) =>
              jsx.jsxs(
                "section",
                {
                  children: [
                    jsx.jsx("h3", { children: section.title }),
                    jsx.jsx("ul", {
                      children: section.items.map((item) => jsx.jsx("li", { children: item }, item)),
                    }),
                  ],
                },
                section.title,
              ),
            ),
          }),
        }),
      pendingLeaveAction && jsx.jsx(Modal, {
        title: "確認離開流程",
        onClose: () => setPendingLeaveAction(null),
        children: jsx.jsxs(jsx.Fragment, {
          children: [
            jsx.jsx("p", {
              className: "confirm-text",
              children: "申請或廢止流程尚未完成，離開時會將已填寫的資料暫存為草稿，可依證件資料恢復。確定要離開嗎？",
            }),
            jsx.jsxs("div", {
              className: "form-actions",
              children: [
                jsx.jsx(Button, {
                  variant: "danger",
                  onClick: () => {
                    setPendingLeaveAction(null);
                    draftSaveRef.current && draftSaveRef.current();
                    pendingLeaveAction();
                  },
                  children: "確認離開並暫存",
                }),
                jsx.jsx(Button, {
                  onClick: () => setPendingLeaveAction(null),
                  children: "繼續填寫",
                }),
              ],
            }),
          ],
        }),
      }),
      toast &&
        jsx.jsxs("div", { className: "toast", children: [jsx.jsx(z0, {}), toast] }),
      contextMenu &&
        jsx.jsxs("div", {
          ref: contextMenuRef,
          className: "context-menu",
          style: { left: contextMenu.x, top: contextMenu.y },
          children: [
            jsx.jsx("div", { className: "menu-label", children: "演示用 · 切換角色" }),
            jsx.jsx(Select, {
              value: role,
              onChange: (event) => {
                const newRole = event.target.value;
                const mustLeave = !canAccessRoute(newRole, route);
                const changeRole = () => {
                if (mustLeave) {
                  (window.history.pushState(null, "", "#dashboard"), setRoute("dashboard"), setIntake(null), setCheckResult(null), setFlowDirty(false));
                }
                (setRole(newRole),
                  setToast(`已切換為${newRole}`),
                  setTimeout(() => setToast(""), 1800),
                  setContextMenu(null));
                };
                if (mustLeave) requestLeaveFlow(changeRole);
                else changeRole();
              },
              children: DemoData.roles.map((roleOption) =>
                jsx.jsx("option", { value: roleOption, children: roleOption }, roleOption),
              ),
            }),
            jsx.jsx("div", { className: "menu-label", children: "演示用 · 填充申請資料" }),
            jsx.jsx("button", {
              onClick: () => {
                (setContextMenu(null), setFillScenario("renew"), setFillKey(fillKey + 1));
              },
              children: "30天可續期",
            }),
            jsx.jsx("button", {
              onClick: () => {
                (setContextMenu(null), setFillScenario("blocked"), setFillKey(fillKey + 1));
              },
              children: "未到期",
            }),
            jsx.jsx("button", {
              onClick: () => {
                (setContextMenu(null), setFillScenario("fresh"), setFillKey(fillKey + 1));
              },
              children: "新申請",
            }),
            jsx.jsx("div", { className: "menu-divider" }),
            jsx.jsx("button", {
              onClick: () => {
                (setContextMenu(null), resetDemo());
              },
              children: "重置演示資料",
            }),
          ],
        }),
    ],
  });
}
/* ---- 7.5 應用程式入口 App entry ---- */
ReactDOM.createRoot(document.getElementById("root")).render(
  jsx.jsx(StrictMode.StrictMode, { children: jsx.jsx(App, {}) }),
);
