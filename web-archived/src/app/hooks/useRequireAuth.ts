import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';

/**
 * 認証が必要なページに使用するカスタムフック
 * 未認証ユーザーは自動的にログインページにリダイレクトされます
 *
 * @param redirectUrl リダイレクト先のURL（デフォルトは '/login'）
 * @returns 認証情報（userId, user, loading）
 */
export default function useRequireAuth(redirectUrl: string = '/login') {
  const auth = useAuth();
  const { userId, user, loading: authLoading } = auth;
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // より厳格な認証チェック
  const isAuthenticated =
    userId !== null && userId !== undefined && userId !== '';

  useEffect(() => {
    // ローディング中は何もしない
    if (authLoading) {
      return;
    }

    // 認証チェックが完了したらフラグを設定
    if (!authChecked) {
      setAuthChecked(true);
      return; // 最初のチェック時は早期リターン
    }

    // 認証チェックが完了し、未認証の場合はリダイレクト
    if (!isAuthenticated && authChecked) {
      router.push(redirectUrl);
    }
  }, [authLoading, userId, isAuthenticated, router, redirectUrl, authChecked]);

  // useAuthの全ての値をそのまま返す
  return { ...auth, isAuthenticated };
}
