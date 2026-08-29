// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: standalone script snippets, pipelines,
// here-docs, loops and compound statements.

export default {
  file: 'snippets.sh',
  blocks: [
`#!/usr/bin/env bash
# report_env prints key environment facts in one shot.
set -euo pipefail
printf 'shell: %s\\n' "\${BASH_VERSION:-unknown}"
printf 'user: %s\\n' "\$(id -un)"
printf 'cwd: %s\\n' "\$PWD"
printf 'date: %s\\n' "\$(date +%F)"`,

`# classify_size buckets a byte count into a coarse size class.
classify_size() {
    local bytes="\${1:?missing bytes}"
    if (( bytes < 1024 )); then
        printf 'tiny'
    elif (( bytes < 1048576 )); then
        printf 'small'
    elif (( bytes < 1073741824 )); then
        printf 'large'
    else
        printf 'huge'
    fi
}`,

`# describe_path prints what kind of filesystem entry a path is.
describe_path() {
    local path="\${1:?missing path}"
    if [[ -L "\$path" ]]; then
        printf 'symlink'
    elif [[ -d "\$path" ]]; then
        printf 'directory'
    elif [[ -f "\$path" ]]; then
        printf 'file'
    else
        printf 'other'
    fi
}`,

`# extension_kind maps a file extension to a broad category.
extension_kind() {
    local ext="\${1,,}"
    case "\$ext" in
        sh|bash) printf 'shell' ;;
        py) printf 'python' ;;
        js|ts) printf 'javascript' ;;
        go|rs) printf 'systems' ;;
        md|txt) printf 'docs' ;;
        *) printf 'other' ;;
    esac
}`,

`# summarize_logs prints the line count of every log file in a directory.
summarize_logs() {
    local dir="\${1:-.}" f
    for f in "\$dir"/*.log; do
        [[ -e "\$f" ]] || continue
        printf '%5d %s\\n' "\$(wc -l < "\$f")" "\$f"
    done
}`,

`# count_by_prefix tallies words by their first letter.
count_by_prefix() {
    tr -cs 'A-Za-z' '\\n' | tr '[:upper:]' '[:lower:]' \\
        | while read -r word; do
            [[ -n "\$word" ]] || continue
            printf '%s\\n' "\${word:0:1}"
        done | sort | uniq -c
}`,

`# top_ports prints the most common listening ports from ss output.
top_ports() {
    ss -tln 2>/dev/null | awk 'NR > 1 { split(\$4, a, ":"); print a[2] }' \\
        | sort -n | uniq -c | sort -rn | head -n 5
}`,

`# diff_directories compares file listings of two directories.
diff_directories() {
    local a="\${1:?missing first}" b="\${2:?missing second}"
    diff <(find "\$a" -type f -printf '%P\\n' | sort) \\
         <(find "\$b" -type f -printf '%P\\n' | sort)
}`,

`# timed_block measures how long a group of commands takes.
timed_block() {
    local start end
    start=\$(date +%s)
    {
        printf 'starting work\\n'
        sleep 2
        printf 'work complete\\n'
    }
    end=\$(date +%s)
    printf 'elapsed: %ds\\n' "\$(( end - start ))"
}`,

`# render_config emits a configuration file from a here-doc template.
render_config() {
    local host="\${1:-localhost}" port="\${2:-3306}"
    cat <<EOF
[connection]
host = \$host
port = \$port
timeout = 30
EOF
}`,

`# count_vowels counts vowels in a string using a here-string.
count_vowels() {
    local s="\${1,,}"
    tr -cd 'aeiou' <<< "\$s" | wc -c | tr -d '[:space:]'
}`,

`# pick_target lets the user choose a build target from a menu.
pick_target() {
    local target
    select target in dev staging prod quit; do
        case "\$target" in
            quit) return 0 ;;
            *) printf 'building %s\\n' "\$target" ;;
        esac
    done
}`,

`# powers_of_two prints the first n powers of two.
powers_of_two() {
    local n="\${1:-8}" value=1 i
    for (( i = 0; i < n; i++ )); do
        printf '%d\\n' "\$value"
        value=\$(( value * 2 ))
    done
}`,

`# touch_missing_dirs creates a fixed set of project directories.
touch_missing_dirs() {
    local d
    for d in src/{main,test}/{unit,integration}; do
        mkdir -p "\$d"
    done
}`,

`# run_with_defaults applies fallbacks for every configuration knob.
run_with_defaults() {
    local url="\${URL:-https://localhost:8080}"
    local retries="\${RETRIES:-3}"
    local timeout="\${TIMEOUT:-30}"
    printf 'url=%s retries=%s timeout=%s\\n' "\$url" "\$retries" "\$timeout"
}`,

`# print_var prints the value of a variable named by the argument.
print_var() {
    local name="\${1:?missing name}"
    printf '%s=%s\\n' "\$name" "\${!name}"
}`,

`# check_length validates a value against minimum and maximum lengths.
check_length() {
    local name="\${1:?missing name}" value="\${2:-}" min="\${3:-1}" max="\${4:-100}"
    if (( \${#value} < min )); then
        printf '%s is shorter than %d\\n' "\$name" "\$min" >&2
        return 1
    fi
    if (( \${#value} > max )); then
        printf '%s is longer than %d\\n' "\$name" "\$max" >&2
        return 1
    fi
    return 0
}`,

`# ask_credentials prompts for a username and a hidden password.
ask_credentials() {
    local user pass
    read -r -p 'username: ' user
    read -r -s -p 'password: ' pass
    printf '\\n'
    printf 'user=%s pass_len=%d\\n' "\$user" "\${#pass}"
}`,

`# print_columns renders a list of label:value pairs as aligned columns.
print_columns() {
    local pair
    for pair in "\$@"; do
        printf '%-20s %s\\n' "\${pair%%:*}" "\${pair#*:}"
    done
}`,

`# resize_images batch-processes images with xargs in parallel.
resize_images() {
    local dir="\${1:?missing dir}" size="\${2:-800}"
    find "\$dir" -type f -name '*.jpg' -print0 \\
        | xargs -0 -P 4 -I {} convert {} -resize "\${size}x\${size}" {}
}`,

`# remove_backup_files deletes editor backup files from a tree.
remove_backup_files() {
    local root="\${1:-.}"
    find "\$root" -type f \\( -name '*~' -o -name '*.bak' \\) -delete
}`,

`# grid_report prints a small multiplication table.
grid_report() {
    local i j
    for (( i = 1; i <= 5; i++ )); do
        for (( j = 1; j <= 5; j++ )); do
            printf '%4d' "\$(( i * j ))"
        done
        printf '\\n'
    done
}`,

`# run_or_die runs a command and exits when it fails.
run_or_die() {
    if ! "\$@"; then
        printf 'aborting: %s\\n' "\$*" >&2
        exit 1
    fi
}`,

`# csv_name_list reads a two-column file and greets each person.
csv_name_list() {
    local file="\${1:?missing file}" first last
    while IFS=, read -r first last; do
        printf 'hello %s %s\\n' "\$first" "\$last"
    done < "\$file"
}`,

`# stamp_file writes a copy of a file with a timestamp suffix.
stamp_file() {
    local file="\${1:?missing file}" stamp
    stamp=\$(date +%Y%m%d-%H%M%S)
    cp "\$file" "\${file%.*}.\${stamp}.\${file##*.}"
}`,

`# consume_all processes arguments one at a time with shift.
consume_all() {
    local arg
    while (( \$# > 0 )); do
        arg="\$1"
        printf 'got: %s\\n' "\$arg"
        shift
    done
}`,

`# install_or_update builds a tool or refreshes it from the registry.
install_or_update() {
    local tool="\${1:?missing tool}"
    if command -v "\$tool" >/dev/null 2>&1; then
        printf '%s already installed\\n' "\$tool"
    else
        printf 'installing %s\\n' "\$tool"
        make install
    fi
}`,

`# main parses flags, validates input, and dispatches to subcommands.
main() {
    local mode="run" opt
    OPTIND=1
    while getopts 'm:' opt; do
        case "\$opt" in
            m) mode="\$OPTARG" ;;
        esac
    done
    shift \$(( OPTIND - 1 ))
    case "\$mode:\$#" in
        run:1) run_task "\$1" ;;
        test:*) run_tests ;;
        *) printf 'usage: %s -m mode\\n' "\$0"; return 2 ;;
    esac
}`,

`# describe_changes prints a summary banner with the last commit.
describe_changes() {
    cat <<EOF
=== \$(git_branch) ===
last: \$(git log -1 --oneline 2>/dev/null || printf none)
EOF
}`,

`# numbered_args prints each argument with its 1-based position.
numbered_args() {
    local arg n=0
    for arg in "\$@"; do
        n=\$(( n + 1 ))
        printf '%2d: %s\\n' "\$n" "\$arg"
    done
}`,

`# wait_until_file polls until a marker file appears.
wait_until_file() {
    local marker="\${1:?missing marker}" tries="\${2:-30}" i
    for (( i = 0; i < tries; i++ )); do
        [[ -e "\$marker" ]] && { printf 'marker found\\n'; return 0; }
        sleep 1
    done
    printf 'marker never appeared\\n' >&2
    return 1
}`,

`# find_replace_in_dir applies a literal replacement across a file set.
find_replace_in_dir() {
    local dir="\${1:?missing dir}" old="\${2:?missing old}" new="\${3:?missing new}" f
    find "\$dir" -type f \\( -name '*.sh' -o -name '*.conf' \\) -print0 \\
        | while IFS= read -r -d '' f; do
            sed -i "s/\$old/\$new/g" "\$f"
        done
}`,
  ],
};
