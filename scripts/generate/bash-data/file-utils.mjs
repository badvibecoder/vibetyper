// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: file inspection and manipulation.

export default {
  file: 'file_utils.sh',
  blocks: [
`# path_exists tests whether a path exists in any form.
path_exists() {
    [[ -e "\${1:?missing path}" ]]
}`,

`# is_directory tests whether a path is a directory.
is_directory() {
    [[ -d "\${1:?missing path}" ]]
}`,

`# is_regular_file tests whether a path is a plain file.
is_regular_file() {
    [[ -f "\${1:?missing path}" ]]
}`,

`# is_symlink tests whether a path is a symbolic link.
is_symlink() {
    [[ -L "\${1:?missing path}" ]]
}`,

`# is_readable tests whether a path can be opened for reading.
is_readable() {
    [[ -r "\${1:?missing path}" ]]
}`,

`# file_size_bytes prints the byte length of a file.
file_size_bytes() {
    local file="\${1:?missing file}"
    wc -c < "\$file" | tr -d '[:space:]'
}`,

`# file_extension prints the extension of a filename without the dot.
file_extension() {
    local name="\${1##*/}"
    [[ "\$name" == *.* ]] || { printf ''; return; }
    printf '%s' "\${name##*.}"
}`,

`# base_name_without_ext prints the filename minus its final extension.
base_name_without_ext() {
    local name="\${1##*/}"
    printf '%s' "\${name%.*}"
}`,

`# parent_dir prints the directory component of a path.
parent_dir() {
    local path="\${1:?missing path}" dir
    dir="\${path%/*}"
    [[ "\$dir" == "\$path" ]] && dir="."
    printf '%s' "\$dir"
}`,

`# human_size renders a byte count as a human-readable size.
human_size() {
    local bytes="\${1:?missing bytes}" value i=0
    value="\$bytes"
    local units=("B" "KB" "MB" "GB" "TB")
    while (( value >= 1024 && i < \${#units[@]} - 1 )); do
        value=\$(( value / 1024 ))
        i=\$(( i + 1 ))
    done
    printf '%s %s\\n' "\$value" "\${units[\$i]}"
}`,

`# ensure_directory creates a directory tree and reports what it did.
ensure_directory() {
    local dir="\${1:?missing directory}"
    if [[ -d "\$dir" ]]; then
        printf 'exists: %s\\n' "\$dir"
    else
        mkdir -p "\$dir" && printf 'created: %s\\n' "\$dir"
    fi
}`,

`# touch_if_missing creates an empty file only when one is absent.
touch_if_missing() {
    local file="\${1:?missing file}"
    [[ -e "\$file" ]] || : > "\$file"
}`,

`# backup_file copies a file next to itself with a timestamp suffix.
backup_file() {
    local file="\${1:?missing file}" stamp
    [[ -f "\$file" ]] || return 1
    stamp=\$(date +%Y%m%d-%H%M%S)
    cp -p "\$file" "\${file}.bak-\${stamp}"
}`,

`# rotate_backups keeps only the newest n backups for a base name.
rotate_backups() {
    local base="\${1:?missing base}" keep="\${2:-5}"
    ls -1t "\${base}".bak-* 2>/dev/null \\
        | tail -n +\$((keep + 1)) \\
        | xargs -r rm -f
}`,

`# newest_file_in prints the most recently modified file in a directory.
newest_file_in() {
    local dir="\${1:-.}"
    find "\$dir" -maxdepth 1 -type f -printf '%T@ %p\\n' 2>/dev/null \\
        | sort -rn | head -n 1 | cut -d' ' -f2-
}`,

`# largest_file_in prints the biggest regular file under a directory.
largest_file_in() {
    local dir="\${1:-.}"
    find "\$dir" -type f -printf '%s %p\\n' 2>/dev/null \\
        | sort -rn | head -n 1 | cut -d' ' -f2-
}`,

`# count_files_by_ext tallies how many files use each extension.
count_files_by_ext() {
    local dir="\${1:-.}"
    find "\$dir" -type f -printf '%f\\n' 2>/dev/null \\
        | sed -n 's/.*\\.\\([A-Za-z0-9]*\\)$/\\1/p' \\
        | sort | uniq -c | sort -rn
}`,

`# safe_remove moves a file to a trash folder instead of deleting it.
safe_remove() {
    local file="\${1:?missing file}" trash="\${TMPDIR:-/tmp}/trash"
    mkdir -p "\$trash"
    [[ -e "\$file" ]] || return 0
    mv "\$file" "\$trash/\$(basename "\$file").\$(date +%s)"
}`,

`# append_line_once adds a line to a file unless it is already present.
append_line_once() {
    local file="\${1:?missing file}" line="\${2:?missing line}"
    grep -qF -- "\$line" "\$file" 2>/dev/null || printf '%s\\n' "\$line" >> "\$file"
}`,

`# compare_files prints a short verdict on two files' contents.
compare_files() {
    local a="\${1:?missing first}" b="\${2:?missing second}"
    if cmp -s "\$a" "\$b"; then
        printf 'identical: %s %s\\n' "\$a" "\$b"
    else
        printf 'differ:    %s %s\\n' "\$a" "\$b"
    fi
}`,

`# count_lines_in prints the number of lines in a file.
count_lines_in() {
    local file="\${1:?missing file}"
    wc -l < "\$file" | tr -d '[:space:]'
}`,

`# move_keep_permissions relocates a file while preserving its mode.
move_keep_permissions() {
    local src="\${1:?missing source}" dst="\${2:?missing target}" mode
    mode=\$(stat -c '%a' "\$src")
    mv "\$src" "\$dst" && chmod "\$mode" "\$dst"
}`,

`# checksum_file prints the sha256 checksum of a file.
checksum_file() {
    local file="\${1:?missing file}"
    sha256sum "\$file" | cut -d' ' -f1
}`,

`# write_defaults writes a config file only when it does not exist yet.
write_defaults() {
    local file="\${1:?missing file}" content="\${2:-}"
    if [[ -e "\$file" ]]; then
        printf 'keeping existing %s\\n' "\$file"
        return
    fi
    printf '%s\\n' "\$content" > "\$file"
}`,
  ],
};
