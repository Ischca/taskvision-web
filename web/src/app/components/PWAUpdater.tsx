"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function PWAUpdater() {
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Service Workerをサポートしているかチェック
        if ("serviceWorker" in navigator) {
            // Service Workerに関連するイベントを監視
            const handleUpdate = (reg: ServiceWorkerRegistration) => {
                if (reg.waiting) {
                    // 更新待ちの Service Worker がある場合
                    setRegistration(reg);
                    setShowUpdateBanner(true);
                }
            };

            // Service Workerの登録
            navigator.serviceWorker.ready.then((reg) => {
                // 既存の待機中の Service Worker があるかチェック
                if (reg.waiting) {
                    setRegistration(reg);
                    setShowUpdateBanner(true);
                    return;
                }

                // 更新イベントを監視
                reg.addEventListener("updatefound", () => {
                    if (reg.installing) {
                        const newWorker = reg.installing;
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                handleUpdate(reg);
                            }
                        });
                    }
                });
            });

            // 制御されていない Service Worker が更新を見つけた場合
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                window.location.reload();
            });
        }
    }, []);

    // 更新を適用する
    const applyUpdate = () => {
        if (registration && registration.waiting) {
            // waiting の Service Worker にメッセージを送信して更新を促す
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
            setShowUpdateBanner(false);
        }
    };

    if (!showUpdateBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 m-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-md mx-auto border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">アップデートが利用可能です</h3>
                    <button
                        onClick={() => setShowUpdateBanner(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    TaskVisionの新しいバージョンが利用可能です。更新してアプリを最新の状態にしましょう。
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={applyUpdate}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                    >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        更新する
                    </button>
                    <button
                        onClick={() => setShowUpdateBanner(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
                    >
                        あとで
                    </button>
                </div>
            </div>
        </div>
    );
} 