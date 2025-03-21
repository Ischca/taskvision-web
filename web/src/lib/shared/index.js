// 型定義のエクスポート
// ユーティリティ関数のエクスポート
const dateUtils = require("./dist/utils/dateUtils");
const taskUtils = require("./dist/utils/taskUtils");

module.exports = {
  // 日付ユーティリティ関数
  formatDate: require("./dist/utils/dateUtils").formatDate,
  parseDate: require("./dist/utils/dateUtils").parseDate,
  isDatePast: require("./dist/utils/dateUtils").isDatePast,
  isToday: require("./dist/utils/dateUtils").isToday,
  getDaysDiff: require("./dist/utils/dateUtils").getDaysDiff,

  // タスクユーティリティ関数
  getSourceLabel: require("./dist/utils/taskUtils").getSourceLabel,
  isTaskOverdue: require("./dist/utils/taskUtils").isTaskOverdue,
  suggestPriority: require("./dist/utils/taskUtils").suggestPriority,
  completeTask: require("./dist/utils/taskUtils").completeTask,
  reopenTask: require("./dist/utils/taskUtils").reopenTask,
};
