# trim removes leading and trailing whitespace with parameter expansion only.
trim() {
    local s="${1:-}"
    s="${s#"${s%%[![:space:]]*}"}"
    s="${s%"${s##*[![:space:]]}"}"
    printf '%s' "$s"
}

# trim_sed strips surrounding whitespace through a sed pipeline.
trim_sed() {
    printf '%s' "${1:-}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

# ltrim removes only the leading whitespace of a string.
ltrim() {
    local s="${1:-}"
    printf '%s' "${s#"${s%%[![:space:]]*}"}"
}

# rtrim removes only the trailing whitespace of a string.
rtrim() {
    local s="${1:-}"
    printf '%s' "${s%"${s##*[![:space:]]}"}"
}

# upper converts every ASCII letter to uppercase.
upper() {
    printf '%s' "${1:-}" | tr '[:lower:]' '[:upper:]'
}

# lower converts every ASCII letter to lowercase.
lower() {
    printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]'
}

# title_case capitalises the first letter of each whitespace-separated word.
title_case() {
    local text="${1:-}" word out=()
    for word in $text; do
        out+=("${word^}")
    done
    printf '%s' "${out[*]}"
}

# capitalize uppercases only the first character of the input.
capitalize() {
    local s="${1:-}"
    printf '%s' "${s^}"
}

# starts_with tests whether a string begins with a given prefix.
starts_with() {
    local s="${1:-}" prefix="${2:-}"
    [[ "$s" == "$prefix"* ]]
}

# ends_with tests whether a string ends with a given suffix.
ends_with() {
    local s="${1:-}" suffix="${2:-}"
    [[ "$s" == *"$suffix" ]]
}

# contains reports whether a string holds a given substring.
contains() {
    local s="${1:-}" sub="${2:-}"
    [[ "$s" == *"$sub"* ]]
}

# index_of prints the 1-based position of a substring, or -1 when absent.
index_of() {
    local s="${1:-}" sub="${2:-}" head
    head="${s%%"$sub"*}"
    if [[ "$head" == "$s" ]]; then
        printf '%s' -1
    else
        printf '%s' "$(( ${#head} + 1 ))"
    fi
}

# substring_before returns the part of a string preceding the first delimiter.
substring_before() {
    local s="${1:-}" delim="${2:-}"
    printf '%s' "${s%%"$delim"*}"
}

# substring_after returns the part of a string following the first delimiter.
substring_after() {
    local s="${1:-}" delim="${2:-}"
    printf '%s' "${s#*"$delim"}"
}

# split stores the pieces of a string in a caller-named array.
split() {
    local s="${1:-}" delim="${2:-}" name="${3:-parts}"
    IFS="$delim" read -r -a "$name" <<< "$s"
}

# join concatenates the elements of a named array with a separator.
join() {
    local sep="${1:-,}" name="${2:-parts}" out="" item
    local -n ref="$name"
    for item in "${ref[@]}"; do
        out="${out:+$out$sep}$item"
    done
    printf '%s' "$out"
}

# replace_all swaps every occurrence of one literal string for another.
replace_all() {
    local s="${1:-}" old="${2:-}" new="${3:-}"
    printf '%s' "${s//"$old"/$new}"
}

# replace_first swaps only the first occurrence of a literal string.
replace_first() {
    local s="${1:-}" old="${2:-}" new="${3:-}"
    printf '%s' "${s/"$old"/$new}"
}

# truncate shortens a string to a maximum length, adding an ellipsis.
truncate() {
    local s="${1:-}" max="${2:-80}"
    if (( ${#s} <= max )); then
        printf '%s' "$s"
    elif (( max <= 3 )); then
        printf '%s' "${s:0:max}"
    else
        printf '%s...' "${s:0:$((max - 3))}"
    fi
}

# truncate_middle keeps the head and tail of a long string around an ellipsis.
truncate_middle() {
    local s="${1:-}" max="${2:-80}" keep
    if (( ${#s} <= max )); then
        printf '%s' "$s"
        return
    fi
    keep=$(( (max - 1) / 2 ))
    printf '%s...%s' "${s:0:keep}" "${s: -keep}"
}

# mask hides everything but the first and last characters of a string.
mask() {
    local s="${1:-}"
    if (( ${#s} <= 2 )); then
        printf '%s' "$s"
        return
    fi
    printf '%s%s%s' "${s:0:1}" "$(printf '%*s' "$(( ${#s} - 2 ))" '' | tr ' ' '*')" "${s: -1}"
}

# slugify turns arbitrary text into a lowercase, hyphen-separated slug.
slugify() {
    local text="${1:-}"
    text=$(printf '%s' "$text" | tr '[:upper:]' '[:lower:]' \
        | sed -e 's/[^a-z0-9]\+/ /g' -e 's/^ *//' -e 's/ *$//' -e 's/ /-/g')
    printf '%s' "$text"
}

# camel_case converts a dashed or spaced phrase into camelCase.
camel_case() {
    local word out="" first rest
    for word in $(printf '%s' "${1:-}" | tr '_-' ' '); do
        out+="${word^}"
    done
    out="${out,}"
    printf '%s' "$out"
}

# snake_case converts a phrase into lowercase words joined by underscores.
snake_case() {
    local text="${1:-}"
    text=$(printf '%s' "$text" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_')
    text="${text#_}"
    text="${text%_}"
    printf '%s' "$text"
}

# pad_left left-pads a string with a character to a target width.
pad_left() {
    local s="${1:-}" width="${2:-10}" pad="${3:- }" n
    n=$(( width - ${#s} ))
    if (( n > 0 )); then
        printf '%*s%s' "$n" '' "$s" | tr ' ' "$pad"
    else
        printf '%s' "$s"
    fi
}

# pad_right right-pads a string with a character to a target width.
pad_right() {
    local s="${1:-}" width="${2:-10}" pad="${3:- }" n
    n=$(( width - ${#s} ))
    if (( n > 0 )); then
        printf '%s%*s' "$s" "$n" '' | tr ' ' "$pad"
    else
        printf '%s' "$s"
    fi
}

# reverse prints the characters of a string in reverse order.
reverse() {
    local s="${1:-}" i out=""
    for (( i = ${#s} - 1; i >= 0; i-- )); do
        out+="${s:i:1}"
    done
    printf '%s' "$out"
}

# repeat prints a string concatenated with itself n times.
repeat() {
    local s="${1:-}" n="${2:-1}" i out=""
    for (( i = 0; i < n; i++ )); do
        out+="$s"
    done
    printf '%s' "$out"
}

# count_occurrences counts non-overlapping occurrences of a substring.
count_occurrences() {
    local s="${1:-}" sub="${2:-}" stripped
    if [[ -z "$sub" ]]; then
        printf '%s' 0
        return
    fi
    stripped="${s//"$sub"/}"
    printf '%s' "$(( ( ${#s} - ${#stripped} ) / ${#sub} ))"
}

# rot13 applies the classic Caesar cipher variant to ASCII letters.
rot13() {
    printf '%s' "${1:-}" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
}
