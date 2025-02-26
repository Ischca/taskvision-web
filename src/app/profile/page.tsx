"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    updateProfile,
    deleteUser,
    signOut
} from "firebase/auth";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const { user, userId, loading } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    // 未ログインの場合はログインページにリダイレクト
    useEffect(() => {
        if (!loading && !userId) {
            router.push("/login");
        }
    }, [loading, userId, router]);

    // ユーザー情報をフォームに設定
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setEmail(user.email || "");
        }
    }, [user]);

    // 基本プロフィール更新
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            // ユーザー名を更新
            await updateProfile(user, {
                displayName: displayName
            });

            setSuccessMessage("プロフィールを更新しました。");
        } catch (error: any) {
            console.error("プロフィール更新エラー:", error);
            setErrorMessage("プロフィールの更新に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    // アカウント削除
    const handleDeleteAccount = async () => {
        if (!user) return;

        if (deleteConfirmText !== "削除する") {
            setErrorMessage("確認テキストが一致しません。");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await deleteUser(user);
            router.push("/login");
        } catch (error: any) {
            console.error("アカウント削除エラー:", error);
            setErrorMessage("アカウントの削除に失敗しました。再ログインして再試行してください。");
            setIsSubmitting(false);
        }
    };

    // ログアウト
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-lg">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // ユーザーがない場合は何も表示しない（リダイレクト処理中）
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">アカウント設定</h1>
                <Link href="/" className="text-primary-600 hover:text-primary-800">
                    ← ホームに戻る
                </Link>
            </div>

            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            className={`px-4 py-4 text-sm font-medium ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            プロフィール
                        </button>
                        <button
                            className={`px-4 py-4 text-sm font-medium ${activeTab === 'account' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('account')}
                        >
                            アカウント
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        名前
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        メールアドレス
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="input input-bordered w-full"
                                            value={email}
                                            disabled
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        メールアドレスはGoogleアカウントに紐づいています。変更するには、Googleアカウント設定から行ってください。
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "更新中..." : "プロフィールを更新"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">アカウント操作</h3>
                                <div className="mt-4 grid grid-cols-1 gap-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={handleLogout}
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-red-600">危険な操作</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        className="mt-4 btn btn-error btn-outline"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        アカウントを削除
                                    </button>
                                ) : (
                                    <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
                                        <h4 className="text-md font-medium text-red-800">本当にアカウントを削除しますか？</h4>
                                        <p className="mt-1 text-sm text-red-600">
                                            この操作は取り消せません。確認のため「削除する」と入力してください。
                                        </p>
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="削除する"
                                            />
                                        </div>
                                        <div className="mt-3 flex space-x-3">
                                            <button
                                                type="button"
                                                className="btn btn-error"
                                                disabled={isSubmitting || deleteConfirmText !== "削除する"}
                                                onClick={handleDeleteAccount}
                                            >
                                                {isSubmitting ? "処理中..." : "アカウントを完全に削除"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setDeleteConfirmText("");
                                                }}
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 