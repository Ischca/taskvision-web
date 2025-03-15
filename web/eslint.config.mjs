import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 共通のルールを定義
const commonRules = {
  // 未使用変数を無効化
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  
  // any型の使用を許可
  '@typescript-eslint/no-explicit-any': 'off',
  
  // requireスタイルのインポートを許可
  '@typescript-eslint/no-require-imports': 'off',
  
  // 未使用式を許可
  '@typescript-eslint/no-unused-expressions': 'off',
  'no-unused-expressions': 'off',
  
  // 未定義変数を許可（Reactなど）
  'no-undef': 'off',
  
  // TypeScriptコメントディレクティブの制限緩和
  '@typescript-eslint/ban-ts-comment': 'off',
  
  // ケース文での宣言を許可
  'no-case-declarations': 'off',
  
  // 不要なエスケープを許可
  'no-useless-escape': 'off',
  
  // デフォルトエクスポートのスタイルを緩和
  'import/no-anonymous-default-export': 'off'
};

export default [
  // グローバル設定（ignores）
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'public/sw.js',
      'public/workbox-*.js',
      'next.config.js'
    ]
  },
  
  // Next.js設定 - FlatCompatを使用
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // ベース設定
  js.configs.recommended,
  
  // グローバルルール
  {
    rules: commonRules,
    linterOptions: {
      reportUnusedDisableDirectives: false
    }
  }
];
