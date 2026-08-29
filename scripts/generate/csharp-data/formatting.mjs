// C# formatting blocks — one complete method per block.
export const formatting = [
`// Formats an integer with thousands separators: 1234567 -> 1,234,567.
public static string FormatWithCommas(long number)
{
    return number.ToString("N0");
}`,
`// Formats a byte count as a compact human-readable string.
public static string FormatBytes(long bytes)
{
    if (bytes < 1024)
    {
        return $"{bytes} B";
    }
    string[] units = { "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = -1;
    while (size >= 1024 && unit < units.Length - 1)
    {
        size /= 1024;
        unit++;
    }
    return $"{size:F1} {units[unit]}";
}`,
`// Formats a TimeSpan as "2d 3h 4m 5s", omitting zero parts.
public static string FormatDuration(TimeSpan span)
{
    var parts = new List<string>();
    if (span.Days > 0)
    {
        parts.Add($"{span.Days}d");
    }
    if (span.Hours > 0 || parts.Count > 0)
    {
        parts.Add($"{span.Hours}h");
    }
    if (span.Minutes > 0 || parts.Count > 0)
    {
        parts.Add($"{span.Minutes}m");
    }
    parts.Add($"{span.Seconds}s");
    return string.Join(" ", parts);
}`,
`// Left-pads a string to a target width with a fill character.
public static string PadLeft(string text, int width, char fill)
{
    return text.Length >= width ? text : new string(fill, width - text.Length) + text;
}`,
`// Formats a fraction as a percentage with one decimal place.
public static string FormatPercent(double fraction)
{
    return $"{fraction * 100:F1}%";
}`,
`// Capitalizes the first letter of every space-separated word.
public static string CapitalizeWords(string phrase)
{
    var builder = new System.Text.StringBuilder(phrase.Length);
    bool atStart = true;
    foreach (char c in phrase)
    {
        if (char.IsWhiteSpace(c))
        {
            atStart = true;
            builder.Append(c);
        }
        else if (atStart)
        {
            builder.Append(char.ToUpperInvariant(c));
            atStart = false;
        }
        else
        {
            builder.Append(c);
        }
    }
    return builder.ToString();
}`,
`// Formats a DateTime as "Mon, 12 Aug 2024" style.
public static string FormatDateFriendly(DateTime date)
{
    return date.ToString("ddd, d MMM yyyy");
}`,
`// Shortens text to maxChars and appends an ellipsis when cut.
public static string Shorten(string? text, int maxChars)
{
    if (string.IsNullOrEmpty(text) || text.Length <= maxChars)
    {
        return text ?? "";
    }
    if (maxChars <= 1)
    {
        return "\u2026";
    }
    return text[..(maxChars - 1)] + "\u2026";
}`,
`// Renders a decimal as currency: 1234.5 -> $1,234.50.
public static string FormatCurrency(double amount)
{
    return amount.ToString("C2");
}`,
`// Formats a double with a fixed number of decimal places.
public static string ToFixed(double value, int places)
{
    return value.ToString($"F{places}");
}`,
`// Formats a stopwatch-style elapsed time, e.g. "00:03:24.7".
public static string FormatElapsedMillis(long millis)
{
    long totalTenths = millis / 100;
    long minutes = totalTenths / 600;
    long seconds = totalTenths / 10 % 60;
    long tenths = totalTenths % 10;
    return $"{minutes:00}:{seconds:00}.{tenths}";
}`,
`// Right-aligns a value inside a column of the given width.
public static string AlignRight(object value, int width)
{
    string text = value.ToString() ?? "";
    return text.Length >= width ? text : text.PadLeft(width);
}`,
`// Chooses the singular or plural form based on a count.
public static string Pluralize(int count, string singular, string plural)
{
    string noun = count == 1 ? singular : plural;
    return $"{count} {noun}";
}`,
`// Formats a 10-digit US number as (555) 123-4567.
public static string FormatUsPhone(string phone)
{
    string digits = new string(phone.Where(char.IsDigit).ToArray());
    if (digits.Length == 11 && digits.StartsWith('1'))
    {
        digits = digits[1..];
    }
    if (digits.Length != 10)
    {
        return phone;
    }
    return $"({digits[..3]}) {digits.Substring(3, 3)}-{digits[6..]}";
}`,
`// Converts a camelCase identifier into a display title.
public static string CamelToTitle(string camel)
{
    var builder = new System.Text.StringBuilder();
    foreach (char c in camel)
    {
        if (char.IsUpper(c) && builder.Length > 0)
        {
            builder.Append(' ');
        }
        builder.Append(c);
    }
    return builder.ToString();
}`,
`// Renders one table row from cells, joined by a separator.
public static string FormatTableRow(IEnumerable<string> cells, string separator)
{
    return string.Join(separator, cells);
}`,
`// Compresses large counts into short form: 12500 -> "12.5k".
public static string FormatCompactCount(long count)
{
    if (count < 1000)
    {
        return count.ToString();
    }
    if (count < 1_000_000)
    {
        return $"{count / 1000.0:F1}k";
    }
    return $"{count / 1_000_000.0:F1}M";
}`,
`// Repeats a character n times as a string.
public static string RepeatChar(char c, int times)
{
    return times <= 0 ? "" : new string(c, times);
}`,
`// Strips trailing zeros from a decimal string: "3.1400" -> "3.14".
public static string StripTrailingZeros(string decimalText)
{
    if (!decimalText.Contains('.'))
    {
        return decimalText;
    }
    string stripped = decimalText.TrimEnd('0');
    return stripped.EndsWith('.') ? stripped[..^1] : stripped;
}`,
`// Formats a signed number with an explicit plus sign for positives.
public static string FormatSigned(int value)
{
    return value > 0 ? $"+{value}" : value.ToString();
}`,
`// Pads a string on both sides so it is centered within a width.
public static string CenterText(string text, int width)
{
    if (text.Length >= width)
    {
        return text;
    }
    int totalPad = width - text.Length;
    int leftPad = totalPad / 2;
    return new string(' ', leftPad) + text + new string(' ', totalPad - leftPad);
}`,
];
