"use client"

import * as React from "react"
import { UnifiedCalendar } from "./unified-calendar"
import { DayPickerSingleProps, DayPickerMultipleProps, DayPickerRangeProps } from "react-day-picker"

type BaseCalendarProps = Omit<
  React.ComponentProps<typeof UnifiedCalendar>,
  'calendarMode' | 'mode'
>;

export type CalendarProps = BaseCalendarProps & {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from: Date; to: Date } | undefined;
  onSelect?: ((date?: Date) => void) | ((dates?: Date[]) => void) | ((range?: { from: Date; to: Date }) => void);
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  ...props
}: CalendarProps) {
  return (
    <UnifiedCalendar
      mode="embedded"
      calendarMode={mode}
      className={className}
      classNames={classNames}
      showOutsideDays={showOutsideDays}
      date={mode === "single" ? selected as Date : undefined}
      onDateChange={mode === "single" ? onSelect as (date?: Date) => void : undefined}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
