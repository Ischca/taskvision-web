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

function getAuthMessage(code: string): string {
  const locale = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/(ja|en)/)?.[1] || "ja")
    : "ja";
  const messages: Record<string, Record<string, string>> = {
    ja: {
      "auth/invalid-credential": "メールアドレスかパスワードが間違っています",
      "auth/user-disabled": "このアカウントは無効になっています",
      "auth/too-many-requests": "ログイン試行回数が多すぎます。しばらく待ってから再試行してください",
      "auth/popup-blocked": "ポップアップがブロックされました",
      "auth/popup-closed-by-user": "認証がキャンセルされました",
      "default-email": "認証に失敗しました",
      "default-google": "Googleログインに失敗しました",
      "logout-failed": "ログアウトに失敗しました",
      "token-refresh-failed": "認証情報の更新に失敗しました",
    },
    en: {
      "auth/invalid-credential": "Invalid email or password",
      "auth/user-disabled": "This account has been disabled",
      "auth/too-many-requests": "Too many login attempts. Please try again later",
      "auth/popup-blocked": "Popup was blocked",
      "auth/popup-closed-by-user": "Authentication was cancelled",
      "default-email": "Authentication failed",
      "default-google": "Failed to login with Google",
      "logout-failed": "Failed to logout",
      "token-refresh-failed": "Failed to refresh authentication",
    },
  };
  return messages[locale]?.[code] || messages["ja"][code] || code;
}

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
  const [repeatCheckTimers, setRepeatCheckTimers] = useState<{
    timeout: NodeJS.Timeout | null;
    interval: NodeJS.Timeout | null;
  }>({ timeout: null, interval: null });
  const router = useRouter();

  const userId = user?.uid || null;

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
      setUser(result.user);
      setLoading(false);

      if (result.user) {
        ensureDefaultBlocks(result.user.uid).catch((err) => {
          console.error("Default block creation error:", err);
        });
      }
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let errorMessage = getAuthMessage("default-email");
      if (firebaseError.code === "auth/invalid-credential") {
        errorMessage = getAuthMessage("auth/invalid-credential");
      } else if (firebaseError.code === "auth/user-disabled") {
        errorMessage = getAuthMessage("auth/user-disabled");
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage = getAuthMessage("auth/too-many-requests");
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
      router.push("/");
      setUser(result.user);
      setLoading(false);
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let errorMessage = getAuthMessage("default-google");
      if (firebaseError.code === "auth/popup-blocked") {
        errorMessage = getAuthMessage("auth/popup-blocked");
      } else if (firebaseError.code === "auth/popup-closed-by-user") {
        errorMessage = getAuthMessage("auth/popup-closed-by-user");
      }
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.push("/");
      setUser(null);
      setLoading(true);
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = getAuthMessage("logout-failed");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!user) return null;
      const newToken = await getIdToken(user, true);
      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      setError(getAuthMessage("token-refresh-failed"));
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

        const timeoutId = setTimeout(() => {
          checkRepeatTasks();
          const intervalId = setInterval(checkRepeatTasks, 24 * 60 * 60 * 1000);
          setRepeatCheckTimers((prev) => ({ ...prev, interval: intervalId }));
        }, timeUntil1AM);
        setRepeatCheckTimers((prev) => ({ ...prev, timeout: timeoutId }));
      }
    }

    return () => {
      if (reminderTimerId !== null) {
        stopReminderTimer(reminderTimerId);
      }
      if (repeatCheckTimers.timeout) clearTimeout(repeatCheckTimers.timeout);
      if (repeatCheckTimers.interval) clearInterval(repeatCheckTimers.interval);
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
