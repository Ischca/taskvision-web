"use client";

import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onIdTokenChanged,
    getIdToken
} from "firebase/auth";
import { ensureDefaultBlocks } from "@/lib/ensureDefaultBlocks";
import { requestNotificationPermission, startReminderTimer, stopReminderTimer } from "@/lib/reminderService";
import { checkAndGenerateNextRepeatTasks } from "@/lib/repeatTaskUtils";

// 認証コンテキストの型定義
type AuthContextType = {
    user: User | null;
    loading: boolean;
    userId: string | null;
    error: string | null;
    signInWithEmail: (email: string, password: string) => Promise<User | null>;
    signInWithGooglePopup: () => Promise<User | null>;
    logOut: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
};

// 認証コンテキストの作成（デフォルト値を設定）
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    userId: null,
    error: null,
    signInWithEmail: async () => null,
    signInWithGooglePopup: async () => null,
    logOut: async () => { },
    refreshToken: async () => null
});

// 認証コンテキストを使用するカスタムフック
export const useAuth = () => {
    return useContext(AuthContext);
};

// 認証プロバイダーコンポーネント
export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reminderTimerId, setReminderTimerId] = useState<NodeJS.Timeout | null>(null);

    // 実際のユーザーIDのみを使用
    const userId = user?.uid || null;

    // メールとパスワードでサインイン
    const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error: any) {
            // エラーハンドリングを改善
            let errorMessage = "認証に失敗しました";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = "メールアドレスかパスワードが間違っています";
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = "このアカウントは無効になっています";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "このメールアドレスのユーザーが見つかりません";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "ログイン試行回数が多すぎます。しばらく待ってから再試行してください";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "ネットワークエラーが発生しました。インターネット接続を確認してください";
            }
            setError(errorMessage);
            console.error("サインインエラー:", error);
            return null;
        }
    };

    // Googleでサインイン
    const signInWithGooglePopup = async (): Promise<User | null> => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error: any) {
            let errorMessage = "Googleログインに失敗しました";
            if (error.code === 'auth/popup-blocked') {
                errorMessage = "ポップアップがブロックされました。ポップアップを許可してください";
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "認証がキャンセルされました";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "ネットワークエラーが発生しました。インターネット接続を確認してください";
            }
            setError(errorMessage);
            console.error("Googleサインインエラー:", error);
            return null;
        }
    };

    // ログアウト
    const logOut = async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("ログアウトエラー:", error);
            setError("ログアウトに失敗しました");
        }
    };

    // トークンを更新
    const refreshToken = useCallback(async (): Promise<string | null> => {
        try {
            if (!user) return null;
            const newToken = await getIdToken(user, true);
            return newToken;
        } catch (error) {
            console.error("トークン更新エラー:", error);
            setError("認証情報の更新に失敗しました");
            return null;
        }
    }, [user]);

    // 認証状態の監視
    useEffect(() => {
        // Firebase Auth の監視
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            if (user) {
                // ユーザーが認証されている場合の処理
                ensureDefaultBlocks(user.uid).catch(err => {
                    console.error("デフォルトブロック作成エラー:", err);
                });
            }
        });

        // トークン変更の監視
        const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
            if (user) {
                try {
                    // トークンを取得し、必要に応じて更新
                    const token = await getIdToken(user);
                    console.log("トークンが更新されました");

                    // トークンの期限切れが近い場合は更新をトリガー
                    const tokenExpiration = JSON.parse(atob(token.split('.')[1])).exp * 1000;
                    const timeToExpiry = tokenExpiration - Date.now();

                    // 有効期限の10分前に自動更新をスケジュール
                    if (timeToExpiry < 3600000) { // 1時間未満
                        setTimeout(() => refreshToken(), Math.max(timeToExpiry - 600000, 0)); // 10分前
                    }
                } catch (err) {
                    console.error("トークン取得エラー:", err);
                }
            }
        });

        // クリーンアップ関数
        return () => {
            unsubscribeAuth();
            unsubscribeToken();
        };
    }, [refreshToken]);

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
            }).catch(err => {
                console.error("通知パーミッションエラー:", err);
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
        error,
        signInWithEmail,
        signInWithGooglePopup,
        logOut,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 