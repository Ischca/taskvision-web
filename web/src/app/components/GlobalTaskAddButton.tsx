"use client";

import { useState, useRef, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  PlusIcon,
  CheckIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { generateRepeatTaskInstances } from "@/lib/repeatTaskUtils";
import { RepeatSettings, RepeatType, RepeatEndType, Task } from "@/types";
import { useTranslations } from "next-intl";
// import { useToast } from '@/components/ui/use-toast';
// import { dateToString, stringToDate } from '@/utils/dateUtils';
import TaskFormModal from "./task/TaskFormModal";
import QuickTaskDrawer from "./task/QuickTaskDrawer";

// モックのdateToString関数（実際の実装は@/utils/dateUtilsにあるはず）
const dateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// モックのuseToastフック（実際の実装は@/components/ui/use-toastにあるはず）
const useToast = () => {
  return {
    toast: (props: any) => {
      console.log("Toast:", props);
    },
  };
};

type GlobalTaskAddButtonProps = {
  todayStr: string;
};

// GlobalTaskAddButtonの定義
const GlobalTaskAddButton = ({ todayStr }: GlobalTaskAddButtonProps) => {
  const { theme } = useTheme();
  const { userId } = useAuth();
  const t = useTranslations();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );
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
  const [enableBlockStartReminder, setEnableBlockStartReminder] =
    useState(false);
  const [blockStartReminderMinutes, setBlockStartReminderMinutes] =
    useState(15);
  const [enableBlockEndReminder, setEnableBlockEndReminder] = useState(false);
  const [blockEndReminderMinutes, setBlockEndReminderMinutes] = useState(10);
  const [enableDeadlineReminder, setEnableDeadlineReminder] = useState(false);
  const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState(30);

  // 繰り返し設定
  const [showRepeatSettings, setShowRepeatSettings] = useState(false);
  const [enableRepeat, setEnableRepeat] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("daily");
  const [repeatFrequency, setRepeatFrequency] = useState(1);
  const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<number[]>([1, 3, 5]); // 月・水・金
  const [repeatDayOfMonth, setRepeatDayOfMonth] = useState(1);
  const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>("never");
  const [repeatOccurrences, setRepeatOccurrences] = useState(10);
  const [repeatEndDate, setRepeatEndDate] = useState("");

  // ポップオーバーが開いているかどうかを追跡
  const [isAnyPopoverOpen, setIsAnyPopoverOpen] = useState(false);

  // 文字列型の日付を管理するための状態
  const [deadlineDate, setDeadlineDate] = useState<string | undefined>(
    undefined,
  );

  // 曜日名変換（日本語 or 英語）
  const getDayName = (day: number) => {
    const daysJA = ["日", "月", "火", "水", "木", "金", "土"];
    const daysEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = t("common.locale") === "en-US" ? daysEN : daysJA;
    return days[day];
  };

  // タスクブロック一覧を取得
  useEffect(() => {
    const fetchBlocks = async () => {
      if (!userId) return;

      try {
        const q = query(
          collection(db, "blocks"),
          where("userId", "==", userId),
          orderBy("order", "asc"),
        );
        const querySnapshot = await getDocs(q);
        const blocksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setBlocks(blocksData);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };

    if (userId) {
      fetchBlocks();
    }
  }, [userId]);

  // モーダル外のクリックでモーダルを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ポップオーバーが開いている場合は処理しない
      if (isAnyPopoverOpen) {
        return;
      }

      // カレンダー関連の要素がクリックされた場合は無視する
      const targetElement = event.target as HTMLElement;
      if (
        targetElement.closest("[data-radix-popper-content-wrapper]") || // Radixポップオーバー
        targetElement.closest(".rdp") || // react-day-picker
        targetElement.closest('[role="dialog"]') || // ダイアログ
        targetElement.closest(".calendar-popup") || // カスタムクラス
        targetElement.closest('[data-state="open"]') // 開いている状態の要素
      ) {
        return;
      }

      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, isAnyPopoverOpen]);

  // モバイルでのドラッグ操作を処理
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 処理略
    };

    const handleTouchEnd = () => {
      startYRef.current = null;
    };

    const drawerTouchStart = (e: TouchEvent) => {
      drawerStartYRef.current = e.touches[0].clientY;
    };

    const drawerTouchMove = (e: TouchEvent) => {
      // 処理略
    };

    const drawerTouchEnd = () => {
      drawerStartYRef.current = null;
    };

    const handleElement = handleRef.current;
    const drawerElement = drawerRef.current;

    if (handleElement) {
      handleElement.addEventListener("touchstart", handleTouchStart);
      handleElement.addEventListener("touchmove", handleTouchMove);
      handleElement.addEventListener("touchend", handleTouchEnd);
    }

    if (drawerElement) {
      drawerElement.addEventListener("touchstart", drawerTouchStart);
      drawerElement.addEventListener("touchmove", drawerTouchMove);
      drawerElement.addEventListener("touchend", drawerTouchEnd);
    }

    return () => {
      if (handleElement) {
        handleElement.removeEventListener("touchstart", handleTouchStart);
        handleElement.removeEventListener("touchmove", handleTouchMove);
        handleElement.removeEventListener("touchend", handleTouchEnd);
      }

      if (drawerElement) {
        drawerElement.removeEventListener("touchstart", drawerTouchStart);
        drawerElement.removeEventListener("touchmove", drawerTouchMove);
        drawerElement.removeEventListener("touchend", drawerTouchEnd);
      }
    };
  }, [isQuickDrawerOpen]);

  // クイックタスク追加
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !userId) return;

    setIsQuickSubmitting(true);

    try {
      await addDoc(collection(db, "tasks"), {
        userId,
        title: quickTitle,
        description: "",
        blockId: null,
        date: new Date(todayStr),
        status: "open",
        createdAt: serverTimestamp(),
        deadline: null,
      });

      setQuickTitle("");
      setIsQuickDrawerOpen(false);
      showToastNotification(t("messages.taskAdded"));
    } catch (error) {
      console.error("Error adding task:", error);
      showToastNotification(t("messages.taskAddError"), "error");
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  // トースト通知を表示
  const showToastNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 繰り返し設定の作成
  const createRepeatSettings = (): RepeatSettings | undefined => {
    if (!enableRepeat) return undefined;

    // Type assertion to fix type errors
    const settings: any = {
      type: repeatType,
      frequency: repeatFrequency,
      daysOfWeek: repeatType === "weekly" ? repeatDaysOfWeek : [],
      dayOfMonth: repeatType === "monthly" ? repeatDayOfMonth : undefined,
      endType: repeatEndType,
      occurrences: repeatEndType === "after" ? repeatOccurrences : undefined,
      endDate:
        repeatEndType === "on_date" && repeatEndDate
          ? new Date(repeatEndDate)
          : undefined,
    };

    return settings as RepeatSettings;
  };

  // 曜日選択のトグル処理
  const toggleDayOfWeek = (day: number) => {
    if (repeatDaysOfWeek.includes(day)) {
      setRepeatDaysOfWeek(repeatDaysOfWeek.filter((d) => d !== day));
    } else {
      setRepeatDaysOfWeek([...repeatDaysOfWeek, day].sort());
    }
  };

  // タスク追加の送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userId) return;

    if (!title.trim()) {
      toast({
        title: t("messages.error"),
        description: t("messages.titleRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ブロックIDを文字列として確実に処理
      let finalBlockId = null;
      if (selectedBlock && selectedBlock.trim() !== "") {
        finalBlockId = String(selectedBlock);
      }

      // 日付データの準備 - 文字列形式(YYYY-MM-DD)で保存
      let finalDate = null;
      if (!isDateUnassigned && selectedDate) {
        try {
          // 日付形式の標準化
          const dateObj = new Date(selectedDate);
          if (!isNaN(dateObj.getTime())) {
            // YYYY-MM-DD形式の文字列に変換
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            finalDate = `${year}-${month}-${day}`;

            console.log("日付を文字列形式で保存:", finalDate);
          } else {
            console.warn("警告: 不正な日付形式", selectedDate);
          }
        } catch (e) {
          console.error("日付変換エラー:", e);
        }
      }

      // タスクのデータを準備
      const taskData: any = {
        userId,
        title: title.trim(),
        description: description.trim(),
        // ブロックIDを明示的に null として設定（空文字列ではなく）
        blockId: finalBlockId,
        // 日付は null または YYYY-MM-DD形式の文字列
        date: finalDate,
        status: "open",
        createdAt: serverTimestamp(),
        deadline: deadlineDate
          ? formatDateToString(new Date(deadlineDate))
          : null,
      };

      // 日付をYYYY-MM-DD形式に変換する関数
      function formatDateToString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      // リマインド設定を追加（設定がある場合のみ）
      if (showReminderSettings) {
        taskData.reminderSettings = {
          enableBlockStartReminder,
          blockStartReminderMinutes,
          enableBlockEndReminder,
          blockEndReminderMinutes,
          enableDeadlineReminder,
          deadlineReminderMinutes,
        };
      }

      // 繰り返し設定を追加（設定がある場合のみ）
      const repeatSettings = createRepeatSettings();
      if (repeatSettings) {
        taskData.repeatSettings = repeatSettings;
      }

      // タスクをFirestoreに追加
      const docRef = await addDoc(collection(db, "tasks"), taskData);

      // 繰り返しタスクの場合、最初のインスタンス（2週間分）を生成
      if (repeatSettings && !isDateUnassigned && selectedDate) {
        const parentTask = {
          id: docRef.id,
          ...taskData,
          createdAt: serverTimestamp() as any,
          deadline: taskData.deadline || null,
          reminderSettings: taskData.reminderSettings || null,
          repeatSettings,
        };

        // 現在日から2週間分のタスクを生成
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); // 2週間後

        await generateRepeatTaskInstances(
          parentTask as unknown as Task,
          startDate,
          endDate,
        );
      }

      // フォームをリセットしてモーダルを閉じる
      setTitle("");
      setDescription("");
      setSelectedBlock("");
      setSelectedDate("");
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
      showToastNotification(t("messages.taskAdded"));
    } catch (error) {
      console.error("Error adding task:", error);
      showToastNotification(t("messages.taskAddError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* デスクトップ表示用ボタン */}
      <button
        className="hidden sm:flex btn btn-primary sm:btn-md btn-sm"
        onClick={() => setIsModalOpen(true)}
        aria-label={t("tasks.addTask")}
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        {t("tasks.addTask")}
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
              style={{ boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)" }}
            >
              {/* ハンドルバー */}
              <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-1"></div>

              {/* 短いテキスト */}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("tasks.swipeUpToAdd")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用クイックタスク追加ドロワー */}
      <QuickTaskDrawer
        isQuickDrawerOpen={isQuickDrawerOpen}
        setIsQuickDrawerOpen={setIsQuickDrawerOpen}
        setIsModalOpen={setIsModalOpen}
        quickTitle={quickTitle}
        setQuickTitle={setQuickTitle}
        isQuickSubmitting={isQuickSubmitting}
        handleQuickSubmit={handleQuickSubmit}
        quickTitleInputRef={quickTitleInputRef}
        drawerRef={drawerRef}
      />

      {/* タスク追加モーダル */}
      {isModalOpen && (
        <TaskFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          selectedBlock={selectedBlock}
          setSelectedBlock={setSelectedBlock}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isDateUnassigned={isDateUnassigned}
          setIsDateUnassigned={setIsDateUnassigned}
          deadlineDate={deadlineDate}
          setDeadlineDate={setDeadlineDate}
          blocks={blocks}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
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
          setIsAnyPopoverOpen={setIsAnyPopoverOpen}
          deadline={deadline}
          dateToString={dateToString}
          isEditing={false}
        />
      )}

      {/* トースト通知 */}
      {showToast && (
        <div
          className={`toast ${toastType === "success" ? "toast-success" : "toast-error"} toast-visible`}
        >
          <div className="flex items-center">
            <CheckIcon
              className={`h-5 w-5 ${toastType === "success" ? "text-green-500" : "text-red-500"} mr-2`}
            />
            <p className="text-sm">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalTaskAddButton;
