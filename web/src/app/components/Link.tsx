'use client';

import { forwardRef } from 'react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';

type LinkProps = React.ComponentPropsWithoutRef<typeof NextLink> & {
    locale?: string;
};

/**
 * CSR専用のLinkコンポーネント
 * 現在のlocaleを自動的にパスに追加します
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
    ({ href, locale, ...rest }, ref) => {
        const params = useParams();
        const currentLocale = (params?.locale as string) || 'ja';

        // 使用するロケール（明示的に指定されたものか現在のもの）
        const localeToUse = locale || currentLocale;

        // 外部リンクかどうかをチェック
        const isExternal = typeof href === 'string' && (
            href.startsWith('http') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:')
        );

        // 外部リンクの場合はそのまま使用
        if (isExternal) {
            return <NextLink ref={ref} href={href} {...rest} />;
        }

        // 内部リンクの場合はロケールを追加
        let newHref = href;

        // hrefが文字列の場合
        if (typeof href === 'string') {
            // すでにロケールパスがある場合は置き換え、ない場合は追加
            if (href.startsWith('/')) {
                // ルートパスからの相対パス
                const segments = href.split('/').filter(Boolean);
                if (segments.length > 0 && segments[0] === localeToUse) {
                    // すでに正しいロケールがパスにある場合はそのまま
                    newHref = href;
                } else if (segments.length > 0 && /^[a-z]{2}$/.test(segments[0])) {
                    // 別のロケールがパスにある場合は置き換え
                    newHref = `/${localeToUse}${href.substring(3)}`;
                } else {
                    // ロケールがパスにない場合は追加
                    newHref = `/${localeToUse}${href}`;
                }
            }
        }

        return <NextLink ref={ref} href={newHref} {...rest} />;
    }
);

Link.displayName = 'Link';

export { Link }; 