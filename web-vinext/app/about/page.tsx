import Link from "next/link";

export default function About() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="text-gray-600 mb-4">
        TaskVision Vinext PoC の静的ページテスト
      </p>
      <Link href="/" className="text-blue-600 hover:underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
