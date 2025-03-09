"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Task, Block } from "@/types";
import { useAuth } from "./components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "./components/ThemeProvider";
import { useMessages } from '@/app/hooks/useMessages';
import Sidebar from "./components/Sidebar";
import GlobalTaskAddButton from "./components/GlobalTaskAddButton";
import BlockList from "./components/BlockList";
import UnassignedTasksSection from "./components/UnassignedTasksSection";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { formatDate, parseDate, isToday } from "@/lib/dateUtils";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { theme } = useTheme();
  const { t } = useMessages();

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    let prefix = '';
    if (diffDays === 0) prefix = `${t('common.dates.today')} - `;
    else if (diffDays === 1) prefix = `${t('common.dates.tomorrow')} - `;
    else if (diffDays === -1) prefix = `${t('common.dates.yesterday')} - `;

    return `${prefix}${date.toLocaleDateString(t('common.locale') || 'ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}`;
  };

  // ユーザーIDが利用可能になったら、タスクとブロックをフェッチ
  useEffect(() => {
    // 認証ローディング中は何もしない
    if (authLoading) return;

    // クリーンアップ関数を保持する変数
    let unsubscribeTasks: () => void = () => { };
    let unsubscribeBlocks: () => void = () => { };

    // ログインしている場合のみデータをフェッチ
    if (userId) {
      setLoading(true);

      // タスクのリアルタイムリスナーをセットアップ
      try {
        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(
          tasksRef,
          where("userId", "==", userId)
        );

        unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const fetchedTasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[];

          setTasks(fetchedTasks);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching tasks:", error);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up task listener:", error);
        setLoading(false);
      }

      // ブロックのリアルタイムリスナーをセットアップ
      try {
        const blocksRef = collection(db, "blocks");
        const blocksQuery = query(
          blocksRef,
          where("userId", "==", userId),
          orderBy("order", "asc")
        );

        unsubscribeBlocks = onSnapshot(blocksQuery, (snapshot) => {
          const fetchedBlocks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Block[];

          setBlocks(fetchedBlocks);
        }, (error) => {
          console.error("Error fetching blocks:", error);
        });
      } catch (error) {
        console.error("Error setting up block listener:", error);
      }
    } else {
      // 未ログインの場合はローディングを終了
      setLoading(false);
    }

    // クリーンアップ：コンポーネントのアンマウント時にリスナーを解除
    return () => {
      unsubscribeTasks();
      unsubscribeBlocks();
    };
  }, [userId, authLoading]);

  // 未ログインの場合のプロモーションセクション
  const renderLoginPromotion = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">TaskVisionへようこそ</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          タイムブロッキングを活用した効率的なタスク管理アプリです。<br />
          Googleアカウントで簡単にログインして、タスクを効率的に管理しましょう。
        </p>

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl w-full mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">時間をブロックで管理</h2>
            <p className="text-gray-600">タイムブロックで1日の流れを視覚化し、集中力を高めます。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">シンプルで直感的</h2>
            <p className="text-gray-600">余計な機能はなく、シンプルで使いやすいインターフェース。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">リマインダー機能</h2>
            <p className="text-gray-600">タスクの締め切りが近づくと、リマインダーでお知らせします。</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">パスワードレス認証</h2>
            <p className="text-gray-600">Googleアカウントでログイン。パスワード不要で安全・簡単。</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="btn btn-primary btn-lg flex items-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleで続ける
          </Link>
        </div>
      </div>
    );
  };

  // ログイン状態のタスク管理画面
  const renderTaskManagement = () => {
    return (
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 lg:w-72 flex-shrink-0 mb-6 md:mb-0 md:mr-6">
          <Sidebar blocks={blocks} tasks={tasks} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">タスク一覧</h1>
            <GlobalTaskAddButton todayStr={selectedDate} />
          </div>

          {/* 日付選択UI */}
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="前日"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center">
              <button
                onClick={goToToday}
                className="mr-2 px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/50"
              >
                今日
              </button>

              <div className="flex items-center relative">
                <button
                  onClick={() => {
                    // dateInputを参照して、クリックイベントをトリガー
                    const dateInput = document.getElementById('date-input');
                    if (dateInput) {
                      (dateInput as HTMLInputElement).showPicker();
                    }
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-lg font-medium text-gray-800 dark:text-white">
                    {formatDisplayDate(selectedDate)}
                  </span>
                </button>

                <input
                  id="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                  style={{ colorScheme: 'auto' }}
                />
              </div>
            </div>

            <button
              onClick={goToNextDay}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="翌日"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* ブロック一覧 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">時間ブロック</h2>
            <BlockList
              blocks={blocks}
              tasks={tasks.filter(task => !task.date || task.date === selectedDate)}
              date={selectedDate}
              loading={loading}
            />
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">未割り当てタスク</h2>
          <UnassignedTasksSection
            tasks={tasks.filter(task =>
              task.blockId === null &&
              (!task.date || task.date === selectedDate)
            )}
            blocks={blocks}
            loading={loading}
            date={selectedDate}
          />
        </div>
      </div>
    );
  };

  // 読み込み中の表示
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // 認証状態のチェックをより厳格に
  const isAuthenticated = userId !== null && userId !== undefined && userId !== '';

  return (
    <div className="container mx-auto max-w-7xl">
      {isAuthenticated ? renderTaskManagement() : renderLoginPromotion()}
    </div>
  );
}