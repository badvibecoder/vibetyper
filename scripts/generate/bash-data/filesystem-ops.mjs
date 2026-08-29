// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: directory walking and filesystem ops.

export default {
  file: 'filesystem_ops.sh',
  blocks: [
`# walk_tree prints every path under a directory, one per line.
walk_tree() {
    local root="\${1:-.}"
    find "\$root" -mindepth 1 -print | sort
}`,

`# list_dirs_only prints only the directories under a root.
list_dirs_only() {
    local root="\${1:-.}"
    find "\$root" -mindepth 1 -type d | sort
}`,

`# find_empty_dirs lists directories that contain no entries at all.
find_empty_dirs() {
    local root="\${1:-.}"
    find "\$root" -type d -empty
}`,

`# find_empty_files lists zero-byte regular files under a root.
find_empty_files() {
    local root="\${1:-.}"
    find "\$root" -type f -size 0
}`,

`# find_large_files lists files larger than a size threshold in MB.
find_large_files() {
    local root="\${1:-.}" mb="\${2:-10}"
    find "\$root" -type f -size "+\${mb}M" -printf '%s\\t%p\\n' | sort -rn
}`,

`# find_recent lists files modified within the last n days.
find_recent() {
    local root="\${1:-.}" days="\${2:-7}"
    find "\$root" -type f -mtime "-\${days}" -printf '%TY-%Tm-%Td %p\\n' | sort -r
}`,

`# prune_old deletes files not touched in n days, then empties dirs.
prune_old() {
    local dir="\${1:?missing dir}" days="\${2:-30}"
    find "\$dir" -type f -mtime "+\${days}" -delete
    find "\$dir" -type d -empty -delete
}`,

`# per_dir_sizes prints a human-readable size for each immediate child.
per_dir_sizes() {
    local root="\${1:-.}"
    du -sh "\$root"/* 2>/dev/null | sort -h
}`,

`# disk_space prints the free space on the filesystem holding a path.
disk_space() {
    local path="\${1:-.}"
    df -h "\$path" | tail -n 1
}`,

`# sync_trees mirrors a directory into a destination with rsync.
sync_trees() {
    local src="\${1:?missing source}" dst="\${2:?missing target}"
    rsync -a --delete "\$src/" "\$dst/"
}`,

`# copy_excluding copies a tree while skipping build artifact folders.
copy_excluding() {
    local src="\${1:?missing source}" dst="\${2:?missing target}"
    rsync -a --exclude node_modules --exclude .git "\$src/" "\$dst/"
}`,

`# tar_backup archives a directory into a timestamped tarball.
tar_backup() {
    local dir="\${1:?missing dir}" stamp out
    stamp=\$(date +%Y%m%d-%H%M%S)
    out="\$(basename "\$dir")-\${stamp}.tar.gz"
    tar -czf "\$out" -C "\$(dirname "\$dir")" "\$(basename "\$dir")"
    printf 'created %s\\n' "\$out"
}`,

`# extract_archive unpacks a tarball or zip by its extension.
extract_archive() {
    local archive="\${1:?missing archive}"
    case "\$archive" in
        *.tar.gz|*.tgz) tar -xzf "\$archive" ;;
        *.tar.bz2) tar -xjf "\$archive" ;;
        *.tar.xz) tar -xJf "\$archive" ;;
        *.tar) tar -xf "\$archive" ;;
        *.zip) unzip "\$archive" ;;
        *) printf 'unsupported archive: %s\\n' "\$archive" >&2; return 2 ;;
    esac
}`,

`# rename_by_pattern renames files, replacing a literal token with a new one.
rename_by_pattern() {
    local dir="\${1:-.}" old="\${2:?missing old}" new="\${3:?missing new}" f target
    for f in "\$dir"/*; do
        [[ -e "\$f" ]] || continue
        target="\${f//\$old/\$new}"
        [[ "\$target" == "\$f" ]] && continue
        mv "\$f" "\$target"
    done
}`,

`# strip_crlf converts CRLF line endings to LF across a directory.
strip_crlf() {
    local dir="\${1:-.}" f
    find "\$dir" -type f -print0 | while IFS= read -r -d '' f; do
        sed -i 's/\\r$//' "\$f"
    done
}`,

`# batch_chmod makes every shell script under a directory executable.
batch_chmod() {
    local dir="\${1:-.}"
    find "\$dir" -type f -name '*.sh' -exec chmod +x {} +
}`,

`# batch_chown reassigns ownership of a whole tree.
batch_chown() {
    local root="\${1:?missing root}" owner="\${2:?missing owner}"
    chown -R "\$owner" "\$root"
}`,

`# count_total_files prints how many files live under a directory.
count_total_files() {
    local root="\${1:-.}"
    find "\$root" -type f | wc -l | tr -d '[:space:]'
}`,

`# sum_of_file_sizes totals the bytes of every file under a directory.
sum_of_file_sizes() {
    local root="\${1:-.}"
    find "\$root" -type f -printf '%s\\n' | awk '{ total += \$1 } END { print total + 0 }'
}`,

`# move_by_ext buckets files into per-extension folders.
move_by_ext() {
    local dir="\${1:-.}" f ext
    for f in "\$dir"/*; do
        [[ -f "\$f" ]] || continue
        ext="\${f##*.}"
        [[ "\$f" == *.* ]] || ext="noext"
        mkdir -p "\$dir/\$ext"
        mv "\$f" "\$dir/\$ext/"
    done
}`,

`# verify_tree_hash prints an md5 digest covering a whole tree.
verify_tree_hash() {
    local root="\${1:-.}"
    find "\$root" -type f -print0 | sort -z | xargs -0 md5sum | md5sum | cut -d' ' -f1
}`,

`# tail_all_logs tails the end of every log file under a root.
tail_all_logs() {
    local root="\${1:-.}" f
    find "\$root" -type f -name '*.log' -print0 | while IFS= read -r -d '' f; do
        printf '== %s ==\\n' "\$f"
        tail -n 5 "\$f"
    done
}`,

`# find_by_name searches a tree for files matching a glob pattern.
find_by_name() {
    local root="\${1:-.}" pattern="\${2:?missing pattern}"
    find "\$root" -type f -name "\$pattern"
}`,

`# recent_dirs lists immediate children sorted by newest modification time.
recent_dirs() {
    local root="\${1:-.}"
    find "\$root" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\\n' \\
        | sort -rn | cut -d' ' -f2-
}`,
  ],
};
