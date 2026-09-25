(function attachWorkflow(root, factory) {
  const workflow = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = workflow;
  if (root) root.DICJWorkflow = workflow;
})(typeof window !== "undefined" ? window : null, function createWorkflow() {
  const ROLES = {
    COUNTER: "櫃枱人員",
    PROCESSOR: "處理人員",
    SUPERVISOR: "主管",
    ADMIN: "系統管理員",
  };

  const SOURCES = {
    ONLINE: "一戶通",
    COUNTER: "親臨",
  };

  // 一戶通案件審批通過後，依申請人選擇的取件方式自動進入取件分支
  const PICKUP_METHODS = {
    LOCKER: "智取易",
    COUNTER: "親臨",
    ELECTRONIC: "電子通知",
  };

  // 狀態的流程順序：主線依序推進，退回緊接其來源的複核／審批；
  // 已審批後依取件方式分為實體取件（智取易／親臨）及電子通知兩段；作廢為最後的終止狀態
  const STATUS_ORDER = [
    "待處理",
    "已通知補件",
    "待複核",
    "待審批",
    "退回",
    "已審批",
    "等待制件",
    "已制件",
    "已送出",
    "送達待取件",
    "已通知取件",
    "已取件",
    "已發送電子通知",
    "待查閱",
    "已查閱",
    "完成",
    "作廢",
  ];

  const TERMINAL_STATUSES = new Set(["完成", "作廢"]);
  const COUNTER_VOIDABLE_STATUSES = new Set(["待處理", "待審批", "已審批", "退回"]);

  const ACTIONS = {
    confirm_missing: {
      label: "確認缺件並發送通知",
      role: ROLES.COUNTER,
      section: "main",
      variant: "danger",
      message: "已確認缺件，補件通知已自動發送",
    },
    submit_initial_review: {
      label: "完成初審並送複核",
      role: ROLES.COUNTER,
      section: "main",
      message: "初審完成，案件已送交處理人員複核",
    },
    // 申請人於一戶通補件屬外部事件：演示按鈕由櫃枱人員按下，但歷程記為申請人補交，之後由系統自動確認收到
    simulate_applicant_supplement: {
      label: "模擬申請人於一戶通補件",
      role: ROLES.COUNTER,
      section: "simulation",
      historyActor: "申請人",
      historyLabel: "於一戶通補交資料",
      message: "（模擬）申請人已於一戶通補交資料",
    },
    complete_review: {
      label: "完成複核並上呈主管審批",
      role: ROLES.PROCESSOR,
      section: "main",
      message: "複核完成，案件已上呈主管審批",
    },
    return_case: {
      label: "退回案件",
      role: ROLES.PROCESSOR,
      section: "main",
      variant: "danger",
      message: "案件已退回收件人員跟進修正",
    },
    approve_sign: {
      label: "審批通過並雲簽",
      role: ROLES.SUPERVISOR,
      section: "main",
      message: "審批完成，文件已雲簽",
    },
    request_return: {
      label: "退回",
      role: ROLES.SUPERVISOR,
      section: "main",
      variant: "danger",
      message: "主管已要求退回案件修正",
    },
    send_correction_notice: {
      label: "發送修正通知",
      role: ROLES.COUNTER,
      section: "notification",
      message: "修正通知已發送予申請人",
    },
    resubmit_review: {
      label: "確認補交並重新送複核",
      role: ROLES.COUNTER,
      section: "main",
      message: "補交資料已確認，案件重新送交複核",
    },
    complete_processing: {
      label: "完成案件處理",
      role: ROLES.PROCESSOR,
      section: "main",
      message: "已記錄處理人員完成案件處理",
    },
    complete_production: {
      label: "完成制件",
      role: ROLES.COUNTER,
      section: "main",
      message: "制件已完成",
    },
    dispatch_to_locker: {
      label: "送出至智取易",
      role: ROLES.COUNTER,
      section: "main",
      message: "文件已送出至智取易",
    },
    // section "simulation"：演示用按鈕，代替智取易／一戶通系統回傳的外部事件
    simulate_locker_arrival: {
      label: "模擬智取易送達",
      role: ROLES.COUNTER,
      section: "simulation",
      message: "（模擬）文件已送達智取易，待申請人取件",
    },
    send_pickup_notice: {
      label: "發送取件通知",
      role: ROLES.COUNTER,
      section: "notification",
      message: "取件通知已發送",
    },
    simulate_locker_pickup: {
      label: "模擬申請人於智取易取件",
      role: ROLES.COUNTER,
      section: "simulation",
      message: "（模擬）申請人已於智取易取件",
    },
    record_handover: {
      label: "記錄交件及簽收",
      role: ROLES.COUNTER,
      section: "notification",
      message: "已記錄交件與申請人簽收",
    },
    simulate_notice_delivered: {
      label: "模擬電子通知送達",
      role: ROLES.COUNTER,
      section: "simulation",
      message: "（模擬）電子通知已送達一戶通，待申請人查閱",
    },
    simulate_notice_read: {
      label: "模擬申請人查閱",
      role: ROLES.COUNTER,
      section: "simulation",
      message: "（模擬）申請人已查閱電子通知",
    },
    close_case: {
      label: "結案",
      role: ROLES.COUNTER,
      section: "main",
      message: "案件已結案",
    },
    counter_submit_review: {
      label: "完成列印、簽署並送複核",
      role: ROLES.COUNTER,
      section: "main",
      message: "臨櫃申請表已簽署，案件送交處理人員複核",
    },
    counter_return_case: {
      label: "退回案件",
      role: ROLES.PROCESSOR,
      section: "main",
      variant: "danger",
      message: "案件已退回櫃枱人員跟進修正",
    },
    counter_complete_review: {
      label: "完成複核並送主管",
      role: ROLES.PROCESSOR,
      section: "main",
      message: "複核完成，案件已轉交主管審批",
    },
    counter_request_return: {
      label: "退回",
      role: ROLES.SUPERVISOR,
      section: "main",
      variant: "danger",
      message: "主管已要求退回案件修正",
    },
    counter_approve_sign: {
      label: "審批通過並雲簽",
      role: ROLES.SUPERVISOR,
      section: "main",
      message: "審批完成，通知書及公函已雲簽",
    },
    counter_resubmit_review: {
      label: "確認補正並重新送複核",
      role: ROLES.COUNTER,
      section: "main",
      message: "補正已確認，案件重新送交複核",
    },
    counter_record_handover: {
      label: "記錄領取及簽收",
      role: ROLES.COUNTER,
      section: "notification",
      message: "文件已交付並完成簽收，案件完成",
    },
    void_case: {
      label: "作廢案件",
      roles: [ROLES.PROCESSOR, ROLES.SUPERVISOR],
      section: "main",
      variant: "danger",
      message: "案件已作廢",
    },
  };

  function nowString() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function cloneFlags(application) {
    return {
      correctionNoticeSent: false,
      processingCompleted: false,
      ...(application.flags || {}),
    };
  }

  // 未填或舊資料的取件方式：「電子方式」視為電子通知，其餘（含「郵寄」）視為親臨，與列表的預設顯示一致
  function getPickupMethod(application) {
    const method = ((application && application.termsDetails) || {}).pickupMethod;
    if (method === PICKUP_METHODS.LOCKER) return PICKUP_METHODS.LOCKER;
    if (method === PICKUP_METHODS.ELECTRONIC || method === "電子方式") return PICKUP_METHODS.ELECTRONIC;
    return PICKUP_METHODS.COUNTER;
  }

  function actionAllowedForRole(action, role) {
    return role === ROLES.ADMIN || action.role === role || (action.roles || []).includes(role);
  }

  function availableOnlineActionIds(application) {
    const flags = cloneFlags(application);
    const pickupMethod = getPickupMethod(application);
    switch (application.status) {
      case "待處理":
        return ["confirm_missing", "submit_initial_review"];
      case "已通知補件":
        return ["simulate_applicant_supplement"];
      case "待複核":
        return ["return_case", "complete_review"];
      case "待審批":
        return ["request_return", "approve_sign"];
      case "退回":
        return flags.correctionNoticeSent
          ? ["resubmit_review"]
          : ["send_correction_notice"];
      // 已審批不會停留：審批通過時即自動轉入取件分支（見 getAutoAdvance）
      case "等待制件":
        return ["complete_production"];
      case "已制件":
        return pickupMethod === PICKUP_METHODS.LOCKER ? ["dispatch_to_locker"] : ["send_pickup_notice"];
      case "已送出":
        return ["simulate_locker_arrival"];
      case "送達待取件":
        return ["send_pickup_notice"];
      case "已通知取件":
        return pickupMethod === PICKUP_METHODS.LOCKER ? ["simulate_locker_pickup"] : ["record_handover"];
      case "已發送電子通知":
        return ["simulate_notice_delivered"];
      case "待查閱":
        return ["simulate_notice_read"];
      case "已取件":
      case "已查閱":
        return ["close_case"];
      default:
        return [];
    }
  }

  function availableCounterActionIds(application) {
    const flags = cloneFlags(application);
    const actionIds = [];
    // 未記錄內部階段的待審批案件視為處理人員複核，避免案件無人可操作
    const isSupervisorStage = application.stage === "supervisor_approval";

    if (application.status === "待處理") actionIds.push("counter_submit_review");
    if (application.status === "待審批" && !isSupervisorStage) {
      actionIds.push("counter_return_case", "counter_complete_review");
    }
    if (application.status === "待審批" && isSupervisorStage) {
      actionIds.push("counter_request_return", "counter_approve_sign");
    }
    if (application.status === "退回") actionIds.push("counter_resubmit_review");
    if (application.status === "已審批") {
      actionIds.push(flags.processingCompleted ? "counter_record_handover" : "complete_processing");
    }
    if (COUNTER_VOIDABLE_STATUSES.has(application.status)) actionIds.push("void_case");
    return actionIds;
  }

  function getAvailableActions(application, role) {
    if (!application || TERMINAL_STATUSES.has(application.status)) return [];
    const ids = application.source === SOURCES.ONLINE
      ? availableOnlineActionIds(application)
      : availableCounterActionIds(application);
    return ids
      .map((id) => ({ id, ...ACTIONS[id] }))
      .filter((action) => actionAllowedForRole(action, role));
  }

  // 只適用於親臨案件；一戶通審批通過後即自動轉入取件分支，不停留在已審批
  function getApprovedResponsibleRole(application) {
    const flags = cloneFlags(application);
    // 親臨案件由處理人員完成案件處理後，由櫃枱記錄領取
    return flags.processingCompleted ? ROLES.COUNTER : ROLES.PROCESSOR;
  }

  function getResponsibleRole(application) {
    if (!application) return "—";
    if (application.status === "完成") return "已完成";
    if (application.status === "作廢") return "已作廢";
    if (application.source === SOURCES.ONLINE) {
      if (application.status === "待複核") return ROLES.PROCESSOR;
      if (application.status === "待審批") return ROLES.SUPERVISOR;
      // 其餘狀態（收件、補件、退回及取件各步）均由櫃枱人員跟進
      return ROLES.COUNTER;
    }
    if (application.status === "待處理") return ROLES.COUNTER;
    if (application.status === "退回") return ROLES.COUNTER;
    if (application.status === "已審批") return getApprovedResponsibleRole(application);
    if (application.status === "待審批") {
      return application.stage === "supervisor_approval" ? ROLES.SUPERVISOR : ROLES.PROCESSOR;
    }
    return "—";
  }

  function applyAction(application, actionId) {
    const next = {
      ...application,
      flags: cloneFlags(application),
      history: [...(application.history || [])],
    };

    switch (actionId) {
      case "confirm_missing":
        next.status = "已通知補件";
        break;
      case "submit_initial_review":
        next.status = "待複核";
        break;
      case "simulate_applicant_supplement":
        // 狀態先維持已通知補件，由 getAutoAdvance 自動確認收到補交資料後返回待處理
        break;
      case "complete_review":
        next.status = "待審批";
        break;
      case "return_case":
      case "request_return":
        next.status = "退回";
        next.flags.correctionNoticeSent = false;
        break;
      case "approve_sign":
      case "counter_approve_sign":
        next.status = "已審批";
        next.stage = null;
        break;
      case "send_correction_notice":
        next.flags.correctionNoticeSent = true;
        break;
      case "resubmit_review":
        next.status = "待複核";
        next.flags.correctionNoticeSent = false;
        break;
      case "complete_processing":
        next.flags.processingCompleted = true;
        break;
      case "complete_production":
        next.status = "已制件";
        break;
      case "dispatch_to_locker":
        next.status = "已送出";
        break;
      case "simulate_locker_arrival":
        next.status = "送達待取件";
        break;
      case "send_pickup_notice":
        next.status = "已通知取件";
        break;
      case "simulate_locker_pickup":
      case "record_handover":
        next.status = "已取件";
        break;
      case "simulate_notice_delivered":
        next.status = "待查閱";
        break;
      case "simulate_notice_read":
        next.status = "已查閱";
        break;
      case "close_case":
      case "counter_record_handover":
        next.status = "完成";
        next.stage = null;
        break;
      case "counter_submit_review":
      case "counter_resubmit_review":
        next.status = "待審批";
        next.stage = "processor_review";
        break;
      case "counter_return_case":
      case "counter_request_return":
        next.status = "退回";
        next.stage = null;
        break;
      case "counter_complete_review":
        next.status = "待審批";
        next.stage = "supervisor_approval";
        break;
      case "void_case":
        next.status = "作廢";
        next.stage = null;
        break;
      default:
        throw new Error("未知的流程操作");
    }
    return next;
  }

  // 系統自動轉移：
  // - 申請人於一戶通補件後，系統自動確認收到補交資料，案件返回待處理
  // - 一戶通審批通過後不停留在已審批，依取件方式送交制件或發送電子通知
  function getAutoAdvance(application, actionId) {
    if (actionId === "simulate_applicant_supplement") {
      return { status: "待處理", label: "自動確認收到補交資料", message: "系統已自動確認收到補交資料，案件返回待處理" };
    }
    if (application.source !== SOURCES.ONLINE || application.status !== "已審批") return null;
    return getPickupMethod(application) === PICKUP_METHODS.ELECTRONIC
      ? { status: "已發送電子通知", label: "自動發送電子通知", message: "電子通知已自動發送" }
      : { status: "等待制件", label: "自動送交制件", message: "已自動送交制件" };
  }

  function transition(application, actionId, role, options) {
    const availableAction = getAvailableActions(application, role).find((action) => action.id === actionId);
    if (!availableAction) throw new Error("目前角色或案件狀態不允許此操作");

    const previousStatus = application.status;
    const next = applyAction(application, actionId);
    const note = options && options.note ? String(options.note).trim() : "";
    const time = (options && options.time) || nowString();
    // 模擬外部事件可指定歷程的實際行為人（如申請人），不記為按下演示按鈕的角色
    next.history.push({
      actorRole: availableAction.historyActor || role,
      action: availableAction.historyLabel || availableAction.label,
      fromStatus: previousStatus,
      toStatus: next.status,
      time,
      note,
    });
    const autoAdvance = getAutoAdvance(next, actionId);
    if (!autoAdvance) return { application: next, message: availableAction.message };
    // 自動轉移另記一筆「系統」歷程，保留轉移前的節點（如已審批）
    next.history.push({
      actorRole: "系統",
      action: autoAdvance.label,
      fromStatus: next.status,
      toStatus: autoAdvance.status,
      time,
      note: "",
    });
    next.status = autoAdvance.status;
    return { application: next, message: `${availableAction.message}，${autoAdvance.message}` };
  }

  function isActionable(application, role) {
    return getAvailableActions(application, role).length > 0;
  }

  function getActionableApplications(applications, role) {
    return applications.filter((application) => isActionable(application, role));
  }

  return {
    ACTIONS,
    PICKUP_METHODS,
    ROLES,
    SOURCES,
    STATUS_ORDER,
    TERMINAL_STATUSES,
    getActionableApplications,
    getAvailableActions,
    getPickupMethod,
    getResponsibleRole,
    isActionable,
    transition,
  };
});
