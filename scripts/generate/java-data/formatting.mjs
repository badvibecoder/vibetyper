// Java formatting blocks — one complete method per block.
export const formatting = [
`// Formats an integer with thousands separators: 1234567 -> 1,234,567.
public static String formatWithCommas(long number) {
    return String.format("%,d", number);
}`,
`// Formats a byte count as a compact human-readable string.
public static String formatBytes(long bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }
    String[] units = { "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = -1;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }
    return String.format("%.1f %s", size, units[unit]);
}`,
`// Formats milliseconds as "2d 3h 4m 5s", omitting zero parts.
public static String formatDuration(long millis) {
    long seconds = millis / 1000;
    long days = seconds / 86400;
    long hours = (seconds % 86400) / 3600;
    long minutes = (seconds % 3600) / 60;
    long secs = seconds % 60;
    StringBuilder out = new StringBuilder();
    if (days > 0) {
        out.append(days).append("d ");
    }
    if (hours > 0 || days > 0) {
        out.append(hours).append("h ");
    }
    if (minutes > 0 || hours > 0 || days > 0) {
        out.append(minutes).append("m ");
    }
    out.append(secs).append("s");
    return out.toString().trim();
}`,
`// Left-pads a string to a target width with a fill character.
public static String padLeft(String text, int width, char fill) {
    if (text.length() >= width) {
        return text;
    }
    return String.valueOf(fill).repeat(width - text.length()) + text;
}`,
`// Formats a fraction as a percentage with one decimal place.
public static String formatPercent(double fraction) {
    return String.format("%.1f%%", fraction * 100);
}`,
`// Capitalizes the first letter of every space-separated word.
public static String capitalizeWords(String phrase) {
    StringBuilder out = new StringBuilder(phrase.length());
    boolean atStart = true;
    for (char c : phrase.toCharArray()) {
        if (Character.isWhitespace(c)) {
            atStart = true;
            out.append(c);
        } else if (atStart) {
            out.append(Character.toUpperCase(c));
            atStart = false;
        } else {
            out.append(c);
        }
    }
    return out.toString();
}`,
`// Formats a LocalDate as "Mon, 12 Aug 2024" style.
public static String formatDateFriendly(java.time.LocalDate date) {
    return date.format(java.time.format.DateTimeFormatter.ofPattern("EEE, d MMM yyyy"));
}`,
`// Shortens text to maxChars and appends an ellipsis when cut.
public static String shorten(String text, int maxChars) {
    if (text == null || text.length() <= maxChars) {
        return text;
    }
    if (maxChars <= 1) {
        return "…";
    }
    return text.substring(0, maxChars - 1) + "…";
}`,
`// Renders a decimal as currency with two places: 1234.5 -> $1,234.50.
public static String formatCurrency(double amount) {
    return String.format("$%,.2f", amount);
}`,
`// Formats a double with a fixed number of decimal places.
public static String toFixed(double value, int places) {
    return String.format("%." + places + "f", value);
}`,
`// Formats a stopwatch-style elapsed time, e.g. "00:03:24.7".
public static String formatElapsedMillis(long millis) {
    long totalTenths = millis / 100;
    long minutes = totalTenths / 600;
    long seconds = (totalTenths / 10) % 60;
    long tenths = totalTenths % 10;
    return String.format("%02d:%02d.%d", minutes, seconds, tenths);
}`,
`// Right-aligns a value inside a column of the given width.
public static String alignRight(Object value, int width) {
    String text = String.valueOf(value);
    if (text.length() >= width) {
        return text;
    }
    return " ".repeat(width - text.length()) + text;
}`,
`// Chooses the singular or plural form based on a count.
public static String pluralize(int count, String singular, String plural) {
    String noun = count == 1 ? singular : plural;
    return count + " " + noun;
}`,
`// Formats a 10-digit US number as (555) 123-4567.
public static String formatUsPhone(String phone) {
    String digits = phone.replaceAll("\\\\D", "");
    if (digits.length() == 11 && digits.startsWith("1")) {
        digits = digits.substring(1);
    }
    if (digits.length() != 10) {
        return phone;
    }
    return "(" + digits.substring(0, 3) + ") " + digits.substring(3, 6) + "-" + digits.substring(6);
}`,
`// Converts a camelCase identifier into a display title.
public static String camelToTitle(String camel) {
    StringBuilder title = new StringBuilder();
    for (char c : camel.toCharArray()) {
        if (Character.isUpperCase(c) && title.length() > 0) {
            title.append(' ');
        }
        title.append(c);
    }
    return title.toString();
}`,
`// Renders one table row from cells, joined by a separator.
public static String formatTableRow(List<String> cells, String separator) {
    return String.join(separator, cells);
}`,
`// Compresses large counts into short form: 12500 -> "12.5k".
public static String formatCompactCount(long count) {
    if (count < 1000) {
        return String.valueOf(count);
    }
    if (count < 1_000_000) {
        return String.format("%.1fk", count / 1000.0);
    }
    return String.format("%.1fM", count / 1_000_000.0);
}`,
`// Repeats a character n times as a string.
public static String repeatChar(char c, int times) {
    if (times <= 0) {
        return "";
    }
    return String.valueOf(c).repeat(times);
}`,
`// Strips trailing zeros from a decimal string: "3.1400" -> "3.14".
public static String stripTrailingZeros(String decimal) {
    if (!decimal.contains(".")) {
        return decimal;
    }
    String stripped = decimal.replaceAll("0+$", "");
    return stripped.endsWith(".") ? stripped.substring(0, stripped.length() - 1) : stripped;
}`,
`// Formats a signed number with an explicit plus sign for positives.
public static String formatSigned(int value) {
    return value > 0 ? "+" + value : String.valueOf(value);
}`,
`// Pads a string on both sides so it is centered within a width.
public static String centerText(String text, int width) {
    if (text.length() >= width) {
        return text;
    }
    int totalPad = width - text.length();
    int leftPad = totalPad / 2;
    return " ".repeat(leftPad) + text + " ".repeat(totalPad - leftPad);
}`,
];
