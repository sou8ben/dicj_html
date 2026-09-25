/* ----------------------------------------------------------------
 * 7.1 示範資料 Demo Data
 * 集中所有演示假數據：登入帳號、申請、行政處罰名單、模板、
 * 操作日誌、報表、字典／角色／帳號設定。
 * 在頁面按滑鼠右鍵，選「重置演示資料」即還原到這裡的初始值。
 * ---------------------------------------------------------------- */
const DemoAccounts = [
  {
    id: "DICJ-001",
    name: "陳怡婷",
    role: "櫃枱人員",
    status: "啟用",
    updated: "2026-07-05 10:20",
  },
  {
    id: "DICJ-002",
    name: "吳建成",
    role: "處理人員",
    status: "停用",
    updated: "2026-07-06 14:05",
  },
  {
    id: "DICJ-003",
    name: "劉佩珊",
    role: "主管",
    status: "啟用",
    updated: "2026-07-08 09:40",
  },
  {
    id: "DICJ-004",
    name: "陳嘉敏",
    role: "系統管理員",
    status: "啟用",
    updated: "2026-08-27 09:40",
  },
];

const dicjWorkflow = window.DICJWorkflow;
const {
  ACTIONS: WorkflowActions,
  PICKUP_METHODS: WorkflowPickupMethods,
  ROLES: WorkflowRoles,
  STATUS_ORDER: WorkflowStatusOrder,
  getActionableApplications,
  getAvailableActions,
  getPickupMethod,
  transition: transitionApplication,
} = dicjWorkflow;

const makeDemoApplication = (application) => ({
  stage: null,
  flags: {
    correctionNoticeSent: false,
    processingCompleted: false,
  },
  history: [
    {
      actorRole: application.source === "一戶通" ? "申請人" : "櫃枱人員",
      action: `${application.source}建立${application.type}`,
      fromStatus: null,
      toStatus: "待處理",
      time: application.time,
      note: "",
    },
  ],
  ...application,
  applicantDetails: {
    foreignName: "WONG CHI MEN",
    gender: "男",
    birthDate: "1984-03-16",
    docType: "澳門居民身份證",
    docNo: "1234567(8)",
    phone: "+853 6688 1234",
    email: "demo@example.com",
    address: "澳門黑沙環海邊馬路88號",
    ...(application.applicantDetails || {}),
  },
  flags: {
    correctionNoticeSent: false,
    processingCompleted: false,
    ...(application.flags || {}),
  },
});

const padDatePart = (part) => String(part).padStart(2, "0"),
  // 澳門居民身份證 13888888 的廢止時間：當前日期 + 20 天，讓廢止申請流程隨時可演示
  exclusionEndDate = (() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 20);
    return `${endDate.getFullYear()}-${padDatePart(endDate.getMonth() + 1)}-${padDatePart(endDate.getDate())} 00:00`;
  })();

/* ---- 演示案件生成：由「待處理」起按流程重放操作，狀態、內部階段、標記及歷程必與 workflow 一致 ----
 * hoursAgo：相對系統時間的建立時數；steps：依序執行的操作 id，或 [操作 id, 意見]。
 * 各步操作於建立後每 20 小時執行一次，最後一步不晚於一小時前。 */
const formatDemoTime = (date) =>
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`,
  buildDemoCase = ({ hoursAgo: hoursAgo, steps: steps = [], ...application }) => {
    const hourMs = 36e5,
      createdAt = Date.now() - hoursAgo * hourMs,
      stepGap = steps.length ? Math.min(20 * hourMs, ((hoursAgo - 1) * hourMs) / steps.length) : 0;
    return steps.reduce(
      (current, step, index) => {
        const [actionId, note = ""] = [].concat(step),
          action = WorkflowActions[actionId];
        return transitionApplication(current, actionId, action.role || action.roles[0], {
          time: formatDemoTime(new Date(createdAt + stepGap * (index + 1))),
          note: note,
        }).application;
      },
      makeDemoApplication({ ...application, status: "待處理", time: formatDemoTime(new Date(createdAt)) }),
    );
  };

// 共用流程片段
const OnlineToApproval = ["submit_initial_review", "complete_review", "approve_sign"],
  CounterToApproval = ["counter_submit_review", "counter_complete_review", "counter_approve_sign"],
  // 一戶通審批通過後自動轉入取件分支（智取易／親臨 → 等待制件；電子通知 → 已發送電子通知），各取件方式的後續操作
  OnlinePickupSteps = {
    智取易: [
      "complete_production",
      "dispatch_to_locker",
      "simulate_locker_arrival",
      "send_pickup_notice",
      "simulate_locker_pickup",
      "close_case",
    ],
    親臨: ["complete_production", "send_pickup_notice", "record_handover", "close_case"],
    電子通知: ["simulate_notice_delivered", "simulate_notice_read", "close_case"],
  },
  // 取件分支：第 n 位申請人停在分支的第 n 步（第 0 位為審批通過後自動轉入的狀態），每個狀態一筆
  buildPickupBranch = (pickupMethod, applicants) =>
    applicants.map((applicant, index) =>
      buildDemoCase({
        type: "申請",
        source: "一戶通",
        party: "本人",
        notify: "電子通知",
        termsDetails: { pickupMethod: pickupMethod },
        ...applicant,
        steps: [...OnlineToApproval, ...OnlinePickupSteps[pickupMethod].slice(0, index)],
      }),
    );

const DemoData = {
  roles: ["櫃枱人員", "處理人員", "主管", "系統管理員"],
  accounts: DemoAccounts,
  // 超時未審批判定天數（SLA）
  slaDays: 3,
  // 列表順序：一戶通在前、親臨在後，各自按流程順序排列；一戶通審批後依取件方式分為三條分支，每個狀態一筆
  applications: [
    /* ---- 一戶通：收件至審批 ---- */
    buildDemoCase({
      id: "130/DICJ/2026",
      name: "梁志明",
      type: "申請",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "電子通知" },
      hoursAgo: 3,
    }),
    buildDemoCase({
      id: "129/DICJ/2026",
      name: "黃美玲",
      type: "申請",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "智取易" },
      hoursAgo: 100,
      steps: [["confirm_missing", "缺少身份證副本及近照"]],
    }),
    buildDemoCase({
      id: "128/DICJ/2026",
      name: "蘇麗華",
      type: "申請",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "親臨" },
      hoursAgo: 26,
      steps: ["submit_initial_review"],
    }),
    buildDemoCase({
      id: "127/DICJ/2026",
      name: "林國強",
      type: "申請",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "電子通知" },
      hoursAgo: 50,
      steps: ["submit_initial_review", "complete_review"],
    }),
    // 退回（處理人員複核退回，待發修正通知）
    buildDemoCase({
      id: "126/DICJ/2026",
      name: "郭子健",
      type: "廢止",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "電子通知" },
      hoursAgo: 60,
      steps: ["submit_initial_review", ["return_case", "申請表簽名與身份證明文件不符"]],
    }),
    // 退回（主管要求退回，已發修正通知，待確認補交）
    buildDemoCase({
      id: "125/DICJ/2026",
      name: "陳小燕",
      type: "續期",
      source: "一戶通",
      party: "本人",
      notify: "電子通知",
      termsDetails: { pickupMethod: "智取易" },
      hoursAgo: 96,
      steps: [
        "submit_initial_review",
        "complete_review",
        ["request_return", "禁入期限與申請表不符，請申請人確認"],
        "send_correction_notice",
      ],
    }),
    /* ---- 一戶通取件：智取易（審批通過 → 等待制件 → 已制件 → 已送出 → 送達待取件 → 已通知取件 → 已取件 → 完成）---- */
    ...buildPickupBranch("智取易", [
      { id: "124/DICJ/2026", name: "黃子朗", hoursAgo: 36 },
      { id: "123/DICJ/2026", name: "何美琪", hoursAgo: 40 },
      { id: "122/DICJ/2026", name: "劉建邦", hoursAgo: 44 },
      { id: "121/DICJ/2026", name: "梁嘉儀", hoursAgo: 48 },
      { id: "120/DICJ/2026", name: "麥美儀", hoursAgo: 54 },
      { id: "119/DICJ/2026", name: "譚志偉", hoursAgo: 60 },
      { id: "118/DICJ/2026", name: "羅家明", hoursAgo: 200 },
    ]),
    /* ---- 一戶通取件：親臨（審批通過 → 等待制件 → 已制件 → 已通知取件 → 已取件 → 完成）---- */
    ...buildPickupBranch("親臨", [
      { id: "117/DICJ/2026", name: "趙文傑", hoursAgo: 38 },
      { id: "116/DICJ/2026", name: "楊淑儀", type: "續期", hoursAgo: 42 },
      { id: "115/DICJ/2026", name: "馬俊傑", hoursAgo: 50 },
      { id: "114/DICJ/2026", name: "鍾美華", hoursAgo: 58 },
      { id: "113/DICJ/2026", name: "葉志明", hoursAgo: 180 },
    ]),
    /* ---- 一戶通取件：電子通知（審批通過 → 已發送電子通知 → 待查閱 → 已查閱 → 完成）---- */
    ...buildPickupBranch("電子通知", [
      { id: "112/DICJ/2026", name: "潘家樂", hoursAgo: 34 },
      { id: "111/DICJ/2026", name: "盧詩敏", type: "廢止", hoursAgo: 40 },
      { id: "110/DICJ/2026", name: "韋俊賢", hoursAgo: 46 },
      { id: "109/DICJ/2026", name: "高詠芝", hoursAgo: 150 },
    ]),
    /* ---- 親臨 ---- */
    buildDemoCase({
      id: "108/DICJ/2026",
      name: "區麗珊",
      type: "申請",
      source: "親臨",
      party: "本人",
      notify: "短信",
      hoursAgo: 1.5,
    }),
    // 待審批（處理人員複核）
    buildDemoCase({
      id: "107/DICJ/2026",
      name: "周永康",
      type: "申請",
      source: "親臨",
      party: "親屬",
      notify: "短信",
      filerDetails: {
        name: "周麗雯",
        foreignName: "CHAO LAI MAN",
        relation: "兄弟姊妹",
        gender: "女",
        birthDate: "1982-11-02",
        docType: "澳門居民身份證",
        docNo: "2345678(9)",
        phone: "+853 6699 2345",
        email: "chao.lm@example.com",
        address: "澳門筷子基北灣大馬路12號",
      },
      hoursAgo: 20,
      steps: ["counter_submit_review"],
    }),
    // 待審批（主管審批）
    buildDemoCase({
      id: "106/DICJ/2026",
      name: "李嘉欣",
      type: "申請",
      source: "親臨",
      party: "本人",
      notify: "短信",
      hoursAgo: 45,
      steps: ["counter_submit_review", "counter_complete_review"],
    }),
    buildDemoCase({
      id: "105/DICJ/2026",
      name: "吳家豪",
      type: "續期",
      source: "親臨",
      party: "本人",
      notify: "短信",
      hoursAgo: 75,
      steps: [
        "counter_submit_review",
        "counter_complete_review",
        ["counter_request_return", "禁入範圍與申請人聲明不一致，請補正申請表"],
      ],
    }),
    // 已審批（待處理人員完成案件處理）
    buildDemoCase({
      id: "104/DICJ/2026",
      name: "馮少芬",
      type: "續期",
      source: "親臨",
      party: "親屬",
      notify: "短信",
      filerDetails: {
        name: "馮建邦",
        foreignName: "FONG KIN PONG",
        relation: "卑親屬",
        gender: "男",
        birthDate: "1975-04-18",
        docType: "澳門居民身份證",
        docNo: "3456789(0)",
        phone: "+853 6611 3456",
        email: "fong.kp@example.com",
        address: "澳門台山巴波沙大馬路56號",
      },
      hoursAgo: 52,
      steps: CounterToApproval,
    }),
    // 已審批（已完成案件處理，待記錄領取）
    buildDemoCase({
      id: "103/DICJ/2026",
      name: "陳志華",
      type: "申請",
      source: "親臨",
      party: "本人",
      notify: "短信",
      hoursAgo: 90,
      steps: [...CounterToApproval, "complete_processing"],
    }),
    buildDemoCase({
      id: "102/DICJ/2026",
      name: "林國強",
      type: "廢止",
      source: "親臨",
      party: "本人",
      notify: "電子通知",
      hoursAgo: 170,
      steps: [...CounterToApproval, "complete_processing", "counter_record_handover"],
    }),
    buildDemoCase({
      id: "101/DICJ/2026",
      name: "鄭文浩",
      type: "申請",
      source: "親臨",
      party: "本人",
      notify: "短信",
      hoursAgo: 230,
      steps: ["counter_submit_review", ["void_case", "申請人撤回申請"]],
    }),
  ],
  sanctions: [
    {
      zh: "何國偉",
      en: "HO KUOK WAI",
      doc: "澳門居民身份證",
      no: "5566778(3)",
      scope: "全部",
      start: "2026-07-12 09:18",
      end: "2027-07-12 09:18",
    },
    {
      zh: "麥心怡",
      en: "MAK SAM I",
      doc: "外地僱員身份認別證",
      no: "P1234567",
      scope: "全部",
      start: "2026-06-10 10:00",
      end: "2027-06-10 10:00",
    },
    {
      zh: "彭家傑",
      en: "PANG KA KIT",
      doc: "澳門居民身份證",
      no: "3321567(0)",
      scope: "銀河娛樂",
      start: "2026-05-12 09:18",
      end: "2027-05-12 09:18",
    },
    {
      zh: "陳嘉玲",
      en: "CHAN KA LENG",
      doc: "澳門居民身份證",
      no: "8899221(4)",
      scope: "全部",
      start: "2026-04-08 15:30",
      end: "2027-04-08 15:30",
    },
  ],
  // 公眾假期（第60/2000號行政命令訂定的 2026 年公眾假期，由 ICS 日曆檔匯入）
  holidays: [
    { name: "元旦", date: "2026-01-01", created: "2026-06-30 15:20" },
    { name: "農曆正月初一", date: "2026-02-17", created: "2026-06-30 15:20" },
    { name: "農曆正月初二", date: "2026-02-18", created: "2026-06-30 15:20" },
    { name: "農曆正月初三", date: "2026-02-19", created: "2026-06-30 15:20" },
    { name: "耶穌受難日", date: "2026-04-03", created: "2026-06-30 15:20" },
    { name: "復活節前日", date: "2026-04-04", created: "2026-06-30 15:20" },
    { name: "清明節", date: "2026-04-05", created: "2026-06-30 15:20" },
    { name: "勞動節", date: "2026-05-01", created: "2026-06-30 15:20" },
    { name: "佛誕節", date: "2026-05-24", created: "2026-06-30 15:20" },
    { name: "端午節", date: "2026-06-19", created: "2026-06-30 15:20" },
    { name: "中秋節翌日", date: "2026-09-26", created: "2026-06-30 15:20" },
    { name: "中華人民共和國國慶日", date: "2026-10-01", created: "2026-06-30 15:20" },
    { name: "中華人民共和國國慶日翌日", date: "2026-10-02", created: "2026-06-30 15:20" },
    { name: "重陽節", date: "2026-10-18", created: "2026-06-30 15:20" },
    { name: "追思節", date: "2026-11-02", created: "2026-06-30 15:20" },
    { name: "聖母無原罪瞻禮", date: "2026-12-08", created: "2026-06-30 15:20" },
    { name: "澳門特別行政區成立紀念日", date: "2026-12-20", created: "2026-06-30 15:20" },
    { name: "冬至", date: "2026-12-22", created: "2026-06-30 15:20" },
    { name: "聖誕節前日", date: "2026-12-24", created: "2026-06-30 15:20" },
    { name: "聖誕節", date: "2026-12-25", created: "2026-06-30 15:20" },
  ],
  // 以「證件類型:證件號碼」為鍵，核查時需兩者相符
  exclusionHistory: {
    "澳門居民身份證:13888888": [
      {
        id: "98/DICJ/2025",
        scope: "全部",
        createdAt: "2025-08-20 09:15",
        start: "2025-09-01 00:00",
        end: exclusionEndDate,
      },
      {
        id: "8/DICJ/2025",
        scope: "全部",
        createdAt: "2024-08-20 09:15",
        start: "2024-09-01 00:00",
        end: "2025-09-01 00:00",
      },
    ],
    "澳門居民身份證:88888888": [
      {
        id: "88/DICJ/2025",
        scope: "全部",
        createdAt: "2025-08-20 09:15",
        start: "2025-09-01 00:00",
        end: "2027-09-01 00:00",
      },
    ],
    "澳門居民身份證:20001234": [
      {
        id: "61/DICJ/2024",
        scope: "全部",
        createdAt: "2024-05-10 09:00",
        start: "2024-06-01 00:00",
        end: "2027-06-01 00:00",
      },
    ],
  },
  templates: [
    {
      name: "批准通知",
      type: "電子通知",
      content: "【DICJ】{{申請人姓名}}您好，禁入申請 {{禁入編號}} 已獲批准。",
      active: !0,
    },
    {
      name: "即將到期提醒",
      type: "短信",
      content: "【DICJ】{{申請人姓名}}您好，禁入令將於 {{到期日}} 到期。",
      active: !0,
    },
    {
      name: "補件通知",
      type: "短信",
      content: "【DICJ】請於六個月內補交所需文件。",
      active: !1,
    },
  ],
  logs: [
    ["DICJ-001", "建立", "2026-08-27 10:20", "本人申請 123/DICJ/2026", "成功"],
    ["DICJ-002", "更新", "2026-08-27 10:05", "行政處罰名單", "成功"],
    ["DICJ-003", "審批", "2026-08-27 09:40", "申請 107/DICJ/2026", "成功"],
    ["DICJ-001", "匯入", "2026-08-26 16:12", "行政處罰名單", "部分成功"],
  ],
  reports: [
    "禁入申請總表",
    "承批公司千人比例表",
    "娛樂場禁入申請統計表",
    "娛樂場禁入申請季度統計表",
    "社會工作局轉介報表",
  ],
  settings: {
    dictionary: {
      title: "字典配置",
      headers: ["名稱", "類別", "狀態", "更新時間"],
      rows: [
        ["澳娛綜合度假股份有限公司", "承批公司", "啟用", "2026-07-05 10:20"],
        ["銀河娛樂場股份有限公司", "承批公司", "啟用", "2026-07-06 14:05"],
        ["澳門居民身份證", "證件類型", "啟用", "2026-07-08 09:40"],
      ],
    },
    roles: {
      title: "角色權限管理",
      headers: ["名稱", "狀態", "權限摘要", "更新時間"],
      rows: [
        ["櫃枱人員", "啟用", "收件新增、申請查看", "2026-07-05 10:20"],
        ["處理人員", "啟用", "查看、上呈、退回、通知", "2026-07-06 14:05"],
        ["主管", "啟用", "查看、審批、退回、簽署", "2026-07-08 09:40"],
        ["系統管理員", "啟用", "全部系統管理權限", "2026-07-08 09:40"],
      ],
    },
    accounts: {
      title: "帳號管理",
      headers: ["帳號名稱", "姓名", "狀態", "角色", "更新時間"],
      rows: DemoAccounts.map((a) => [a.id, a.name, a.status, a.role, a.updated]),
    },
  },
};

/* ----------------------------------------------------------------
 * 7.2 暫存草稿示範資料 Demo Drafts
 * 暫存以「證件類型 + 證件號碼」為 key 核心，寫入 localStorage。
 * 頁面載入及「重置演示資料」時由 app.js 的 seedDemoDrafts() 寫入，
 * 供臨櫃收件流程演示「偵測草稿 → 恢復填寫」。
 * ---------------------------------------------------------------- */
const DraftKeyPrefix = "dicj:draft:";
const DemoDrafts = {
  [`${DraftKeyPrefix}澳門居民身份證:12345678`]: {
    v: 1,
    savedAt: "2026-09-11 10:15",
    mode: "new",
    appType: "新申請",
    docNo: "12345678",
    applicant: { name: "周德明", en: "CHAO TAK MENG", gender: "男", birth: "1990-03-15", docType: "澳門居民身份證" },
    step: 2,
    partyType: "本人申請",
    term: "一年",
    scope: "全部",
    counsel: "同意",
    docType: "澳門居民身份證",
    documents: [{ type: "澳門居民身份證", name: "澳門身份證正面.jpg" }],
    photoName: "近照.jpg",
    personal: {
      occupation: "工程師",
      email: "demo@example.com",
      phoneCode: "+853",
      phone: "66123456",
      address: "澳門南灣大馬路123號",
    },
    effectiveDate: "2026-08-30",
    endDate: "2027-08-30",
    companies: [],
    relativeDocType: "",
    relativeFiles: [],
    relativeReadMethod: "",
    relative: {
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
    },
  },
};

/* ----------------------------------------------------------------
 * 7.3 右鍵演示填充設定 Demo Fill Profiles
 * 對應臨櫃收件「核查禁入紀錄」的三種結果：
 * renew（30天內到期）→ 13888888、blocked（未到期）→ 88888888、
 * fresh（無紀錄，新申請）→ 12345670。
 * ---------------------------------------------------------------- */
const DemoFillProfiles = {
  renew: { gender: "男", enName: "CHAN DAI MAN", birth: "1998-08-08", docType: "澳門居民身份證", docNo: "13888888" },
  blocked: { gender: "男", enName: "WONG CHI MING", birth: "1985-03-12", docType: "澳門居民身份證", docNo: "88888888" },
  fresh: { gender: "女", enName: "LEI MEI LENG", birth: "1992-07-21", docType: "澳門居民身份證", docNo: "12345670" },
};
