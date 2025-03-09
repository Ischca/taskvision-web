"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// PWAインストールコンポーネント
export default function InstallPWA() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [dismissed, setDismissed] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // PWAが既にインストールされているかどうかを確認
        const checkIfInstalled = () => {
            // スタンドアロンモードでの実行か、iOSのフルスクリーンモードでの実行かを確認
            if (window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches ||
                (window.navigator as any).standalone === true) {
                setIsInstalled(true);
                return true;
            }
            return false;
        };

        if (checkIfInstalled()) {
            // インストール済みの場合はプロンプトを表示しない
            return;
        }

        // PWAインストールが可能かどうかをチェック
        const handler = (e: any) => {
            // インストールプロンプトを表示する前にイベントをキャプチャ
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);

            // ローカルストレージをチェックして、ユーザーが過去に通知を閉じたかどうかを確認
            const hasUserDismissedPrompt = localStorage.getItem("pwaPromptDismissed");
            if (hasUserDismissedPrompt === "true") {
                setDismissed(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        // 'appinstalled' イベントを監視して、PWAがインストールされたときに通知を非表示にする
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener('appinstalled', () => { });
        };
    }, []);

    // インストールボタンがクリックされたときの処理
    const handleInstallClick = () => {
        if (!deferredPrompt) return;

        // インストールプロンプトを表示
        deferredPrompt.prompt();

        // プロンプトが表示された後に結果を取得
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            // プロンプトは一度しか使用できないため、使用後はnullに設定
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        });
    };

    // プロンプトを閉じる処理
    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem("pwaPromptDismissed", "true");
    };

    // 表示条件: プロンプトが利用可能で、かつユーザーが閉じていない場合、かつPWAがインストールされていない場合
    if (!showInstallPrompt || !deferredPrompt || dismissed || isInstalled) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 m-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-md mx-auto border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">アプリをインストール</h3>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    TaskVisionをホーム画面に追加して、オフラインでも使用できます。
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
                    >
                        インストール
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
                    >
                        あとで
                    </button>
                </div>
            </div>
        </div>
    );
} 