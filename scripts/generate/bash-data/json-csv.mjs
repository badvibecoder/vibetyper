// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: JSON and CSV processing with jq/awk.

export default {
  file: 'json_csv.sh',
  blocks: [
`# json_valid tests whether a string parses as JSON.
json_valid() {
    jq -e . >/dev/null 2>&1 <<<"\${1:?missing json}"
}`,

`# json_get prints the value of a dotted path from a JSON file.
json_get() {
    local file="\${1:?missing file}" path="\${2:?missing path}"
    jq -r ".\$path" "\$file"
}`,

`# json_has_key tests whether a JSON object holds a key.
json_has_key() {
    local file="\${1:?missing file}" key="\${2:?missing key}"
    jq -e --arg k "\$key" 'has(\$k)' "\$file" >/dev/null
}`,

`# json_keys lists the keys of the top-level JSON object.
json_keys() {
    local file="\${1:?missing file}"
    jq -r 'keys[]' "\$file"
}`,

`# json_length prints the number of elements in a JSON array.
json_length() {
    local file="\${1:?missing file}"
    jq 'length' "\$file"
}`,

`# json_pretty reformats JSON with two-space indentation.
json_pretty() {
    jq . "\${1:?missing file}"
}`,

`# json_first prints the first element of a JSON array.
json_first() {
    local file="\${1:?missing file}"
    jq -c '.[0]' "\$file"
}`,

`# json_filter keeps array elements whose field equals a value.
json_filter() {
    local file="\${1:?missing file}" field="\${2:?missing field}" value="\${3:?missing value}"
    jq -c --arg f "\$field" --arg v "\$value" '.[] | select(.[\$f] == \$v)' "\$file"
}`,

`# json_sort_by sorts an array of objects by a numeric field descending.
json_sort_by() {
    local file="\${1:?missing file}" field="\${2:?missing field}"
    jq -c --arg f "\$field" 'sort_by(.[\$f]) | reverse' "\$file"
}`,

`# json_map_values prints one field of every object in an array.
json_map_values() {
    local file="\${1:?missing file}" field="\${2:?missing field}"
    jq -r --arg f "\$field" '.[] | .[\$f]' "\$file"
}`,

`# json_merge deep-merges two JSON files, with the second winning.
json_merge() {
    local a="\${1:?missing first}" b="\${2:?missing second}"
    jq -s '.[0] * .[1]' "\$a" "\$b"
}`,

`# json_to_kv flattens a flat object into key=value lines.
json_to_kv() {
    local file="\${1:?missing file}"
    jq -r 'to_entries[] | "\\(.key)=\\(.value)"' "\$file"
}`,

`# csv_columns prints the header row of a CSV file.
csv_columns() {
    local file="\${1:?missing file}"
    head -n 1 "\$file"
}`,

`# csv_rows prints every data row of a CSV file, skipping the header.
csv_rows() {
    local file="\${1:?missing file}"
    tail -n +2 "\$file"
}`,

`# csv_column prints one comma-separated column of a CSV file.
csv_column() {
    local file="\${1:?missing file}" n="\${2:?missing column}"
    cut -d, -f"\$n" "\$file" | tail -n +2
}`,

`# csv_count_rows counts the data rows of a CSV file.
csv_count_rows() {
    local file="\${1:?missing file}"
    tail -n +2 "\$file" | wc -l | tr -d '[:space:]'
}`,

`# csv_filter_field prints rows whose n-th field equals a value.
csv_filter_field() {
    local file="\${1:?missing file}" n="\${2:?missing column}" value="\${3:?missing value}"
    awk -F, -v c="\$n" -v v="\$value" 'NR > 1 && \$c == v' "\$file"
}`,

`# csv_sum_field totals a numeric column of a CSV file.
csv_sum_field() {
    local file="\${1:?missing file}" n="\${2:?missing column}"
    awk -F, -v c="\$n" 'NR > 1 { total += \$c } END { print total + 0 }' "\$file"
}`,

`# csv_sort_by sorts CSV rows by a numeric column.
csv_sort_by() {
    local file="\${1:?missing file}" n="\${2:?missing column}"
    (head -n 1 "\$file"; tail -n +2 "\$file" | sort -t, -k"\$n","\$n" -n)
}`,

`# csv_to_json converts a simple CSV file into a JSON array of objects.
csv_to_json() {
    local file="\${1:?missing file}"
    jq -R -s -r '
        split("\\n") | map(select(length > 0))
        | .[0] as \$h | .[1:] | map(
            split(",") | . as \$r
            | reduce range(0; \$h | length) as \$i ({};
                . + { (\$h[\$i]): \$r[\$i] })
        )' "\$file"
}`,

`# tsv_to_csv converts tab-separated input to comma-separated.
tsv_to_csv() {
    tr '\\t' ',' < "\${1:?missing file}"
}`,

`# print_table aligns whitespace-delimited columns for the terminal.
print_table() {
    column -t
}`,

`# json_grep prints objects whose stringified form matches a pattern.
json_grep() {
    local file="\${1:?missing file}" pattern="\${2:?missing pattern}"
    jq -c '.[]' "\$file" | grep -E "\$pattern" || true
}`,
  ],
};
