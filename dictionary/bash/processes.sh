# is_running tests whether a process id is still alive.
is_running() {
    local pid="${1:?missing pid}"
    kill -0 "$pid" 2>/dev/null
}

# wait_for_pid blocks until a process exits or a timeout passes.
wait_for_pid() {
    local pid="${1:?missing pid}" timeout="${2:-10}" waited=0
    while kill -0 "$pid" 2>/dev/null; do
        (( waited >= timeout )) && return 1
        sleep 1
        waited=$(( waited + 1 ))
    done
    return 0
}

# kill_graceful sends TERM, then KILL after a grace period.
kill_graceful() {
    local pid="${1:?missing pid}" grace="${2:-5}" i
    kill -TERM "$pid" 2>/dev/null || return 0
    for (( i = 0; i < grace; i++ )); do
        kill -0 "$pid" 2>/dev/null || return 0
        sleep 1
    done
    kill -KILL "$pid" 2>/dev/null
}

# run_with_timeout runs a command and kills it when it exceeds a deadline.
run_with_timeout() {
    local seconds="${1:?missing seconds}" pid status
    shift
    "$@" &
    pid=$!
    if ! wait_for_pid "$pid" "$seconds"; then
        kill_graceful "$pid" 2
        printf 'timed out after %ds\n' "$seconds" >&2
        return 124
    fi
    wait "$pid"
    return $?
}

# run_parallel runs up to n jobs at once using xargs.
run_parallel() {
    local jobs="${1:?missing jobs}"
    shift
    printf '%s\n' "$@" | xargs -P "$jobs" -I {} sh -c '{}'
}

# collect_exit_codes runs several commands and reports each result.
collect_exit_codes() {
    local cmd status=0
    for cmd in "$@"; do
        if eval "$cmd"; then
            printf 'ok: %s\n' "$cmd"
        else
            printf 'failed: %s\n' "$cmd"
            status=1
        fi
    done
    return "$status"
}

# background_pids launches commands in the background and records their pids.
background_pids() {
    local pids=() cmd
    for cmd in "$@"; do
        eval "$cmd" &
        pids+=("$!")
    done
    printf '%s\n' "${pids[@]}"
}

# wait_all waits for every pid listed in a file, one per line.
wait_all() {
    local pidfile="${1:?missing pidfile}" pid status=0
    while read -r pid; do
        wait "$pid" || status=1
    done < "$pidfile"
    return "$status"
}

# daemonize detaches a command from the current shell session.
daemonize() {
    local log="${1:-/dev/null}"
    shift
    setsid "$@" >"$log" 2>&1 < /dev/null &
    printf '%d\n' "$!"
}

# pidfile_create writes the current pid to a lock file, refusing overlap.
pidfile_create() {
    local file="${1:?missing pidfile}"
    if [[ -f "$file" ]] && kill -0 "$(cat "$file")" 2>/dev/null; then
        printf 'already running as pid %s\n' "$(cat "$file")" >&2
        return 1
    fi
    printf '%d\n' "$$" > "$file"
}

# pidfile_remove deletes a pidfile that belongs to this process.
pidfile_remove() {
    local file="${1:?missing pidfile}"
    [[ -f "$file" ]] || return 0
    if [[ "$(cat "$file")" == "$$" ]]; then
        rm -f "$file"
    fi
}

# trap_cleanup registers a cleanup command to run on exit.
trap_cleanup() {
    local file="${1:?missing file}"
    trap "rm -f -- '$file' && printf 'cleaned up %s\n' '$file'" EXIT
}

# trap_signals installs a handler for INT and TERM.
trap_signals() {
    local handler="${1:?missing handler}"
    trap "$handler" INT TERM
}

# trap_err_report reports the failing command and line on any error.
trap_err_report() {
    trap 'printf "error on line %d: %s\n" "$LINENO" "$BASH_COMMAND" >&2' ERR
}

# cpu_count prints the number of available processors.
cpu_count() {
    nproc 2>/dev/null || getconf _NPROCESSORS_ONLN
}

# load_average prints the 1-minute load average.
load_average() {
    uptime | sed -n 's/.*load average: //p'
}

# top_cpu_process prints the process consuming the most CPU.
top_cpu_process() {
    ps -eo pid,comm,%cpu --sort=-%cpu | head -n 2 | tail -n 1
}

# process_tree prints the descendant processes of a pid.
process_tree() {
    local pid="${1:?missing pid}"
    pstree -p "$pid"
}

# watch_loop re-runs a command every n seconds until interrupted.
watch_loop() {
    local interval="${1:-2}"
    shift
    while true; do
        clear
        date
        "$@"
        sleep "$interval"
    done
}

# spawn_workers launches n worker scripts and stores their pids.
spawn_workers() {
    local count="${1:?missing count}" script="${2:?missing script}" pids=() i
    for (( i = 0; i < count; i++ )); do
        "$script" "$i" &
        pids+=("$!")
    done
    printf '%s\n' "${pids[@]}"
}

# restart_self re-executes the current script after a delay.
restart_self() {
    local delay="${1:-5}"
    printf 'restarting in %ds\n' "$delay"
    sleep "$delay"
    exec "$0" "$@"
}

# job_count reports how many background jobs this shell has.
job_count() {
    jobs -p | wc -l | tr -d '[:space:]'
}

# run_single_instance uses a lock file to prevent duplicate runs.
run_single_instance() {
    local lock="${1:-/tmp/$(basename "$0").lock}"
    exec 9>"$lock"
    if ! flock -n 9; then
        printf 'another instance is running\n' >&2
        return 1
    fi
    printf 'acquired lock %s\n' "$lock"
}
