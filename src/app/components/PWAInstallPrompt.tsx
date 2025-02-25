"use client";

import { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // インストール済みかどうかを確認
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // インストールプロンプトイベントをキャプチャ
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        // インストール完了イベントのハンドリング
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // LocalStorageからプロンプト表示履歴を確認
        const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
        if (hasUserDismissed) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // インストールプロンプトを表示
        deferredPrompt.prompt();

        // ユーザーがプロンプトに応答するのを待つ
        const { outcome } = await deferredPrompt.userChoice;

        // プロンプトは一度しか使えないので破棄
        setDeferredPrompt(null);

        // ユーザーが「インストール」を選択した場合
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // 再表示を防ぐためLocalStorageに記録
        localStorage.setItem('pwaPromptDismissed', 'true');
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-sm px-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                        <DevicePhoneMobileIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">アプリをインストール</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            ホーム画面に追加してオフラインでも利用できます
                        </p>
                        <div className="mt-3 flex space-x-2">
                            <button
                                type="button"
                                onClick={handleInstallClick}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                インストール
                            </button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                後で
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
                        onClick={handleDismiss}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
} 