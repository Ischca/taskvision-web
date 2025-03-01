import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Popup: React.FC = () => {
    const { t } = useTranslation();
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
        } catch (error) {
            console.error('ログインエラー:', error);
            setMessage({
                type: 'error',
                text: t('popup.errorMessage')
            });
        }
    };

    // タスク追加処理
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (!taskTitle.trim()) {
            setMessage({
                type: 'error',
                text: t('validation.required')
            });
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title: taskTitle,
                description: taskDescription,
                sourceUrl: pageInfo.url,
                sourcePage: pageInfo.title,
                status: 'todo',
                userId: currentUser.uid,
                created: serverTimestamp(),
                updated: serverTimestamp(),
                dueDate: null,
                priority: 'medium',
                date: new Date(),
                blockId: null
            };

            await addDoc(collection(db, 'tasks'), taskData);

            setMessage({
                type: 'success',
                text: t('popup.successMessage')
            });

            // フォームリセット
            setTaskTitle(pageInfo.title);
            setTaskDescription(selectedText || '');
        } catch (error) {
            console.error('タスク追加エラー:', error);
            setMessage({
                type: 'error',
                text: t('popup.errorMessage')
            });
        } finally {
            setLoading(false);
        }
    };

    // ウェブアプリを開く
    const openWebApp = () => {
        chrome.tabs.create({ url: webAppUrl });
    };

    // ローディング表示
    if (authChecking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
                <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    // ログインしていない場合のUI
    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
                <h1 className="text-xl font-bold mb-4">{t('popup.title')}</h1>
                <p className="mb-6 text-center text-gray-600">{t('messages.loginPrompt')}</p>
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {t('popup.login')}
                </button>
                <div className="mt-6">
                    <LanguageSwitcher />
                </div>
            </div>
        );
    }

    // ログイン済みの場合のUI
    return (
        <div className="p-4 max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">{t('popup.title')}</h1>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={openWebApp}
                        className="text-xs text-blue-500 hover:text-blue-700"
                    >
                        {t('popup.webAppLink')}
                    </button>
                    <LanguageSwitcher />
                </div>
            </div>

            {message.type && (
                <div className={`mb-4 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-sm font-medium text-gray-600 mb-1">{t('popup.pageInfo')}</h2>
                <p className="text-sm truncate">{pageInfo.title}</p>
                <p className="text-xs truncate text-gray-500">{pageInfo.url}</p>
            </div>

            <form onSubmit={handleAddTask}>
                <div className="mb-3">
                    <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('popup.taskTitle')}
                    </label>
                    <input
                        type="text"
                        id="taskTitle"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('popup.placeholderTitle')}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('popup.taskDescription')}
                    </label>
                    <textarea
                        id="taskDescription"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder={t('popup.placeholderDescription')}
                    />
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('common.loading')}
                            </span>
                        ) : t('popup.addTask')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Popup; 