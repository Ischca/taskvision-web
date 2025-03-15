"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Task, Block } from "@/types";
import { useAuth } from "../components/AuthProvider";
import { Link } from "../components/Link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatDate, parseDate } from "@/lib/dateUtils";
import { locales } from "@/i18n";

import Sidebar from "../components/Sidebar";
import GlobalTaskAddButton from "../components/GlobalTaskAddButton";
import BlockList from "../components/BlockList";
import UnassignedTasksSection from "../components/UnassignedTasksSection";
import { useParams } from "next/navigation";
import { loadMessages } from "../components/i18n";

export default function Home() {
  const params = useParams();
  const locale = (params?.locale as string) || "ja";
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const { userId, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // messagesから直接テキストを取得するヘルパー関数
  const t = (key: string) => {
    try {
      // common.key形式のキーを処理
      const parts = key.split(".");
      let current = messages;

      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as any)[part];
        } else {
          return key; // キーが見つからない場合はキー自体を返す
        }
      }

      return current && typeof current === "string" ? current : key;
    } catch (error) {
      console.error("Translation error:", error);
      return key; // エラーが発生した場合はキー自体を返す
    }
  };

  // メッセージを読み込む
  useEffect(() => {
    const fetchMessages = async () => {
      setMessagesLoading(true);
      const loadedMessages = await loadMessages(locale);
      setMessages(loadedMessages);
      setMessagesLoading(false);
    };

    fetchMessages();
  }, [locale]);

  // 日付を1日進める
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(formatDate(nextDay));
  };

  // 日付を1日戻す
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(formatDate(prevDay));
  };

  // 今日の日付に戻る
  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  // 日付を読みやすい形式にフォーマット
  const formatDisplayDate = (dateString: string) => {
    const date = parseDate(dateString);
    // 曜日の配列 (locale に合わせる)
    const weekdaysEN = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekdaysJA = ["日", "月", "火", "水", "木", "金", "土"];
    const weekdays = locale === "en" ? weekdaysEN : weekdaysJA;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${month}/${day} (${weekday})`;
  };

  // Firebaseからデータを取得
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubscribeTasks: () => void = () => {};
    let unsubscribeBlocks: () => void = () => {};

    try {
      // タスククエリ - 日付フィルタリングを修正
      const tasksRef = collection(db, "tasks");
      const tasksQuery = query(tasksRef, where("userId", "==", userId));

      unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const allTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        // クライアント側で日付でフィルタリング
        const filteredTasks = allTasks.filter((task) => {
          // 日付が設定されていないタスクも含める
          if (!task.date) return true;

          // タスクの日付をString型に正規化
          let taskDateStr = "";

          try {
            if (typeof task.date === "string") {
              taskDateStr = task.date;
            } else if (typeof task.date === "object" && task.date !== null) {
              // Date型
              if (
                Object.prototype.toString.call(task.date) === "[object Date]"
              ) {
                const d = task.date as Date;
                taskDateStr = formatDate(d);
              }
              // Timestampオブジェクトの場合
              else if ("toDate" in task.date) {
                const d = (task.date as any).toDate();
                taskDateStr = formatDate(d);
              }
            }
          } catch (e) {
            console.error("日付の変換エラー:", e, task.date);
          }

          // 選択された日付のタスクのみフィルタリング
          return taskDateStr === selectedDate;
        });

        setTasks(filteredTasks);
        setLoading(false);
      });

      // ブロッククエリ
      const blocksQuery = query(
        collection(db, "blocks"),
        where("userId", "==", userId),
        orderBy("order", "asc"), // orderフィールドで並べ替え
      );

      unsubscribeBlocks = onSnapshot(blocksQuery, (snapshot) => {
        const blocksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Block[];

        setBlocks(blocksData);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }

    return () => {
      unsubscribeTasks();
      unsubscribeBlocks();
    };
  }, [userId, selectedDate]);

  // ログイン前の表示
  const renderLoginPromotion = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t("common.messages.welcome")}
        </h2>
        <p className="text-lg mb-6">{t("common.messages.loginPrompt")}</p>
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.actions.login")}
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t("common.actions.signup")}
          </Link>
        </div>
      </div>
    );
  };

  // タスク管理UI
  const renderTaskManagement = () => {
    return (
      <div>
        {/* 日付切り替えUIとタスク追加ボタン */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
          <button
            onClick={goToPreviousDay}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("common.dates.previousDay")}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center relative">
            <button
              onClick={goToToday}
              className="flex items-center mr-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              {t("common.dates.today")}
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center cursor-pointer">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-xl font-bold">
                    {formatDisplayDate(selectedDate)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate)}
                  onSelect={(date: Date | undefined) =>
                    date && setSelectedDate(format(date, "yyyy-MM-dd"))
                  }
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center">
            <button
              onClick={goToNextDay}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors mr-2"
              aria-label={t("common.dates.nextDay")}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>

            <GlobalTaskAddButton todayStr={selectedDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* サイドバー*/}
          <div className="lg:col-span-1">
            <Sidebar blocks={blocks} tasks={tasks} />
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* ブロック一覧 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("common.blocks.timeBlocks")}
              </h2>
              <BlockList
                blocks={blocks}
                tasks={tasks.filter((task) => {
                  // 日付が未設定またはselectedDateと一致するタスクを表示
                  const dateMatch = !task.date || task.date === selectedDate;

                  // BlockListに渡すタスクはblockIdの有無に関わらず全て渡す
                  // (BlockList内部でブロックごとにフィルタリングされる)
                  return dateMatch;
                })}
                date={selectedDate}
                loading={loading}
              />
            </div>

            {/* 割り当てられていないタスク */}
            <UnassignedTasksSection
              tasks={(() => {
                // フィルタリング条件:
                // 1. blockIdがnullまたは空文字列
                // 2. 日付が選択日付と一致するか、日付がnull
                const unassignedTasks = tasks.filter((task) => {
                  // ブロックIDが未設定かチェック
                  const hasNoBlock = !task.blockId || task.blockId === "";

                  // 日付のチェック
                  let dateMatches = false;

                  // 日付がnullならOK
                  if (!task.date) {
                    dateMatches = true;
                  }
                  // 日付が選択日付と一致するかチェック
                  else {
                    // 日付文字列に変換
                    let taskDateStr = "";
                    try {
                      if (typeof task.date === "string") {
                        taskDateStr = task.date;
                      } else if (
                        typeof task.date === "object" &&
                        task.date !== null
                      ) {
                        // Date型
                        if (
                          Object.prototype.toString.call(task.date) ===
                          "[object Date]"
                        ) {
                          const d = task.date as Date;
                          taskDateStr = formatDate(d);
                        }
                        // Timestamp型
                        else if ("toDate" in task.date) {
                          const d = (task.date as any).toDate();
                          taskDateStr = formatDate(d);
                        }
                      }
                    } catch (e) {
                      console.error("日付変換エラー:", e);
                    }

                    dateMatches = taskDateStr === selectedDate;
                  }

                  // 両方の条件を満たすタスクを表示
                  return hasNoBlock && dateMatches;
                });
                return unassignedTasks;
              })()}
              blocks={blocks}
              loading={loading}
              date={selectedDate}
            />
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || messagesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {!userId ? renderLoginPromotion() : renderTaskManagement()}
    </div>
  );
}
