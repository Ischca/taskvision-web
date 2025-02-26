import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyBF4xWfr0N7UA-acEuT8NMTW7a7PWTkiTk",
    authDomain: "taskvision-app.firebaseapp.com",
    projectId: "taskvision-app",
    storageBucket: "taskvision-app.appspot.com",
    messagingSenderId: "782927325205",
    appId: "1:782927325205:web:76749e12519864a2d38055",
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ユーザー設定インターフェース
interface UserSettings {
    enableContextMenu: boolean;
    defaultProjectId: string | null;
    notificationEnabled: boolean;
}

// デフォルト設定
const defaultSettings: UserSettings = {
    enableContextMenu: true,
    defaultProjectId: null,
    notificationEnabled: true,
};

const Options: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

    // 認証状態の監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // ユーザー設定を読み込む
                loadUserSettings(currentUser.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    // ユーザー設定のロード
    const loadUserSettings = async (userId: string) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().settings) {
                setSettings({
                    ...defaultSettings,
                    ...userDoc.data().settings
                });
            }
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
            setMessage({
                text: '設定の読み込みに失敗しました。後でもう一度お試しください。',
                type: 'error'
            });
        }
    };

    // 設定の保存
    const saveSettings = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { settings }, { merge: true });

            // Chrome ストレージにも保存（拡張機能内で使用するため）
            chrome.storage.sync.set({ userSettings: settings }, () => {
                setMessage({
                    text: '設定が保存されました！',
                    type: 'success'
                });
                setLoading(false);
            });
        } catch (error) {
            console.error('設定の保存に失敗しました:', error);
            setMessage({
                text: '設定の保存に失敗しました。後でもう一度お試しください。',
                type: 'error'
            });
            setLoading(false);
        }
    };

    // Googleでログイン
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('ログインに失敗しました:', error);
            setMessage({
                text: 'ログインに失敗しました。後でもう一度お試しください。',
                type: 'error'
            });
        }
    };

    // ログアウト
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setSettings(defaultSettings);
            setMessage({
                text: 'ログアウトしました。',
                type: 'success'
            });
        } catch (error) {
            console.error('ログアウトに失敗しました:', error);
            setMessage({
                text: 'ログアウトに失敗しました。後でもう一度お試しください。',
                type: 'error'
            });
        }
    };

    // 設定の変更ハンドラー
    const handleSettingChange = (key: keyof UserSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className="settings-container">
                <p className="text-center">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1 className="text-2xl font-bold">TaskVision設定</h1>
            </div>

            {message.text && (
                <div className={`p-2 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {!user ? (
                <div className="settings-section">
                    <p>TaskVisionを使用するにはログインしてください。</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded settings-button"
                        onClick={signInWithGoogle}
                    >
                        Googleでログイン
                    </button>
                </div>
            ) : (
                <>
                    <div className="settings-section">
                        <p>ログイン中: {user.displayName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>

                    <div className="settings-section">
                        <h2 className="text-xl font-semibold mb-2">全般設定</h2>

                        <div className="mb-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.enableContextMenu}
                                    onChange={(e) => handleSettingChange('enableContextMenu', e.target.checked)}
                                    className="mr-2"
                                />
                                コンテキストメニューを有効にする
                            </label>
                            <p className="text-sm text-gray-600">ウェブページ上で右クリックでタスクを追加します。</p>
                        </div>

                        <div className="mb-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notificationEnabled}
                                    onChange={(e) => handleSettingChange('notificationEnabled', e.target.checked)}
                                    className="mr-2"
                                />
                                通知を有効にする
                            </label>
                            <p className="text-sm text-gray-600">タスクの締め切りが近いときに通知します。</p>
                        </div>
                    </div>

                    <div className="settings-section">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded settings-button"
                            onClick={saveSettings}
                            disabled={loading}
                        >
                            設定を保存
                        </button>

                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded settings-button mt-2"
                            onClick={handleSignOut}
                        >
                            ログアウト
                        </button>
                    </div>
                </>
            )}

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>TaskVision Chrome拡張機能 v1.0.0</p>
                <p className="mt-1">
                    <a href="https://taskvision-app.web.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        TaskVision公式サイト
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Options; 