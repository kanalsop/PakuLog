const JST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1_000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type ParseJstConsumedAtResult =
  | Readonly<{
      success: true;
      value: Readonly<{ consumedAt: string | null; consumedOn: string }>;
    }>
  | Readonly<{ success: false }>;

function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

function parseDate(value: string): Readonly<{ day: number; month: number; year: number }> | null {
  const match = DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (year < 1_000 || month < 1 || month > 12) {
    return null;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth ? { year, month, day } : null;
}

export function getJstDate(now: Date): string {
  const jstDate = new Date(now.getTime() + JST_OFFSET_MILLISECONDS);

  return [
    jstDate.getUTCFullYear(),
    padTwoDigits(jstDate.getUTCMonth() + 1),
    padTwoDigits(jstDate.getUTCDate()),
  ].join("-");
}

export function parseJstConsumedAt({
  consumedOn,
  consumedTime,
}: Readonly<{ consumedOn: string; consumedTime: string }>): ParseJstConsumedAtResult {
  const date = parseDate(consumedOn);

  if (!date) {
    return { success: false };
  }

  if (consumedTime === "") {
    return {
      success: true,
      value: { consumedOn, consumedAt: null },
    };
  }

  const timeMatch = TIME_PATTERN.exec(consumedTime);

  if (!timeMatch) {
    return { success: false };
  }

  const [, hourText, minuteText] = timeMatch;
  const utcMilliseconds =
    Date.UTC(date.year, date.month - 1, date.day, Number(hourText), Number(minuteText)) -
    JST_OFFSET_MILLISECONDS;

  return {
    success: true,
    value: { consumedOn, consumedAt: new Date(utcMilliseconds).toISOString() },
  };
}
