"use client";

import { FC, useState, useRef, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
    PlusIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";

type TaskAddButtonProps = {
    blockId: string;
    todayStr: string;
};

const TaskAddButton: FC<TaskAddButtonProps> = ({ blockId, todayStr }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const { userId } = useAuth();

    // モーダルが開いたらタイトル入力にフォーカス
    useEffect(() => {
        if (isModalOpen && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isModalOpen]);

    // モーダル外クリックでクローズ
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        }

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    // トースト表示関数
    const showToastNotification = (message: string) => {
        setToastMessage(message);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        // ユーザーがログインしていない場合は処理しない
        if (!userId) {
            showToastNotification("ログインが必要です");
            return;
        }

        try {
            setIsSubmitting(true);

            // Add new task to Firestore
            await addDoc(collection(db, "tasks"), {
                userId, // 認証情報から取得したユーザーID
                title: title.trim(),
                description: description.trim(),
                blockId,
                date: todayStr,
                status: "open",
                createdAt: serverTimestamp()
            });

            // Reset form and close modal
            setTitle("");
            setDescription("");
            setIsModalOpen(false);

            // 成功メッセージを表示
            showToastNotification("タスクを追加しました！");
        } catch (error) {
            console.error("Error adding task:", error);
            showToastNotification("タスクの作成に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                className="add-task-button"
                onClick={() => setIsModalOpen(true)}
                aria-label="タスクを追加"
            >
                <PlusIcon className="h-4 w-4" />
                <span>タスク追加</span>
            </button>

            {/* Modal for task creation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 modal-appear">
                    <div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-appear"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                新しいタスクを追加
                            </h3>
                            <button
                                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label" htmlFor="new-task-title">
                                        タスク名
                                    </label>
                                    <input
                                        id="new-task-title"
                                        type="text"
                                        className="input input-bordered w-full focus-ring"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="タスク名を入力"
                                        required
                                        ref={titleInputRef}
                                    />
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="new-task-description">
                                        詳細 (任意)
                                    </label>
                                    <textarea
                                        id="new-task-description"
                                        className="textarea textarea-bordered w-full focus-ring min-h-24"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="詳細な説明を入力（任意）"
                                        rows={4}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                    disabled={!title.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                            保存中...
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                            保存
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* トースト通知 */}
            {showToast && (
                <div className="toast toast-success toast-visible">
                    <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-sm">{toastMessage}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskAddButton;