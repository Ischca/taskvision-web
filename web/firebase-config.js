// Firebase Admin SDKの初期化
const admin = require("firebase-admin");

// プロジェクトIDに基づいて自動的に認証情報を取得
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("Firebase Admin SDK initialized");
}

module.exports = admin;
