"use client";

import { FC } from "react";
import { UnifiedCalendar } from "@/components/ui/unified-calendar";

interface ShadcnDatePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ShadcnDatePicker: FC<ShadcnDatePickerProps> = ({
    date,
    onDateChange,
    disabled = false,
    onOpenChange
}) => {
    return (
        <UnifiedCalendar
            mode="popover"
            date={date}
            onDateChange={onDateChange}
            disabled={disabled}
            onOpenChange={onOpenChange}
            calendarMode="single"
        />
    );
};

export default ShadcnDatePicker; 