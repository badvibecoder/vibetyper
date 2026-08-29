// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: date and time helpers.

export default {
  file: 'datetime.sh',
  blocks: [
`# now_iso prints the current time in ISO-8601 format.
now_iso() {
    date +%Y-%m-%dT%H:%M:%S%z
}`,

`# today prints today's date as YYYY-MM-DD.
today() {
    date +%F
}`,

`# yesterday prints the date one day before today.
yesterday() {
    date -d 'yesterday' +%F
}`,

`# tomorrow prints the date one day after today.
tomorrow() {
    date -d 'tomorrow' +%F
}`,

`# epoch_now prints the current unix timestamp in seconds.
epoch_now() {
    date +%s
}`,

`# epoch_to_date converts a unix timestamp to a readable date.
epoch_to_date() {
    local epoch="\${1:?missing epoch}"
    date -d "@\$epoch" '+%F %T'
}`,

`# weekday_of prints the weekday name for a YYYY-MM-DD date.
weekday_of() {
    local date="\${1:?missing date}"
    date -d "\$date" +%A
}`,

`# days_between prints the number of days between two dates.
days_between() {
    local a="\${1:?missing first}" b="\${2:?missing second}" ea eb
    ea=\$(date -d "\$a" +%s)
    eb=\$(date -d "\$b" +%s)
    printf '%d\\n' "\$(( (eb - ea) / 86400 ))"
}`,

`# date_plus_days adds n days to a date and prints the result.
date_plus_days() {
    local base="\${1:?missing date}" n="\${2:?missing days}"
    date -d "\$base + \$n days" +%F
}`,

`# is_leap_year tests whether a year is a leap year.
is_leap_year() {
    local year="\${1:?missing year}"
    (( year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) ))
}`,

`# month_name prints the full name of a month by number.
month_name() {
    local month="\${1:?missing month}"
    date -d "2000-\$month-01" +%B
}`,

`# valid_iso_date tests a YYYY-MM-DD string against the real calendar.
valid_iso_date() {
    local candidate="\${1:?missing date}"
    date -d "\$candidate" +%F 2>/dev/null | grep -qx "\$candidate"
}`,

`# seconds_to_hms renders a duration as H:MM:SS.
seconds_to_hms() {
    local s="\${1:?missing seconds}"
    printf '%d:%02d:%02d\\n' "\$(( s / 3600 ))" "\$(( (s % 3600) / 60 ))" "\$(( s % 60 ))"
}`,

`# file_age prints how many seconds ago a file was modified.
file_age() {
    local file="\${1:?missing file}" now then
    now=\$(date +%s)
    then=\$(stat -c '%Y' "\$file")
    printf '%d\\n' "\$(( now - then ))"
}`,

`# file_mtime prints the last modification time of a file.
file_mtime() {
    local file="\${1:?missing file}"
    stat -c '%y' "\$file" | cut -d. -f1
}`,

`# add_months shifts a date forward by a number of months.
add_months() {
    local base="\${1:?missing date}" months="\${2:?missing months}"
    date -d "\$base + \$months months" +%F
}`,

`# time_until prints the hours until a given timestamp.
time_until() {
    local target="\${1:?missing timestamp}" now diff
    now=\$(date +%s)
    diff=\$(( \$(date -d "\$target" +%s) - now ))
    printf '%d hours\\n' "\$(( diff / 3600 ))"
}`,

`# day_of_year prints the ordinal day of the year for today.
day_of_year() {
    date +%j
}`,

`# start_of_week prints the Monday of the current week.
start_of_week() {
    local dow offset
    dow=\$(date +%u)
    offset=\$(( dow - 1 ))
    date -d "today - \$offset days" +%F
}`,

`# timestamp_ms prints the current time with milliseconds.
timestamp_ms() {
    date +%Y-%m-%dT%H:%M:%S.%3N%z
}`,
  ],
};
