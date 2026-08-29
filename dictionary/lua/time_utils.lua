-- now_unix returns the current Unix timestamp in seconds.
local function now_unix()
	return os.time()
end

-- is_leap_year checks the Gregorian leap-year rule.
local function is_leap_year(year)
	if year % 400 == 0 then
		return true
	end
	if year % 100 == 0 then
		return false
	end
	return year % 4 == 0
end

-- days_in_month returns the day count for a month and year.
local function days_in_month(year, month)
	local days = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }
	if month == 2 and is_leap_year(year) then
		return 29
	end
	return days[month]
end

-- day_of_week returns the weekday name for a date.
local function day_of_week(year, month, day)
	local t = os.time({ year = year, month = month, day = day })
	return os.date("%A", t)
end

-- format_hhmm renders a timestamp as HH:MM.
local function format_hhmm(unix)
	return os.date("%H:%M", unix)
end

-- seconds_to_hhmmss splits a duration into clock text.
local function seconds_to_hhmmss(total)
	local hours = math.floor(total / 3600)
	local minutes = math.floor((total % 3600) / 60)
	local seconds = total % 60
	return string.format("%02d:%02d:%02d", hours, minutes, seconds)
end

-- month_name returns the English name of a month number.
local function month_name(month)
	local names = { "January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December" }
	return names[month]
end

-- is_weekend reports whether a date falls on Saturday or Sunday.
local function is_weekend(year, month, day)
	local weekday = day_of_week(year, month, day)
	return weekday == "Saturday" or weekday == "Sunday"
end

-- add_days shifts a calendar date forward by a number of days.
local function add_days(year, month, day, days)
	local t = os.time({ year = year, month = month, day = day }) + days * 86400
	local d = os.date("*t", t)
	return d.year, d.month, d.day
end

-- diff_days returns the whole days between two timestamps.
local function diff_days(later, earlier)
	return math.floor((later - earlier) / 86400)
end

-- age_from_birthdate computes whole years since a birth date.
local function age_from_birthdate(birth_year, birth_month, birth_day)
	local now = os.date("*t")
	local age = now.year - birth_year
	if now.month < birth_month or (now.month == birth_month and now.day < birth_day) then
		age = age - 1
	end
	return age
end

-- unix_to_iso formats a timestamp as YYYY-MM-DD.
local function unix_to_iso(unix)
	return os.date("%Y-%m-%d", unix)
end

-- iso_to_unix parses a YYYY-MM-DD date into a timestamp.
local function iso_to_unix(iso)
	local year, month, day = iso:match("^(%d%d%d%d)-(%d%d)-(%d%d)$")
	if not year then
		return nil
	end
	return os.time({ year = tonumber(year), month = tonumber(month), day = tonumber(day) })
end

-- relative_label describes how long ago a timestamp was.
local function relative_label(unix)
	local seconds = os.time() - unix
	if seconds < 60 then
		return "just now"
	end
	if seconds < 3600 then
		return string.format("%dm ago", math.floor(seconds / 60))
	end
	if seconds < 86400 then
		return string.format("%dh ago", math.floor(seconds / 3600))
	end
	return string.format("%dd ago", math.floor(seconds / 86400))
end

-- minutes_since_midnight converts a clock to minutes.
local function minutes_since_midnight(hour, minute)
	return hour * 60 + minute
end

-- hours_between returns the fractional hours between two timestamps.
local function hours_between(from, to)
	return (to - from) / 3600
end

-- is_iso_date validates a YYYY-MM-DD string and its calendar values.
local function is_iso_date(iso)
	local year, month, day = iso:match("^(%d%d%d%d)-(%d%d)-(%d%d)$")
	if not year then
		return false
	end
	year, month, day = tonumber(year), tonumber(month), tonumber(day)
	if month < 1 or month > 12 or day < 1 then
		return false
	end
	return day <= days_in_month(year, month)
end

-- schedule_next_hour returns the next whole hour at or after a timestamp.
local function schedule_next_hour(unix)
	local d = os.date("*t", unix)
	d.minute = 0
	d.second = 0
	return os.time(d)
end

-- timestamp_label formats a timestamp as "YYYY-MM-DD HH:MM".
local function timestamp_label(unix)
	return os.date("%Y-%m-%d %H:%M", unix)
end

-- weekday_number maps a date to 0 for Sunday through 6 for Saturday.
local function weekday_number(year, month, day)
	local t = os.time({ year = year, month = month, day = day })
	return tonumber(os.date("%w", t))
end

-- unix_to_clock returns hour, minute and second of a timestamp.
local function unix_to_clock(unix)
	local d = os.date("*t", unix)
	return d.hour, d.minute, d.second
end
