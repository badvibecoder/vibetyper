# log_info prints a timestamped informational message.
log_info() {
    printf '[%s] INFO  %s\n' "$(date +%H:%M:%S)" "$*"
}

# log_error prints a timestamped error message to stderr.
log_error() {
    printf '[%s] ERROR %s\n' "$(date +%H:%M:%S)" "$*" >&2
}

# log_debug prints a message only when DEBUG is enabled.
log_debug() {
    [[ "${DEBUG:-}" == "1" ]] || return 0
    printf '[%s] DEBUG %s\n' "$(date +%H:%M:%S)" "$*" >&2
}

# log prints a message when its level is at or below the configured verbosity.
log() {
    local level="${1:?missing level}" message="${2:?missing message}" weight
    case "$level" in
        error) weight=0 ;;
        warn) weight=1 ;;
        info) weight=2 ;;
        debug) weight=3 ;;
        *) weight=2 ;;
    esac
    (( weight <= LOG_LEVEL )) && printf '%s: %s\n' "$level" "$message"
}

# log_tee writes a message to a log file and to the terminal.
log_tee() {
    local file="${1:?missing file}"
    shift
    printf '%s\n' "$*" | tee -a "$file"
}

# log_section prints a banner marking the start of a phase.
log_section() {
    local title="${1:?missing title}" width=60 dashes
    dashes=$(printf '%*s' "$width" '' | tr ' ' '=')
    printf '%s\n%s\n%s\n' "$dashes" "== $title" "$dashes"
}

# log_kv prints a key/value pair with the value aligned at a column.
log_kv() {
    local key="${1:?missing key}" value="${2:-}"
    printf '%-24s %s\n' "${key}:" "$value"
}

# log_json emits one structured JSON line with jq.
log_json() {
    local level="${1:-info}" message="${2:-}"
    jq -nc --arg lvl "$level" --arg msg "$message" \
        '{ ts: (now | todateiso8601), level: $lvl, message: $msg }'
}

# log_elapsed prints how long a named step took.
log_elapsed() {
    local name="${1:?missing name}" start="${2:?missing start}" now
    now=$(date +%s)
    printf '[%s] %s took %ds\n' "$(date +%H:%M:%S)" "$name" "$(( now - start ))"
}

# progress_bar draws a 40-character progress bar with a percentage.
progress_bar() {
    local pct="${1:-0}" filled
    (( pct > 100 )) && pct=100
    (( pct < 0 )) && pct=0
    filled=$(( pct * 40 / 100 ))
    printf '\r['
    printf '%*s' "$filled" '' | tr ' ' '#'
    printf '%*s' "$(( 40 - filled ))" '' | tr ' ' '-'
    printf '] %3d%%' "$pct"
}

# spinner shows an animated spinner while a command runs.
spinner() {
    local pid="$1" frame=0
    local marks=('-' '\\' '|' '/')
    while kill -0 "$pid" 2>/dev/null; do
        printf '\r%s' "${marks[frame]}"
        frame=$(( (frame + 1) % 4 ))
        sleep 0.1
    done
    printf '\r \n'
}

# log_rotate_if_large renames a log file when it exceeds a size in KB.
log_rotate_if_large() {
    local file="${1:?missing file}" limit="${2:-1024}" size
    [[ -f "$file" ]] || return 0
    size=$(du -k "$file" | cut -f1)
    if (( size > limit )); then
        mv "$file" "${file}.$(date +%Y%m%d-%H%M%S)"
    fi
}

# log_exec runs a command and prefixes each output line.
log_exec() {
    local prefix="${1:?missing prefix}"
    shift
    "$@" 2>&1 | sed "s/^/$prefix /"
}

# log_command_failure reports a failed command with its exit status.
log_command_failure() {
    local status="$?" cmd="$*"
    printf 'command failed (%d): %s\n' "$status" "$cmd" >&2
    return "$status"
}

# log_duration_seconds reports a duration measured in seconds.
log_duration_seconds() {
    local seconds="${1:?missing seconds}"
    printf 'took %dm %02ds\n' "$(( seconds / 60 ))" "$(( seconds % 60 ))"
}

# log_pipe prefixes every stdin line with a timestamp.
log_pipe() {
    local line
    while IFS= read -r line; do
        printf '[%s] %s\n' "$(date +%H:%M:%S)" "$line"
    done
}

# color_log prints a message in color when stdout is a terminal.
color_log() {
    local color="${1:?missing color}" message="${2:?missing message}"
    if [[ -t 1 ]]; then
        case "$color" in
            red) printf '\033[31m%s\033[0m\n' "$message" ;;
            green) printf '\033[32m%s\033[0m\n' "$message" ;;
            yellow) printf '\033[33m%s\033[0m\n' "$message" ;;
            *) printf '%s\n' "$message" ;;
        esac
    else
        printf '%s\n' "$message"
    fi
}

# log_head prints the first n lines of a file, noting truncation.
log_head() {
    local file="${1:?missing file}" n="${2:-10}" total
    head -n "$n" "$file"
    total=$(wc -l < "$file" | tr -d '[:space:]')
    if (( total > n )); then
        printf '... %d more lines\n' "$(( total - n ))"
    fi
}

# log_tail_errors prints the last error lines of a log file.
log_tail_errors() {
    local file="${1:?missing file}" n="${2:-20}"
    grep -E '\[(ERROR|FATAL)\]' "$file" | tail -n "$n"
}

# timestamped_file prints a log filename with the current date embedded.
timestamped_file() {
    local base="${1:-app}" ext="${2:-log}"
    printf '%s-%s.%s\n' "$base" "$(date +%Y%m%d)" "$ext"
}
