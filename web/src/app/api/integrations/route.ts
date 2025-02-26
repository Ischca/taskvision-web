import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { setupSlackIntegration } from '@/lib/integrations/slackIntegration';
import {
  setupEmailIntegration,
  EmailFilter,
} from '@/lib/integrations/emailIntegration';

/**
 * 統合サービスの設定を取得するGETハンドラー
 */
export async function GET(request: NextRequest) {
  try {
    // URLからユーザーIDを取得
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // Firestoreから統合設定を取得
    const integrationsRef = collection(db, 'integrations');
    const q = query(integrationsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    // 結果を整形して返す
    const integrations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('統合設定の取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新しい統合サービスを設定するPOSTハンドラー
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, integrationType, ...integrationData } = body;

    if (!userId || !integrationType) {
      return NextResponse.json(
        { error: 'ユーザーIDと統合タイプが必要です' },
        { status: 400 }
      );
    }

    // 統合タイプに応じた処理
    switch (integrationType) {
      case 'slack':
        const { workspaceId, authToken } = integrationData;
        if (!workspaceId || !authToken) {
          return NextResponse.json(
            { error: 'Slack統合にはワークスペースIDとトークンが必要です' },
            { status: 400 }
          );
        }
        await setupSlackIntegration(userId, workspaceId, authToken);
        break;

      case 'email':
        const { emailAddress, filters } = integrationData;
        if (!emailAddress) {
          return NextResponse.json(
            { error: 'メール統合にはメールアドレスが必要です' },
            { status: 400 }
          );
        }
        await setupEmailIntegration(
          userId,
          emailAddress,
          filters as EmailFilter
        );
        break;

      default:
        return NextResponse.json(
          { error: '未対応の統合タイプです' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: '統合設定が完了しました',
    });
  } catch (error) {
    console.error('統合設定中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
