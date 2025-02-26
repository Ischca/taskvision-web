'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { saveIntegration, generateSecureToken, getIntegrationByType, generateWebhookUrl } from '@/lib/integrations/integrationUtils';
import { fetchSlackChannels, validateSlackToken } from '@/lib/integrations/slackIntegration';
import { CheckIcon, InfoCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function SlackSetupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [workspaceId, setWorkspaceId] = useState('');
    const [botToken, setBotToken] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [triggerReactions, setTriggerReactions] = useState<string[]>(['white_check_mark', 'check']);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // 既存の設定を読み込む
    useEffect(() => {
        if (!user) return;

        const loadIntegration = async () => {
            try {
                setIsLoading(true);
                const integration = await getIntegrationByType(user.uid, 'slack');

                if (integration) {
                    // 型アサーションで特定のSlack統合プロパティにアクセス
                    const slackIntegration = integration as any;

                    setWorkspaceId(slackIntegration.workspaceId || '');
                    setBotToken(slackIntegration.authToken || '');
                    setIsActive(slackIntegration.isActive);
                    setSelectedChannels(slackIntegration.channels || []);
                    setTriggerReactions(slackIntegration.triggerReactions || ['white_check_mark', 'check']);

                    // トークンが存在する場合はWebhook URLを生成
                    if (user.uid && slackIntegration.webhookToken) {
                        const url = generateWebhookUrl('slack', user.uid, slackIntegration.webhookToken);
                        setWebhookUrl(url);
                    }

                    // トークンが有効かどうかをチェック
                    if (slackIntegration.authToken) {
                        const isValid = await validateSlackToken(slackIntegration.authToken);
                        setIsValidToken(isValid);

                        if (isValid) {
                            // チャンネル一覧を取得
                            const channelList = await fetchSlackChannels(slackIntegration.authToken);
                            setChannels(channelList);
                        }
                    }
                } else {
                    // 新規設定の場合はWebhook用のトークンを生成
                    const token = generateSecureToken();
                    const url = generateWebhookUrl('slack', user.uid, token);
                    setWebhookUrl(url);
                }
            } catch (err) {
                console.error('Slack設定の読み込みエラー:', err);
                setError('設定の読み込み中にエラーが発生しました');
            } finally {
                setIsLoading(false);
            }
        };

        loadIntegration();
    }, [user]);

    // トークン検証とチャンネル一覧の取得
    const handleValidateToken = async () => {
        if (!botToken) {
            setError('Botトークンを入力してください');
            return;
        }

        try {
            setIsLoading(true);
            const isValid = await validateSlackToken(botToken);
            setIsValidToken(isValid);

            if (isValid) {
                toast({
                    title: 'トークン検証成功',
                    description: 'Slackトークンは有効です',
                    variant: 'default',
                });

                // チャンネル一覧を取得
                const channelList = await fetchSlackChannels(botToken);
                setChannels(channelList);
            } else {
                setError('無効なSlackトークンです');
            }
        } catch (err) {
            console.error('トークン検証エラー:', err);
            setError('トークンの検証中にエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    // 設定の保存
    const handleSave = async () => {
        if (!user) {
            setError('ログインが必要です');
            return;
        }

        if (!workspaceId || !botToken) {
            setError('ワークスペースIDとBotトークンは必須です');
            return;
        }

        try {
            setIsSaving(true);

            // Webhook用のトークンを生成（既存のものがなければ）
            const webhookToken = webhookUrl.split('token=')[1] || generateSecureToken();

            await saveIntegration({
                userId: user.uid,
                type: 'slack',
                workspaceId,
                authToken: botToken,
                channels: selectedChannels,
                triggerReactions,
                webhookToken,
                isActive,
            });

            toast({
                title: '設定が保存されました',
                description: 'Slack連携の設定が正常に保存されました',
                variant: 'default',
            });

            // 保存後は統合一覧ページにリダイレクト
            router.push('/integrations');
        } catch (err) {
            console.error('設定保存エラー:', err);
            setError('設定の保存中にエラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    // チャンネル選択の切り替え
    const toggleChannel = (channelId: string) => {
        setSelectedChannels(prev =>
            prev.includes(channelId)
                ? prev.filter(id => id !== channelId)
                : [...prev, channelId]
        );
    };

    if (!user) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>認証エラー</AlertTitle>
                    <AlertDescription>
                        この機能を利用するにはログインが必要です。
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Slack連携の設定</h1>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>セットアップ手順</CardTitle>
                    <CardDescription>Slack連携を設定するには、以下の手順に従ってください。</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Slack API</a>でSlackアプリを作成</li>
                        <li>権限スコープの追加：<code>channels:history</code>, <code>reactions:read</code>, <code>chat:write</code></li>
                        <li>イベント購読の設定：<code>message.channels</code>, <code>reaction_added</code></li>
                        <li>イベント購読URLとして以下のエンドポイントを設定：
                            <div className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto">
                                <code>{webhookUrl}</code>
                            </div>
                        </li>
                        <li>Botトークンをコピーして下記フォームに入力</li>
                    </ol>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Slack設定</CardTitle>
                    <CardDescription>Slackワークスペースとの連携設定を行います。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="workspace-id">ワークスペースID</Label>
                        <Input
                            id="workspace-id"
                            value={workspaceId}
                            onChange={(e) => setWorkspaceId(e.target.value)}
                            placeholder="例: T12345678"
                            disabled={isLoading || isSaving}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bot-token">BotトークンまたはアクセストークンMr-robot</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="bot-token"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                placeholder="例: xoxb-..."
                                type="password"
                                disabled={isLoading || isSaving}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleValidateToken}
                                disabled={!botToken || isLoading || isSaving}
                                variant="outline"
                            >
                                検証
                            </Button>
                        </div>
                        {isValidToken && (
                            <div className="flex items-center text-green-600 mt-2">
                                <CheckIcon className="mr-2 h-4 w-4" />
                                <span>トークンは有効です</span>
                            </div>
                        )}
                    </div>

                    {channels.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <Label>監視するチャンネル</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                {channels.map(channel => (
                                    <div
                                        key={channel.id}
                                        className={`p-2 border rounded-md cursor-pointer ${selectedChannels.includes(channel.id)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-200'
                                            }`}
                                        onClick={() => toggleChannel(channel.id)}
                                    >
                                        <div className="flex items-center">
                                            {selectedChannels.includes(channel.id) && (
                                                <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                                            )}
                                            <span>#{channel.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="trigger-reactions">トリガーリアクション</Label>
                        <Input
                            id="trigger-reactions"
                            value={triggerReactions.join(', ')}
                            onChange={(e) => setTriggerReactions(e.target.value.split(',').map(r => r.trim()))}
                            placeholder="例: white_check_mark, check"
                            disabled={isLoading || isSaving}
                        />
                        <p className="text-sm text-gray-500">
                            カンマ区切りでリアクション名を入力。これらのリアクションがついたメッセージがタスクになります。
                        </p>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active-status"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={isLoading || isSaving}
                        />
                        <Label htmlFor="active-status">連携を有効にする</Label>
                    </div>

                    <Alert className="mt-4">
                        <InfoCircledIcon className="h-4 w-4" />
                        <AlertTitle>セキュリティ情報</AlertTitle>
                        <AlertDescription>
                            Botトークンは暗号化して保存されます。セキュリティのため、定期的にトークンをローテーションすることをお勧めします。
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/integrations')}
                        disabled={isLoading || isSaving}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!workspaceId || !botToken || isLoading || isSaving}
                    >
                        {isSaving ? '保存中...' : '設定を保存'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 