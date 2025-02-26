import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定
// 注: 実際の環境ではこれらの値を環境変数から取得することをお勧めします
const firebaseConfig = {
  apiKey: 'AIzaSyBF4xWfr0N7UA-acEuT8NMTW7a7PWTkiTk',
  authDomain: 'taskvision-app.firebaseapp.com',
  projectId: 'taskvision-app',
  storageBucket: 'taskvision-app.appspot.com',
  messagingSenderId: '782927325205',
  appId: '1:782927325205:web:76749e12519864a2d38055',
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
