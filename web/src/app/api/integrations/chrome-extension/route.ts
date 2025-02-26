import { NextRequest, NextResponse } from 'next/server';
import { handleChromeExtensionRequest } from '@/lib/integrations/chromeExtension';
import { auth } from '@/lib/firebase';

/**
 * Chrome拡張機能からタスクを作成するためのAPIエンドポイント
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストデータを取得
    const body = await request.json();
    const { title, url, pageTitle, selectedText, userId, authToken } = body;

    // 必須パラメータをチェック
    if (!url || !pageTitle || !userId || !authToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            '必須パラメータが不足しています（URL、ページタイトル、ユーザーID、認証トークンが必要です）',
        },
        { status: 400 }
      );
    }

    // ここで認証トークンを検証する
    // 注意: 実際のアプリケーションでは、Firebaseの認証トークンを検証する必要があります
    // この例ではシンプルにしていますが、実際の実装ではFirebase Admin SDKを使用します

    // タスクを作成
    const response = await handleChromeExtensionRequest(userId, {
      title: title || '',
      url,
      pageTitle,
      selectedText,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      'Chrome拡張機能のリクエスト処理中にエラーが発生しました:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'サーバーエラーが発生しました',
        errorDetail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Chrome拡張機能の認証状態を確認するためのGETエンドポイント
 */
export async function GET(request: NextRequest) {
  try {
    // URLからIDトークンを取得
    const searchParams = request.nextUrl.searchParams;
    const authToken = searchParams.get('token');

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    // トークンを検証
    // 注意: 実際のアプリケーションでは、Firebaseの認証トークンを検証する必要があります
    // この例ではシンプルにしていますが、実際の実装ではFirebase Admin SDKを使用します
    // const decodedToken = await admin.auth().verifyIdToken(authToken);
    // const userId = decodedToken.uid;

    // 仮の実装としてOKを返す
    return NextResponse.json({
      success: true,
      message: '認証されました',
      // userId: userId
    });
  } catch (error) {
    console.error('認証確認中にエラーが発生しました:', error);
    return NextResponse.json(
      { success: false, error: '認証に失敗しました' },
      { status: 401 }
    );
  }
}
