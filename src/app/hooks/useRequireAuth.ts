import { useEffect } from 'react';
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
  const { userId, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証ロード完了後、ユーザーIDがない場合はリダイレクト
    if (!authLoading && !userId) {
      console.log(
        `認証が必要なページへの未認証アクセスを検出、${redirectUrl}へリダイレクト中...`
      );
      router.push(redirectUrl);
    }
  }, [authLoading, userId, router, redirectUrl]);

  return { userId, user, loading: authLoading };
}
