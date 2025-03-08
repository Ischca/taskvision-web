import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// タスクデータの型定義
export interface TaskData {
  title: string;
  description?: string;
  blockId?: string | null;
  date?: string | null;
  status?: 'open' | 'done';
  deadline?: string | null;
  source?: {
    type: string;
    url?: string;
    title?: string;
    faviconUrl?: string;
    capturedAt?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Firebase設定
// 注意: この設定は公開されますが、Firebaseセキュリティルールで保護する必要があります
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// アプリケーションの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// より安全なタスク作成関数
export async function createTaskSecurely(
  taskData: TaskData
): Promise<{ id: string } | null> {
  try {
    // 認証状態を確認
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('ユーザーが認証されていません');
      return null;
    }

    // ユーザーIDを設定
    const secureTaskData = {
      ...taskData,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      status: taskData.status || 'open',
      source: {
        ...taskData.source,
        type: taskData.source?.type || 'chrome_extension',
      },
    };

    // Firestoreに追加
    // セキュリティルールがユーザーIDを検証するため安全
    const docRef = await addDoc(collection(db, 'tasks'), secureTaskData);
    return { id: docRef.id };
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return null;
  }
}

// 認証リスナーのセットアップ関数
export function setupAuthListener(
  onSignedIn: (user: any) => void,
  onSignedOut: () => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onSignedIn(user);
    } else {
      onSignedOut();
    }
  });
}

// Googleでサインイン
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google認証エラー:', error);
    return null;
  }
}

export { app, auth, db };
