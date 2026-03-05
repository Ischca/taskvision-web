"use client";

import { useState, useEffect } from "react";
import { WifiIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function OfflineDetector() {
    const [isOffline, setIsOffline] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 初期状態をチェック
        setIsOffline(!navigator.onLine);
        setShowBanner(!navigator.onLine);

        // オンライン/オフラインの状態変化を監視
        const handleOnline = () => {
            setIsOffline(false);
            setShowBanner(false);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowBanner(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showBanner) {
        return null;
    }

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showBanner ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <WifiIcon className="h-5 w-5 text-amber-500 mr-2" />
                        <p className="text-amber-800 text-sm font-medium">
                            {isOffline
                                ? "オフラインモードです。インターネット接続を確認してください。"
                                : "接続が回復しました！"}
                        </p>
                    </div>
                    {isOffline && (
                        <button
                            onClick={() => setShowBanner(false)}
                            className="text-amber-500 hover:text-amber-700"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 