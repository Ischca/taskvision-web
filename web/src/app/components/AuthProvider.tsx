"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ensureDefaultBlocks } from "@/lib/ensureDefaultBlocks";
import { requestNotificationPermission, startReminderTimer, stopReminderTimer } from "@/lib/reminderService";
import { checkAndGenerateNextRepeatTasks } from "@/lib/repeatTaskUtils";

// 認証コンテキストの型定義
type AuthContextType = {
    user: User | null;
    loading: boolean;
    userId: string | null; // nullも許容するよう変更
};

// 認証コンテキストの作成（デフォルト値を設定）
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    userId: null, // DEFAULTをnullに変更
});

// 認証コンテキストを使用するカスタムフック
export const useAuth = () => {
    return useContext(AuthContext);
};

// 認証プロバイダーコンポーネント
export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [reminderTimerId, setReminderTimerId] = useState<NodeJS.Timeout | null>(null);

    // 実際のユーザーIDのみを使用
    const userId = user?.uid || null;

    // 認証状態の監視
    useEffect(() => {
        // Firebase Auth の監視
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            if (user) {
                // ユーザーが認証されている場合の処理
                ensureDefaultBlocks(user.uid);
            }
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, []);

    // リマインダータイマーと繰り返しタスクの初期化
    useEffect(() => {
        if (!loading) {
            // 通知のパーミッションを要求
            requestNotificationPermission().then(granted => {
                console.log("通知パーミッション:", granted ? "許可" : "拒否");

                if (granted && reminderTimerId === null && userId !== null) {
                    // リマインダータイマーを開始
                    const timerId = startReminderTimer(userId);
                    setReminderTimerId(timerId);
                    console.log("リマインダータイマーを開始しました");
                }
            });

            // 繰り返しタスクの確認と生成
            const checkRepeatTasks = async () => {
                try {
                    if (userId !== null) {
                        await checkAndGenerateNextRepeatTasks(userId);
                        console.log("繰り返しタスクの確認と生成を完了しました");
                    }
                } catch (error) {
                    console.error("繰り返しタスクの確認と生成中にエラーが発生しました:", error);
                }
            };

            // ユーザーがログインしている場合のみ実行
            if (userId !== null) {
                // 初回実行
                checkRepeatTasks();

                // 毎日AM 1:00に実行するための設定
                const now = new Date();
                const tomorrow1AM = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 1,
                    1, 0, 0
                );
                const timeUntil1AM = tomorrow1AM.getTime() - now.getTime();

                // 最初は明日の1AMに設定し、その後は24時間ごとに実行
                const scheduleNextCheck = () => {
                    console.log("次回の繰り返しタスクチェックをスケジュール: ", new Date(Date.now() + timeUntil1AM));
                    setTimeout(() => {
                        checkRepeatTasks();
                        // 以降は24時間ごとにチェック
                        setInterval(checkRepeatTasks, 24 * 60 * 60 * 1000);
                    }, timeUntil1AM);
                };

                scheduleNextCheck();
            }
        }

        // クリーンアップ関数
        return () => {
            if (reminderTimerId !== null) {
                stopReminderTimer(reminderTimerId);
                console.log("リマインダータイマーを停止しました");
            }
        };
    }, [loading, userId, reminderTimerId]);

    // コンテキスト値
    const value = {
        user,
        loading,
        userId,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 