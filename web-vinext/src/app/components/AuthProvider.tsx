"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth } from "../../lib/firebase";
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
import { ensureDefaultBlocks } from "../../lib/ensureDefaultBlocks";
import {
  requestNotificationPermission,
  startReminderTimer,
  stopReminderTimer,
} from "../../lib/reminderService";
import { checkAndGenerateNextRepeatTasks } from "../../lib/repeatTaskUtils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderTimerId, setReminderTimerId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const router = useRouter();

  const userId = user?.uid || null;

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
        ensureDefaultBlocks(result.user.uid).catch((err) => {
          console.error("デフォルトブロック作成エラー:", err);
        });
      }
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let errorMessage = "認証に失敗しました";
      if (firebaseError.code === "auth/invalid-credential") {
        errorMessage = "メールアドレスかパスワードが間違っています";
      } else if (firebaseError.code === "auth/user-disabled") {
        errorMessage = "このアカウントは無効になっています";
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage =
          "ログイン試行回数が多すぎます。しばらく待ってから再試行してください";
      }
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithGooglePopup = async (): Promise<UserCredential> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      router.push("/dashboard");
      setUser(result.user);
      setLoading(false);
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let errorMessage = "Googleログインに失敗しました";
      if (firebaseError.code === "auth/popup-blocked") {
        errorMessage = "ポップアップがブロックされました";
      } else if (firebaseError.code === "auth/popup-closed-by-user") {
        errorMessage = "認証がキャンセルされました";
      }
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        ensureDefaultBlocks(user.uid).catch((err) => {
          console.error("デフォルトブロック作成エラー:", err);
        });
      }
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user);
          const tokenExpiration =
            JSON.parse(atob(token.split(".")[1])).exp * 1000;
          const timeToExpiry = tokenExpiration - Date.now();

          if (timeToExpiry < 3600000) {
            setTimeout(
              () => refreshToken(),
              Math.max(timeToExpiry - 600000, 0),
            );
          }
        } catch (err) {
          console.error("トークン取得エラー:", err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [refreshToken]);

  useEffect(() => {
    if (!loading) {
      requestNotificationPermission()
        .then((granted) => {
          if (granted && reminderTimerId === null && userId !== null) {
            const timerId = startReminderTimer(userId);
            setReminderTimerId(timerId);
          }
        })
        .catch((err) => {
          console.error("通知パーミッションエラー:", err);
        });

      const checkRepeatTasks = async () => {
        try {
          if (userId !== null) {
            await checkAndGenerateNextRepeatTasks(userId);
          }
        } catch (error) {
          console.error("繰り返しタスクエラー:", error);
        }
      };

      if (userId !== null) {
        checkRepeatTasks();

        const now = new Date();
        const tomorrow1AM = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          1, 0, 0,
        );
        const timeUntil1AM = tomorrow1AM.getTime() - now.getTime();

        const scheduleNextCheck = () => {
          setTimeout(() => {
            checkRepeatTasks();
            setInterval(checkRepeatTasks, 24 * 60 * 60 * 1000);
          }, timeUntil1AM);
        };

        scheduleNextCheck();
      }
    }

    return () => {
      if (reminderTimerId !== null) {
        stopReminderTimer(reminderTimerId);
      }
    };
  }, [loading, userId, reminderTimerId]);

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

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? (
        <div className="loading-auth">Loading authentication...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
