// Chrome API型定義
/// <reference types="chrome" />

// グローバルに chrome オブジェクトを利用できるようにする
declare namespace NodeJS {
  interface Global {
    chrome: typeof chrome;
  }
}
