"use client";

import { FC, useState, useRef, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import {
    PlusIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    CalendarDaysIcon,
    BellIcon,
    BellSlashIcon,
    ChevronDownIcon,
    ArrowPathRoundedSquareIcon,
    ChevronUpIcon
} from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { generateRepeatTaskInstances } from "@/lib/repeatTaskUtils";
import { RepeatSettings, RepeatType, RepeatEndType, Task } from "@/types";
import { useMessages } from '@/app/hooks/useMessages';
import ShadcnDatePicker from "./ShadcnDatePicker";

type GlobalTaskAddButtonProps = {
    todayStr: string;
};

const GlobalTaskAddButton: FC<GlobalTaskAddButtonProps> = ({ todayStr }) => {
    const { theme } = useTheme();
    const { userId } = useAuth();
    const { t } = useMessages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
    const [quickTitle, setQuickTitle] = useState("");
    const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("");
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(new Date());
    const [isDateUnassigned, setIsDateUnassigned] = useState(false);
    const [deadline, setDeadline] = useState("");
    const [blocks, setBlocks] = useState<{ id: string; name: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const titleInputRef = useRef<HTMLInputElement>(null);
    const quickTitleInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number | null>(null);
    const drawerStartYRef = useRef<number | null>(null);

    // リマインド設定
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const [enableBlockStartReminder, setEnableBlockStartReminder] = useState(false);
    const [blockStartReminderMinutes, setBlockStartReminderMinutes] = useState(15);
    const [enableBlockEndReminder, setEnableBlockEndReminder] = useState(false);
    const [blockEndReminderMinutes, setBlockEndReminderMinutes] = useState(10);
    const [enableDeadlineReminder, setEnableDeadlineReminder] = useState(false);
    const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState(30);

    // 繰り返し設定
    const [showRepeatSettings, setShowRepeatSettings] = useState(false);
    const [enableRepeat, setEnableRepeat] = useState(false);
    const [repeatType, setRepeatType] = useState<RepeatType>('daily');
    const [repeatFrequency, setRepeatFrequency] = useState(1);
    const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<number[]>([1, 3, 5]); // 月・水・金
    const [repeatDayOfMonth, setRepeatDayOfMonth] = useState(1);
    const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>('never');
    const [repeatOccurrences, setRepeatOccurrences] = useState(10);
    const [repeatEndDate, setRepeatEndDate] = useState("");

    // ポップオーバーが開いているかどうかを追跡
    const [isAnyPopoverOpen, setIsAnyPopoverOpen] = useState(false);

    // 曜日名変換（日本語 or 英語）
    const getDayName = (day: number) => {
        const daysJA = ['日', '月', '火', '水', '木', '金', '土'];
        const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = t('common.locale') === 'en-US' ? daysEN : daysJA;
        return days[day];
    };

    // 日付を読みやすいフォーマットで表示
    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(t('common.locale') || 'ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    };

    // ブロック一覧を取得
    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const blocksRef = collection(db, "blocks");
                const q = query(
                    blocksRef,
                    where("userId", "==", userId)
                );
                const snapshot = await getDocs(q);
                const blockData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name as string
                }));

                // ブロックをソート
                blockData.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });

                setBlocks(blockData);
            } catch (error) {
                console.error("Error fetching blocks:", error);
            }
        };

        if (isModalOpen) {
            fetchBlocks();
        }
    }, [isModalOpen, userId]);

    // モーダルが開いたらタイトル入力にフォーカス
    useEffect(() => {
        if (isModalOpen && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isModalOpen]);

    // モーダル外クリックでクローズ
    useEffect(() => {
        // モーダル外クリックでクローズ処理
        const handleClickOutside = (event: MouseEvent) => {
            // モーダル自体、または子要素をクリックした場合は何もしない
            if (modalRef.current && modalRef.current.contains(event.target as Node)) {
                return;
            }

            // ポップオーバーが開いている場合は処理しない
            if (isAnyPopoverOpen) {
                return;
            }

            // カレンダー関連の要素がクリックされた場合は無視する
            const targetElement = event.target as HTMLElement;
            if (
                targetElement.closest('.rdp') || // react-day-pickerのルート要素
                targetElement.closest('[role="dialog"]') || // ポップオーバーダイアログ
                targetElement.closest('[role="presentation"]') || // ポップオーバーの背景
                targetElement.closest('[data-state="open"]') || // 開いている状態のRadix UI要素
                targetElement.closest('.popover-content-calendar') // カレンダーポップオーバー
            ) {
                return;
            }

            // それ以外でモーダル外をクリックした場合は閉じる
            setIsModalOpen(false);
        };

        if (isModalOpen) {
            // イベントリスナーを追加（キャプチャーフェーズで）
            setTimeout(() => {
                document.addEventListener("click", handleClickOutside, { capture: true });
            }, 0);
        } else {
            document.removeEventListener("click", handleClickOutside, { capture: true });
        }

        return () => {
            document.removeEventListener("click", handleClickOutside, { capture: true });
        };
    }, [isModalOpen, isAnyPopoverOpen]);

    // スワイプ操作の処理（下部ハンドル用）
    useEffect(() => {
        const handleEl = handleRef.current;
        if (!handleEl) return;

        // タッチ開始時の位置を記録
        const handleTouchStart = (e: TouchEvent) => {
            startYRef.current = e.touches[0].clientY;
        };

        // タッチ移動中の処理
        const handleTouchMove = (e: TouchEvent) => {
            if (startYRef.current === null) return;

            const currentY = e.touches[0].clientY;
            const diff = startYRef.current - currentY;

            // 上に50px以上スワイプしたらドロワーを開く
            if (diff > 50) {
                setIsQuickDrawerOpen(true);
                startYRef.current = null;
            }
        };

        // タッチ終了時の処理
        const handleTouchEnd = () => {
            startYRef.current = null;
        };

        handleEl.addEventListener('touchstart', handleTouchStart);
        handleEl.addEventListener('touchmove', handleTouchMove);
        handleEl.addEventListener('touchend', handleTouchEnd);

        return () => {
            handleEl.removeEventListener('touchstart', handleTouchStart);
            handleEl.removeEventListener('touchmove', handleTouchMove);
            handleEl.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // ドロワーでのスワイプ操作処理（閉じる動作）
    useEffect(() => {
        const drawerEl = drawerRef.current;
        if (!drawerEl || !isQuickDrawerOpen) return;

        // タッチ開始時の位置を記録
        const drawerTouchStart = (e: TouchEvent) => {
            drawerStartYRef.current = e.touches[0].clientY;
        };

        // タッチ移動中の処理
        const drawerTouchMove = (e: TouchEvent) => {
            if (drawerStartYRef.current === null) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - drawerStartYRef.current;

            // 下に50px以上スワイプしたらドロワーを閉じる
            if (diff > 50) {
                setIsQuickDrawerOpen(false);
                drawerStartYRef.current = null;
            }
        };

        // タッチ終了時の処理
        const drawerTouchEnd = () => {
            drawerStartYRef.current = null;
        };

        drawerEl.addEventListener('touchstart', drawerTouchStart);
        drawerEl.addEventListener('touchmove', drawerTouchMove);
        drawerEl.addEventListener('touchend', drawerTouchEnd);

        return () => {
            drawerEl.removeEventListener('touchstart', drawerTouchStart);
            drawerEl.removeEventListener('touchmove', drawerTouchMove);
            drawerEl.removeEventListener('touchend', drawerTouchEnd);
        };
    }, [isQuickDrawerOpen]);

    // クイックタスク追加機能
    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!quickTitle.trim() || !userId) {
            if (!userId) showToastNotification("ログインが必要です");
            return;
        }

        try {
            setIsQuickSubmitting(true);

            // シンプルなタスクデータを準備
            const taskData = {
                userId,
                title: quickTitle.trim(),
                description: "",
                blockId: null,
                date: todayStr,
                status: "open",
                createdAt: serverTimestamp(),
            };

            // タスクをFirestoreに追加
            await addDoc(collection(db, "tasks"), taskData);

            // フォームをリセットしてドロワーを閉じる
            setQuickTitle("");
            setIsQuickDrawerOpen(false);

            // 成功メッセージを表示
            showToastNotification("タスクを追加しました！");
        } catch (error) {
            console.error("Error adding quick task:", error);
            showToastNotification("タスクの作成に失敗しました。もう一度お試しください。", "error");
        } finally {
            setIsQuickSubmitting(false);
        }
    };

    // モバイルのクイックドロワーがオープンしたらタイトル入力にフォーカス
    useEffect(() => {
        if (isQuickDrawerOpen && quickTitleInputRef.current) {
            // 少し遅延させてフォーカス（アニメーション完了後）
            setTimeout(() => {
                quickTitleInputRef.current?.focus();
            }, 300);
        }
    }, [isQuickDrawerOpen]);

    // ドロワー外クリックでクローズ
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setIsQuickDrawerOpen(false);
            }
        }

        if (isQuickDrawerOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isQuickDrawerOpen]);

    // トースト表示関数
    const showToastNotification = (message: string, type: "success" | "error" = "success") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // 日付選択を切り替え
    const toggleDateAssigned = () => {
        setIsDateUnassigned(!isDateUnassigned);
        if (!isDateUnassigned) {
            setSelectedDate("");
        } else {
            setSelectedDate(todayStr);
        }
    };

    // リマインダー設定セクションの表示切り替え
    const toggleReminderSettings = () => {
        setShowReminderSettings(!showReminderSettings);
    };

    // 繰り返し設定セクションの表示切り替え
    const toggleRepeatSettings = () => {
        setShowRepeatSettings(!showRepeatSettings);
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

        return settings;
    };

    // 日付文字列⇔Dateオブジェクト変換ヘルパー関数
    const dateToString = (date: Date | undefined): string => {
        if (!date) return '';
        // ローカルタイムゾーンのまま処理するために、UTC変換を避ける
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const stringToDate = (dateStr: string): Date | undefined => {
        if (!dateStr) return undefined;
        // タイムゾーンの問題を避けるために、日付部分のみを指定して新しいDateオブジェクトを作成する
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    // 日付変更ハンドラ
    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            const dateStr = dateToString(date);
            setSelectedDate(dateStr);
            setSelectedDateObj(date);
        }
    };

    // DatePickerの初期化
    useEffect(() => {
        setSelectedDateObj(stringToDate(selectedDate));
    }, [selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setIsSubmitting(true);

            // タスクデータを準備
            const taskData: any = {
                userId,
                title: title.trim(),
                description: description.trim(),
                blockId: selectedBlock || null, // ブロックが選択されていない場合はnull
                date: isDateUnassigned ? null : selectedDate, // 日付が未割り当ての場合はnull
                status: "open",
                createdAt: serverTimestamp(),
                deadline: deadline || null,
            };

            // リマインド設定を追加（設定がある場合のみ）
            if (showReminderSettings) {
                taskData.reminderSettings = {
                    enableBlockStartReminder,
                    blockStartReminderMinutes,
                    enableBlockEndReminder,
                    blockEndReminderMinutes,
                    enableDeadlineReminder,
                    deadlineReminderMinutes
                };
            }

            // 繰り返し設定を追加（設定がある場合のみ）
            const repeatSettings = createRepeatSettings();
            if (repeatSettings) {
                taskData.repeatSettings = repeatSettings;
            }

            // タスクをFirestoreに追加
            const newTaskRef = await addDoc(collection(db, "tasks"), taskData);

            const newTaskId = newTaskRef.id;
            console.log('タスクを作成しました:', newTaskId);

            // 繰り返しが有効な場合、子タスクを生成
            if (repeatSettings?.enabled) {
                const parentTask = {
                    id: newTaskId,
                    userId,
                    title: title.trim(),
                    description: description.trim(),
                    blockId: selectedBlock || null,
                    date: isDateUnassigned ? null : selectedDate,
                    status: "open" as const,
                    createdAt: serverTimestamp() as any,
                    deadline: deadline || null,
                    reminderSettings: taskData.reminderSettings || null,
                    repeatSettings
                };

                // 現在日から2週間分のタスクを生成
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 14); // 2週間後

                await generateRepeatTaskInstances(parentTask as Task, startDate, endDate);
            }

            // フォームをリセットしてモーダルを閉じる
            setTitle("");
            setDescription("");
            setSelectedBlock("");
            setSelectedDate(todayStr);
            setIsDateUnassigned(false);
            setDeadline("");
            setShowReminderSettings(false);
            setEnableBlockStartReminder(false);
            setEnableBlockEndReminder(false);
            setEnableDeadlineReminder(false);
            setShowRepeatSettings(false);
            setEnableRepeat(false);
            setIsModalOpen(false);

            // 成功メッセージを表示
            showToastNotification("タスクを追加しました！");
        } catch (error) {
            console.error("Error adding task:", error);
            showToastNotification("タスクの作成に失敗しました。もう一度お試しください。", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 曜日選択のトグル処理
    const toggleDayOfWeek = (day: number) => {
        if (repeatDaysOfWeek.includes(day)) {
            setRepeatDaysOfWeek(repeatDaysOfWeek.filter(d => d !== day));
        } else {
            setRepeatDaysOfWeek([...repeatDaysOfWeek, day].sort());
        }
    };

    return (
        <>
            {/* デスクトップ表示用ボタン */}
            <button
                className="hidden sm:flex btn btn-primary sm:btn-md btn-sm"
                onClick={() => setIsModalOpen(true)}
                aria-label={t('common.tasks.addTask')}
            >
                <PlusIcon className="h-5 w-5 mr-1" />
                {t('common.tasks.addTask')}
            </button>

            {/* モバイル用 下部ハンドル - 引っ張り上げ印象のデザイン */}
            <div
                ref={handleRef}
                className="sm:hidden fixed bottom-0 left-0 right-0 z-40 cursor-pointer px-4 pb-1"
                onClick={() => setIsQuickDrawerOpen(true)}
            >
                <div className="relative mx-auto max-w-sm">
                    <div className="flex flex-col items-center">
                        {/* 上向き矢印アニメーション */}
                        <div className="text-gray-400 dark:text-gray-500 mb-1 animate-bounce">
                            <ChevronUpIcon className="h-5 w-5" />
                        </div>

                        {/* メインハンドル */}
                        <div
                            className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-t border-x border-white/20 dark:border-gray-700/30 shadow-md rounded-t-xl w-full py-2 flex flex-col items-center"
                            style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)' }}
                        >
                            {/* ハンドルバー */}
                            <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-1"></div>

                            {/* 短いテキスト */}
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {t('common.tasks.swipeUpToAdd')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* モバイル用クイックタスク追加ドロワー */}
            <div className={`fixed inset-x-0 bottom-0 z-50 sm:hidden transition-transform duration-300 ease-in-out ${isQuickDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div
                    ref={drawerRef}
                    className="bg-white dark:bg-gray-800 rounded-t-xl shadow-xl p-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <div className="flex justify-center mb-2">
                        <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {t('common.tasks.quickAdd')}
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                onClick={() => {
                                    setIsQuickDrawerOpen(false);
                                    setIsModalOpen(true);
                                }}
                            >
                                <ChevronUpIcon className="h-5 w-5" />
                                <span className="sr-only">{t('common.tasks.advancedSettings')}</span>
                            </button>
                            <button
                                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                onClick={() => setIsQuickDrawerOpen(false)}
                            >
                                <XMarkIcon className="h-5 w-5" />
                                <span className="sr-only">{t('common.tasks.close')}</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleQuickSubmit} className="space-y-4">
                        <div className="flex space-x-2">
                            <input
                                ref={quickTitleInputRef}
                                type="text"
                                className="input input-bordered flex-1 focus-ring"
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                placeholder={t('common.tasks.taskName')}
                                required
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!quickTitle.trim() || isQuickSubmitting}
                            >
                                {isQuickSubmitting ? (
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                ) : (
                                    <CheckIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <p>{t('common.tasks.willBeRegisteredToday')}</p>
                            <p>{t('common.tasks.forDetailedSettings')}
                                <button type="button" className="text-primary-600 dark:text-primary-400 underline" onClick={() => {
                                    setQuickTitle("");
                                    setIsQuickDrawerOpen(false);
                                    setIsModalOpen(true);
                                }}>{t('common.tasks.here')}</button>
                            </p>
                            <p className="mt-1.5 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <span>{t('common.tasks.swipeDownToClose')}</span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Task Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 modal-appear">
                    <div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-appear overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('common.tasks.taskDetails')}
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
                                    <label className="form-label" htmlFor="task-title">
                                        {t('common.tasks.taskName')}
                                    </label>
                                    <input
                                        id="task-title"
                                        ref={titleInputRef}
                                        type="text"
                                        className="input input-bordered w-full focus-ring"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="task-date">
                                        {t('common.dates.date')}
                                    </label>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="date-unassigned"
                                                className="checkbox checkbox-sm checkbox-primary mr-2"
                                                checked={isDateUnassigned}
                                                onChange={toggleDateAssigned}
                                            />
                                            <label htmlFor="date-unassigned" className="text-sm">
                                                {t('common.tasks.unassignedDate')}
                                            </label>
                                        </div>
                                    </div>
                                    {isDateUnassigned ? (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 italic p-2">
                                            {t('common.tasks.dateNotAssigned')}
                                        </div>
                                    ) : (
                                        <ShadcnDatePicker
                                            date={selectedDateObj}
                                            onDateChange={handleDateChange}
                                            disabled={isDateUnassigned}
                                            onOpenChange={(open) => {
                                                setIsAnyPopoverOpen(open);
                                            }}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="task-block">
                                        {t('common.blocks.blockName')}
                                    </label>
                                    <select
                                        id="task-block"
                                        className={`select select-bordered w-full focus-ring ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        value={selectedBlock}
                                        onChange={(e) => setSelectedBlock(e.target.value)}
                                    >
                                        <option value="">{t('common.tasks.selectBlockOptional')}</option>
                                        {blocks.map((block) => (
                                            <option key={block.id} value={block.id}>
                                                {block.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="form-label mb-1">{t('common.tasks.deadline')}</div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex-1 w-full">
                                            <ShadcnDatePicker
                                                date={deadline ? new Date(deadline) : undefined}
                                                onDateChange={(date) => {
                                                    if (date) {
                                                        // 既存の時間があれば維持する
                                                        const existingTime = deadline ? deadline.split('T')[1] : '00:00';
                                                        setDeadline(`${dateToString(date)}T${existingTime}`);
                                                    } else {
                                                        setDeadline('');
                                                    }
                                                }}
                                                onOpenChange={(open) => setIsAnyPopoverOpen(open)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="time"
                                                value={deadline ? deadline.split('T')[1] : ''}
                                                onChange={(e) => {
                                                    const dateStr = deadline ? deadline.split('T')[0] : dateToString(new Date());
                                                    setDeadline(`${dateStr}T${e.target.value}`);
                                                }}
                                                className={`input input-bordered w-full focus-ring ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                                        onClick={toggleReminderSettings}
                                    >
                                        <div className="flex items-center">
                                            {showReminderSettings ? (
                                                <BellIcon className="h-5 w-5 mr-2 text-primary-500" />
                                            ) : (
                                                <BellSlashIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            )}
                                            <span>{showReminderSettings ? t('common.tasks.hideReminderSettings') : t('common.tasks.showReminderSettings')}</span>
                                        </div>
                                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showReminderSettings ? 'transform rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {showReminderSettings && (
                                    <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-3 animate-fade-in`}>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="enable-block-start"
                                                        className="checkbox checkbox-sm checkbox-primary mr-2"
                                                        checked={enableBlockStartReminder}
                                                        onChange={() => setEnableBlockStartReminder(!enableBlockStartReminder)}
                                                    />
                                                    <label htmlFor="enable-block-start" className="text-sm">
                                                        {t('common.tasks.notifyBeforeBlockStart')}
                                                    </label>
                                                </div>
                                                <select
                                                    className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                    value={blockStartReminderMinutes}
                                                    onChange={(e) => setBlockStartReminderMinutes(Number(e.target.value))}
                                                    disabled={!enableBlockStartReminder}
                                                >
                                                    <option value="5">5 {t('common.time.minutesBefore')}</option>
                                                    <option value="10">10 {t('common.time.minutesBefore')}</option>
                                                    <option value="15">15 {t('common.time.minutesBefore')}</option>
                                                    <option value="30">30 {t('common.time.minutesBefore')}</option>
                                                    <option value="60">1 {t('common.time.hourBefore')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="enable-block-end"
                                                        className="checkbox checkbox-sm checkbox-primary mr-2"
                                                        checked={enableBlockEndReminder}
                                                        onChange={() => setEnableBlockEndReminder(!enableBlockEndReminder)}
                                                    />
                                                    <label htmlFor="enable-block-end" className="text-sm">
                                                        {t('common.tasks.notifyBeforeBlockEnd')}
                                                    </label>
                                                </div>
                                                <select
                                                    className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                    value={blockEndReminderMinutes}
                                                    onChange={(e) => setBlockEndReminderMinutes(Number(e.target.value))}
                                                    disabled={!enableBlockEndReminder}
                                                >
                                                    <option value="5">5 {t('common.time.minutesBefore')}</option>
                                                    <option value="10">10 {t('common.time.minutesBefore')}</option>
                                                    <option value="15">15 {t('common.time.minutesBefore')}</option>
                                                    <option value="30">30 {t('common.time.minutesBefore')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="enable-deadline"
                                                        className="checkbox checkbox-sm checkbox-primary mr-2"
                                                        checked={enableDeadlineReminder}
                                                        onChange={() => setEnableDeadlineReminder(!enableDeadlineReminder)}
                                                        disabled={!deadline}
                                                    />
                                                    <label htmlFor="enable-deadline" className="text-sm">
                                                        {t('common.tasks.notifyBeforeDeadline')}
                                                    </label>
                                                </div>
                                                <select
                                                    className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                    value={deadlineReminderMinutes}
                                                    onChange={(e) => setDeadlineReminderMinutes(Number(e.target.value))}
                                                    disabled={!enableDeadlineReminder || !deadline}
                                                >
                                                    <option value="15">15 {t('common.time.minutesBefore')}</option>
                                                    <option value="30">30 {t('common.time.minutesBefore')}</option>
                                                    <option value="60">1 {t('common.time.hourBefore')}</option>
                                                    <option value="120">2 {t('common.time.hoursBefore')}</option>
                                                    <option value="1440">1 {t('common.time.dayBefore')}</option>
                                                </select>
                                            </div>
                                            {!deadline && enableDeadlineReminder && (
                                                <p className="text-xs text-orange-500 mt-1">
                                                    {t('common.tasks.pleaseSetDeadline')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 繰り返し設定トグルボタン */}
                                <div>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                                        onClick={toggleRepeatSettings}
                                    >
                                        <div className="flex items-center">
                                            {showRepeatSettings ? (
                                                <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2 text-primary-500" />
                                            ) : (
                                                <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            )}
                                            <span>{showRepeatSettings ? t('common.tasks.hideRepeatSettings') : t('common.tasks.showRepeatSettings')}</span>
                                        </div>
                                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showRepeatSettings ? 'transform rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* 繰り返し設定パネル */}
                                {showRepeatSettings && (
                                    <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-3 animate-fade-in`}>
                                        <div>
                                            <div className="flex items-center mb-3">
                                                <input
                                                    type="checkbox"
                                                    id="enable-repeat"
                                                    className="checkbox checkbox-sm checkbox-primary mr-2"
                                                    checked={enableRepeat}
                                                    onChange={() => setEnableRepeat(!enableRepeat)}
                                                />
                                                <label htmlFor="enable-repeat" className="text-sm font-medium">
                                                    {t('common.tasks.repeatTask')}
                                                </label>
                                            </div>

                                            {enableRepeat && (
                                                <div className="space-y-3 pl-6">
                                                    {/* 繰り返しタイプ */}
                                                    <div>
                                                        <label className="form-label text-sm" htmlFor="repeat-type">
                                                            {t('common.tasks.repeatPattern')}
                                                        </label>
                                                        <select
                                                            id="repeat-type"
                                                            className={`select select-bordered select-sm w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                            value={repeatType}
                                                            onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                                                        >
                                                            <option value="daily">{t('common.tasks.repeatDaily')}</option>
                                                            <option value="weekdays">{t('common.tasks.repeatWeekdays')}</option>
                                                            <option value="weekly">{t('common.tasks.repeatWeekly')}</option>
                                                            <option value="monthly">{t('common.tasks.repeatMonthly')}</option>
                                                            <option value="custom">{t('common.tasks.repeatCustom')}</option>
                                                        </select>
                                                    </div>

                                                    {/* 繰り返しの頻度（daily, customの場合） */}
                                                    {(repeatType === 'daily' || repeatType === 'custom') && (
                                                        <div>
                                                            <label className="form-label text-sm" htmlFor="repeat-frequency">
                                                                {t('common.tasks.frequency')}
                                                            </label>
                                                            <div className="flex items-center">
                                                                <span className="mr-2">{t('common.tasks.interval')}:</span>
                                                                <select
                                                                    id="repeat-frequency"
                                                                    className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                                    value={repeatFrequency}
                                                                    onChange={(e) => setRepeatFrequency(Number(e.target.value))}
                                                                >
                                                                    <option value="1">{t('common.tasks.everyDay')}</option>
                                                                    <option value="2">{t('common.tasks.everyTwoDays')}</option>
                                                                    <option value="3">{t('common.tasks.everyThreeDays')}</option>
                                                                    <option value="5">{t('common.tasks.everyFiveDays')}</option>
                                                                    <option value="7">{t('common.tasks.everyWeek')}</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 曜日選択（weeklyの場合） */}
                                                    {repeatType === 'weekly' && (
                                                        <div>
                                                            <label className="form-label text-sm mb-2 block">
                                                                {t('common.tasks.selectDaysOfWeek')}
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                                                    <button
                                                                        key={day}
                                                                        type="button"
                                                                        onClick={() => toggleDayOfWeek(day)}
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                                                                            ${repeatDaysOfWeek.includes(day)
                                                                                ? 'bg-primary-500 text-white'
                                                                                : theme === 'dark'
                                                                                    ? 'bg-gray-600 text-gray-200'
                                                                                    : 'bg-gray-200 text-gray-700'} 
                                                                            transition-colors`}
                                                                    >
                                                                        {getDayName(day)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {repeatDaysOfWeek.length === 0 && (
                                                                <p className="text-xs text-orange-500 mt-1">
                                                                    {t('common.tasks.selectAtLeastOneDay')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 日付選択（monthlyの場合） */}
                                                    {repeatType === 'monthly' && (
                                                        <div>
                                                            <label className="form-label text-sm" htmlFor="repeat-day-of-month">
                                                                {t('common.tasks.selectDate')}
                                                            </label>
                                                            <select
                                                                id="repeat-day-of-month"
                                                                className={`select select-bordered select-sm w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                                value={repeatDayOfMonth}
                                                                onChange={(e) => setRepeatDayOfMonth(Number(e.target.value))}
                                                            >
                                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                    <option key={day} value={day}>
                                                                        {day} {t('common.tasks.dayOfMonth')}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* 繰り返し終了設定 */}
                                                    <div>
                                                        <label className="form-label text-sm mb-2 block">
                                                            {t('common.tasks.endCondition')}
                                                        </label>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    id="end-never"
                                                                    name="repeat-end"
                                                                    className="radio radio-sm radio-primary mr-2"
                                                                    checked={repeatEndType === 'never'}
                                                                    onChange={() => setRepeatEndType('never')}
                                                                />
                                                                <label htmlFor="end-never" className="text-sm">
                                                                    {t('common.tasks.noEndDate')}
                                                                </label>
                                                            </div>

                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    id="end-after"
                                                                    name="repeat-end"
                                                                    className="radio radio-sm radio-primary mr-2"
                                                                    checked={repeatEndType === 'after'}
                                                                    onChange={() => setRepeatEndType('after')}
                                                                />
                                                                <label htmlFor="end-after" className="text-sm flex items-center">
                                                                    <span className="mr-2">{t('common.tasks.specifyCount')}:</span>
                                                                    <input
                                                                        type="number"
                                                                        className={`input input-bordered input-sm w-16 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                                        value={repeatOccurrences}
                                                                        onChange={(e) => setRepeatOccurrences(Number(e.target.value))}
                                                                        min="1"
                                                                        max="100"
                                                                        disabled={repeatEndType !== 'after'}
                                                                    />
                                                                    <span className="ml-2">{t('common.tasks.times')}</span>
                                                                </label>
                                                            </div>

                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    id="end-on-date"
                                                                    name="repeat-end"
                                                                    className="radio radio-sm radio-primary mr-2"
                                                                    checked={repeatEndType === 'on_date'}
                                                                    onChange={() => setRepeatEndType('on_date')}
                                                                />
                                                                <label htmlFor="end-on-date" className="text-sm flex items-center flex-wrap">
                                                                    <span className="mr-2 mb-2">{t('common.tasks.specifyDate')}:</span>
                                                                    <div className="w-full">
                                                                        <ShadcnDatePicker
                                                                            date={repeatEndDate ? new Date(repeatEndDate) : undefined}
                                                                            onDateChange={(date) => setRepeatEndDate(date ? dateToString(date) : '')}
                                                                            disabled={repeatEndType !== 'on_date'}
                                                                            onOpenChange={(open) => setIsAnyPopoverOpen(open)}
                                                                        />
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="form-label" htmlFor="task-description">
                                        {t('common.tasks.details')}
                                    </label>
                                    <textarea
                                        id="task-description"
                                        className="textarea textarea-bordered w-full focus-ring min-h-24"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t('common.tasks.detailsPlaceholder')}
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
                                    {t('common.actions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                    disabled={!title.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                            {t('common.tasks.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                            {t('common.actions.save')}
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

export default GlobalTaskAddButton; 