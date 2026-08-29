// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: error handling, guards, cleanup.

export default {
  file: 'error_handling.sh',
  blocks: [
`# die prints a message to stderr and exits with a status.
die() {
    local status="\${1:?missing status}" message="\${2:?missing message}"
    printf 'error: %s\\n' "\$message" >&2
    exit "\$status"
}`,

`# require_command fails unless a command is available on the PATH.
require_command() {
    local cmd="\${1:?missing command}"
    command -v "\$cmd" >/dev/null 2>&1 || {
        printf 'required command not found: %s\\n' "\$cmd" >&2
        return 127
    }
}`,

`# require_all_commands checks a list of commands and reports missing ones.
require_all_commands() {
    local cmd missing=0
    for cmd in "\$@"; do
        if ! command -v "\$cmd" >/dev/null 2>&1; then
            printf 'missing: %s\\n' "\$cmd" >&2
            missing=1
        fi
    done
    return "\$missing"
}`,

`# assert_file fails unless a path is a regular file.
assert_file() {
    local file="\${1:?missing path}"
    [[ -f "\$file" ]] || die 1 "not a file: \$file"
}`,

`# assert_dir fails unless a path is a directory.
assert_dir() {
    local dir="\${1:?missing path}"
    [[ -d "\$dir" ]] || die 1 "not a directory: \$dir"
}`,

`# assert_nonempty fails when a value is an empty string.
assert_nonempty() {
    local name="\${1:?missing name}" value="\${2:-}"
    [[ -n "\$value" ]] || die 1 "\$name must not be empty"
}`,

`# assert_integer fails unless a value is a whole number.
assert_integer() {
    local name="\${1:?missing name}" value="\${2:-}"
    [[ "\$value" =~ ^[0-9]+$ ]] || die 1 "\$name must be an integer, got: \$value"
}`,

`# assert_range fails unless an integer lies inside [lo, hi].
assert_range() {
    local name="\${1:?missing name}" value="\${2:?missing value}"
    local lo="\${3:?missing low}" hi="\${4:?missing high}"
    assert_integer "\$name" "\$value"
    (( value >= lo && value <= hi )) || die 1 "\$name out of range: \$value"
}`,

`# check_status inspects a command's exit code and reports the outcome.
check_status() {
    local status="\$1" label="\${2:-command}"
    if (( status == 0 )); then
        printf '%s succeeded\\n' "\$label"
    else
        printf '%s failed with status %d\\n' "\$label" "\$status" >&2
    fi
    return "\$status"
}`,

`# retry runs a command until it succeeds or the attempt limit is hit.
retry() {
    local attempts="\${1:?missing attempts}" delay="\${2:-1}" n=1
    shift 2
    until "\$@"; do
        (( n >= attempts )) && return 1
        printf 'attempt %d failed, retrying in %ds\\n' "\$n" "\$delay" >&2
        sleep "\$delay"
        n=\$(( n + 1 ))
    done
    return 0
}`,

`# safe_cd changes into a directory or dies with a clear message.
safe_cd() {
    local dir="\${1:?missing directory}"
    cd "\$dir" || die 1 "cannot enter directory: \$dir"
}`,

`# guard_root refuses to run unless the user is root.
guard_root() {
    (( EUID == 0 )) || die 1 "this script must run as root"
}`,

`# guard_bash_version requires a minimum bash major version.
guard_bash_version() {
    local major="\${1:-4}"
    (( \${BASH_VERSINFO[0]} >= major )) || die 1 "bash \${major}+ required"
}`,

`# cleanup_trap removes temporary files on any exit path.
cleanup_trap() {
    local tmp="\${1:?missing tmp}"
    trap "rm -f -- '\$tmp'" EXIT INT TERM
}`,

`# temp_file creates a private temporary file and prints its path.
temp_file() {
    local prefix="\${1:-tmp}"
    mktemp "\${TMPDIR:-/tmp}/\${prefix}.XXXXXX"
}`,

`# check_env_var fails when a required environment variable is unset.
check_env_var() {
    local name="\${1:?missing name}"
    if [[ -z "\${!name}" ]]; then
        printf 'environment variable %s is required\\n' "\$name" >&2
        return 1
    fi
}`,

`# warn_continue asks for confirmation after printing a warning.
warn_continue() {
    local message="\${1:?missing message}" answer
    printf 'warning: %s\\n' "\$message" >&2
    printf 'continue? [y/N] '
    read -r answer
    [[ "\${answer,,}" =~ ^(y|yes)$ ]]
}`,

`# with_fallback returns the fallback value when a command fails.
with_fallback() {
    local fallback="\${1:?missing fallback}"
    shift
    local out
    out=\$("\$@" 2>/dev/null) || { printf '%s' "\$fallback"; return 1; }
    printf '%s' "\$out"
}`,

`# error_context wraps a command so failures carry extra context.
error_context() {
    local context="\${1:?missing context}"
    shift
    if ! "\$@"; then
        printf 'failed while: %s\\n' "\$context" >&2
        return 1
    fi
}`,

`# try_quiet runs a command and discards its output.
try_quiet() {
    "\$@" >/dev/null 2>&1
}`,

`# assert_executable fails unless a path is executable.
assert_executable() {
    local bin="\${1:?missing path}"
    [[ -x "\$bin" ]] || die 1 "not executable: \$bin"
}`,
  ],
};
