/* ================================================================
 * 工具函數 Utils（狀態顏色、日期格式化、暫存草稿存取、ICS 解析）
 * 載入順序：workflow.js → vendor.js → demo-data.js → icons.js → utils.js
 *          → components.js → screens/*.js → app.js
 * ================================================================ */

/* ---- 7.2 工具函數 Utils ---- */
const statusColor = (status) =>
  status.includes("完成") ||
  status.includes("已審批") ||
  status.includes("生效") ||
  status === "啟用" ||
  status === "成功"
    ? "green"
    : status.includes("退回") || status.includes("作廢") || status.includes("不通過")
      ? "red"
      : status.includes("待") || status === "部分成功"
        ? "amber"
        : "blue";
/* ---- ICS 解析：抽取 VEVENT 事件為公眾假期資料 ---- */
const formatNow = () => {
  const now = new Date(),
    pad = (num) => String(num).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};
/* ---- 暫存草稿 Draft Storage：以「證件類型 + 證件號碼」為 key 核心 ---- */
const buildDraftKey = (docType, docNo) => `${DraftKeyPrefix}${docType}:${docNo}`;
const saveDraft = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* 私密模式或容量不足時靜默忽略 */
  }
};
const loadDraft = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed && parsed.v === 1 ? parsed : null;
  } catch (error) {
    return null;
  }
};
const removeDraft = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    /* 同上 */
  }
};
const clearAllDrafts = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(DraftKeyPrefix))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    /* 同上 */
  }
};
const seedDemoDrafts = () => Object.entries(DemoDrafts).forEach(([key, value]) => saveDraft(key, value));
const parseICS = (content) => {
  const unfolded = String(content)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n[ \t]/g, ""),
    toDate = (raw) => `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
    unescapeText = (text) =>
      text
        .replace(/\\n/g, " ")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\")
        .trim(),
    created = formatNow(),
    events = [],
    blockPattern = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;
  while ((match = blockPattern.exec(unfolded))) {
    const block = match[1],
      startMatch = /^DTSTART(?:;[^:]*)?:(\d{8})/m.exec(block);
    if (!startMatch) continue;
    const endMatch = /^DTEND(?:;[^:]*)?:(\d{8})/m.exec(block),
      summaryMatch = /^SUMMARY(?:;[^:]*)?:(.*)$/m.exec(block),
      startDate = toDate(startMatch[1]),
      endDate = endMatch && endMatch[1] !== startMatch[1] ? toDate(endMatch[1]) : "",
      isMultiDay = endDate
        ? new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`) > 86400000
        : false;
    events.push({
      name: (summaryMatch && unescapeText(summaryMatch[1])) || "未命名假期",
      date: isMultiDay ? `${startDate} 至 ${endDate}` : startDate,
      created: created,
    });
  }
  return events;
};
