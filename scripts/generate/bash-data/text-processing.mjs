// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: text and stream processing.

export default {
  file: 'text_processing.sh',
  blocks: [
`# word_count counts whitespace-separated words in a string.
word_count() {
    local s="\${1:-}"
    [[ -z "\$s" ]] && { printf '%s' 0; return; }
    set -- \$s
    printf '%s' "\$#"
}`,

`# unique_words prints the distinct words of a string in first-seen order.
unique_words() {
    local s="\${1:-}" word
    for word in \$s; do
        printf '%s\\n' "\$word"
    done | awk '!seen[\$0]++'
}`,

`# longest_word prints the longest whitespace-delimited word in a string.
longest_word() {
    printf '%s' "\${1:-}" | awk '{
        best = ""
        for (i = 1; i <= NF; i++) {
            if (length(\$i) > length(best)) best = \$i
        }
        print best
    }'
}`,

`# shortest_word prints the shortest non-empty word in a string.
shortest_word() {
    printf '%s' "\${1:-}" | awk '{
        best = ""
        for (i = 1; i <= NF; i++) {
            if (best == "" || length(\$i) < length(best)) best = \$i
        }
        print best
    }'
}`,

`# normalize_spaces collapses runs of whitespace into single spaces.
normalize_spaces() {
    awk '{\$1=\$1; print}'
}`,

`# strip_punctuation removes every non-alphanumeric, non-space character.
strip_punctuation() {
    printf '%s' "\${1:-}" | tr -cd '[:alnum:][:space:]'
}`,

`# extract_emails pulls unique email addresses out of a text stream.
extract_emails() {
    grep -Eo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}' | sort -u
}`,

`# extract_urls pulls unique http(s) URLs out of a text stream.
extract_urls() {
    grep -Eo 'https?://[A-Za-z0-9./?=_-]+' | sort -u
}`,

`# count_nonblank_lines counts lines that are not entirely whitespace.
count_nonblank_lines() {
    grep -cve '^[[:space:]]*$' || true
}`,

`# number_lines prefixes each input line with its 1-based number.
number_lines() {
    awk '{ printf "%4d  %s\\n", NR, \$0 }'
}`,

`# remove_duplicate_lines keeps only the first occurrence of each line.
remove_duplicate_lines() {
    awk '!seen[\$0]++'
}`,

`# top_occurrences prints the n most frequent lines of a stream.
top_occurrences() {
    local n="\${1:-10}"
    sort | uniq -c | sort -rn | head -n "\$n"
}`,

`# filter_log_level keeps only log lines at or above a severity.
filter_log_level() {
    local level="\${1:-ERROR}"
    case "\$level" in
        DEBUG) grep -E '\\[(DEBUG|INFO|WARN|ERROR)\\]' ;;
        INFO)  grep -E '\\[(INFO|WARN|ERROR)\\]' ;;
        WARN)  grep -E '\\[(WARN|ERROR)\\]' ;;
        ERROR) grep -E '\\[ERROR\\]' ;;
        *)     cat ;;
    esac
}`,

`# strip_comments removes whole-line and trailing comments from a script.
strip_comments() {
    sed -e 's/[[:space:]]*#.*$//' -e '/^[[:space:]]*$/d'
}`,

`# to_tsv converts runs of whitespace into single tab separators.
to_tsv() {
    tr -s '[:space:]' '\\t'
}`,

`# join_lines concatenates every input line with a separator.
join_lines() {
    local sep="\${1:-, }"
    paste -sd "\$sep"
}`,

`# wrap_text folds long lines at a width, keeping words intact.
wrap_text() {
    local width="\${1:-80}"
    fold -s -w "\$width"
}`,

`# shuffle_lines randomises the order of the input lines.
shuffle_lines() {
    sort -R
}`,

`# check_trailing_whitespace reports lines that end with a space or tab.
check_trailing_whitespace() {
    grep -n '[[:space:]]$' || true
}`,

`# extract_column prints the n-th whitespace-delimited field of each line.
extract_column() {
    local n="\${1:-1}"
    awk -v col="\$n" '{ print \$col }'
}`,

`# sed_replace applies a sed expression over stdin with a readable failure.
sed_replace() {
    local expr="\${1:?missing sed expression}"
    sed -e "\$expr" 2>/dev/null || { printf 'bad expression: %s\\n' "\$expr" >&2; return 1; }
}`,

`# count_chars counts every character in a string, newlines included.
count_chars() {
    printf '%s' "\${1:-}" | wc -c | tr -d '[:space:]'
}`,

`# line_widths prints the character length of every input line.
line_widths() {
    awk '{ print length(\$0) }'
}`,

`# grep_context prints matches with a configurable amount of context.
grep_context() {
    local pattern="\${1:?missing pattern}" before="\${2:-2}" after="\${3:-2}"
    grep -n -B "\$before" -A "\$after" -e "\$pattern" || true
}`,
  ],
};
