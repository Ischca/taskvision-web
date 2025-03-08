"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { format, parse } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { useMessages } from "@/app/hooks/useMessages";
import MiniCalendar from "./MiniCalendar";

interface ShadcnDatePickerProps {
    date: string | undefined;
    onDateChange: (date: string | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const ShadcnDatePicker: React.FC<ShadcnDatePickerProps> = ({
    date,
    onDateChange,
    placeholder = "日付を選択",
    className = "",
    disabled = false,
}) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { t } = useMessages();
    const locale = t("common.locale") === "en-US" ? enUS : ja;
    const dateFormat = t("common.locale") === "en-US" ? "yyyy/MM/dd" : "yyyy/MM/dd";

    // 日付オブジェクトを状態として管理
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
        if (!date) return undefined;
        try {
            // yyyy/MM/ddの形式であることを確認
            if (!/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
                console.warn(`無効な日付フォーマット: ${date}、yyyy/MM/dd形式が必要です`);
                return undefined;
            }
            return parse(date, "yyyy/MM/dd", new Date());
        } catch (e) {
            console.error("日付のパースに失敗:", e);
            return undefined;
        }
    });

    // propsからの日付が変更された場合に内部状態を更新
    useEffect(() => {
        try {
            if (date) {
                // yyyy/MM/ddの形式であることを確認
                if (!/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
                    console.warn(`無効な日付フォーマット: ${date}、yyyy/MM/dd形式が必要です`);
                    setSelectedDate(undefined);
                    return;
                }
                setSelectedDate(parse(date, "yyyy/MM/dd", new Date()));
            } else {
                setSelectedDate(undefined);
            }
        } catch (e) {
            console.error("日付のパースに失敗:", e);
            setSelectedDate(undefined);
        }
    }, [date]);

    // 日付選択時のハンドラ
    const handleDateChange = (date: Date | undefined) => {
        setSelectedDate(date);

        if (date) {
            const formattedDate = format(date, "yyyy/MM/dd");
            onDateChange(formattedDate);
        } else {
            onDateChange(undefined);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-gray-500 dark:text-gray-400",
                        isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date && selectedDate ? (
                        format(selectedDate, dateFormat, { locale })
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <MiniCalendar
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                />
            </PopoverContent>
        </Popover>
    );
};

export default ShadcnDatePicker; 