import Link from "next/link";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">タスク詳細</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600">
          タスクID: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          動的ルーティング [id] のテスト
        </p>
      </div>
      <Link href="/" className="text-blue-600 hover:underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
