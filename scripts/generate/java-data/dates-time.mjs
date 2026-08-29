// Java date/time blocks — one complete method per block.
export const datesTime = [
`// Whole days between two dates, ignoring the time component.
public static long daysBetween(java.time.LocalDate from, java.time.LocalDate to) {
    return java.time.temporal.ChronoUnit.DAYS.between(from, to);
}`,
`// True when the date falls on a Saturday or Sunday.
public static boolean isWeekend(java.time.LocalDate date) {
    java.time.DayOfWeek day = date.getDayOfWeek();
    return day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY;
}`,
`// Returns the date after adding business days, skipping weekends.
public static java.time.LocalDate addBusinessDays(java.time.LocalDate start, int days) {
    java.time.LocalDate result = start;
    int added = 0;
    while (added < days) {
        result = result.plusDays(1);
        if (!isWeekend(result)) {
            added++;
        }
    }
    return result;
}`,
`// The Monday of the week containing the given date.
public static java.time.LocalDate startOfWeek(java.time.LocalDate date) {
    return date.with(java.time.DayOfWeek.MONDAY);
}`,
`// Formats a date in the ISO-8601 yyyy-MM-dd form.
public static String formatIso(java.time.LocalDate date) {
    return date.format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
}`,
`// Parses a date, accepting several common formats.
public static java.time.LocalDate parseLenient(String value) {
    String[] patterns = { "yyyy-MM-dd", "yyyy/MM/dd", "MM/dd/yyyy", "dd-MM-yyyy" };
    for (String pattern : patterns) {
        try {
            return java.time.LocalDate.parse(value,
                    java.time.format.DateTimeFormatter.ofPattern(pattern));
        } catch (java.time.format.DateTimeParseException ignored) {
            // keep trying
        }
    }
    throw new IllegalArgumentException("unparseable date: " + value);
}`,
`// Last day of the month containing the given date.
public static java.time.LocalDate lastDayOfMonth(java.time.LocalDate date) {
    return date.withDayOfMonth(date.lengthOfMonth());
}`,
`// Completed years between a birth date and a reference date.
public static int ageOn(java.time.LocalDate birthDate, java.time.LocalDate onDate) {
    return (int) java.time.temporal.ChronoUnit.YEARS.between(birthDate, onDate);
}`,
`// True when the date is the 13th of a month and a Friday.
public static boolean isFridayThe13th(java.time.LocalDate date) {
    return date.getDayOfMonth() == 13
            && date.getDayOfWeek() == java.time.DayOfWeek.FRIDAY;
}`,
`// Whole hours between two instants, truncated toward zero.
public static long hoursBetween(java.time.Instant from, java.time.Instant to) {
    return java.time.Duration.between(from, to).toHours();
}`,
`// True when a date lies within the inclusive range [start, end].
public static boolean dateInRange(java.time.LocalDate date,
        java.time.LocalDate start, java.time.LocalDate end) {
    return !date.isBefore(start) && !date.isAfter(end);
}`,
`// Converts a Unix timestamp in seconds to a LocalDateTime.
public static java.time.LocalDateTime fromUnixSeconds(long epochSeconds, String zoneId) {
    return java.time.LocalDateTime.ofInstant(
            java.time.Instant.ofEpochSecond(epochSeconds),
            java.time.ZoneId.of(zoneId));
}`,
`// Full name of the month for a date, e.g. "March".
public static String monthName(java.time.LocalDate date) {
    return date.getMonth().getDisplayName(
            java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
}`,
`// Whole calendar quarters between two dates.
public static long quartersBetween(java.time.LocalDate from, java.time.LocalDate to) {
    long months = java.time.temporal.ChronoUnit.MONTHS.between(from, to);
    return months / 3;
}`,
`// ISO-8601 week number of a date.
public static int isoWeekNumber(java.time.LocalDate date) {
    return date.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
}`,
`// True when two dates fall on the same calendar day.
public static boolean isSameDay(java.time.LocalDate a, java.time.LocalDate b) {
    return a.getYear() == b.getYear()
            && a.getMonth() == b.getMonth()
            && a.getDayOfMonth() == b.getDayOfMonth();
}`,
`// Minutes until a deadline, negative when already past.
public static long minutesUntil(java.time.Instant deadline, java.time.Instant now) {
    return java.time.Duration.between(now, deadline).toMinutes();
}`,
`// Sorts a list of dates from earliest to latest.
public static List<java.time.LocalDate> sortDates(List<java.time.LocalDate> dates) {
    List<java.time.LocalDate> sorted = new ArrayList<>(dates);
    Collections.sort(sorted);
    return sorted;
}`,
`// The first day of the month after the one containing the date.
public static java.time.LocalDate firstDayOfNextMonth(java.time.LocalDate date) {
    return date.plusMonths(1).withDayOfMonth(1);
}`,
`// Human-friendly relative time like "3 days ago".
public static String relativeTime(java.time.Instant when, java.time.Instant now) {
    long seconds = java.time.Duration.between(when, now).getSeconds();
    long abs = Math.abs(seconds);
    String suffix = seconds >= 0 ? "ago" : "from now";
    if (abs < 60) {
        return abs + " seconds " + suffix;
    }
    if (abs < 3600) {
        return abs / 60 + " minutes " + suffix;
    }
    if (abs < 86400) {
        return abs / 3600 + " hours " + suffix;
    }
    return abs / 86400 + " days " + suffix;
}`,
];
