export type ReadingDateStyle = "weekdayDayMonth" | "dayMonth" | "dayMonthShort" | "monthYear";

const INTL_OPTIONS: Record<ReadingDateStyle, Intl.DateTimeFormatOptions> = {
  weekdayDayMonth: { weekday: "long", day: "numeric", month: "long" },
  dayMonth:        { day: "numeric", month: "long" },
  dayMonthShort:   { day: "numeric", month: "short" },
  monthYear:       { month: "short", year: "numeric" },
};

const KK_MONTHS = [
  "қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым",
  "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан",
] as const;
const KK_WEEKDAYS = ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"] as const;

/** Browsers ship no Kazakh month or weekday names in their Intl data (they print "M10"), so Kazakh is spelled out by hand. */
function formatKazakh(date: Date, style: ReadingDateStyle): string {
  const day = date.getDate();
  const month = KK_MONTHS[date.getMonth()];
  const shortMonth = `${month.slice(0, 3)}.`;
  switch (style) {
    case "weekdayDayMonth": return `${day} ${month}, ${KK_WEEKDAYS[date.getDay()]}`;
    case "dayMonth":        return `${day} ${month}`;
    case "dayMonthShort":   return `${day} ${shortMonth}`;
    case "monthYear":       return `${date.getFullYear()} ж. ${shortMonth}`;
  }
}

export function formatReadingDate(iso: string, locale: string, style: ReadingDateStyle): string {
  const date = new Date(iso);
  if (locale === "kk") return formatKazakh(date, style);
  return date.toLocaleDateString(locale, INTL_OPTIONS[style]);
}
