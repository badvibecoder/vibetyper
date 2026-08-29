# parse_verbose_flag scans arguments for -v/--verbose.
parse_verbose_flag() {
    local arg verbose=false
    for arg in "$@"; do
        case "$arg" in
            -v|--verbose) verbose=true ;;
        esac
    done
    printf '%s' "$verbose"
}

# run_cli parses -f and -o options with getopts and shifts positionals.
run_cli() {
    local file="" output="" opt
    OPTIND=1
    OPTIND=1
    while getopts 'f:o:h' opt; do
        case "$opt" in
            f) file="$OPTARG" ;;
            o) output="$OPTARG" ;;
            h) printf 'usage: %s -f file [-o out]\n' "$0"; return 0 ;;
            *) return 2 ;;
        esac
    done
    shift $(( OPTIND - 1 ))
    printf 'file=%s output=%s extra=%s\n' "$file" "$output" "$*"
}

# run_counter parses a -n count option and validates it as a number.
run_counter() {
    local count=3 opt
    OPTIND=1
    while getopts 'n:' opt; do
        case "$opt" in
            n) count="$OPTARG" ;;
        esac
    done
    [[ "$count" =~ ^[0-9]+$ ]] || { printf 'count must be a number\n' >&2; return 2; }
    for (( i = 1; i <= count; i++ )); do
        printf '%d\n' "$i"
    done
}

# run_kv parses key=value style arguments into labelled output lines.
run_kv() {
    local pair key value
    for pair in "$@"; do
        [[ "$pair" == *=* ]] || {
            printf 'expected key=value, got: %s\n' "$pair" >&2
            return 2
        }
        key="${pair%%=*}"
        value="${pair#*=}"
        printf '%s -> %s\n' "$key" "$value"
    done
}

# parse_double_dash treats everything after -- as positional arguments.
parse_double_dash() {
    local arg positional=() done=false
    for arg in "$@"; do
        if [[ "$arg" == "--" ]]; then
            done=true
            continue
        fi
        if [[ "$done" == true || "$arg" != -* ]]; then
            positional+=("$arg")
        fi
    done
    printf '%s\n' "${positional[@]}"
}

# run_server_opts parses host, port, tls and debug flags for a server.
run_server_opts() {
    local host="127.0.0.1" port=8080 tls=false debug=false opt
    OPTIND=1
    while getopts 'h:p:td' opt; do
        case "$opt" in
            h) host="$OPTARG" ;;
            p) port="$OPTARG" ;;
            t) tls=true ;;
            d) debug=true ;;
        esac
    done
    printf 'host=%s port=%s tls=%s debug=%s\n' "$host" "$port" "$tls" "$debug"
}

# run_required validates that the caller supplied the needed options.
run_required() {
    local input="" output="" opt
    OPTIND=1
    while getopts 'i:o:' opt; do
        case "$opt" in
            i) input="$OPTARG" ;;
            o) output="$OPTARG" ;;
        esac
    done
    if [[ -z "$input" || -z "$output" ]]; then
        printf 'both -i and -o are required\n' >&2
        return 2
    fi
    printf 'processing %s into %s\n' "$input" "$output"
}

# usage prints a help block for a build command.
usage() {
    cat <<'EOF'
usage: build [options] target
  -j N    run N parallel jobs
  -q      quiet output
  -h      show this help
EOF
}

# run_env_conf reads configuration from the environment with defaults.
run_env_conf() {
    local mode="${MODE:-auto}" retries="${RETRIES:-3}" timeout="${TIMEOUT:-30}"
    printf 'mode=%s retries=%s timeout=%s\n' "$mode" "$retries" "$timeout"
}

# parse_boolean_flag accepts --cache and --no-cache style flags.
parse_boolean_flag() {
    local arg cache=true
    for arg in "$@"; do
        case "$arg" in
            --cache) cache=true ;;
            --no-cache) cache=false ;;
        esac
    done
    printf '%s' "$cache"
}

# run_multi collects every -t tag option into a list.
run_multi() {
    local tags=() opt
    OPTIND=1
    while getopts 't:' opt; do
        case "$opt" in
            t) tags+=("$OPTARG") ;;
        esac
    done
    printf 'tags (%d):\n' "${#tags[@]}"
    printf '  - %s\n' "${tags[@]}"
}

# run_pos checks that exactly two positional arguments were given.
run_pos() {
    shift $(( OPTIND - 1 )) 2>/dev/null || true
    if (( $# != 2 )); then
        printf 'expected 2 arguments, got %d\n' "$#" >&2
        return 2
    fi
    printf 'first=%s second=%s\n' "$1" "$2"
}

# run_abbrev accepts unambiguous prefixes like --verb for --verbose.
run_abbrev() {
    local arg verbose=false quiet=false show_help=false
    for arg in "$@"; do
        case "$arg" in
            --verbose|--verb) verbose=true ;;
            --quiet|--qui) quiet=true ;;
            --help|--hel|--h) show_help=true ;;
        esac
    done
    printf 'verbose=%s quiet=%s help=%s\n' "$verbose" "$quiet" "$show_help"
}

# run_confirm asks for a y/N confirmation before proceeding.
run_confirm() {
    local answer
    printf 'Proceed with destructive cleanup? [y/N] '
    read -r answer
    case "${answer,,}" in
        y|yes) return 0 ;;
        *) printf 'aborted\n'; return 1 ;;
    esac
}

# run_range parses -n/-e bounds and validates their ordering.
run_range() {
    local start=1 end=10 opt
    OPTIND=1
    while getopts 'n:e:' opt; do
        case "$opt" in
            n) start="$OPTARG" ;;
            e) end="$OPTARG" ;;
        esac
    done
    [[ "$start" =~ ^[0-9]+$ && "$end" =~ ^[0-9]+$ ]] || {
        printf 'bounds must be integers\n' >&2
        return 2
    }
    (( start <= end )) || { printf 'start must not exceed end\n' >&2; return 2; }
    printf 'range %s..%s\n' "$start" "$end"
}

# run_list splits a comma-separated option value into an array.
run_list() {
    local list="${1:?missing list}" parts
    IFS=',' read -r -a parts <<< "$list"
    printf '%s\n' "${parts[@]}"
}

# run_dry accepts -n/--dry-run and echoes commands instead of running them.
run_dry() {
    local dry=false arg cmd=()
    for arg in "$@"; do
        case "$arg" in
            -n|--dry-run) dry=true ;;
            *) cmd+=("$arg") ;;
        esac
    done
    if [[ "$dry" == true ]]; then
        printf 'would run: %s\n' "${cmd[*]}"
    else
        "${cmd[@]}"
    fi
}

# run_long parses --output=file style long options by hand.
run_long() {
    local arg output=""
    for arg in "$@"; do
        case "$arg" in
            --output=*) output="${arg#*=}" ;;
        esac
    done
    printf 'output=%s\n' "$output"
}

# run_log_opts maps -v and -q into a numeric log level.
run_log_opts() {
    local level=2 opt
    OPTIND=1
    while getopts 'vq' opt; do
        case "$opt" in
            v) level=$(( level + 1 )) ;;
            q) level=$(( level - 1 )) ;;
        esac
    done
    printf 'log level: %d\n' "$level"
}

# run_endpoint parses a single host:port argument.
run_endpoint() {
    local endpoint="${1:?missing endpoint}" host port
    host="${endpoint%%:*}"
    port="${endpoint##*:}"
    if [[ "$endpoint" != *:* ]]; then
        port=80
    fi
    printf 'host=%s port=%s\n' "$host" "$port"
}

# run_menu reads a choice until the user picks quit.
run_menu() {
    local choice
    while true; do
        printf 'choose (build|test|quit): '
        read -r choice
        case "$choice" in
            build) printf 'building\n' ;;
            test) printf 'testing\n' ;;
            quit) return 0 ;;
            *) printf 'unknown choice\n' ;;
        esac
    done
}

# run_twice scans the arguments twice, resetting OPTIND between passes.
run_twice() {
    local opt first="" second=""
    OPTIND=1
    while getopts 'a:b:' opt; do
        case "$opt" in
            a) first="$OPTARG" ;;
        esac
    done
    OPTIND=1
    while getopts 'a:b:' opt; do
        case "$opt" in
            b) second="$OPTARG" ;;
        esac
    done
    printf 'a=%s b=%s\n' "$first" "$second"
}

# run_exit parses --fail to force a non-zero exit status.
run_exit() {
    local arg fail=false
    for arg in "$@"; do
        [[ "$arg" == "--fail" ]] && fail=true
    done
    if [[ "$fail" == true ]]; then
        printf 'failing on purpose\n' >&2
        return 1
    fi
    printf 'ok\n'
}

# run_flag_defaults prints which flags were present among candidates.
run_flag_defaults() {
    local arg colors=false force=false
    for arg in "$@"; do
        case "$arg" in
            --colors) colors=true ;;
            --force) force=true ;;
        esac
    done
    printf 'colors=%s force=%s\n' "$colors" "$force"
}
