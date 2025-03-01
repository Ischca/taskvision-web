'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * クライアントサイドでのみレンダリングするコンポーネント
 * サーバーサイドレンダリング中は何も表示しない（またはフォールバックを表示）
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // サーバーサイドレンダリング中はフォールバックを表示
    if (!isClient) {
        return <>{fallback}</>;
    }

    // クライアントサイドでレンダリング
    return <>{children}</>;
} 