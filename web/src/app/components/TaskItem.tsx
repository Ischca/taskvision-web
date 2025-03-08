"use client";

import { FC, useState, useRef, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Task } from "@/types";
import {
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    BellIcon,
    BellSlashIcon,
    ChevronDownIcon,
    CalendarDaysIcon,
    ClockIcon,
    ArrowPathRoundedSquareIcon
} from "@heroicons/react/24/outline";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "./AuthProvider";
import { RepeatSettings, RepeatType, RepeatEndType } from "@/types";
import { generateRepeatTaskInstances } from "@/lib/repeatTaskUtils";
import { useBlocks } from "../hooks/useBlocks";
import { useParams } from "next/navigation";
import { loadMessages } from "../components/i18n";
import { useMessages } from '@/app/hooks/useMessages';
import TaskFormModal from "./task/TaskFormModal";

type TaskItemProps = {
    task: Task;
    isDraggable?: boolean;
};

const TaskItem: FC<TaskItemProps> = ({ task, isDraggable = false }) => {
    const [checked, setChecked] = useState(task.status === "done");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [deadline, setDeadline] = useState(task.deadline || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [selectedBlock, setSelectedBlock] = useState<string | null>(task.blockId || null);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(() => {
        if (!task.date) return undefined;

        // 日付が有効なフォーマットかチェック
        try {
            // yyyy/MM/ddのフォーマットになっているか確認
            if (/^\d{4}\/\d{2}\/\d{2}$/.test(task.date)) {
                return task.date;
            }
            // それ以外の場合はDate型に変換して正しいフォーマットに整形
            const date = new Date(task.date);
            if (isNaN(date.getTime())) {
                return undefined; // 無効な日付
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        } catch (e) {
            console.error("無効な日付フォーマット:", task.date);
            return undefined;
        }
    });
    const [isDateUnassigned, setIsDateUnassigned] = useState<boolean>(!task.date);

    // リマインド設定
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const [enableBlockStartReminder, setEnableBlockStartReminder] = useState(
        task.reminderSettings?.enableBlockStartReminder || false
    );
    const [blockStartReminderMinutes, setBlockStartReminderMinutes] = useState(
        task.reminderSettings?.blockStartReminderMinutes || 15
    );
    const [enableBlockEndReminder, setEnableBlockEndReminder] = useState(
        task.reminderSettings?.enableBlockEndReminder || false
    );
    const [blockEndReminderMinutes, setBlockEndReminderMinutes] = useState(
        task.reminderSettings?.blockEndReminderMinutes || 10
    );
    const [enableDeadlineReminder, setEnableDeadlineReminder] = useState(
        task.reminderSettings?.enableDeadlineReminder || false
    );
    const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState(
        task.reminderSettings?.deadlineReminderMinutes || 30
    );

    // 繰り返し設定
    const [showRepeatSettings, setShowRepeatSettings] = useState(false);
    const [enableRepeat, setEnableRepeat] = useState(
        task.repeatSettings?.enabled || false
    );
    const [repeatType, setRepeatType] = useState<RepeatType>(
        task.repeatSettings?.type || 'daily'
    );
    const [repeatFrequency, setRepeatFrequency] = useState(
        task.repeatSettings?.frequency || 1
    );
    const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<number[]>(
        task.repeatSettings?.daysOfWeek || [1, 3, 5]
    );
    const [repeatDayOfMonth, setRepeatDayOfMonth] = useState(
        task.repeatSettings?.dayOfMonth || 1
    );
    const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>(
        task.repeatSettings?.endType || 'never'
    );
    const [repeatOccurrences, setRepeatOccurrences] = useState(
        task.repeatSettings?.occurrences || 10
    );
    const [repeatEndDate, setRepeatEndDate] = useState(
        task.repeatSettings?.endDate || ""
    );

    const { theme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const initialRender = useRef(true);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const { userId } = useAuth();
    const { blocks } = useBlocks();
    const params = useParams();
    const locale = (params?.locale as string) || 'ja';
    const { t } = useMessages();
    const daysJA = ['日', '月', '火', '水', '木', '金', '土'];
    const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = locale === 'en' ? daysEN : daysJA;

    // i18n用のメッセージ取得
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [messagesLoading, setMessagesLoading] = useState(true);

    // チェックボックス状態の変更を視覚的にアニメーション
    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        setIsUpdating(true);
        const timer = setTimeout(() => {
            setIsUpdating(false);
        }, 700); // アニメーション時間

        return () => clearTimeout(timer);
    }, [checked]);

    // モーダル外クリックでクローズ
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // カレンダーポップオーバーが開いている場合は閉じる処理をスキップ
            if (document.querySelector('[data-state="open"]')) {
                return;
            }

            // カレンダーポップアップのクリックを無視
            if ((event.target as HTMLElement).closest('.calendar-popup')) {
                return;
            }

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

    // トースト表示
    const showSuccessToast = (message: string = t('common.tasks.taskUpdated')) => {
        setToastType("success");
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const showErrorToast = (message: string = t('common.tasks.taskUpdateFailed')) => {
        setToastType("error");
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleCheck = async () => {
        try {
            const newStatus = checked ? "open" : "done";
            setChecked(!checked);
            await updateDoc(doc(db, "tasks", task.id), {
                status: newStatus,
            });

            if (newStatus === "done") {
                showSuccessToast(t('common.tasks.taskUpdated'));
            }
        } catch (err) {
            console.error("Failed to update task status:", err);
            setChecked(checked);
            showErrorToast(t('common.tasks.taskUpdateFailed'));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setIsSubmitting(true);

            // リマインド設定オブジェクトを作成
            const reminderSettings = {
                enableBlockStartReminder,
                blockStartReminderMinutes,
                enableBlockEndReminder,
                blockEndReminderMinutes,
                enableDeadlineReminder,
                deadlineReminderMinutes
            };

            // 繰り返し設定を作成
            const repeatSettings = createRepeatSettings();

            // タスク更新データの作成
            const updateData: any = {
                title: title.trim(),
                description: description.trim(),
                deadline: deadline || null,
                reminderSettings,
                blockId: selectedBlock,
                date: isDateUnassigned ? null : (selectedDate || null)
            };

            // 繰り返し設定を追加（設定がある場合のみ）
            if (repeatSettings) {
                updateData.repeatSettings = repeatSettings;
            } else {
                // 繰り返し設定を無効化する場合はnullを設定
                updateData.repeatSettings = null;
            }

            await updateDoc(doc(db, "tasks", task.id), updateData);

            // 繰り返し設定が変更され、有効になった場合は繰り返しタスクインスタンスを生成
            if (repeatSettings?.enabled &&
                (!task.repeatSettings?.enabled ||
                    JSON.stringify(task.repeatSettings) !== JSON.stringify(repeatSettings))) {

                // 現在日から2週間分のタスクを生成
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 14); // 2週間後

                const updatedTask = {
                    ...task,
                    ...updateData,
                    userId,
                };

                await generateRepeatTaskInstances(updatedTask as Task, startDate, endDate);
            }

            setIsModalOpen(false);
            showSuccessToast(t('common.tasks.taskUpdated'));
        } catch (error) {
            console.error("Error updating task:", error);
            showErrorToast(t('common.tasks.taskUpdateFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('common.tasks.deleteConfirmation'))) {
            try {
                setIsDeleting(true);
                await deleteDoc(doc(db, "tasks", task.id));
                showSuccessToast(t('common.tasks.taskDeleted'));
            } catch (error) {
                console.error("Error deleting task:", error);
                showErrorToast(t('common.tasks.taskDeleteFailed'));
                setIsDeleting(false);
            }
        }
    };

    // ドラッグ開始時のハンドラー
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
        if (!isDraggable) return;

        // タスクデータをJSON文字列に変換して転送
        e.dataTransfer.setData("application/json", JSON.stringify(task));
        // タスクIDも設定（未割り当てエリアへのドロップ用）
        e.dataTransfer.setData("taskId", task.id);
        // ドラッグ中の要素の見た目を設定
        e.dataTransfer.effectAllowed = "move";

        // ドラッグ中のスタイルを適用
        e.currentTarget.classList.add("dragging");

        // 現在のターゲット要素を保存
        const targetElement = e.currentTarget;

        // ドラッグ終了時のイベントリスナーを追加
        const handleDragEnd = () => {
            // nullチェックを追加
            const dragElements = document.querySelectorAll('.dragging');
            dragElements.forEach(el => {
                el.classList.remove('dragging');
            });

            document.removeEventListener("dragend", handleDragEnd);
        };
        document.addEventListener("dragend", handleDragEnd);
    };

    // リマインド設定セクションの表示切り替え
    const toggleReminderSettings = () => {
        setShowReminderSettings(!showReminderSettings);
    };

    // 繰り返し設定セクションの表示切り替え
    const toggleRepeatSettings = () => {
        setShowRepeatSettings(!showRepeatSettings);
    };

    // 曜日選択のトグル処理
    const toggleDayOfWeek = (day: number) => {
        if (repeatDaysOfWeek.includes(day)) {
            setRepeatDaysOfWeek(repeatDaysOfWeek.filter(d => d !== day));
        } else {
            setRepeatDaysOfWeek([...repeatDaysOfWeek, day].sort());
        }
    };

    // 曜日の表示（ロケールに合わせて切り替え）
    const getDayName = (day: number): string => {
        return days[day];
    };

    // 繰り返し設定オブジェクトの作成
    const createRepeatSettings = (): RepeatSettings | undefined => {
        if (!enableRepeat) return undefined;

        const settings: RepeatSettings = {
            enabled: true,
            type: repeatType,
            frequency: repeatFrequency,
            endType: repeatEndType,
        };

        // 繰り返しタイプによる追加設定
        if (repeatType === 'weekly') {
            settings.daysOfWeek = repeatDaysOfWeek;
        } else if (repeatType === 'monthly') {
            settings.dayOfMonth = repeatDayOfMonth;
        }

        // 終了条件の設定
        if (repeatEndType === 'after') {
            settings.occurrences = repeatOccurrences;
        } else if (repeatEndType === 'on_date' && repeatEndDate) {
            settings.endDate = repeatEndDate;
        }

        // 既存の例外を引き継ぐ
        if (task.repeatSettings?.exceptions) {
            settings.exceptions = task.repeatSettings.exceptions;
        }

        return settings;
    };

    // 日付を見やすい形式にフォーマット
    const formatDisplayDate = (dateStr: string): string => {
        if (!dateStr) return t('common.tasks.unassigned');
        const date = new Date(dateStr);
        return date.toLocaleDateString(t('common.locale') || 'ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleUpdateTask = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const taskRef = doc(db, "tasks", task.id);
            const updateData: any = {
                title,
                description,
                updatedAt: new Date().toISOString(),
                blockId: selectedBlock,
            };

            if (deadline) {
                updateData.deadline = deadline;
            } else {
                // Firestore doesn't support setting fields to undefined, so we use deleteField()
                // But for our local state management, we'll just exclude the field from the object
            }

            // リマインダー設定を追加
            updateData.reminderSettings = {
                enableBlockStartReminder,
                blockStartReminderMinutes,
                enableBlockEndReminder,
                blockEndReminderMinutes,
                enableDeadlineReminder,
                deadlineReminderMinutes,
            };

            // 繰り返し設定を追加
            if (enableRepeat) {
                const repeatSettings: RepeatSettings = {
                    enabled: true,
                    type: repeatType,
                    frequency: repeatFrequency,
                    daysOfWeek: repeatType === 'weekly' ? repeatDaysOfWeek : undefined,
                    dayOfMonth: repeatType === 'monthly' ? repeatDayOfMonth : undefined,
                    endType: repeatEndType,
                    occurrences: repeatEndType === 'after' ? repeatOccurrences : undefined,
                    endDate: repeatEndType === 'on_date' ? repeatEndDate : undefined,
                };
                updateData.repeatSettings = repeatSettings;

                // 繰り返しタスクのインスタンスを生成
                if (task.repeatSettings?.enabled !== true) {
                    // 新しく繰り返し設定が有効になった場合のみインスタンスを生成
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 14); // 2週間後

                    const updatedTask = {
                        ...task,
                        title,
                        description,
                        blockId: selectedBlock,
                        deadline,
                        reminderSettings: updateData.reminderSettings,
                        repeatSettings,
                        userId,
                    };

                    await generateRepeatTaskInstances(updatedTask as Task, startDate, endDate);
                }
            } else {
                updateData.repeatSettings = { enabled: false };
            }

            await updateDoc(taskRef, updateData);
            setIsModalOpen(false);
            setShowToast(true);
            setToastMessage("タスクを更新しました");
            setToastType("success");
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error updating task:", error);
            setShowToast(true);
            setToastMessage("エラーが発生しました");
            setToastType("error");
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // タスク更新完了時の処理
    const handleTaskUpdated = () => {
        setIsModalOpen(false);
        showSuccessToast(t('common.tasks.taskUpdated'));
    };

    return (
        <>
            <li
                className={`task-item group ${isUpdating ? 'animate-pulse-soft' : ''} ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:bg-gray-50' : ''}`}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                data-task-id={task.id}
            >
                <div className="flex items-center flex-1 min-w-0">
                    <div className="relative flex items-start w-full">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary focus-ring"
                                checked={checked}
                                onChange={handleCheck}
                                disabled={isDeleting || isUpdating}
                            />
                        </div>
                        <div
                            className="ml-3 cursor-pointer min-w-0 flex-1"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span
                                className={`text-sm font-medium ${checked ? "completed-task" : "text-gray-700 dark:text-gray-200"}`}
                            >
                                {task.title}
                            </span>
                            {task.description && (
                                <p className={`text-xs truncate max-w-full sm:max-w-xs mt-0.5 ${checked ? "completed-task" : "text-gray-500"}`}>
                                    {task.description.substring(0, 100)}
                                    {task.description.length > 100 ? '...' : ''}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                {task.deadline && (
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-3 w-3 text-orange-500 mr-1" />
                                        <span className="text-xs text-orange-500">
                                            {new Date(task.deadline).toLocaleDateString(t('common.locale') || 'ja-JP', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                                {task.reminderSettings && (task.reminderSettings.enableBlockStartReminder ||
                                    task.reminderSettings.enableBlockEndReminder ||
                                    task.reminderSettings.enableDeadlineReminder) && (
                                        <div className="flex items-center">
                                            <BellIcon className="h-3 w-3 text-primary-500 mr-1" />
                                            <span className="text-xs text-primary-500">
                                                {t('common.tasks.reminderSettingsAvailable')}
                                            </span>
                                        </div>
                                    )}
                                {/* 繰り返し設定の表示 */}
                                {task.repeatSettings?.enabled && (
                                    <div className="flex items-center">
                                        <ArrowPathRoundedSquareIcon className="h-3 w-3 text-green-600 mr-1" />
                                        <span className="text-xs text-green-600">
                                            {t('common.tasks.repeatSettingsAvailable')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center ml-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {isDraggable && (
                        <div className="mr-1 text-gray-400 hidden sm:block">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </div>
                    )}
                    <button
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isDeleting}
                        aria-label="タスクを編集"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors ml-1"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        aria-label="タスクを削除"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </li>

            {/* TaskFormModalを使った編集モード */}
            {isModalOpen && (
                <TaskFormModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    selectedBlock={selectedBlock || ""}
                    setSelectedBlock={setSelectedBlock}
                    selectedDate={selectedDate}
                    setSelectedDate={(date) => {
                        // タスクの日付を更新（実際の更新はフォーム提出時に行われる）
                        setSelectedDate(date);
                        // 日付が設定された場合は、未割り当てフラグをオフにする
                        if (date) {
                            setIsDateUnassigned(false);
                        }
                    }}
                    isDateUnassigned={isDateUnassigned}
                    setIsDateUnassigned={(unassigned) => {
                        // 未割り当て状態の更新
                        setIsDateUnassigned(unassigned);
                        // 未割り当てにチェックが入った場合は日付をクリア
                        if (unassigned) {
                            setSelectedDate(undefined);
                        }
                    }}
                    deadlineDate={deadline || undefined}
                    setDeadlineDate={(date) => {
                        // 締切日が変更された場合、ここで処理
                        setDeadline(date || "");
                    }}
                    blocks={blocks}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleUpdate}
                    titleInputRef={titleInputRef}
                    modalRef={modalRef}
                    showReminderSettings={showReminderSettings}
                    setShowReminderSettings={setShowReminderSettings}
                    enableBlockStartReminder={enableBlockStartReminder}
                    setEnableBlockStartReminder={setEnableBlockStartReminder}
                    blockStartReminderMinutes={blockStartReminderMinutes}
                    setBlockStartReminderMinutes={setBlockStartReminderMinutes}
                    enableBlockEndReminder={enableBlockEndReminder}
                    setEnableBlockEndReminder={setEnableBlockEndReminder}
                    blockEndReminderMinutes={blockEndReminderMinutes}
                    setBlockEndReminderMinutes={setBlockEndReminderMinutes}
                    enableDeadlineReminder={enableDeadlineReminder}
                    setEnableDeadlineReminder={setEnableDeadlineReminder}
                    deadlineReminderMinutes={deadlineReminderMinutes}
                    setDeadlineReminderMinutes={setDeadlineReminderMinutes}
                    showRepeatSettings={showRepeatSettings}
                    setShowRepeatSettings={setShowRepeatSettings}
                    enableRepeat={enableRepeat}
                    setEnableRepeat={setEnableRepeat}
                    repeatType={repeatType}
                    setRepeatType={setRepeatType}
                    repeatFrequency={repeatFrequency}
                    setRepeatFrequency={setRepeatFrequency}
                    repeatDaysOfWeek={repeatDaysOfWeek}
                    toggleDayOfWeek={toggleDayOfWeek}
                    repeatDayOfMonth={repeatDayOfMonth}
                    setRepeatDayOfMonth={setRepeatDayOfMonth}
                    repeatEndType={repeatEndType}
                    setRepeatEndType={setRepeatEndType}
                    repeatOccurrences={repeatOccurrences}
                    setRepeatOccurrences={setRepeatOccurrences}
                    repeatEndDate={repeatEndDate}
                    setRepeatEndDate={setRepeatEndDate}
                    getDayName={getDayName}
                    setIsAnyPopoverOpen={() => { }}
                    deadline={deadline}
                    dateToString={(date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}/${month}/${day}`;
                    }}
                    isEditing={true}
                    taskId={task.id}
                />
            )}

            {/* トースト通知 */}
            {showToast && (
                <div className={`toast ${toastType === "success" ? "toast-success" : "toast-error"} toast-visible`}>
                    <div className="flex items-center">
                        <CheckIcon className={`h-5 w-5 ${toastType === "success" ? "text-green-500" : "text-red-500"} mr-2`} />
                        <p className="text-sm">{toastMessage}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskItem;