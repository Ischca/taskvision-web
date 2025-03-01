import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import './index.css';
import '../i18n/i18n'; // i18n初期化をインポート

// DOMコンテンツがロードされたらReactをマウント
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root) {
        ReactDOM.createRoot(root).render(<Popup />);
    }
}); 