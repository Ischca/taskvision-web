"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onIdTokenChanged,
  getIdToken,
  UserCredential,
} from "firebase/auth";
import { ensureDefaultBlocks } from "@/lib/ensureDefaultBlocks";
import {
  requestNotificationPermission,
  startReminderTimer,
  stopReminderTimer,
} from "@/lib/reminderService";
import { checkAndGenerateNextRepeatTasks } from "@/lib/repeatTaskUtils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// コンテキストの型定義
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  userId: string | null;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGooglePopup: () => Promise<UserCredential>;
  logOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

// デフォルト値
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  userId: null,
  error: null,
  signInWithEmail: async () => {
    throw new Error("AuthContext not initialized");
  },
  signInWithGooglePopup: async () => {
    throw new Error("AuthContext not initialized");
  },
  logOut: async () => {
    throw new Error("AuthContext not initialized");
  },
  refreshToken: async () => null,
};

// React 19用の型安全なコンテキスト作成
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProviderの型定義
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProviderコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderTimerId, setReminderTimerId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const router = useRouter();

  // 実際のユーザーIDのみを使用
  const userId = user?.uid || null;

  // メールとパスワードでサインイン
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
      setUser(result.user);
      setLoading(false);

      if (result.user) {
        // ユーザーが認証されている場合の処理
        ensureDefaultBlocks(result.user.uid).catch((err) => {
          console.error("デフォルトブロック作成エラー:", err);
        });
      }
      return result;
    } catch (error: any) {
      // エラーハンドリングを改善
      let errorMessage = "認証に失敗しました";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "メールアドレスかパスワードが間違っています";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "このアカウントは無効になっています";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "このメールアドレスのユーザーが見つかりません";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "ログイン試行回数が多すぎます。しばらく待ってから再試行してください";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "ネットワークエラーが発生しました。インターネット接続を確認してください";
      }
      setError(errorMessage);
      console.error("サインインエラー:", error);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Googleでサインイン
  const signInWithGooglePopup = async (): Promise<UserCredential> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      router.push("/dashboard");
      setUser(result.user);
      setLoading(false);
      return result;
    } catch (error: any) {
      let errorMessage = "Googleログインに失敗しました";
      if (error.code === "auth/popup-blocked") {
        errorMessage =
          "ポップアップがブロックされました。ポップアップを許可してください";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "認証がキャンセルされました";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "ネットワークエラーが発生しました。インターネット接続を確認してください";
      }
      setError(errorMessage);
      console.error("Googleサインインエラー:", error);
      toast.error(errorMessage);
      throw error;
    }
  };

  // ログアウト
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.push("/login");
      setUser(null);
      setLoading(true);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setError("ログアウトに失敗しました");
      toast.error("ログアウトに失敗しました");
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
      toast.error("認証情報の更新に失敗しました");
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
        ensureDefaultBlocks(user.uid).catch((err) => {
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

          // トークンの期限切れが近い場合は更新をトリガー
          const tokenExpiration =
            JSON.parse(atob(token.split(".")[1])).exp * 1000;
          const timeToExpiry = tokenExpiration - Date.now();

          // 有効期限の10分前に自動更新をスケジュール
          if (timeToExpiry < 3600000) {
            // 1時間未満
            setTimeout(
              () => refreshToken(),
              Math.max(timeToExpiry - 600000, 0),
            ); // 10分前
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
      requestNotificationPermission()
        .then((granted) => {
          if (granted && reminderTimerId === null && userId !== null) {
            // リマインダータイマーを開始
            const timerId = startReminderTimer(userId);
            setReminderTimerId(timerId);
          }
        })
        .catch((err) => {
          console.error("通知パーミッションエラー:", err);
        });

      // 繰り返しタスクの確認と生成
      const checkRepeatTasks = async () => {
        try {
          if (userId !== null) {
            await checkAndGenerateNextRepeatTasks(userId);
          }
        } catch (error) {
          console.error(
            "繰り返しタスクの確認と生成中にエラーが発生しました:",
            error,
          );
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
          1,
          0,
          0,
        );
        const timeUntil1AM = tomorrow1AM.getTime() - now.getTime();

        // 最初は明日の1AMに設定し、その後は24時間ごとに実行
        const scheduleNextCheck = () => {
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
      }
    };
  }, [loading, userId, reminderTimerId]);

  // コンテキスト値
  const contextValue = {
    user,
    loading,
    userId,
    error,
    signInWithEmail,
    signInWithGooglePopup,
    logOut,
    refreshToken,
  };

  // React 19対応のレンダリング
  return (
    <div className="auth-context-wrapper">
      {/* @ts-ignore */}
      <AuthContext.Provider value={contextValue}>
        {loading ? (
          <div className="loading-auth">Loading authentication...</div>
        ) : (
          children
        )}
      </AuthContext.Provider>
    </div>
  );
}
