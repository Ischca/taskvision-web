import Link from 'next/link';
import Image from 'next/image';
import {
    DevicePhoneMobileIcon,
    ArrowDownTrayIcon,
    WifiIcon,
    ClockIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export const metadata = {
    title: 'PWAガイド - TaskVision',
    description: 'TaskVisionをアプリとしてインストールして便利に使う方法をご紹介します。',
};

export default function PWAGuidePage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="bg-indigo-600 px-4 py-5 sm:px-6">
                    <h1 className="text-lg md:text-xl font-medium text-white">TaskVisionアプリのインストール方法</h1>
                    <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                        より快適にTaskVisionを利用するためのガイド
                    </p>
                </div>
                <div className="px-4 py-5 sm:px-6">
                    <div className="border-b border-gray-200 pb-5 mb-5">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            PWAとは？
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            PWA（Progressive Web App）は、ウェブサイトをスマートフォンやパソコンにアプリとしてインストールして利用できる技術です。
                            ブラウザを開かずに直接アプリを起動でき、オフラインでも一部機能が利用可能になります。
                        </p>
                    </div>

                    <div className="border-b border-gray-200 pb-5 mb-5">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            インストール方法
                        </h2>

                        <div className="mt-4 space-y-5">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="font-medium text-gray-900">iPhoneやiPadの場合</h3>
                                <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600 space-y-2">
                                    <li>SafariでTaskVisionを開く</li>
                                    <li>画面下部の「共有」ボタン（□に上向き矢印のアイコン）をタップ</li>
                                    <li>「ホーム画面に追加」を選択</li>
                                    <li>「追加」をタップ</li>
                                </ol>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="font-medium text-gray-900">Android端末の場合</h3>
                                <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600 space-y-2">
                                    <li>ChromeでTaskVisionを開く</li>
                                    <li>メニュー（右上の三点アイコン）をタップ</li>
                                    <li>「アプリをインストール」または「ホーム画面に追加」を選択</li>
                                </ol>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="font-medium text-gray-900">パソコン（Chrome）の場合</h3>
                                <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600 space-y-2">
                                    <li>ChromeでTaskVisionを開く</li>
                                    <li>アドレスバーの右側に表示されるインストールアイコン（+）をクリック</li>
                                    <li>「インストール」をクリック</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 pb-5 mb-5">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <WifiIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            オフライン機能
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            TaskVisionはオフラインでも以下の機能が利用可能です：
                        </p>
                        <ul className="mt-2 ml-5 list-disc text-sm text-gray-600 space-y-1">
                            <li>保存済みのタスクの閲覧</li>
                            <li>タイムブロック表示</li>
                            <li>基本的なUI要素とナビゲーション</li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-500">
                            データの同期やオンライン機能を利用するには、インターネット接続が必要です。
                        </p>
                    </div>

                    <div className="border-b border-gray-200 pb-5 mb-5">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            自動アップデート
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            TaskVisionアプリは自動的に最新バージョンにアップデートされます。アプリを起動するたびに最新機能が利用可能です。
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            アプリを使ってみる
                            <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 