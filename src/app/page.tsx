"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import BlockList from "./components/BlockList";
import UnassignedTasksSection from "./components/UnassignedTasksSection";
import GlobalTaskAddButton from "./components/GlobalTaskAddButton";
import { Block, Task } from "@/types";
import { ensureDefaultBlocks } from "@/lib/ensureDefaultBlocks";
import { useAuth } from "./components/AuthProvider";
import { setupLocalReminders } from "@/lib/reminderService";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import DatePicker from "./components/DatePicker";

export default function HomePage() {
  // AuthProviderからユーザーIDを取得
  const { userId } = useAuth();

  // ブロックとタスクを状態管理
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 表示中の日付文字列（例: "2025-02-23"）
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateStr = formatDateString(currentDate);

  // 日付を前後に移動する関数
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // カレンダーから日付を選択
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setCalendarOpen(false);
  };

  // 日付表示用のフォーマット関数
  const formatDateDisplay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('ja-JP', options);
  };

  // ドラッグオーバーイベントハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 未割り当てエリアへのドロップ
  const handleDropToUnassigned = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    try {
      const taskData = JSON.parse(e.dataTransfer.getData("application/json")) as Task;
      console.log(`タスク "${taskData.title}" を未割り当てに移動します`);

      // Firestoreでタスクを更新
      await updateDoc(doc(db, "tasks", taskData.id), {
        blockId: null,
        date: null
      });
    } catch (error) {
      console.error("未割り当てへの移動中にエラーが発生しました:", error);
    }
  };

  // 初回ロード時にデフォルトブロックを確認・作成
  useEffect(() => {
    setLoadingBlocks(true);
    ensureDefaultBlocks(userId).then(() => {
      setLoadingBlocks(false);
    }).catch(error => {
      console.error("Failed to ensure default blocks:", error);
      setLoadingBlocks(false);
    });
  }, [userId]);

  // ブロック一覧を取得（固定だが一応リアルタイムリスナー使用）
  useEffect(() => {
    const blocksRef = collection(db, "blocks");
    const qBlocks = query(
      blocksRef,
      where("userId", "==", userId),
      orderBy("order", "asc")
    );
    const unsubBlocks = onSnapshot(qBlocks, (snapshot) => {
      const blockData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Block[];
      setBlocks(blockData);
      setLoadingBlocks(false);
    }, (error) => {
      console.error("Error fetching blocks:", error);
      setLoadingBlocks(false);
    });

    return () => unsubBlocks();
  }, [userId]);

  // 選択中の日付のタスク一覧を取得
  useEffect(() => {
    setLoadingTasks(true);
    const tasksRef = collection(db, "tasks");
    const qTasks = query(
      tasksRef,
      where("userId", "==", userId),
      where("date", "==", dateStr)
    );
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(taskData);
      setLoadingTasks(false);

      // 各タスクのローカルリマインダーを設定
      taskData.forEach(task => {
        if (task.reminderSettings) {
          setupLocalReminders(task);
        }
      });
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoadingTasks(false);
    });

    return () => unsubTasks();
  }, [userId, dateStr]);

  // 今日の日付かどうかをチェック
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // 曜日に応じたスタイルを返す
  const getWeekdayStyle = (date: Date): string => {
    const day = date.getDay();
    if (day === 0) return "text-red-500"; // 日曜
    if (day === 6) return "text-blue-500"; // 土曜
    return ""; // 平日
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6" onDragOver={handleDragOver}>
      {/* 日付セレクター */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="前の日"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="flex items-center px-3 sm:px-4 py-2 font-bold text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <CalendarDaysIcon className="h-5 w-5 mr-1 sm:mr-2 text-primary-600" />
              <span className="text-base sm:text-lg">{formatDateDisplay(currentDate)}</span>
            </button>

            {/* カレンダーポップアップ */}
            {calendarOpen && (
              <div className="absolute z-10 mt-1 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                <DatePicker
                  selectedDate={currentDate}
                  onDateSelect={handleDateSelect}
                  onClose={() => setCalendarOpen(false)}
                />
              </div>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="次の日"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 border border-primary-300 rounded-md flex items-center transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            今日
          </button>

          <GlobalTaskAddButton todayStr={dateStr} />
        </div>
      </div>

      {/* 未割り当てタスクセクション */}
      <UnassignedTasksSection />

      {/* ブロックとタスクのリスト */}
      {loadingBlocks ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">ブロックを読み込み中...</p>
        </div>
      ) : (
        <BlockList blocks={blocks} tasks={tasks} todayStr={dateStr} />
      )}
    </div>
  );
}