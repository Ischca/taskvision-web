"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import {
    DayPicker,
    DayPickerSingleProps,
    DayPickerRangeProps,
    DayPickerMultipleProps,
    DateRange
} from "react-day-picker"
import { format } from "date-fns"
import { ja, enUS } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/app/components/ThemeProvider"
import { useMessages } from '@/app/hooks/useMessages'

type CalendarMode = "single" | "multiple" | "range";

export type UnifiedCalendarProps = {
    mode: 'embedded' | 'popover';
    date?: Date | undefined;
    onDateChange?: (date: Date | undefined) => void;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    calendarMode?: CalendarMode;
    components?: {
        DayContent?: (props: { date: Date }) => React.ReactNode;
    };
    modifiers?: Record<string, (date: Date) => boolean>;
    modifiersClassNames?: Record<string, string>;
    month?: Date;
    defaultMonth?: Date;
    fromMonth?: Date;
    toMonth?: Date;
    fixedWeeks?: boolean;
} & Omit<React.ComponentProps<typeof DayPicker>, 'mode' | 'selected' | 'onSelect' | 'className' | 'components' | 'modifiers' | 'modifiersClassNames'>;

/**
 * 統一カレンダーコンポーネント
 * mode: 'embedded' - ページに直接埋め込むカレンダー
 * mode: 'popover' - クリックで表示するポップオーバーカレンダー
 */
function UnifiedCalendar({
    mode = 'embedded',
    date,
    onDateChange,
    disabled = false,
    onOpenChange,
    className,
    classNames,
    showOutsideDays = true,
    calendarMode = "single",
    components,
    modifiers,
    modifiersClassNames,
    month,
    defaultMonth,
    fromMonth,
    toMonth,
    fixedWeeks,
    ...props
}: UnifiedCalendarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { theme } = useTheme();
    const { t } = useMessages();
    const isDark = theme === "dark";

    // オープン状態が変化したときに親コンポーネントに通知
    React.useEffect(() => {
        if (mode === 'popover') {
            onOpenChange?.(isOpen);
        }
    }, [isOpen, onOpenChange, mode]);

    // 日本語かどうか判定
    const isJapanese = t('common.locale') === 'ja-JP';
    const localeObj = isJapanese ? ja : enUS;

    // 日付表示用フォーマット
    const displayFormat = isJapanese ? 'yyyy年MM月dd日' : 'MMM d, yyyy';

    // カレンダー本体のレンダリング
    const renderCalendar = () => {
        // 共通のスタイルを設定
        const commonClassNames = {
            months: "flex flex-col sm:flex-row space-y-0 sm:space-x-1 sm:space-y-0",
            month: "space-y-0",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-0",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                "h-9 w-9"
            ),
            day: cn(
                buttonVariants({ variant: "ghost" }),
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
            ),
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
        };

        const commonComponents = {
            // DayContent ComponentをカスタムComponentで上書き
            ...components && components.DayContent ? { DayContent: components.DayContent } : {},
            // IconLeft/RightはDayPickerの型定義で認識されている
            IconLeft: (props: React.ComponentProps<typeof ChevronLeft>) => (
                <ChevronLeft className="h-4 w-4" {...props} />
            ),
            IconRight: (props: React.ComponentProps<typeof ChevronRight>) => (
                <ChevronRight className="h-4 w-4" {...props} />
            ),
        };

        // カレンダーモードに応じたpropsを生成
        if (calendarMode === "single") {
            // singleモード用のハンドラ
            const handleSingleSelect: DayPickerSingleProps['onSelect'] = (newDate) => {
                if (onDateChange) {
                    onDateChange(newDate);
                }
            };

            return (
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={handleSingleSelect}
                    showOutsideDays={showOutsideDays}
                    locale={localeObj}
                    className={cn("responsive-calendar", className)}
                    classNames={commonClassNames}
                    footer={renderActionButtons()}
                    month={month}
                    defaultMonth={defaultMonth}
                    fromMonth={fromMonth}
                    toMonth={toMonth}
                    modifiers={modifiers || {}}
                    modifiersClassNames={modifiersClassNames || {}}
                    required={false}
                />
            );
        } else if (calendarMode === "range") {
            // rangeモード用のハンドラ
            const handleRangeSelect: DayPickerRangeProps['onSelect'] = (range) => {
                if (range?.from && onDateChange) {
                    onDateChange(range.from);
                }
            };

            return (
                <DayPicker
                    mode="range"
                    selected={undefined}
                    onSelect={handleRangeSelect}
                    showOutsideDays={showOutsideDays}
                    locale={localeObj}
                    className={cn("responsive-calendar", className)}
                    classNames={commonClassNames}
                    footer={renderActionButtons()}
                    month={month}
                    defaultMonth={defaultMonth}
                    fromMonth={fromMonth}
                    toMonth={toMonth}
                    modifiers={modifiers || {}}
                    modifiersClassNames={modifiersClassNames || {}}
                    required={false}
                />
            );
        } else {
            // multipleモード用のハンドラ
            const handleMultipleSelect: DayPickerMultipleProps['onSelect'] = (dates) => {
                if (dates && dates.length > 0 && onDateChange) {
                    onDateChange(dates[0]);
                }
            };

            return (
                <DayPicker
                    mode="multiple"
                    selected={undefined}
                    onSelect={handleMultipleSelect}
                    showOutsideDays={showOutsideDays}
                    locale={localeObj}
                    className={cn("responsive-calendar", className)}
                    classNames={commonClassNames}
                    footer={renderActionButtons()}
                    month={month}
                    defaultMonth={defaultMonth}
                    fromMonth={fromMonth}
                    toMonth={toMonth}
                    modifiers={modifiers || {}}
                    modifiersClassNames={modifiersClassNames || {}}
                    required={false}
                />
            );
        }
    };

    // ポップオーバーカレンダーの下部に表示するアクションボタン
    const renderActionButtons = () => (
        <div className="px-2 py-1.5 border-t flex justify-between">
            <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-7"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDateSelect(new Date());
                    if (mode === 'popover') setIsOpen(false);
                }}
            >
                {t('common.buttons.today')}
            </Button>
            {mode === 'popover' && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm h-7"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                >
                    {t('common.buttons.close')}
                </Button>
            )}
        </div>
    );

    // 日付選択ハンドラー
    const handleDateSelect = (newDate: Date | undefined) => {
        if (onDateChange) {
            onDateChange(newDate);
            if (mode === 'popover') setIsOpen(false);
        }
    };

    // 埋め込みモードの場合はカレンダーを直接表示
    if (mode === 'embedded') {
        return (
            <div className="calendar-container">
                {renderCalendar()}
                {renderActionButtons()}
            </div>
        );
    }

    // ポップオーバーモードの場合はトリガーとポップアップを表示
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, displayFormat, { locale: localeObj }) : <span>{t('common.tasks.selectDate')}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="popover-content-calendar"
                align="center"
                sideOffset={4}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <div
                    className="calendar-container"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {renderCalendar()}
                    {renderActionButtons()}
                </div>
            </PopoverContent>
        </Popover>
    );
}

UnifiedCalendar.displayName = "UnifiedCalendar";

export { UnifiedCalendar }; 