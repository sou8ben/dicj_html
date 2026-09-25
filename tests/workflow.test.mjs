import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const workflow = require("../src/workflow.js");
const { ROLES, getAvailableActions, transition } = workflow;

function application(overrides = {}) {
  return {
    id: "TEST/DICJ/2026",
    source: "一戶通",
    status: "待處理",
    stage: null,
    flags: {},
    history: [],
    ...overrides,
  };
}

function run(current, actionId, role) {
  return transition(current, actionId, role, {
    time: "2026-08-27 10:30",
    note: "測試意見",
  }).application;
}

test("一戶通初檢缺件自動發送通知，申請人補件後系統自動確認並回到待處理", () => {
  let current = application();
  current = run(current, "confirm_missing", ROLES.COUNTER);
  assert.equal(current.status, "已通知補件");
  // 已通知補件時櫃枱沒有正式操作，只有演示用的外部事件模擬
  assert.deepEqual(
    getAvailableActions(current, ROLES.COUNTER).map((action) => [action.id, action.section]),
    [["simulate_applicant_supplement", "simulation"]],
  );
  const result = transition(current, "simulate_applicant_supplement", ROLES.COUNTER, { time: "2026-08-27 10:30" });
  current = result.application;
  assert.equal(current.status, "待處理");
  assert.deepEqual(
    current.history.slice(1).map((entry) => [entry.actorRole, entry.action, entry.fromStatus, entry.toStatus]),
    [
      ["申請人", "於一戶通補交資料", "已通知補件", "已通知補件"],
      ["系統", "自動確認收到補交資料", "已通知補件", "待處理"],
    ],
  );
  assert.match(result.message, /自動確認收到補交資料/);
});

test("一戶通複核退回在修正通知後重新送複核", () => {
  let current = application({ status: "待複核" });
  current = run(current, "return_case", ROLES.PROCESSOR);
  assert.equal(current.status, "退回");
  assert.deepEqual(
    getAvailableActions(current, ROLES.COUNTER).map((action) => action.id),
    ["send_correction_notice"],
  );
  current = run(current, "send_correction_notice", ROLES.COUNTER);
  assert.equal(current.flags.correctionNoticeSent, true);
  current = run(current, "resubmit_review", ROLES.COUNTER);
  assert.equal(current.status, "待複核");
});

test("一戶通主管可退回，亦可審批至完成", () => {
  const returned = run(application({ status: "待審批" }), "request_return", ROLES.SUPERVISOR);
  assert.equal(returned.status, "退回");

  let current = run(application({ status: "待審批" }), "approve_sign", ROLES.SUPERVISOR);
  assert.equal(current.status, "等待制件");
  current = runPath(current, ["complete_production", "send_pickup_notice", "record_handover", "close_case"]);
  assert.equal(current.status, "完成");
  assert.equal(getAvailableActions(current, ROLES.COUNTER).length, 0);
});

// 依序以各操作的指定角色執行，並回傳每一步後的狀態
function runPath(current, actionIds, statuses = []) {
  for (const actionId of actionIds) {
    const action = workflow.ACTIONS[actionId];
    current = run(current, actionId, action.role || action.roles[0]);
    statuses.push(current.status);
  }
  return current;
}

function approveOnline(pickupMethod) {
  const pending = application({
    status: "待審批",
    termsDetails: pickupMethod ? { pickupMethod } : undefined,
  });
  return transition(pending, "approve_sign", ROLES.SUPERVISOR, { time: "2026-08-27 10:30" });
}

test("一戶通審批通過即依取件方式自動進入下一步，歷程保留已審批節點", () => {
  for (const [pickupMethod, expected, autoAction] of [
    ["智取易", "等待制件", "自動送交制件"],
    ["親臨", "等待制件", "自動送交制件"],
    ["電子通知", "已發送電子通知", "自動發送電子通知"],
  ]) {
    const { application: approved, message } = approveOnline(pickupMethod);
    assert.equal(approved.status, expected);
    assert.deepEqual(
      approved.history.map((entry) => [entry.actorRole, entry.action, entry.fromStatus, entry.toStatus]),
      [
        [ROLES.SUPERVISOR, "審批通過並雲簽", "待審批", "已審批"],
        ["系統", autoAction, "已審批", expected],
      ],
    );
    assert.match(message, /審批完成.*自動/);
  }
});

test("一戶通智取易：制件、送出、送達、通知、取件後結案", () => {
  const statuses = [];
  runPath(
    approveOnline("智取易").application,
    [
      "complete_production",
      "dispatch_to_locker",
      "simulate_locker_arrival",
      "send_pickup_notice",
      "simulate_locker_pickup",
      "close_case",
    ],
    statuses,
  );
  assert.deepEqual(statuses, ["已制件", "已送出", "送達待取件", "已通知取件", "已取件", "完成"]);
});

test("一戶通親臨取件：制件後直接通知取件，交件簽收後結案", () => {
  const statuses = [];
  runPath(
    approveOnline("親臨").application,
    ["complete_production", "send_pickup_notice", "record_handover", "close_case"],
    statuses,
  );
  assert.deepEqual(statuses, ["已制件", "已通知取件", "已取件", "完成"]);
});

test("一戶通電子通知：送達、查閱後結案", () => {
  const statuses = [];
  runPath(
    approveOnline("電子通知").application,
    ["simulate_notice_delivered", "simulate_notice_read", "close_case"],
    statuses,
  );
  assert.deepEqual(statuses, ["待查閱", "已查閱", "完成"]);
});

test("取件方式決定分流，舊資料的電子方式視為電子通知、其餘視為親臨", () => {
  const statusAfterApproval = (pickupMethod) => approveOnline(pickupMethod).application.status;
  assert.equal(statusAfterApproval("電子方式"), "已發送電子通知");
  assert.equal(statusAfterApproval("郵寄"), "等待制件");
  assert.equal(statusAfterApproval(undefined), "等待制件");
  const producedLocker = application({ status: "已制件", termsDetails: { pickupMethod: "智取易" } });
  const producedCounter = application({ status: "已制件", termsDetails: { pickupMethod: "親臨" } });
  assert.deepEqual(getAvailableActions(producedLocker, ROLES.ADMIN).map((a) => a.id), ["dispatch_to_locker"]);
  assert.deepEqual(getAvailableActions(producedCounter, ROLES.ADMIN).map((a) => a.id), ["send_pickup_notice"]);
  assert.equal(workflow.getResponsibleRole(producedLocker), ROLES.COUNTER);
});

test("臨櫃待審批未記錄內部階段時視為處理人員複核", () => {
  const current = application({ source: "親臨", status: "待審批", stage: null });
  assert.deepEqual(
    getAvailableActions(current, ROLES.PROCESSOR).map((action) => action.id),
    ["counter_return_case", "counter_complete_review", "void_case"],
  );
  assert.deepEqual(
    getAvailableActions(current, ROLES.SUPERVISOR).map((action) => action.id),
    ["void_case"],
  );
  assert.equal(workflow.getResponsibleRole(current), ROLES.PROCESSOR);
  const next = run(current, "counter_complete_review", ROLES.PROCESSOR);
  assert.equal(next.stage, "supervisor_approval");
});

test("親臨已審批的負責角色隨案件處理進度更新", () => {
  const { getResponsibleRole } = workflow;
  const counter = (flags) => application({ source: "親臨", status: "已審批", flags });
  assert.equal(getResponsibleRole(counter({})), ROLES.PROCESSOR);
  assert.equal(getResponsibleRole(counter({ processingCompleted: true })), ROLES.COUNTER);
});

test("臨櫃待審批以內部階段轉移負責角色", () => {
  let current = application({ source: "親臨" });
  current = run(current, "counter_submit_review", ROLES.COUNTER);
  assert.equal(current.status, "待審批");
  assert.equal(current.stage, "processor_review");
  current = run(current, "counter_complete_review", ROLES.PROCESSOR);
  assert.equal(current.status, "待審批");
  assert.equal(current.stage, "supervisor_approval");
  current = run(current, "counter_approve_sign", ROLES.SUPERVISOR);
  assert.equal(current.status, "已審批");
  current = run(current, "complete_processing", ROLES.PROCESSOR);
  current = run(current, "counter_record_handover", ROLES.COUNTER);
  assert.equal(current.status, "完成");
});

test("臨櫃案件已審批時須完成案件處理才能記錄領取，不設列印步驟", () => {
  let current = application({ source: "親臨", status: "已審批", stage: null });
  assert.deepEqual(
    getAvailableActions(current, ROLES.ADMIN).map((action) => action.id).sort(),
    ["complete_processing", "void_case"].sort(),
  );
  assert.equal("counter_print_documents" in workflow.ACTIONS, false);
  current = run(current, "complete_processing", ROLES.PROCESSOR);
  assert.deepEqual(
    getAvailableActions(current, ROLES.ADMIN).map((action) => action.id).sort(),
    ["counter_record_handover", "void_case"].sort(),
  );
});

test("臨櫃案件複核或審批階段可退回，補正後重新送複核", () => {
  let current = application({ source: "親臨", status: "待審批", stage: "processor_review" });
  current = run(current, "counter_return_case", ROLES.PROCESSOR);
  assert.equal(current.status, "退回");
  assert.deepEqual(
    getAvailableActions(current, ROLES.ADMIN).map((action) => action.id).sort(),
    ["counter_resubmit_review", "void_case"].sort(),
  );
  current = run(current, "counter_resubmit_review", ROLES.COUNTER);
  assert.equal(current.status, "待審批");
  assert.equal(current.stage, "processor_review");

  current = run(
    application({ source: "親臨", status: "待審批", stage: "supervisor_approval" }),
    "counter_request_return",
    ROLES.SUPERVISOR,
  );
  assert.equal(current.status, "退回");
});

test("處理人員與主管可作廢未完成的臨櫃案件", () => {
  for (const role of [ROLES.PROCESSOR, ROLES.SUPERVISOR]) {
    for (const status of ["待處理", "待審批", "已審批"]) {
      const stage = status === "待審批" ? "processor_review" : null;
      const current = run(application({ source: "親臨", status, stage }), "void_case", role);
      assert.equal(current.status, "作廢");
    }
  }
});

test("角色與終止狀態限制會阻止越權操作", () => {
  assert.throws(
    () => run(application({ status: "待審批" }), "approve_sign", ROLES.PROCESSOR),
    /不允許/,
  );
  assert.equal(getAvailableActions(application({ status: "完成" }), ROLES.COUNTER).length, 0);
  assert.equal(getAvailableActions(application({ status: "作廢", source: "親臨" }), ROLES.SUPERVISOR).length, 0);
});

test("系統管理員可操作全流程，不限角色，唯終止狀態除外", () => {
  let current = application();
  current = run(current, "submit_initial_review", ROLES.ADMIN);
  assert.equal(current.status, "待複核");
  current = run(current, "complete_review", ROLES.ADMIN);
  assert.equal(current.status, "待審批");
  current = run(current, "approve_sign", ROLES.ADMIN);
  assert.equal(current.status, "等待制件");
  for (const actionId of ["complete_production", "send_pickup_notice", "record_handover", "close_case"]) {
    current = run(current, actionId, ROLES.ADMIN);
  }
  assert.equal(current.status, "完成");
  assert.equal(getAvailableActions(current, ROLES.ADMIN).length, 0);

  const counter = run(application({ source: "親臨", status: "待處理" }), "void_case", ROLES.ADMIN);
  assert.equal(counter.status, "作廢");
  assert.equal(getAvailableActions(counter, ROLES.ADMIN).length, 0);
});

test("每次操作都記錄角色、狀態、時間及意見", () => {
  const current = run(application(), "submit_initial_review", ROLES.COUNTER);
  assert.deepEqual(current.history[0], {
    actorRole: ROLES.COUNTER,
    action: "完成初審並送複核",
    fromStatus: "待處理",
    toStatus: "待複核",
    time: "2026-08-27 10:30",
    note: "測試意見",
  });
});
