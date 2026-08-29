// C# date/time blocks — one complete method per block.
export const datesTime = [
`// Whole days between two dates, ignoring the time component.
public static int DaysBetween(DateTime from, DateTime to)
{
    return (int)(to.Date - from.Date).TotalDays;
}`,
`// True when the date falls on a Saturday or Sunday.
public static bool IsWeekend(DateTime date)
{
    return date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
}`,
`// Returns the date after adding business days, skipping weekends.
public static DateTime AddBusinessDays(DateTime start, int days)
{
    DateTime result = start;
    int added = 0;
    while (added < days)
    {
        result = result.AddDays(1);
        if (!IsWeekend(result))
        {
            added++;
        }
    }
    return result;
}`,
`// The Monday of the week containing the given date.
public static DateTime StartOfWeek(DateTime date)
{
    int daysFromMonday = ((int)date.DayOfWeek + 6) % 7;
    return date.Date.AddDays(-daysFromMonday);
}`,
`// Formats a DateTime in the ISO-8601 yyyy-MM-dd form.
public static string FormatIso(DateTime date)
{
    return date.ToString("yyyy-MM-dd");
}`,
`// Parses a date, accepting several common formats.
public static DateTime ParseLenient(string value)
{
    string[] patterns = { "yyyy-MM-dd", "yyyy/MM/dd", "MM/dd/yyyy", "dd-MM-yyyy" };
    if (DateTime.TryParseExact(value, patterns, System.Globalization.CultureInfo.InvariantCulture,
        System.Globalization.DateTimeStyles.None, out DateTime parsed))
    {
        return parsed;
    }
    throw new FormatException($"unparseable date: {value}");
}`,
`// Last day of the month containing the given date.
public static DateTime LastDayOfMonth(DateTime date)
{
    return new DateTime(date.Year, date.Month, DateTime.DaysInMonth(date.Year, date.Month));
}`,
`// Completed years between a birth date and a reference date.
public static int AgeOn(DateTime birthDate, DateTime onDate)
{
    int age = onDate.Year - birthDate.Year;
    if (onDate < birthDate.AddYears(age))
    {
        age--;
    }
    return age;
}`,
`// True when the date is the 13th of a month and a Friday.
public static bool IsFridayThe13th(DateTime date)
{
    return date.Day == 13 && date.DayOfWeek == DayOfWeek.Friday;
}`,
`// Whole hours between two instants, truncated toward zero.
public static long HoursBetween(DateTimeOffset from, DateTimeOffset to)
{
    return (long)(to - from).TotalHours;
}`,
`// True when a date lies within the inclusive range [start, end].
public static bool DateInRange(DateTime date, DateTime start, DateTime end)
{
    return date >= start && date <= end;
}`,
`// Converts a Unix timestamp in seconds to a local DateTime.
public static DateTime FromUnixSeconds(long epochSeconds, string zoneId)
{
    DateTimeOffset utc = DateTimeOffset.FromUnixTimeSeconds(epochSeconds);
    TimeZoneInfo zone = TimeZoneInfo.FindSystemTimeZoneById(zoneId);
    return TimeZoneInfo.ConvertTime(utc, zone).DateTime;
}`,
`// Full name of the month for a date, e.g. "March".
public static string MonthName(DateTime date)
{
    return date.ToString("MMMM");
}`,
`// Whole calendar quarters between two dates.
public static int QuartersBetween(DateTime from, DateTime to)
{
    int months = ((to.Year - from.Year) * 12) + (to.Month - from.Month);
    return months / 3;
}`,
`// ISO-8601 week number of a date.
public static int IsoWeekNumber(DateTime date)
{
    return System.Globalization.ISOWeek.GetWeekOfYear(date);
}`,
`// True when two dates fall on the same calendar day.
public static bool IsSameDay(DateTime a, DateTime b)
{
    return a.Date == b.Date;
}`,
`// Minutes until a deadline, negative when already past.
public static long MinutesUntil(DateTimeOffset deadline, DateTimeOffset now)
{
    return (long)(deadline - now).TotalMinutes;
}`,
`// Sorts a list of dates from earliest to latest.
public static List<DateTime> SortDates(List<DateTime> dates)
{
    return dates.OrderBy(d => d).ToList();
}`,
`// The first day of the month after the one containing the date.
public static DateTime FirstDayOfNextMonth(DateTime date)
{
    return new DateTime(date.Year, date.Month, 1).AddMonths(1);
}`,
`// Human-friendly relative time like "3 days ago".
public static string RelativeTime(DateTimeOffset when, DateTimeOffset now)
{
    double totalSeconds = (now - when).TotalSeconds;
    double abs = Math.Abs(totalSeconds);
    string suffix = totalSeconds >= 0 ? "ago" : "from now";
    if (abs < 60)
    {
        return $"{abs:F0} seconds {suffix}";
    }
    if (abs < 3600)
    {
        return $"{abs / 60:F0} minutes {suffix}";
    }
    if (abs < 86400)
    {
        return $"{abs / 3600:F0} hours {suffix}";
    }
    return $"{abs / 86400:F0} days {suffix}";
}`,
];
