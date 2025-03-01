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
import { useMessages } from "@/app/hooks/useMessages";

export default function BlockManagePage() {
    const { messages } = useMessages();
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

    // messagesからテキストを取得するヘルパー関数
    const t = (key: string) => {
        try {
            if (!messages) {
                return key;
            }

            const parts = key.split('.');
            let current = messages;

            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = (current as any)[part];
                } else {
                    return key;
                }
            }

            return current && typeof current === 'string' ? current : key;
        } catch (error) {
            return key;
        }
    };

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
        if (!window.confirm(t('blocks.confirmDelete'))) {
            return;
        }

        try {
            await deleteDoc(doc(db, "blocks", blockId));
            // 必要に応じて、ブロックに紐づくタスクを未割り当てにする処理を追加
        } catch (error) {
            console.error("Error deleting block:", error);
            alert(t('blocks.errorDelete'));
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
            alert(t('blocks.errorUpdate'));
        }
    };

    // ブロックを追加
    const addBlock = async () => {
        if (newBlockName.trim() === "") {
            alert(t('blocks.emptyNameError'));
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
            alert(t('blocks.errorAdd'));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('blocks.title')}</h1>
                <Link href="/" className="btn btn-outline">
                    {t('common.backToHome')}
                </Link>
            </div>

            {authLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="loading loading-spinner"></div>
                </div>
            ) : !userId ? (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-gray-200">{t('common.loginRequired')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('blocks.loginMessage')}</p>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/login" className="btn btn-primary">
                                {t('common.goToLogin')}
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-gray-200">{t('blocks.list')}</h2>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="loading loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="text-gray-700 dark:text-gray-300">
                                            <th>{t('blocks.table.order')}</th>
                                            <th>{t('blocks.table.name')}</th>
                                            <th>{t('blocks.table.timeRange')}</th>
                                            <th>{t('blocks.table.actions')}</th>
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
                                                            <span>〜</span>
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
                                                        <span>
                                                            {block.startTime} 〜 {block.endTime}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingBlock?.id === block.id ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="btn btn-xs btn-primary"
                                                                onClick={updateBlock}
                                                            >
                                                                {t('common.save')}
                                                            </button>
                                                            <button
                                                                className="btn btn-xs btn-outline"
                                                                onClick={() => setEditingBlock(null)}
                                                            >
                                                                {t('common.cancel')}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="btn btn-xs btn-ghost btn-square text-gray-600 dark:text-gray-400"
                                                                onClick={() => setEditingBlock(block)}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="btn btn-xs btn-ghost btn-square text-gray-600 dark:text-gray-400"
                                                                onClick={() => deleteBlock(block.id)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* 新規ブロック追加行 */}
                                        {isAddingBlock && (
                                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                <td>
                                                    <span className="ml-5">{blocks.length + 1}</span>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="input input-bordered input-sm w-full max-w-xs"
                                                        placeholder={t('blocks.placeholders.blockName')}
                                                        value={newBlockName}
                                                        onChange={(e) => setNewBlockName(e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="time"
                                                            className="input input-bordered input-sm"
                                                            value={newBlockStartTime}
                                                            onChange={(e) => setNewBlockStartTime(e.target.value)}
                                                        />
                                                        <span>〜</span>
                                                        <input
                                                            type="time"
                                                            className="input input-bordered input-sm"
                                                            value={newBlockEndTime}
                                                            onChange={(e) => setNewBlockEndTime(e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={addBlock}
                                                        >
                                                            {t('common.add')}
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-outline"
                                                            onClick={() => setIsAddingBlock(false)}
                                                        >
                                                            {t('common.cancel')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* 新規ブロック追加ボタン */}
                                {!isAddingBlock && (
                                    <button
                                        className="btn btn-sm btn-outline mt-4"
                                        onClick={() => setIsAddingBlock(true)}
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        {t('blocks.addNewBlock')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 