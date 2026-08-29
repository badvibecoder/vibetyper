package time_utils

import "core:fmt"
import "core:strconv"
import "core:time"

// unix_now returns the current Unix timestamp in seconds.
unix_now :: proc() -> i64 {
	return time.time_to_unix(time.now())
}

// to_iso_date formats a Time as YYYY-MM-DD.
to_iso_date :: proc(t: time.Time) -> string {
	return fmt.sprintf("%04d-%02d-%02d", t.year, t.month, t.day)
}

// is_leap_year checks the Gregorian leap-year rule.
is_leap_year :: proc(year: int) -> bool {
	if year % 400 == 0 {
		return true
	}
	if year % 100 == 0 {
		return false
	}
	return year % 4 == 0
}

// days_in_month returns the day count for a month and year.
days_in_month :: proc(year, month: int) -> int {
	switch month {
	case 1, 3, 5, 7, 8, 10, 12:
		return 31
	case 4, 6, 9, 11:
		return 30
	case 2:
		if is_leap_year(year) {
			return 29
		}
		return 28
	case:
		return 0
	}
}

// day_of_week returns 0 for Monday .. 6 for Sunday (Zeller-free).
day_of_week :: proc(year, month, day: int) -> int {
	// Sakamoto's algorithm.
	y := year
	if month < 3 {
		y -= 1
	}
	t := []int{0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4}
	return (y + y / 4 - y / 100 + y / 400 + t[month - 1] + day) % 7
}

// add_days shifts a Time forward by a number of days.
add_days :: proc(t: time.Time, days: int) -> time.Time {
	return time.time_add(t, time.Duration(days) * 24 * time.Hour)
}

// diff_days returns the whole days between two times.
diff_days :: proc(later, earlier: time.Time) -> int {
	delta := time.diff(earlier, later)
	return int(delta / (24 * time.Hour))
}

// format_hhmm renders a Time as HH:MM.
format_hhmm :: proc(t: time.Time) -> string {
	return fmt.sprintf("%02d:%02d", t.hour, t.minute)
}

// seconds_to_hhmmss splits a duration into clock text.
seconds_to_hhmmss :: proc(total: int) -> string {
	hours := total / 3600
	minutes := (total % 3600) / 60
	seconds := total % 60
	return fmt.sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}

// month_name returns the English name of a month number.
month_name :: proc(month: int) -> string {
	names := []string{"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"}
	if month < 1 || month > 12 {
		return ""
	}
	return names[month - 1]
}

// is_weekend reports Saturday or Sunday by weekday number.
is_weekend :: proc(year, month, day: int) -> bool {
	weekday := day_of_week(year, month, day)
	return weekday == 5 || weekday == 6
}

// start_of_day zeroes the clock fields of a Time.
start_of_day :: proc(t: time.Time) -> time.Time {
	t.hour = 0
	t.minute = 0
	t.second = 0
	t.nanosecond = 0
	return t
}

// end_of_day sets a Time to 23:59:59.
end_of_day :: proc(t: time.Time) -> time.Time {
	t.hour = 23
	t.minute = 59
	t.second = 59
	t.nanosecond = 0
	return t
}

// age_from_birthdate computes whole years since a birth date.
age_from_birthdate :: proc(birth_year, birth_month, birth_day: int) -> int {
	now := time.now()
	age := now.year - birth_year
	if now.month < birth_month || (now.month == birth_month && now.day < birth_day) {
		age -= 1
	}
	return age
}

// unix_to_date_parts breaks a timestamp into calendar fields.
unix_to_date_parts :: proc(seconds: i64) -> (year, month, day, hour, minute: int) {
	t := time.unix_to_time(seconds)
	return t.year, t.month, t.day, t.hour, t.minute
}

// seconds_until_deadline measures remaining time from now.
seconds_until_deadline :: proc(deadline: time.Time) -> i64 {
	return max(i64(time.diff(time.now(), deadline) / time.Second), 0)
}

// next_weekday advances a date to the next given weekday.
next_weekday :: proc(year, month, day, target: int) -> (int, int, int) {
	current := day_of_week(year, month, day)
	delta := (target - current + 7) % 7
	if delta == 0 {
		delta = 7
	}
	t := time.Time{year = year, month = month, day = day}
	t = add_days(t, delta)
	return t.year, t.month, t.day
}

// minutes_since_midnight converts a clock to minutes.
minutes_since_midnight :: proc(hour, minute: int) -> int {
	return hour * 60 + minute
}

// iso_to_unix parses "YYYY-MM-DD" into a Unix timestamp.
iso_to_unix :: proc(iso: string) -> (i64, bool) {
	if len(iso) != 10 {
		return 0, false
	}
	year, ok1 := strconv.parse_int(iso[0:4])
	month, ok2 := strconv.parse_int(iso[5:7])
	day, ok3 := strconv.parse_int(iso[8:10])
	if !ok1 || !ok2 || !ok3 {
		return 0, false
	}
	if month < 1 || month > 12 || day < 1 || day > days_in_month(year, month) {
		return 0, false
	}
	t := time.Time{year = year, month = month, day = day}
	return time.time_to_unix(t), true
}

// relative_label describes how long ago a time was.
relative_label :: proc(t: time.Time) -> string {
	seconds := i64(time.diff(t, time.now()) / time.Second)
	switch {
	case seconds < 60:
		return "just now"
	case seconds < 3600:
		return fmt.sprintf("%dm ago", seconds / 60)
	case seconds < 86400:
		return fmt.sprintf("%dh ago", seconds / 3600)
	case:
		return fmt.sprintf("%dd ago", seconds / 86400)
	}
}

// hours_between returns the fractional hours between two times.
hours_between :: proc(from, to: time.Time) -> f64 {
	delta := time.diff(from, to)
	return f64(delta) / f64(time.Hour)
}
