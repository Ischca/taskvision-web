"use client";

import { FC, useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Integration, IntegrationType } from "@/types";
import {
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    PlusIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

// 統合サービス設定ページコンポーネント
const IntegrationsPage: FC = () => {
    const { userId, user } = useAuth();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedIntegrationType, setSelectedIntegrationType] = useState<IntegrationType | null>(null);

    // 統合サービスのリストをロード
    useEffect(() => {
        const fetchIntegrations = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/integrations?userId=${userId}`);

                if (!response.ok) {
                    throw new Error('統合サービス設定の取得に失敗しました');
                }

                const data = await response.json();
                setIntegrations(data.integrations || []);
            } catch (err) {
                console.error("統合サービスのロード中にエラーが発生しました:", err);
                setError(err instanceof Error ? err.message : '統合サービスの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchIntegrations();
    }, [userId]);

    // 統合タイプに基づいて追加モーダルを表示
    const handleShowAddModal = (type: IntegrationType) => {
        setSelectedIntegrationType(type);
        setShowAddModal(true);
    };

    // 統合サービスの有効・無効を切り替え
    const toggleIntegrationStatus = async (integrationId: string, currentStatus: boolean) => {
        try {
            const integrationRef = doc(db, "integrations", integrationId);
            await updateDoc(integrationRef, {
                isActive: !currentStatus
            });

            // ローカル状態を更新
            setIntegrations(prev =>
                prev.map(item =>
                    item.id === integrationId
                        ? { ...item, isActive: !currentStatus }
                        : item
                )
            );
        } catch (err) {
            console.error("統合サービスの状態変更中にエラーが発生しました:", err);
            setError("統合サービスの設定の更新に失敗しました");
        }
    };

    // 統合サービスを削除
    const deleteIntegration = async (integrationId: string) => {
        if (!confirm("この連携を削除してもよろしいですか？")) {
            return;
        }

        try {
            const integrationRef = doc(db, "integrations", integrationId);
            await deleteDoc(integrationRef);

            // ローカル状態を更新
            setIntegrations(prev => prev.filter(item => item.id !== integrationId));
        } catch (err) {
            console.error("統合サービスの削除中にエラーが発生しました:", err);
            setError("統合サービスの削除に失敗しました");
        }
    };

    // 統合サービスの種類に応じた名前を表示
    const getIntegrationName = (type: IntegrationType): string => {
        switch (type) {
            case 'slack':
                return 'Slack';
            case 'email':
                return 'メール';
            case 'chrome_extension':
                return 'Chrome拡張機能';
            default:
                return type;
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        連携サービス設定
                    </h1>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            連携機能を使用するには、ログインしてください。
                        </p>
                        <Link href="/login" className="btn btn-primary mt-4">
                            ログイン
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    連携サービス設定
                </h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            連携サービス一覧
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100"></div>
                        </div>
                    ) : (
                        <>
                            {integrations.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        連携サービスがまだ設定されていません
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {integrations.map((integration) => (
                                        <div
                                            key={integration.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                                    {getIntegrationName(integration.type)}
                                                    {integration.isActive ? (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                            有効
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            無効
                                                        </span>
                                                    )}
                                                </div>
                                                {integration.type === 'slack' && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        ワークスペース ID: {integration.workspaceId}
                                                    </p>
                                                )}
                                                {integration.type === 'email' && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        メール: {integration.emailAddress}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => toggleIntegrationStatus(integration.id!, integration.isActive)}
                                                    className={`p-2 rounded-full ${integration.isActive
                                                        ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                        }`}
                                                    title={integration.isActive ? "無効にする" : "有効にする"}
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteIntegration(integration.id!)}
                                                    className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                                                    title="削除"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    新しい連携を追加
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    {/* SlackとEmail連携は一時的に非表示
                                    <button
                                        onClick={() => handleShowAddModal('slack')}
                                        className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                                            <PlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">Slack連携</span>
                                    </button>

                                    <button
                                        onClick={() => handleShowAddModal('email')}
                                        className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="h-12 w-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4">
                                            <PlusIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">メール連携</span>
                                    </button>
                                    */}

                                    <button
                                        onClick={() => handleShowAddModal('chrome_extension')}
                                        className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                                            <PlusIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">Chrome拡張機能</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 統合サービス追加モーダル（実際の実装はここに追加） */}
            {showAddModal && selectedIntegrationType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {getIntegrationName(selectedIntegrationType)}を連携
                            </h3>
                            <button
                                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setShowAddModal(false)}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {/* ここに各統合タイプに応じたフォームを実装 */}
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {/* SlackとEmail連携は一時的に非表示
                                {selectedIntegrationType === 'slack' && 'Slack連携の設定をします。ワークスペースIDとトークンを入力してください。'}
                                {selectedIntegrationType === 'email' && 'メール連携の設定をします。連携するメールアドレスを入力してください。'}
                                */}
                                {selectedIntegrationType === 'chrome_extension' && 'Chrome拡張機能の設定をします。拡張機能をインストールしてアカウント連携を行ってください。'}
                            </p>

                            {/* 実装中の通知 */}
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
                                <p>この機能は現在開発中です。もうしばらくお待ちください。</p>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    className="btn btn-outline mr-2"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    キャンセル
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        // 統合サービス追加処理（現在は実装されていない）
                                        setShowAddModal(false);
                                    }}
                                >
                                    連携する
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationsPage; 