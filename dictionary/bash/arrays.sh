# array_contains tests whether a named array holds a value.
array_contains() {
    local name="${1:?missing array}" target="${2:?missing value}" item
    local -n ref="$name"
    for item in "${ref[@]}"; do
        [[ "$item" == "$target" ]] && return 0
    done
    return 1
}

# array_index_of prints the first index of a value, or -1 when absent.
array_index_of() {
    local name="${1:?missing array}" target="${2:?missing value}" i
    local -n ref="$name"
    for i in "${!ref[@]}"; do
        if [[ "${ref[$i]}" == "$target" ]]; then
            printf '%s' "$i"
            return
        fi
    done
    printf '%s' -1
}

# array_join prints the elements of a named array joined by a separator.
array_join() {
    local name="${1:?missing array}" sep="${2:-,}" out="" item
    local -n ref="$name"
    for item in "${ref[@]}"; do
        out="${out:+$out$sep}$item"
    done
    printf '%s' "$out"
}

# array_reverse fills a target array with the elements in reverse order.
array_reverse() {
    local src="${1:?missing source}" dst="${2:?missing target}" i
    local -n from="$src" to="$dst"
    to=()
    for (( i = ${#from[@]} - 1; i >= 0; i-- )); do
        to+=("${from[$i]}")
    done
}

# array_sort sorts a named array numerically into a target array.
array_sort() {
    local src="${1:?missing source}" dst="${2:?missing target}"
    local -n from="$src" to="$dst"
    mapfile -t to < <(printf '%s\n' "${from[@]}" | sort -n)
}

# array_unique keeps the distinct elements in first-seen order.
array_unique() {
    local src="${1:?missing source}" dst="${2:?missing target}"
    local -n from="$src" to="$dst"
    mapfile -t to < <(printf '%s\n' "${from[@]}" | awk '!seen[$0]++')
}

# array_length prints the number of elements in a named array.
array_length() {
    local name="${1:?missing array}"
    local -n ref="$name"
    printf '%s' "${#ref[@]}"
}

# array_append_many adds every remaining argument to a named array.
array_append_many() {
    local name="${1:?missing array}"
    shift
    local -n ref="$name"
    ref+=("$@")
}

# array_pop removes and prints the last element of a named array.
array_pop() {
    local name="${1:?missing array}" last
    local -n ref="$name"
    (( ${#ref[@]} == 0 )) && return 1
    last="${ref[-1]}"
    unset 'ref[-1]'
    printf '%s' "$last"
}

# array_shift removes and prints the first element of a named array.
array_shift() {
    local name="${1:?missing array}" first
    local -n ref="$name"
    (( ${#ref[@]} == 0 )) && return 1
    first="${ref[0]}"
    ref=("${ref[@]:1}")
    printf '%s' "$first"
}

# array_sum totals every numeric element of a named array.
array_sum() {
    local name="${1:?missing array}" total=0 n
    local -n ref="$name"
    for n in "${ref[@]}"; do
        total=$(( total + n ))
    done
    printf '%s' "$total"
}

# array_max prints the largest numeric element of a named array.
array_max() {
    local name="${1:?missing array}" best n
    local -n ref="$name"
    (( ${#ref[@]} == 0 )) && return 1
    best="${ref[0]}"
    for n in "${ref[@]:1}"; do
        (( n > best )) && best=$n
    done
    printf '%s' "$best"
}

# array_slice copies a range of a named array into a target array.
array_slice() {
    local src="${1:?missing source}" dst="${2:?missing target}" start="${3:-0}" count="${4:-}"
    local -n from="$src" to="$dst"
    if [[ -z "$count" ]]; then
        to=("${from[@]:start}")
    else
        to=("${from[@]:start:count}")
    fi
}

# array_to_lines writes the elements of a named array, one per line.
array_to_lines() {
    local name="${1:?missing array}"
    local -n ref="$name"
    printf '%s\n' "${ref[@]}"
}

# array_from_lines fills a named array from stdin, one element per line.
array_from_lines() {
    local name="${1:?missing array}"
    mapfile -t "$name"
}

# array_shuffle randomises a named array in place.
array_shuffle() {
    local name="${1:?missing array}"
    local -n ref="$name"
    mapfile -t ref < <(printf '%s\n' "${ref[@]}" | sort -R)
}

# array_map_upper uppercases every element of a named array in place.
array_map_upper() {
    local name="${1:?missing array}" i
    local -n ref="$name"
    for i in "${!ref[@]}"; do
        ref[$i]="${ref[$i]^^}"
    done
}

# array_filter_nonempty drops empty strings from a named array.
array_filter_nonempty() {
    local name="${1:?missing array}" kept=() item
    local -n ref="$name"
    for item in "${ref[@]}"; do
        [[ -n "$item" ]] && kept+=("$item")
    done
    ref=("${kept[@]}")
}

# map_has_key tests whether a named associative array holds a key.
map_has_key() {
    local name="${1:?missing map}" key="${2:?missing key}"
    local -n ref="$name"
    [[ -n "${ref[$key]+x}" ]]
}

# map_keys prints every key of a named associative array, one per line.
map_keys() {
    local name="${1:?missing map}" k
    local -n ref="$name"
    for k in "${!ref[@]}"; do
        printf '%s\n' "$k"
    done
}

# array_chunk prints the elements of a named array in groups of n.
array_chunk() {
    local name="${1:?missing array}" size="${2:?missing size}" i group
    local -n ref="$name"
    for (( i = 0; i < ${#ref[@]}; i += size )); do
        group="${ref[*]:i:size}"
        printf '%s\n' "$group"
    done
}

# array_count_where counts elements matching a glob pattern.
array_count_where() {
    local name="${1:?missing array}" pattern="${2:?missing pattern}" count=0 item
    local -n ref="$name"
    for item in "${ref[@]}"; do
        [[ "$item" == $pattern ]] && count=$(( count + 1 ))
    done
    printf '%s' "$count"
}

# array_zip_print prints paired elements from two equal-length arrays.
array_zip_print() {
    local a="${1:?missing first}" b="${2:?missing second}" i
    local -n left="$a" right="$b"
    for i in "${!left[@]}"; do
        printf '%s\t%s\n' "${left[$i]}" "${right[$i]}"
    done
}
