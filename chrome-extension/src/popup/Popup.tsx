import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const Popup: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [pageInfo, setPageInfo] = useState<{ title: string; url: string }>({ title: '', url: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [taskTitle, setTaskTitle] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [selectedText, setSelectedText] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
    const [authChecking, setAuthChecking] = useState<boolean>(true);

    // ウェブアプリのURLを環境変数から取得
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://task-vision.com';

    // 現在のタブ情報を取得
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            setPageInfo({
                title: tab.title || '',
                url: tab.url || '',
            });
            setTaskTitle(tab.title || '');
        });

        // 選択されたテキストを取得（Manifest V3対応版）
        if (chrome.scripting) {
            // Manifest V3
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                    try {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => window.getSelection()?.toString() || '',
                        }, (result) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                return;
                            }
                            if (result && result[0] && result[0].result) {
                                setSelectedText(result[0].result);
                                if (result[0].result.trim() !== '') {
                                    setTaskDescription(result[0].result);
                                }
                            }
                        });
                    } catch (e) {
                        console.error('実行エラー:', e);
                    }
                }
            });
        } else {
            // 以前のバージョンとの互換性のために残す（通常は実行されない）
            try {
                chrome.tabs.executeScript({
                    code: 'window.getSelection().toString();',
                }, (selection: string[]) => {
                    if (chrome.runtime.lastError) {
                        // エラーがあるが、無視して処理を続行
                        return;
                    }
                    if (selection && selection[0]) {
                        setSelectedText(selection[0]);
                        if (selection[0].trim() !== '') {
                            setTaskDescription(selection[0]);
                        }
                    }
                });
            } catch (e) {
                console.error('executeScript error:', e);
            }
        }

        // ブラウザのFirebase認証状態を確認
        setAuthChecking(true);

        // バックグラウンドから認証状態を確認
        chrome.runtime.sendMessage({ action: 'checkAuthState' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('バックグラウンド通信エラー:', chrome.runtime.lastError);
            }
        });

        // 認証状態を監視
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthChecking(false);
        });

        return () => unsubscribe();
    }, []);

    // ログイン処理 - ウェブ版にリダイレクト
    const handleLogin = async () => {
        try {
            // ウェブアプリのログインページにリダイレクト
            chrome.tabs.create({ url: `${webAppUrl}/login` });
            window.close(); // ポップアップを閉じる
        } catch (error) {
            console.error('ログインエラー:', error);
            setMessage({ type: 'error', text: 'ログインに失敗しました。' });
        }
    };

    // ログアウト
    const handleLogout = async () => {
        try {
            await auth.signOut();
            setMessage({ type: 'success', text: 'ログアウトしました。' });
        } catch (error) {
            console.error('ログアウトエラー:', error);
            setMessage({ type: 'error', text: 'ログアウトに失敗しました。' });
        }
    };

    // タスクを作成
    const createTask = async () => {
        if (!currentUser) {
            setMessage({ type: 'error', text: 'タスクを作成するにはログインしてください。' });
            return;
        }

        if (!taskTitle.trim()) {
            setMessage({ type: 'error', text: 'タスク名は必須です。' });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'tasks'), {
                userId: currentUser.uid,
                title: taskTitle,
                description: taskDescription,
                status: 'open',
                blockId: null,
                date: null,
                createdAt: serverTimestamp(),
                source: {
                    type: 'chrome_extension',
                    url: pageInfo.url,
                    pageTitle: pageInfo.title,
                    capturedAt: new Date().toISOString(),
                },
            });

            setMessage({ type: 'success', text: 'タスクを作成しました！' });
            setTaskTitle('');
            setTaskDescription('');
        } catch (error) {
            console.error('タスク作成エラー:', error);
            setMessage({ type: 'error', text: 'タスクの作成に失敗しました。' });
        } finally {
            setLoading(false);
        }
    };

    // 認証チェック中の表示
    if (authChecking) {
        return (
            <div className="p-4">
                <header className="flex justify-center items-center mb-4">
                    <h1 className="text-xl font-bold">TaskVision</h1>
                </header>
                <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600">ログイン状態を確認中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">TaskVision</h1>
                {currentUser ? (
                    <button
                        onClick={handleLogout}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        ログアウト
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        ログイン
                    </button>
                )}
            </header>

            {message.text && (
                <div
                    className={`p-2 mb-3 rounded ${message.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {currentUser ? (
                <div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            タスク名
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="タスク名を入力"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            説明
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="説明を入力（選択したテキストが自動入力されます）"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            value={pageInfo.url}
                            readOnly
                        />
                    </div>

                    <button
                        onClick={createTask}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white ${loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'タスク作成中...' : 'タスクを作成'}
                    </button>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="mb-4 text-gray-600">
                        タスクを作成するには、ログインしてください。
                    </p>
                    <button
                        onClick={handleLogin}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        TaskVision Webでログイン
                    </button>
                </div>
            )}
        </div>
    );
};

export default Popup; 