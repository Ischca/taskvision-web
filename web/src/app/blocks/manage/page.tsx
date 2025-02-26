"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
} from "firebase/firestore";
import { Block } from "@/types";
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import useRequireAuth from "@/app/hooks/useRequireAuth";

export default function BlockManagePage() {
    // 認証から実際のユーザーIDを取得
    const { userId, loading: authLoading, isAuthenticated } = useRequireAuth();

    // ブロック一覧
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);

    // 編集中のブロック
    const [editingBlock, setEditingBlock] = useState<Block | null>(null);

    // 新規ブロック用の状態
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [newBlockName, setNewBlockName] = useState("");
    const [newBlockStartTime, setNewBlockStartTime] = useState("09:00");
    const [newBlockEndTime, setNewBlockEndTime] = useState("10:00");

    // ブロック一覧を取得
    useEffect(() => {
        // 認証ローディング中または未ログインの場合はスキップ
        if (authLoading || !userId) return;

        const blocksRef = collection(db, "blocks");
        const q = query(
            blocksRef,
            where("userId", "==", userId),
            orderBy("order", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blockData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Block[];
            setBlocks(blockData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching blocks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, authLoading]);

    // ブロックの順序を変更
    const moveBlock = async (blockId: string, direction: "up" | "down") => {
        const currentIndex = blocks.findIndex((b) => b.id === blockId);
        if (
            (direction === "up" && currentIndex === 0) ||
            (direction === "down" && currentIndex === blocks.length - 1)
        ) {
            return; // 移動できない場合
        }

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const targetBlock = blocks[targetIndex];
        const currentBlock = blocks[currentIndex];

        // 順序を交換
        const currentOrder = currentBlock.order;
        const targetOrder = targetBlock.order;

        try {
            await updateDoc(doc(db, "blocks", currentBlock.id), {
                order: targetOrder,
            });

            await updateDoc(doc(db, "blocks", targetBlock.id), {
                order: currentOrder,
            });
        } catch (error) {
            console.error("Error moving block:", error);
            alert("ブロックの移動に失敗しました");
        }
    };

    // ブロックを削除
    const deleteBlock = async (blockId: string) => {
        if (!window.confirm("このブロックを削除しますか？関連するタスクも未割り当てになります。")) {
            return;
        }

        try {
            await deleteDoc(doc(db, "blocks", blockId));
            // 必要に応じて、ブロックに紐づくタスクを未割り当てにする処理を追加
        } catch (error) {
            console.error("Error deleting block:", error);
            alert("ブロックの削除に失敗しました");
        }
    };

    // ブロックを更新
    const updateBlock = async () => {
        if (!editingBlock) return;

        try {
            await updateDoc(doc(db, "blocks", editingBlock.id), {
                name: editingBlock.name,
                startTime: editingBlock.startTime,
                endTime: editingBlock.endTime,
            });

            setEditingBlock(null);
        } catch (error) {
            console.error("Error updating block:", error);
            alert("ブロックの更新に失敗しました");
        }
    };

    // ブロックを追加
    const addBlock = async () => {
        if (newBlockName.trim() === "") {
            alert("ブロック名を入力してください");
            return;
        }

        try {
            // まず現在のブロック数を取得して新しいブロックの順序を決定
            const newOrder = blocks.length + 1;

            await addDoc(collection(db, "blocks"), {
                name: newBlockName.trim(),
                startTime: newBlockStartTime,
                endTime: newBlockEndTime,
                order: newOrder,
                userId: userId,
                createdAt: new Date().toISOString(),
            });

            // 入力フィールドをリセット
            setNewBlockName("");
            setNewBlockStartTime("09:00");
            setNewBlockEndTime("10:00");
            setIsAddingBlock(false);
        } catch (error) {
            console.error("Error adding block:", error);
            alert("ブロックの追加に失敗しました");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ブロック管理</h1>
                <Link href="/" className="btn btn-outline">
                    ホームに戻る
                </Link>
            </div>

            {authLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="loading loading-spinner"></div>
                </div>
            ) : !userId ? (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-gray-200">ログインが必要です</h2>
                        <p className="text-gray-600 dark:text-gray-400">ブロック管理機能を使用するにはログインしてください。</p>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/login" className="btn btn-primary">
                                ログイン画面へ
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-gray-200">ブロック一覧</h2>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="loading loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="text-gray-700 dark:text-gray-300">
                                            <th>順序</th>
                                            <th>ブロック名</th>
                                            <th>時間帯</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-800 dark:text-gray-200">
                                        {blocks.map((block, index) => (
                                            <tr key={block.id} className="border-b border-gray-200 dark:border-gray-700">
                                                <td className="w-24">
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            className="btn btn-xs btn-ghost btn-square text-gray-600 dark:text-gray-400"
                                                            onClick={() => moveBlock(block.id, "up")}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUpIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-ghost btn-square text-gray-600 dark:text-gray-400"
                                                            onClick={() => moveBlock(block.id, "down")}
                                                            disabled={index === blocks.length - 1}
                                                        >
                                                            <ArrowDownIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="ml-1">{index + 1}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {editingBlock?.id === block.id ? (
                                                        <input
                                                            type="text"
                                                            className="input input-bordered input-sm w-full max-w-xs"
                                                            value={editingBlock.name}
                                                            onChange={(e) =>
                                                                setEditingBlock({
                                                                    ...editingBlock,
                                                                    name: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    ) : (
                                                        block.name
                                                    )}
                                                </td>
                                                <td>
                                                    {editingBlock?.id === block.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="time"
                                                                className="input input-bordered input-sm"
                                                                value={editingBlock.startTime}
                                                                onChange={(e) =>
                                                                    setEditingBlock({
                                                                        ...editingBlock,
                                                                        startTime: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            <span>-</span>
                                                            <input
                                                                type="time"
                                                                className="input input-bordered input-sm"
                                                                value={editingBlock.endTime}
                                                                onChange={(e) =>
                                                                    setEditingBlock({
                                                                        ...editingBlock,
                                                                        endTime: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${block.startTime} - ${block.endTime}`
                                                    )}
                                                </td>
                                                <td>
                                                    {editingBlock?.id === block.id ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={updateBlock}
                                                            >
                                                                保存
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => setEditingBlock(null)}
                                                            >
                                                                キャンセル
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="btn btn-sm btn-ghost btn-square"
                                                                onClick={() => setEditingBlock(block)}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-ghost btn-square text-error"
                                                                onClick={() => deleteBlock(block.id)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {isAddingBlock ? (
                            <div className="mt-4 border rounded-lg p-4 bg-base-200">
                                <h3 className="font-bold mb-2">新規ブロックを追加</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">ブロック名</label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={newBlockName}
                                            onChange={(e) => setNewBlockName(e.target.value)}
                                            placeholder="例: 午後ブロック"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">開始時刻</label>
                                        <input
                                            type="time"
                                            className="input input-bordered w-full"
                                            value={newBlockStartTime}
                                            onChange={(e) => setNewBlockStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">終了時刻</label>
                                        <input
                                            type="time"
                                            className="input input-bordered w-full"
                                            value={newBlockEndTime}
                                            onChange={(e) => setNewBlockEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4 space-x-2">
                                    <button
                                        className="btn"
                                        onClick={() => setIsAddingBlock(false)}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={addBlock}
                                        disabled={!newBlockName.trim()}
                                    >
                                        追加
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary mt-4"
                                onClick={() => setIsAddingBlock(true)}
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                新規ブロックを追加
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}