import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        // 選択した言語をlocalStorageに保存
        localStorage.setItem('i18nextLng', lng);
    };

    return (
        <div className="flex items-center space-x-2 text-sm">
            <button
                onClick={() => changeLanguage('ja')}
                className={`px-2 py-1 rounded ${i18n.language === 'ja' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                日本語
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                English
            </button>
        </div>
    );
};

export default LanguageSwitcher; 