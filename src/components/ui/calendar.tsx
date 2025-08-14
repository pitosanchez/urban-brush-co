import { DayPicker, type DayPickerSingleProps } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarProps = DayPickerSingleProps & {
  className?: string;
  disabled?: (date: Date) => boolean;
};

export function Calendar(props: CalendarProps) {
  const { className, ...rest } = props;

  return (
    <DayPicker
      className={cn(
        "w-full p-4",
        // Container styling
        "[&_.rdp]:w-full",
        "[&_.rdp-months]:w-full",
        "[&_.rdp-month]:w-full",

        // Table styling
        "[&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse",

        // Header styling
        "[&_.rdp-caption]:flex [&_.rdp-caption]:items-center [&_.rdp-caption]:justify-center [&_.rdp-caption]:mb-6",
        "[&_.rdp-caption_label]:text-xl [&_.rdp-caption_label]:font-bold [&_.rdp-caption_label]:text-gray-900",

        // Navigation buttons
        "[&_.rdp-nav]:flex [&_.rdp-nav]:gap-2",
        "[&_.rdp-button_previous]:absolute [&_.rdp-button_previous]:left-4 [&_.rdp-button_previous]:w-10 [&_.rdp-button_previous]:h-10 [&_.rdp-button_previous]:rounded-full [&_.rdp-button_previous]:bg-gray-100 [&_.rdp-button_previous]:hover:bg-gray-200 [&_.rdp-button_previous]:flex [&_.rdp-button_previous]:items-center [&_.rdp-button_previous]:justify-center [&_.rdp-button_previous]:transition-colors",
        "[&_.rdp-button_next]:absolute [&_.rdp-button_next]:right-4 [&_.rdp-button_next]:w-10 [&_.rdp-button_next]:h-10 [&_.rdp-button_next]:rounded-full [&_.rdp-button_next]:bg-gray-100 [&_.rdp-button_next]:hover:bg-gray-200 [&_.rdp-button_next]:flex [&_.rdp-button_next]:items-center [&_.rdp-button_next]:justify-center [&_.rdp-button_next]:transition-colors",

        // Weekday header styling
        "[&_.rdp-weekdays]:w-full [&_.rdp-weekdays]:mb-4",
        "[&_.rdp-weekday]:w-full [&_.rdp-weekday]:text-center [&_.rdp-weekday]:py-3 [&_.rdp-weekday]:text-sm [&_.rdp-weekday]:font-semibold [&_.rdp-weekday]:text-gray-600 [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-wider",

        // Week and day styling
        "[&_.rdp-week]:w-full",
        "[&_.rdp-day]:w-full [&_.rdp-day]:aspect-square [&_.rdp-day]:p-0",
        "[&_.rdp-day_button]:w-full [&_.rdp-day_button]:h-full [&_.rdp-day_button]:rounded-xl [&_.rdp-day_button]:text-lg [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:transition-all [&_.rdp-day_button]:duration-200 [&_.rdp-day_button]:border-0 [&_.rdp-day_button]:bg-transparent [&_.rdp-day_button]:text-gray-700",

        // Hover and focus states
        "[&_.rdp-day_button:hover]:bg-indigo-50 [&_.rdp-day_button:hover]:text-indigo-600 [&_.rdp-day_button:hover]:scale-105",
        "[&_.rdp-day_button:focus]:outline-none [&_.rdp-day_button:focus]:ring-2 [&_.rdp-day_button:focus]:ring-indigo-500 [&_.rdp-day_button:focus]:ring-opacity-50",

        // Selected day styling
        "[&_.rdp-day_selected_.rdp-day_button]:bg-gradient-to-br [&_.rdp-day_selected_.rdp-day_button]:from-indigo-600 [&_.rdp-day_selected_.rdp-day_button]:to-purple-600 [&_.rdp-day_selected_.rdp-day_button]:text-white [&_.rdp-day_selected_.rdp-day_button]:font-bold [&_.rdp-day_selected_.rdp-day_button]:shadow-lg [&_.rdp-day_selected_.rdp-day_button]:scale-105",
        "[&_.rdp-day_selected_.rdp-day_button:hover]:from-indigo-700 [&_.rdp-day_selected_.rdp-day_button:hover]:to-purple-700",

        // Today styling
        "[&_.rdp-day_today_.rdp-day_button]:bg-yellow-100 [&_.rdp-day_today_.rdp-day_button]:text-yellow-800 [&_.rdp-day_today_.rdp-day_button]:font-semibold [&_.rdp-day_today_.rdp-day_button]:ring-2 [&_.rdp-day_today_.rdp-day_button]:ring-yellow-400 [&_.rdp-day_today_.rdp-day_button]:ring-opacity-50",

        // Outside month styling
        "[&_.rdp-day_outside_.rdp-day_button]:text-gray-300 [&_.rdp-day_outside_.rdp-day_button]:hover:text-gray-400",

        // Disabled day styling
        "[&_.rdp-day_disabled_.rdp-day_button]:text-gray-300 [&_.rdp-day_disabled_.rdp-day_button]:cursor-not-allowed [&_.rdp-day_disabled_.rdp-day_button]:hover:bg-transparent [&_.rdp-day_disabled_.rdp-day_button]:hover:text-gray-300 [&_.rdp-day_disabled_.rdp-day_button]:hover:scale-100",

        className
      )}
      {...rest}
    />
  );
}
