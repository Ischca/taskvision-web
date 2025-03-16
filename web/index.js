const functions = require("firebase-functions");
const { default: next } = require("next");

const isDev = process.env.NODE_ENV !== "production";
console.log(`Running in ${isDev ? "development" : "production"} mode`);

// Next.jsアプリケーションを初期化
const nextjsApp = next({
  dev: isDev,
  conf: {
    distDir: "out",
  },
});

// Next.jsのリクエストハンドラーを取得
const nextjsHandle = nextjsApp.getRequestHandler();

// アプリの準備
let nextjsServer;
const prepareApp = nextjsApp
  .prepare()
  .then(() => {
    console.log("Next.js application prepared");
    nextjsServer = true;
    return nextjsServer;
  })
  .catch((error) => {
    console.error("Error preparing Next.js application:", error);
    return Promise.reject(error);
  });

// Firebase Functionを作成
exports.nextServer = functions
  .runWith({
    memory: "1GB", // メモリの割り当て
    timeoutSeconds: 60, // タイムアウト
  })
  .https.onRequest(async (req, res) => {
    console.log(`Processing request for: ${req.originalUrl}`);

    try {
      // アプリがまだ準備されていない場合は待機
      if (!nextjsServer) {
        console.log("Waiting for Next.js server to prepare...");
        await prepareApp;
      }

      // CORSヘッダーを設定
      res.set("Access-Control-Allow-Origin", "*");

      // プリフライトリクエストの処理
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.status(204).send("");
        return;
      }

      console.log("Handling request with Next.js");
      return nextjsHandle(req, res);
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  });
